import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: {
          select: { vendorAssets: true, orders: true }
        }
      }
    });
    return NextResponse.json(vendors);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Available Prisma Models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    const vendor = await prisma.vendor.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone
      }
    });
    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Vendor Create Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Vendor name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
