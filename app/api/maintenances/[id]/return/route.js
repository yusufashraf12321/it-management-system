import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const id = parseInt(params.id);

    const maintenance = await prisma.maintenance.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!maintenance) {
      return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 });
    }

    if (maintenance.status === 'RETURNED') {
      return NextResponse.json({ error: 'Asset has already been returned' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update maintenance record
      const updatedMaintenance = await tx.maintenance.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnDate: new Date()
        }
      });

      // Update asset status
      await tx.asset.update({
        where: { id: maintenance.assetId },
        data: { status: 'IN_STOCK' }
      });

      // Increase available count in inventory
      await tx.inventoryItem.update({
        where: { id: maintenance.asset.inventoryItemId },
        data: { availableCount: { increment: 1 } }
      });

      return updatedMaintenance;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
