import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const assetId = parseInt(params.id);

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        serialNumber: data.serialNumber,
        status: data.status,
        notes: data.notes
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
      // 1. Find the asset to know its status and inventoryItem
      const asset = await tx.asset.findUnique({
        where: { id: assetId },
        select: { status: true, inventoryItemId: true }
      });

      if (!asset) throw new Error('Asset not found');

      // 2. Delete the asset
      await tx.asset.delete({
        where: { id: assetId }
      });

      // 3. Update InventoryItem counts
      await tx.inventoryItem.update({
        where: { id: asset.inventoryItemId },
        data: {
          totalCount: { decrement: 1 },
          availableCount: asset.status === 'IN_STOCK' ? { decrement: 1 } : undefined
        }
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
