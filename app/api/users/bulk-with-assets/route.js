import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/users/bulk-with-assets
 *
 * Body: {
 *   departmentId: Int,
 *   rows: [
 *     {
 *       // Employee fields
 *       fullName, jobTitle, personalEmail, konectaMail, contactNo,
 *       hiringDate, reportingTo,
 *       // Device fields (optional – skipped when empty)
 *       laptopModel, laptopGen, processorCore, ram, harddisk,
 *       laptopSerial,
 *       macSerial, macEthernet,
 *       windowsLicense, headsetSerial, screenSerial
 *     }, ...
 *   ]
 * }
 *
 * Strategy per row:
 *   1. Create the User
 *   2. For each non-empty serial-number device column:
 *      a. upsert InventoryItem (category + brand + model)  → inc totalCount by 1
 *      b. create Asset with status ASSIGNED              → availableCount stays 0
 *      c. link asset to user & department
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

    // ── Pre-check: duplicate emails ──────────────────────────────────────────
    const personalEmails = rows.map(r => r.personalEmail?.trim()).filter(Boolean);
    const konectaMails   = rows.map(r => r.konectaMail?.trim()).filter(Boolean);

    const conflicts = await prisma.user.findMany({
      where: { OR: [{ personalEmail: { in: personalEmails } }, { konectaMail: { in: konectaMails } }] },
      select: { fullName: true, personalEmail: true, konectaMail: true }
    });
    if (conflicts.length > 0) {
      return NextResponse.json({
        error: 'Email conflicts detected',
        conflicts: conflicts.map(c => `${c.fullName} (${c.personalEmail})`),
      }, { status: 400 });
    }

    // ── Pre-check: duplicate serials within the uploaded batch ───────────────
    const collectSerials = (row) => [
      row.laptopSerial, row.macSerial, row.macEthernet,
      row.windowsLicense, row.headsetSerial, row.screenSerial
    ].map(s => s?.trim()).filter(Boolean);

    const allBatchSerials = rows.flatMap(collectSerials);
    const uniqueBatch = new Set(allBatchSerials);
    if (uniqueBatch.size !== allBatchSerials.length) {
      return NextResponse.json({ error: 'Duplicate serial numbers detected within the uploaded batch' }, { status: 400 });
    }

    // ── Pre-check: serials already existing in DB ────────────────────────────
    if (allBatchSerials.length > 0) {
      const existingAssets = await prisma.asset.findMany({
        where: { serialNumber: { in: allBatchSerials } },
        select: { serialNumber: true }
      });
      if (existingAssets.length > 0) {
        return NextResponse.json({
          error: 'Some serial numbers already exist in the database',
          conflicts: existingAssets.map(a => a.serialNumber)
        }, { status: 400 });
      }
    }

    // ── Hash default password once ───────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('password123', 10);

    // ── Process each row sequentially (to allow upsert ordering) ────────────
    const results = [];
    for (const row of rows) {
      // Helper — build device entries from row fields
      const devices = buildDeviceList(row);

      // 1. Create user
      const user = await prisma.user.create({
        data: {
          fullName:      row.fullName.trim(),
          jobTitle:      row.jobTitle.trim(),
          personalEmail: row.personalEmail.trim(),
          konectaMail:   row.konectaMail.trim(),
          contactNo:     row.contactNo?.trim() || '',
          hiringDate:    row.hiringDate ? new Date(row.hiringDate) : new Date(),
          reportingTo:   row.reportingTo?.trim() || null,
          role:          'EMPLOYEE',
          password:      hashedPassword,
          departmentId:  deptId
        }
      });

      // 2. For each device: upsert InventoryItem → create Asset → assign
      for (const device of devices) {
        // 2a. Upsert InventoryItem
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
            // availableCount stays the same — asset is immediately assigned
          },
          create: {
            category:       device.category,
            brand:          device.brand,
            model:          device.model,
            totalCount:     1,
            availableCount: 0   // immediately assigned, so 0 available
          }
        });

        // 2b. Create Asset and assign to user
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
      }

      results.push({ userId: user.id, name: user.fullName, devicesAdded: devices.length });
    }

    return NextResponse.json({
      success: true,
      count:   rows.length,
      results
    });
  } catch (error) {
    console.error('Bulk-with-assets error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: extract device entries from a single row
// ─────────────────────────────────────────────────────────────────────────────
function buildDeviceList(row) {
  const devices = [];

  // Laptop
  if (row.laptopSerial?.trim()) {
    const specs = [
      row.laptopGen        ? `Gen ${row.laptopGen}`        : null,
      row.processorCore    ? `${row.processorCore} Core`   : null,
      row.ram              ? `${row.ram} RAM`              : null,
      row.harddisk         ? `${row.harddisk} HDD/SSD`    : null,
    ].filter(Boolean).join(' | ');

    devices.push({
      category:     'Laptop',
      brand:        row.laptopBrand?.trim()  || 'Unknown',
      model:        row.laptopModel?.trim()  || 'Unknown',
      serialNumber: row.laptopSerial.trim(),
      notes:        specs || null
    });
  }

  // MAC (Workstation)
  if (row.macSerial?.trim()) {
    devices.push({
      category:     'Desktop',
      brand:        'Apple',
      model:        'Mac',
      serialNumber: row.macSerial.trim(),
      notes:        row.macEthernet?.trim() ? `Ethernet SN: ${row.macEthernet.trim()}` : null
    });
  }

  // Windows License key — stored as an "asset" with category Software
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
