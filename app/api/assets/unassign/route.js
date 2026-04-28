import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { assetId } = await request.json();

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(assetId) }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (asset.status !== 'ASSIGNED') {
      return NextResponse.json({ error: 'Asset is not assigned' }, { status: 400 });
    }

    // Perform unassignment and inventory update in a transaction
    const [updatedAsset, updatedInventory] = await prisma.$transaction([
      prisma.asset.update({
        where: { id: asset.id },
        data: {
          status: 'IN_STOCK',
          assignedToUserId: null,
          departmentId: null,
          assignedDate: null
        }
      }),
      prisma.inventoryItem.update({
        where: { id: asset.inventoryItemId },
        data: {
          availableCount: { increment: 1 }
        }
      })
    ]);

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Error unassigning asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
