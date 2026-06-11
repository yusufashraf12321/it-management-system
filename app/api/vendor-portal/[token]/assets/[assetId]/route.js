import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Manage individual assets in vendor stock
export async function PATCH(request, { params }) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { token: params.token } });
    if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const assetId = parseInt(params.assetId);
    const data = await request.json();

    const asset = await prisma.vendorAsset.update({
      where: { id: assetId, vendorId: vendor.id },
      data: {
        category: data.category,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        price: parseFloat(data.price) || 0
      }
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Vendor Asset Update Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { token: params.token } });
    if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const assetId = parseInt(params.assetId);

    await prisma.vendorAsset.delete({
      where: { id: assetId, vendorId: vendor.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendor Asset Delete Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
