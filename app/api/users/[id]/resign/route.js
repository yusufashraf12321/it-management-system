import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Find the user and check if they exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { assignedAssets: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const assignedAssets = user.assignedAssets || [];

    // Run unassignment, inventory count update, and user deletion inside a transaction
    await prisma.$transaction([
      // 1. Unassign all assets assigned to the user
      prisma.asset.updateMany({
        where: { assignedToUserId: userId },
        data: {
          status: 'IN_STOCK',
          assignedToUserId: null,
          departmentId: null,
          assignedDate: null
        }
      }),
      // 2. Increment the available count of each corresponding InventoryItem
      ...assignedAssets.map(asset =>
        prisma.inventoryItem.update({
          where: { id: asset.inventoryItemId },
          data: {
            availableCount: { increment: 1 }
          }
        })
      ),
      // 3. Delete the user
      prisma.user.delete({
        where: { id: userId }
      })
    ]);

    return NextResponse.json({ success: true, returnedAssetsCount: assignedAssets.length });
  } catch (error) {
    console.error('Error during resignation transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
