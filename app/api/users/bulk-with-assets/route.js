import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/users/bulk-with-assets
 *
 * Body: { departmentId: Int, rows: [...] }
 *
 * Per row strategy (lenient — never aborts the whole batch):
 *   1. Fill missing/invalid email fields with auto-generated placeholders
 *   2. Create the User
 *   3. For each non-empty serial column → upsert InventoryItem → create Asset (ASSIGNED)
 *   4. Serial duplicates are warned and skipped, not aborted
 */
export async function POST(request) {
  try {
    const { rows, departmentId } = await request.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
    }
    if (!departmentId) {
      return NextResponse.json({ error: 'departmentId is required' }, { status: 400 });
    }

    const deptId = parseInt(departmentId);

    // ── Pre-check: only for rows that HAVE valid emails ──────────────────────
    const validPersonalEmails = rows
      .map(r => r.personalEmail?.trim())
      .filter(e => e && e.includes('@'));
    const validKonectaMails = rows
      .map(r => r.konectaMail?.trim())
      .filter(e => e && e.includes('@'));

    if (validPersonalEmails.length > 0 || validKonectaMails.length > 0) {
      const emailConflicts = await prisma.user.findMany({
        where: {
          OR: [
            ...(validPersonalEmails.length ? [{ personalEmail: { in: validPersonalEmails } }] : []),
            ...(validKonectaMails.length   ? [{ konectaMail:   { in: validKonectaMails   } }] : [])
          ]
        },
        select: { fullName: true, personalEmail: true, konectaMail: true }
      });
      if (emailConflicts.length > 0) {
        return NextResponse.json({
          error: 'Email conflicts — these emails already exist in the system',
          conflicts: emailConflicts.map(c => `${c.fullName} (${c.personalEmail || c.konectaMail})`)
        }, { status: 400 });
      }
    }

    // ── Hash default password once ───────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('password123', 10);

    // ── Process each row ─────────────────────────────────────────────────────
    const results = [];
    const skipped = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const ts  = Date.now() + i; // unique timestamp suffix per row

      // ── 1. Sanitize user fields — fill blanks with safe placeholders ──────
      const safeName     = row.fullName?.trim()     || `Unknown Employee ${ts}`;
      const safeTitle    = row.jobTitle?.trim()     || 'Unknown Title';
      const safePersonal = (row.personalEmail?.trim() && row.personalEmail.includes('@'))
                            ? row.personalEmail.trim()
                            : `no_email_${ts}@placeholder.konecta`;
      const safeKonecta  = (row.konectaMail?.trim() && row.konectaMail.includes('@'))
                            ? row.konectaMail.trim()
                            : `no_konecta_${ts}@placeholder.konecta`;
      const safeContact  = row.contactNo?.trim()   || '';
      const safeDate     = row.hiringDate?.trim()
                            ? new Date(row.hiringDate.trim())
                            : new Date();
      const safeManager  = row.reportingTo?.trim() || null;

      // ── 2. Create the user ────────────────────────────────────────────────
      let user;
      try {
        user = await prisma.user.create({
          data: {
            fullName:      safeName,
            jobTitle:      safeTitle,
            personalEmail: safePersonal,
            konectaMail:   safeKonecta,
            contactNo:     safeContact,
            hiringDate:    safeDate,
            reportingTo:   safeManager,
            role:          'EMPLOYEE',
            password:      hashedPassword,
            departmentId:  deptId
          }
        });
      } catch (userErr) {
        // If user creation still fails (race condition etc.), record and continue
        skipped.push({ row: i + 1, name: safeName, reason: userErr.message });
        continue;
      }

      // ── 3. Build device list from this row ────────────────────────────────
      const devices = buildDeviceList(row);
      let devicesAdded = 0;

      for (const device of devices) {
        try {
          // 3a. Upsert InventoryItem (create or increment totalCount)
          const inventoryItem = await prisma.inventoryItem.upsert({
            where: {
              category_brand_model: {
                category: device.category,
                brand:    device.brand,
                model:    device.model
              }
            },
            update: {
              totalCount: { increment: 1 }
              // availableCount stays — asset is immediately ASSIGNED
            },
            create: {
              category:       device.category,
              brand:          device.brand,
              model:          device.model,
              totalCount:     1,
              availableCount: 0
            }
          });

          // 3b. Create Asset and link to user
          await prisma.asset.create({
            data: {
              serialNumber:     device.serialNumber,
              status:           'ASSIGNED',
              notes:            device.notes || null,
              inventoryItemId:  inventoryItem.id,
              assignedToUserId: user.id,
              departmentId:     deptId,
              assignedDate:     new Date()
            }
          });

          devicesAdded++;
        } catch (deviceErr) {
          // Duplicate serial or other device error — skip device, keep user
          console.warn(`Row ${i + 1}: Skipped device serial "${device.serialNumber}" — ${deviceErr.message}`);
        }
      }

      results.push({
        userId:       user.id,
        name:         user.fullName,
        devicesAdded
      });
    }

    return NextResponse.json({
      success:       true,
      imported:      results.length,
      skipped:       skipped.length,
      skippedDetail: skipped,
      results
    });

  } catch (error) {
    console.error('Bulk-with-assets error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: extract device entries from a row object
// Only devices with a non-empty serialNumber are included
// ─────────────────────────────────────────────────────────────────────────────
function buildDeviceList(row) {
  const devices = [];

  // Laptop
  if (row.laptopSerial?.trim()) {
    const specsParts = [
      row.laptopGen     ? `Gen ${row.laptopGen}`       : null,
      row.processorCore ? `${row.processorCore} Core`  : null,
      row.ram           ? `${row.ram} RAM`             : null,
      row.harddisk      ? `${row.harddisk} HDD/SSD`   : null
    ].filter(Boolean);

    devices.push({
      category:     'Laptop',
      brand:        row.laptopBrand?.trim()  || 'Unknown',
      model:        row.laptopModel?.trim()  || 'Unknown',
      serialNumber: row.laptopSerial.trim(),
      notes:        specsParts.length ? specsParts.join(' | ') : null
    });
  }

  // MAC / Desktop
  if (row.macSerial?.trim()) {
    devices.push({
      category:     'Desktop',
      brand:        'Apple',
      model:        'Mac',
      serialNumber: row.macSerial.trim(),
      notes:        row.macEthernet?.trim()
                      ? `Ethernet SN: ${row.macEthernet.trim()}`
                      : null
    });
  }

  // Windows License
  if (row.windowsLicense?.trim()) {
    devices.push({
      category:     'Software License',
      brand:        'Microsoft',
      model:        'Windows',
      serialNumber: row.windowsLicense.trim(),
      notes:        null
    });
  }

  // Headset
  if (row.headsetSerial?.trim()) {
    devices.push({
      category:     'Headset',
      brand:        row.headsetBrand?.trim() || 'Unknown',
      model:        row.headsetModel?.trim() || 'Headset',
      serialNumber: row.headsetSerial.trim(),
      notes:        null
    });
  }

  // Screen / Monitor
  if (row.screenSerial?.trim()) {
    devices.push({
      category:     'Monitor',
      brand:        row.screenBrand?.trim() || 'Unknown',
      model:        row.screenModel?.trim() || 'Monitor',
      serialNumber: row.screenSerial.trim(),
      notes:        null
    });
  }

  return devices;
}
