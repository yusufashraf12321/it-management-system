import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: [
        { category: 'asc' },
        { brand: 'asc' },
        { model: 'asc' }
      ]
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const item = await prisma.inventoryItem.create({
      data: {
        category: data.category,
        brand: data.brand,
        model: data.model,
        totalCount: parseInt(data.totalCount || 0),
        availableCount: parseInt(data.availableCount || 0)
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Inventory item already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
