import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const data = await request.json();
    const { category, brand, model, serialNumbers } = data;

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

      // 2. Add Assets if serials provided
      if (serialNumbers && serialNumbers.length > 0) {
        await Promise.all(
          serialNumbers.map(serial => 
            tx.asset.create({
              data: {
                serialNumber: serial,
                inventoryItemId: inventoryItem.id,
                status: 'IN_STOCK'
              }
            })
          )
        );

        // 3. Update Counts
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            totalCount: { increment: serialNumbers.length },
            availableCount: { increment: serialNumbers.length }
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
