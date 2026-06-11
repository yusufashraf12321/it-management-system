import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Vendor marks an order as SHIPPED (supplies the serials being sent)
export async function POST(request, { params }) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { token: params.token } });
    if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const { orderId, vendorAssetIds } = data;

    // Verify order belongs to this vendor
    const order = await prisma.purchaseOrder.findFirst({
      where: { id: parseInt(orderId), vendorId: vendor.id, status: 'PENDING' }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found or already processed' }, { status: 404 });
    }

    // Calculate total amount based on shipped assets' prices
    const assetsForPrice = await prisma.vendorAsset.findMany({
      where: { id: { in: vendorAssetIds } },
      select: { price: true }
    });
    const totalAmount = assetsForPrice.reduce((sum, a) => sum + (a.price || 0), 0);

    // Update order to SHIPPED and mark assets
    await prisma.$transaction([
      prisma.purchaseOrder.update({
        where: { id: order.id },
        data: { 
          status: 'SHIPPED',
          totalAmount: totalAmount
        }
      }),
      ...vendorAssetIds.map(id =>
        prisma.vendorAsset.update({
          where: { id },
          data: { status: 'TRANSFERRED' }
        })
      )
    ]);

    return NextResponse.json({ success: true, message: 'Order marked as shipped.' });
  } catch (error) {
    console.error('Vendor ship error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
