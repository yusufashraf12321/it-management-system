import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Vendor uploads their items to their own stock
export async function POST(request, { params }) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { token: params.token } });
    if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const { category, brand, model, serialNumbers } = data;

    const result = await prisma.$transaction(
      serialNumbers.map(serial =>
        prisma.vendorAsset.create({
          data: { 
            category, 
            brand, 
            model, 
            serialNumber: serial, 
            price: parseFloat(data.price) || 0,
            vendorId: vendor.id, 
            status: 'AVAILABLE' 
          }
        })
      )
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Vendor Portal Asset POST Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'One or more serial numbers already exist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
