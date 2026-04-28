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
        category: data.category,
        brand: data.brand,
        model: data.model,
        totalCount: data.totalCount !== undefined ? parseInt(data.totalCount) : undefined,
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
    // Delete all related assets first
    await prisma.asset.deleteMany({
      where: { inventoryItemId: parseInt(params.id) }
    });

    await prisma.inventoryItem.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
