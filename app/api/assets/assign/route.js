import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { serialNumber, userId } = await request.json();

    if (!serialNumber || !userId) {
      return NextResponse.json({ error: 'Serial number and user ID are required' }, { status: 400 });
    }

    // Find the user to get their department
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the asset
    const asset = await prisma.asset.findUnique({
      where: { serialNumber }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (asset.status === 'ASSIGNED') {
      return NextResponse.json({ error: 'Asset is already assigned' }, { status: 400 });
    }

    // Perform assignment and inventory update in a transaction
    const [updatedAsset, updatedInventory] = await prisma.$transaction([
      prisma.asset.update({
        where: { id: asset.id },
        data: {
          status: 'ASSIGNED',
          assignedToUserId: user.id,
          departmentId: user.departmentId,
          assignedDate: new Date()
        }
      }),
      prisma.inventoryItem.update({
        where: { id: asset.inventoryItemId },
        data: {
          availableCount: { decrement: 1 }
        }
      })
    ]);

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Error assigning asset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
