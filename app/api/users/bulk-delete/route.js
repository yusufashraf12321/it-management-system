import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 });
    }

    // 1. Fetch users and their assigned assets
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { assignedAssets: true }
    });

    if (users.length === 0) {
      return NextResponse.json({ error: 'No matching users found' }, { status: 404 });
    }

    // Collect all assigned assets to return to stock
    const allAssignedAssets = users.flatMap(u => u.assignedAssets || []);

    // For each unique inventory item, find how many assets are being returned
    const itemReturnCounts = {};
    for (const asset of allAssignedAssets) {
      const itemId = asset.inventoryItemId;
      itemReturnCounts[itemId] = (itemReturnCounts[itemId] || 0) + 1;
    }

    // 2. Perform bulk updates in transaction
    await prisma.$transaction([
      // Unassign all assets from the selected users
      prisma.asset.updateMany({
        where: { assignedToUserId: { in: userIds } },
        data: {
          status: 'IN_STOCK',
          assignedToUserId: null,
          departmentId: null,
          assignedDate: null
        }
      }),
      // Increment availableCount for the affected InventoryItems
      ...Object.entries(itemReturnCounts).map(([itemId, count]) =>
        prisma.inventoryItem.update({
          where: { id: parseInt(itemId) },
          data: {
            availableCount: { increment: count }
          }
        })
      ),
      // Delete the users
      prisma.user.deleteMany({
        where: { id: { in: userIds } }
      })
    ]);

    return NextResponse.json({
      success: true,
      deletedUsersCount: users.length,
      returnedAssetsCount: allAssignedAssets.length
    });
  } catch (error) {
    console.error('Error in bulk-delete API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
