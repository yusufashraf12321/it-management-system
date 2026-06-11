import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const department = await prisma.department.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        users: {
          include: {
            _count: {
              select: { assignedAssets: true }
            }
          }
        },
        assets: true
      }
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const department = await prisma.department.update({
      where: { id: parseInt(params.id) },
      data: {
        name: data.name,
        description: data.description
      }
    });
    return NextResponse.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Department name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    // Check if department has users
    const userCount = await prisma.user.count({ where: { departmentId: id } });
    if (userCount > 0) {
      return NextResponse.json({ error: 'Cannot delete department with assigned users' }, { status: 400 });
    }

    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
