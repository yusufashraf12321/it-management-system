import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { token: params.token },
      include: {
        vendorAssets: {
          orderBy: { createdAt: 'desc' }
        },
        orders: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor portal not found' }, { status: 404 });
    }

    // Don't expose the token in the response
    const { token, ...safeVendor } = vendor;
    return NextResponse.json(safeVendor);
  } catch (error) {
    console.error('Error fetching vendor portal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
