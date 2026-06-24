import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const data = await request.json();
    const { category, brand, model, serialNumbers, status = 'IN_STOCK', vendorName = 'Internal', specs = null } = data;

    if (!category || !brand || !model) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or Create InventoryItem
      let inventoryItem = await tx.inventoryItem.findFirst({
        where: { category, brand, model }
      });

      if (!inventoryItem) {
        inventoryItem = await tx.inventoryItem.create({
          data: {
            category,
            brand,
            model,
            totalCount: 0,
            availableCount: 0
          }
        });
      }

      // 2. Add Assets
      if (serialNumbers && serialNumbers.length > 0) {
        for (const serial of serialNumbers) {
          const asset = await tx.asset.create({
            data: {
              serialNumber: serial,
              inventoryItemId: inventoryItem.id,
              status: status, // Can be IN_STOCK or MAINTENANCE
              notes: specs ? JSON.stringify(specs) : null
            }
          });

          // 3. If Maintenance, create record
          if (status === 'MAINTENANCE') {
            await tx.maintenance.create({
              data: {
                assetId: asset.id,
                serialNumber: serial,
                vendorName: vendorName,
                status: 'OUT_FOR_REPAIR'
              }
            });
          }
        }

        // 4. Update InventoryItem Counts
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            totalCount: { increment: serialNumbers.length },
            availableCount: status === 'IN_STOCK' ? { increment: serialNumbers.length } : undefined
          }
        });
      }

      return inventoryItem;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in add-with-serials:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'One or more serial numbers already exist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
