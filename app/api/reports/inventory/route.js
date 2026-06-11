import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [assets, departments] = await Promise.all([
      prisma.asset.findMany({
        include: { 
          inventoryItem: true,
          assignedToUser: true,
          department: true
        }
      }),
      prisma.department.findMany({
        include: {
          assets: { select: { price: true } }
        }
      })
    ]);

    const stats = {
      totalAssetsCount: assets.length,
      statusDistribution: assets.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {}),
      categoryDistribution: assets.reduce((acc, a) => {
        const cat = a.inventoryItem.category;
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
      deptValue: departments.map(d => ({
        name: d.name,
        value: d.assets.reduce((sum, a) => sum + (a.price || 0), 0),
        count: d.assets.length
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Inventory Report Error:', error);
    return NextResponse.json({ error: 'Failed to generate inventory report' }, { status: 500 });
  }
}
