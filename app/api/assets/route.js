import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const departmentId = searchParams.get('departmentId');
  const userId = searchParams.get('userId');

  const where = {};
  if (status) where.status = status;
  if (departmentId) where.departmentId = parseInt(departmentId);
  if (userId) where.assignedToUserId = parseInt(userId);

  try {
    const assets = await prisma.asset.findMany({
      where,
      include: {
        inventoryItem: true,
        assignedToUser: true,
        department: true
      },
      orderBy: { serialNumber: 'asc' }
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Create the asset and increment the inventory count in a transaction
    const [asset, inventoryItem] = await prisma.$transaction([
      prisma.asset.create({
        data: {
          serialNumber: data.serialNumber,
          inventoryItemId: parseInt(data.inventoryItemId),
          status: 'IN_STOCK',
          notes: data.notes
        }
      }),
      prisma.inventoryItem.update({
        where: { id: parseInt(data.inventoryItemId) },
        data: {
          totalCount: { increment: 1 },
          availableCount: { increment: 1 }
        }
      })
    ]);

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error creating asset:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Asset with this serial number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
