import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    if (categories.length === 0) {
      // Seed default categories with specifications
      const defaults = [
        { 
          name: 'LAPTOPS', 
          fields: JSON.stringify(["Gen", "Processor Core", "RAM", "Harddisk", "MAC Wifi", "MAC Ethernet", "Hostname"]) 
        },
        { 
          name: 'HEADSETS', 
          fields: JSON.stringify([]) 
        },
        { 
          name: 'SCREENS', 
          fields: JSON.stringify([]) 
        },
        { 
          name: 'TV', 
          fields: JSON.stringify([]) 
        }
      ];

      for (const item of defaults) {
        await prisma.category.create({ data: item });
      }

      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });
    }

    const parsed = categories.map(cat => ({
      ...cat,
      fields: cat.fields ? JSON.parse(cat.fields) : []
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const fieldsArray = Array.isArray(data.fields) ? data.fields : [];

    const category = await prisma.category.create({
      data: { 
        name: data.name.toUpperCase(),
        fields: JSON.stringify(fieldsArray)
      }
    });

    return NextResponse.json({
      ...category,
      fields: fieldsArray
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
