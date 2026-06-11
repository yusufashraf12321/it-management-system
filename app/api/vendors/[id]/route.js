import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        _count: { select: { vendorAssets: true, orders: true } }
      }
    });
    if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(vendor);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const vendor = await prisma.vendor.update({
      where: { id: parseInt(params.id) },
      data: { name: data.name, contactPerson: data.contactPerson, email: data.email, phone: data.phone }
    });
    return NextResponse.json(vendor);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.vendor.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Vendor Error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
