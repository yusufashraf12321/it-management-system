import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        assets: {
          include: {
            assignedToUser: true,
            department: true
          },
          orderBy: { serialNumber: 'asc' }
        }
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const item = await prisma.inventoryItem.update({
      where: { id: parseInt(params.id) },
      data: {
        category:       data.category,
        brand:          data.brand,
        model:          data.model,
        totalCount:     data.totalCount     !== undefined ? parseInt(data.totalCount)     : undefined,
        availableCount: data.availableCount !== undefined ? parseInt(data.availableCount) : undefined
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const itemId = parseInt(params.id);

    // 1. Fetch all assets for this inventory item
    const assets = await prisma.asset.findMany({
      where: { inventoryItemId: itemId },
      select: { id: true, status: true, assignedToUserId: true }
    });

    // 2. Block deletion if any asset is ASSIGNED
    const assignedAssets = assets.filter(a => a.status === 'ASSIGNED');
    if (assignedAssets.length > 0) {
      return NextResponse.json({
        error: `Cannot delete: ${assignedAssets.length} asset(s) are currently assigned to employees. Please unassign them first.`
      }, { status: 400 });
    }

    // 3. Safe to delete — remove all assets then the inventory item
    await prisma.$transaction([
      prisma.asset.deleteMany({ where: { inventoryItemId: itemId } }),
      prisma.inventoryItem.delete({ where: { id: itemId } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
