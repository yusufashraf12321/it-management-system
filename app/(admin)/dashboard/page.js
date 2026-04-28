import prisma from '@/lib/prisma';
import { Package, Monitor, Ticket, Users } from 'lucide-react';

async function getDashboardData() {
  const [totalAssets, availableInventory, openTickets, totalEmployees] = await Promise.all([
    prisma.asset.count(),
    prisma.inventoryItem.aggregate({ _sum: { availableCount: true } }),
    prisma.ticket.count({ where: { status: 'OPEN' } }),
    prisma.user.count({ where: { role: 'EMPLOYEE' } })
  ]);

  const recentTickets = await prisma.ticket.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { requester: true }
  });

  return {
    totalAssets,
    availableInventory: availableInventory._sum.availableCount || 0,
    openTickets,
    totalEmployees,
    recentTickets
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl">Overview</h2>
        <p className="text-muted">Welcome to the IT Management Dashboard</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="glass-card" style={styles.statCard}>
          <div style={{...styles.iconWrapper, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)'}}>
            <Monitor size={24} />
          </div>
          <div>
            <p className="text-muted">Total Assets</p>
            <h3 className="text-3xl">{data.totalAssets}</h3>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{...styles.iconWrapper, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)'}}>
            <Package size={24} />
          </div>
          <div>
            <p className="text-muted">In Stock</p>
            <h3 className="text-3xl">{data.availableInventory}</h3>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{...styles.iconWrapper, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)'}}>
            <Ticket size={24} />
          </div>
          <div>
            <p className="text-muted">Open Tickets</p>
            <h3 className="text-3xl">{data.openTickets}</h3>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{...styles.iconWrapper, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6'}}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-muted">Employees</p>
            <h3 className="text-3xl">{data.totalEmployees}</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 className="text-xl mb-4">Recent Tickets</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>REC Number</th>
                <th>Requester</th>
                <th>Issue Date</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td style={{ fontWeight: 600 }}>{ticket.recNumber}</td>
                  <td>{ticket.requesterName}</td>
                  <td>{new Date(ticket.issueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH' ? 'danger' : 'info'}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${ticket.status === 'OPEN' ? 'warning' : 'success'}`}>
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.recentTickets.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                    No recent tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  iconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
