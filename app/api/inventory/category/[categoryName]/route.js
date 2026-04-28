import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const categoryName = decodeURIComponent(params.categoryName);

    // Use a transaction to delete all assets and then the inventory items
    await prisma.$transaction(async (tx) => {
      // 1. Get all inventory items in this category
      const items = await tx.inventoryItem.findMany({
        where: { category: categoryName },
        select: { id: true }
      });

      const itemIds = items.map(item => item.id);

      if (itemIds.length > 0) {
        // 2. Delete all assets for these items
        await tx.asset.deleteMany({
          where: { inventoryItemId: { in: itemIds } }
        });

        // 3. Delete the inventory items
        await tx.inventoryItem.deleteMany({
          where: { id: { in: itemIds } }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
