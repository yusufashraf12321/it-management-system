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
