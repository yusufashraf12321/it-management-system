import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const data   = await request.json();
    const assetId = parseInt(params.id);

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        serialNumber: data.serialNumber,
        status:       data.status,
        notes:        data.notes
      }
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error updating asset:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Serial number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const assetId = parseInt(params.id);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch full asset record
      const asset = await tx.asset.findUnique({
        where:  { id: assetId },
        select: { status: true, inventoryItemId: true, assignedToUserId: true }
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      // 2. Block deletion of ASSIGNED assets
      if (asset.status === 'ASSIGNED') {
        throw new Error('Cannot delete an asset that is currently assigned to an employee. Please unassign it first.');
      }

      // 3. Delete the asset record
      await tx.asset.delete({ where: { id: assetId } });

      // 4. Decrement inventory counts correctly
      //    - totalCount always decrements by 1
      //    - availableCount decrements only if asset was IN_STOCK (not MAINTENANCE)
      const isInStock = asset.status === 'IN_STOCK';

      // Fetch current counts to avoid going below 0
      const invItem = await tx.inventoryItem.findUnique({
        where:  { id: asset.inventoryItemId },
        select: { totalCount: true, availableCount: true }
      });

      await tx.inventoryItem.update({
        where: { id: asset.inventoryItemId },
        data: {
          totalCount:     { decrement: 1 },
          availableCount: isInStock && invItem.availableCount > 0
                            ? { decrement: 1 }
                            : undefined
        }
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Cannot delete') ? 400 : 500 }
    );
  }
}
