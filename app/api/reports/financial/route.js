import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [totalPurchases, vendors, orders] = await Promise.all([
      prisma.purchaseOrder.aggregate({
        where: { status: 'RECEIVED' },
        _sum: { totalAmount: true }
      }),
      prisma.vendor.findMany({
        include: {
          orders: {
            where: { status: 'RECEIVED' },
            select: { totalAmount: true }
          }
        }
      }),
      prisma.purchaseOrder.findMany({
        where: { status: 'RECEIVED' },
        include: { vendor: true },
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    const vendorStats = vendors.map(v => ({
      name: v.name,
      totalSpent: v.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      orderCount: v.orders.length
    }));

    return NextResponse.json({
      totalInvestment: totalPurchases._sum.totalAmount || 0,
      vendorStats,
      recentCapitalOrders: orders
    });
  } catch (error) {
    console.error('Financial Report Error:', error);
    return NextResponse.json({ error: 'Failed to generate financial report' }, { status: 500 });
  }
}
