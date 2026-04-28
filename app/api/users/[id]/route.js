import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        department: true,
        assignedAssets: {
          include: {
            inventoryItem: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    
    // remove fields that shouldn't be updated directly via this endpoint
    const { password, id, createdAt, updatedAt, ...updateData } = data;
    
    if (updateData.departmentId) {
      updateData.departmentId = parseInt(updateData.departmentId);
    }
    
    if (updateData.hiringDate) {
      updateData.hiringDate = new Date(updateData.hiringDate);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: updateData
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // First, unassign any assets
    await prisma.asset.updateMany({
      where: { assignedToUserId: parseInt(params.id) },
      data: {
        status: 'IN_STOCK',
        assignedToUserId: null,
        departmentId: null,
        assignedDate: null
      }
    });

    await prisma.user.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
