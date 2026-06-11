import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        category: data.category,
        quantity: parseInt(data.quantity),
        description: data.description,
        status: data.status // Allow updating status if needed
      }
    });
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    await prisma.purchaseOrder.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
