import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAction } from '@/lib/logger';
import { notify } from '@/lib/notifier';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Generate order number PO-YYYYMMDD-HHMMSS-XXXX for absolute uniqueness
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const count = await prisma.purchaseOrder.count();
    const orderNumber = `PO-${dateStr}-${timeStr}-${(count + 1).toString().padStart(4, '0')}`;

    const order = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        category: data.category,
        quantity: parseInt(data.quantity),
        description: data.description,
        vendorId: parseInt(data.vendorId),
        status: 'PENDING'
      }
    });

    await logAction('CREATE_ORDER', `Created order ${orderNumber} for ${data.category}`, null, 'Order', order.id);
    await notify('New Order Placed', `Order ${orderNumber} for ${data.quantity}x ${data.category} has been created.`, 'SUCCESS');

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendorId');

  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: vendorId ? { vendorId: parseInt(vendorId) } : {},
      include: { vendor: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
