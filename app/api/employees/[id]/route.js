import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        department: true,
        assignedAssets: {
          include: { inventoryItem: true }
        },
        tickets: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!employee) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employee details' }, { status: 500 });
  }
}
