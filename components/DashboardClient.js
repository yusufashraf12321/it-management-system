'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  Monitor, 
  Ticket as TicketIcon, 
  ArrowUpRight, 
  Clock, 
  Package,
  Truck,
  AlertTriangle,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';

const IconMap = {
  Monitor,
  Package,
  TicketIcon,
  Zap
};

export default function DashboardClient({ stats, recentTickets, chartData, maintenanceCount, availableInventory }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 max-w-7xl mx-auto"
    >
      <header className="mb-12 flex justify-between items-end flex-wrap gap-4">
        <div>
          <motion.h1 variants={item} className="text-3xl font-bold text-primary mb-2 tracking-tight">System Intelligence</motion.h1>
          <motion.p variants={item} className="text-sm text-muted font-medium">Real-time infrastructure health and asset lifecycle.</motion.p>
        </div>
        <motion.div variants={item} className="text-[10px] font-mono text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full border border-accent-primary/20 shrink-0">
          v2.4.0 • STABLE
        </motion.div>
      </header>

      <motion.section variants={container} className="grid grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => {
          const Icon = IconMap[stat.iconName] || Monitor;
          return (
            <motion.div key={i} variants={item}>
              <Link href={stat.path} className="no-underline group">
                <div className="glass-card flex flex-col justify-between h-32 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon size={80} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{stat.label}</span>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                    <ArrowUpRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.section>

      <div className="grid grid-cols-12 gap-8">
        <motion.div variants={item} className="col-span-12 lg:col-span-8 space-y-8">
          <section className="glass-panel p-8">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity size={18} className="text-accent-primary" />
                Operational Tickets
              </h2>
              <Link href="/tickets" className="text-[10px] font-bold text-accent-primary hover:underline uppercase tracking-tighter">
                View Full Logs
              </Link>
            </div>
            <div className="table-responsive">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted border-b border-white/5">
                    <th className="pb-4 font-medium">Requester</th>
                    <th className="pb-4 font-medium">Impact Scope</th>
                    <th className="pb-4 text-right font-medium">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 text-sm font-medium">{ticket.requesterName}</td>
                      <td className="py-4 text-xs text-muted truncate max-w-[200px]">{ticket.issueImpact}</td>
                      <td className="py-4 text-right">
                        <span className={`badge ${ticket.status.toLowerCase()}`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="glass-panel p-8">
            <h2 className="text-lg font-bold mb-8">Asset Architecture Distribution</h2>
            <div className="space-y-6">
              {chartData.map((data, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted uppercase tracking-wider">{data.name}</span>
                    <span className="font-mono text-accent-primary">{data.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${data.percentage}%` }}
                      transition={{ duration: 1.5, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                      className="h-full rounded-full"
                      style={{ 
                        background: `linear-gradient(to right, var(--accent-primary), var(--accent-secondary))`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </motion.div>

        <motion.aside variants={item} className="col-span-12 lg:col-span-4 space-y-8">
          <section className="p-6 rounded-xl border border-danger/20 bg-danger/5 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <AlertTriangle size={60} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-danger mb-6">Security & Stock Alerts</h3>
            <div className="space-y-4">
              {maintenanceCount > 0 && (
                <div className="flex justify-between items-center bg-danger/10 p-4 rounded-lg border border-danger/10">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-danger" />
                    <span className="text-[10px] font-bold uppercase">Active Repairs</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-danger">{maintenanceCount}</span>
                </div>
              )}
              {availableInventory < 10 && (
                <div className="flex justify-between items-center bg-warning/10 p-4 rounded-lg border border-warning/10">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-warning" />
                    <span className="text-[10px] font-bold uppercase">Low Inventory</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-warning">CRITICAL</span>
                </div>
              )}
            </div>
          </section>

          <section className="glass-panel p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-6">Infrastructure Status</h3>
            <div className="space-y-4">
              <HealthBar label="Network Backbone" status="Optimal" color="var(--success)" />
              <HealthBar label="Database Cluster" status="Synced" color="var(--success)" />
              <HealthBar label="Asset Sync API" status="Active" color="var(--accent-primary)" />
            </div>
          </section>

          <div className="p-6 bg-accent-primary/5 border border-accent-primary/10 rounded-xl">
            <h4 className="text-[10px] font-bold text-accent-primary uppercase mb-2">Notice</h4>
            <p className="text-[11px] text-muted leading-relaxed">
              New serialized tracking is mandatory for all Category &quot;C&quot; assets. Please ensure all maintenance records include valid serial tags.
            </p>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}

function HealthBar({ label, status, color }) {
  return (
    <div className="flex justify-between items-center group cursor-default">
      <div className="space-y-1">
        <div className="text-[10px] text-muted uppercase tracking-tighter">{label}</div>
        <div className="text-xs font-bold text-primary group-hover:text-accent-primary transition-colors">{status}</div>
      </div>
      <div className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color: color }}></div>
    </div>
  );
}
