'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Monitor, Package, Ticket as TicketIcon, Zap,
  ArrowUpRight, AlertTriangle, Activity, TrendingUp,
  CheckCircle2, Clock, Server, Database, Radio
} from 'lucide-react';

const IconMap = { Monitor, Package, TicketIcon, Zap };

const STAT_COLORS = [
  { gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', glow: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.08)' },
  { gradient: 'linear-gradient(135deg, #10b981, #059669)', glow: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.08)' },
  { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.08)' },
  { gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', glow: 'rgba(239,68,68,0.3)',   bg: 'rgba(239,68,68,0.08)'  },
];

export default function DashboardClient({ stats, recentTickets, chartData, maintenanceCount, availableInventory }) {
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.4,0,0.2,1] } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <motion.header variants={item} style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#f0f6ff', margin: '0 0 0.375rem 0' }}>
            System Intelligence
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#4d6580', margin: 0, fontWeight: '500' }}>
            Real-time infrastructure health and asset lifecycle
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.35rem 0.875rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '999px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#10b981', letterSpacing: '1px', fontFamily: 'monospace' }}>ALL SYSTEMS OPERATIONAL</span>
          </div>
          <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#4d6580', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.35rem 0.875rem', borderRadius: '999px' }}>
            v2.4.0 · STABLE
          </div>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <motion.section variants={container} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((stat, i) => {
          const Icon = IconMap[stat.iconName] || Monitor;
          const colors = STAT_COLORS[i] || STAT_COLORS[0];
          return (
            <motion.div key={i} variants={item}>
              <Link href={stat.path} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: 'rgba(13,27,46,0.6)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px',
                  padding: '1.5rem', transition: 'all 0.25s ease', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.boxShadow = `0 12px 35px rgba(0,0,0,0.4), 0 0 25px ${colors.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)'; }}
                >
                  {/* BG accent */}
                  <div style={{ position: 'absolute', inset: 0, background: colors.bg, opacity: 0.5, borderRadius: '16px' }} />
                  {/* Large ghost icon */}
                  <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', opacity: 0.08 }}>
                    <Icon size={80} />
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Icon */}
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: colors.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1.25rem', boxShadow: `0 6px 20px ${colors.glow}`,
                    }}>
                      <Icon size={22} color="white" />
                    </div>

                    <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#4d6580', marginBottom: '0.375rem' }}>
                      {stat.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <div style={{ fontSize: '2.25rem', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '-1px', color: '#f0f6ff', lineHeight: 1 }}>
                        {stat.value}
                      </div>
                      <ArrowUpRight size={14} style={{ color: '#4d6580' }} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Recent Tickets Table */}
          <motion.section variants={item} style={{
            background: 'rgba(13,27,46,0.5)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={16} color="#60a5fa" />
                </div>
                <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f0f6ff', margin: 0 }}>Operational Tickets</h2>
              </div>
              <Link href="/tickets" style={{ fontSize: '0.75rem', fontWeight: '600', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View all <ArrowUpRight size={13} />
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {['Requester', 'Issue', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1.75rem', textAlign: h === 'Status' ? 'right' : 'left', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d6580', background: 'rgba(5,15,35,0.3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#4d6580', fontSize: '0.875rem' }}>No tickets yet</td></tr>
                  ) : recentTickets.map((ticket) => (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem 1.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#f0f6ff' }}>{ticket.requesterName}</td>
                      <td style={{ padding: '1rem 1.75rem', fontSize: '0.8rem', color: '#4d6580', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.issueImpact}</td>
                      <td style={{ padding: '1rem 1.75rem', textAlign: 'right' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
                          ...(ticket.status === 'OPEN' ? { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' } :
                             ticket.status === 'RESOLVED' ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' } :
                             { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' })
                        }}>{ticket.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Asset Distribution */}
          <motion.section variants={item} style={{
            background: 'rgba(13,27,46,0.5)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.75rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#a78bfa" />
              </div>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f0f6ff', margin: 0 }}>Asset Architecture Distribution</h2>
            </div>

            {chartData.length === 0 ? (
              <p style={{ color: '#4d6580', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>No asset data available</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {chartData.map((data, i) => {
                  const barColors = ['#3b82f6', '#10b981', '#f59e0b', '#a78bfa', '#0ea5e9'];
                  const color = barColors[i % barColors.length];
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#8ba3c0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{data.name}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', fontFamily: 'monospace', color }}>{data.percentage}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${data.percentage}%` }}
                          transition={{ duration: 1.2, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                          style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${color}, ${color}99)`, boxShadow: `0 0 8px ${color}66` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>

        {/* Right sidebar */}
        <motion.aside variants={item} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Alerts */}
          <section style={{
            background: 'rgba(13,27,46,0.5)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <AlertTriangle size={15} color="#f59e0b" />
              <h3 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#f59e0b', margin: 0 }}>Alerts</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {maintenanceCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239,68,68,0.07)', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Zap size={14} color="#f87171" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fca5a5' }}>Active Repairs</span>
                  </div>
                  <span style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: '800', color: '#f87171' }}>{maintenanceCount}</span>
                </div>
              )}
              {availableInventory < 10 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245,158,11,0.07)', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <AlertTriangle size={14} color="#fbbf24" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fde68a' }}>Low Inventory</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: '800', color: '#fbbf24', background: 'rgba(245,158,11,0.15)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>CRITICAL</span>
                </div>
              )}
              {maintenanceCount === 0 && availableInventory >= 10 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'rgba(16,185,129,0.07)', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <CheckCircle2 size={14} color="#34d399" />
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6ee7b7' }}>All systems healthy</span>
                </div>
              )}
            </div>
          </section>

          {/* Infrastructure Status */}
          <section style={{
            background: 'rgba(13,27,46,0.5)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#4d6580', margin: '0 0 1.25rem 0' }}>Infrastructure Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <ServiceRow icon={<Server size={14} />} label="Database Cluster" status="Synced" color="#10b981" />
              <ServiceRow icon={<Radio size={14} />} label="Asset Sync API" status="Active" color="#3b82f6" />
              <ServiceRow icon={<Database size={14} />} label="Backup Storage" status="Optimal" color="#10b981" />
            </div>
          </section>

          {/* Notice card */}
          <section style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,58,237,0.05))',
            border: '1px solid rgba(59,130,246,0.15)', borderRadius: '16px', padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Clock size={13} color="#60a5fa" />
              <h4 style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#60a5fa', margin: 0 }}>Notice</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#4d6580', lineHeight: 1.6, margin: 0 }}>
              Serialized tracking is mandatory for all Category &quot;C&quot; assets. Ensure maintenance records include valid serial tags.
            </p>
          </section>
        </motion.aside>
      </div>
    </motion.div>
  );
}

function ServiceRow({ icon, label, status, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#4d6580' }}>
        {icon}
        <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#8ba3c0' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color, fontFamily: 'monospace' }}>{status}</span>
      </div>
    </div>
  );
}
