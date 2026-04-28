import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.inventoryItemId || !data.serialNumbers || !Array.isArray(data.serialNumbers)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const serials = data.serialNumbers.filter(s => s.trim() !== '');

    if (serials.length === 0) {
      return NextResponse.json({ error: 'No valid serial numbers provided' }, { status: 400 });
    }

    // Insert all assets and update inventory count in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create assets
      const assets = await Promise.all(
        serials.map(serial => 
          tx.asset.create({
            data: {
              serialNumber: serial.trim(),
              inventoryItemId: parseInt(data.inventoryItemId),
              status: 'IN_STOCK'
            }
          })
        )
      );

      // Update inventory counts
      await tx.inventoryItem.update({
        where: { id: parseInt(data.inventoryItemId) },
        data: {
          totalCount: { increment: serials.length },
          availableCount: { increment: serials.length }
        }
      });

      return assets;
    });

    return NextResponse.json({ success: true, count: result.length });
  } catch (error) {
    console.error('Error in bulk asset creation:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'One or more serial numbers already exist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
