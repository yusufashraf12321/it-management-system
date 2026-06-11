import prisma from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const [totalAssets, availableInventory, openTickets, recentTickets, assetDistribution, maintenanceCount] = await Promise.all([
    prisma.asset.count(),
    prisma.inventoryItem.aggregate({ _sum: { availableCount: true } }),
    prisma.ticket.count({ where: { status: 'OPEN' } }),
    prisma.ticket.findMany({ take: 6, orderBy: { createdAt: 'desc' } }),
    prisma.inventoryItem.findMany({ select: { category: true, totalCount: true } }),
    prisma.maintenance.count({ where: { status: 'OUT_FOR_REPAIR' } })
  ]);

  const stats = [
    { label: 'Total Assets', value: totalAssets, color: 'var(--accent-primary)', iconName: 'Monitor', path: '/assets' },
    { label: 'In Stock', value: availableInventory._sum.availableCount || 0, color: 'var(--success)', iconName: 'Package', path: '/inventory' },
    { label: 'Open Tickets', value: openTickets, color: 'var(--warning)', iconName: 'TicketIcon', path: '/tickets' },
    { label: 'Maintenance', value: maintenanceCount, color: 'var(--danger)', iconName: 'Zap', path: '/maintenances' },
  ];

  // Group asset distribution by category
  const categories = assetDistribution.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.totalCount;
    return acc;
  }, {});
  
  const totalCatCount = Object.values(categories).reduce((a, b) => a + b, 0);
  const chartData = Object.entries(categories).map(([name, count]) => ({
    name,
    percentage: totalCatCount > 0 ? Math.round((count / totalCatCount) * 100) : 0
  })).slice(0, 5);

  return (
    <DashboardClient 
      stats={stats}
      recentTickets={recentTickets}
      chartData={chartData}
      maintenanceCount={maintenanceCount}
      availableInventory={availableInventory._sum.availableCount || 0}
    />
  );
}
