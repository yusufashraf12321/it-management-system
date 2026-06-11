import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const vendorId = parseInt(params.id);
    const data = await request.json();
    const { category, brand, model, serialNumbers } = data;

    const result = await prisma.$transaction(async (tx) => {
      const createdAssets = await Promise.all(
        serialNumbers.map(serial => 
          tx.vendorAsset.create({
            data: {
              category,
              brand,
              model,
              serialNumber: serial,
              vendorId,
              status: 'AVAILABLE'
            }
          })
        )
      );
      return createdAssets;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'One or more serial numbers already exist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const assets = await prisma.vendorAsset.findMany({
      where: { vendorId: parseInt(params.id) },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
