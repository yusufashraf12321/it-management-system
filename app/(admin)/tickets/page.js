'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Search, Loader2, AlertCircle, CheckCircle, 
  Clock, ShieldCheck, ChevronRight, Zap
} from 'lucide-react';
import TicketEditModal from '@/components/TicketEditModal';

const PRIORITY_CONFIG = {
  CRITICAL: { label: 'Critical', dot: '#ef4444', glow: 'rgba(239,68,68,0.25)', badge: 'badge-danger' },
  HIGH:     { label: 'High',     dot: '#f59e0b', glow: 'rgba(245,158,11,0.25)', badge: 'badge-warning' },
  MEDIUM:   { label: 'Medium',   dot: '#0ea5e9', glow: 'rgba(14,165,233,0.25)', badge: 'badge-info' },
  LOW:      { label: 'Low',      dot: '#10b981', glow: 'rgba(16,185,129,0.25)', badge: 'badge-success' },
};

const STATUS_CONFIG = {
  OPEN:        { label: 'Open',        icon: AlertCircle,  badge: 'badge-warning' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock,        badge: 'badge-info' },
  RESOLVED:    { label: 'Resolved',    icon: CheckCircle,  badge: 'badge-success' },
  CLOSED:      { label: 'Closed',      icon: ShieldCheck,  badge: 'badge-secondary' },
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter(t => {
    const matchSearch =
      t.recNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.requesterName?.toLowerCase().includes(search.toLowerCase()) ||
      t.issueImpact?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    open:       tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved:   tickets.filter(t => t.status === 'RESOLVED').length,
    critical:   tickets.filter(t => t.priority === 'CRITICAL').length,
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const row       = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted opacity-60">Loading Helpdesk Queue...</p>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-10 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <header className="mb-14 flex justify-between items-end flex-wrap gap-6">
        <div className="flex items-center gap-6">
          <motion.div variants={row} className="w-16 h-16 rounded-[24px] bg-warning/10 flex items-center justify-center text-warning shadow-[0_10px_30px_rgba(245,158,11,0.15)]">
            <Ticket size={28} />
          </motion.div>
          <div>
            <motion.h1 variants={row} className="text-4xl font-bold tracking-tight mb-1.5">IT Helpdesk</motion.h1>
            <motion.p variants={row} className="text-[11px] uppercase font-bold tracking-[0.2em] text-muted opacity-70">
              Support Queue · Incident Management
            </motion.p>
          </div>
        </div>
      </header>

      {/* ── Stats ── */}
      <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Open',        value: stats.open,       color: '#f59e0b' },
          { label: 'In Progress', value: stats.inProgress, color: '#0ea5e9' },
          { label: 'Resolved',    value: stats.resolved,   color: '#10b981' },
          { label: 'Critical',    value: stats.critical,   color: '#ef4444' },
        ].map((s, i) => (
          <motion.div key={i} variants={row} className="glass-card p-7 border-white/5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-20 h-20 rounded-full opacity-20 -translate-x-2 -translate-y-2 group-hover:scale-125 transition-transform duration-500"
                 style={{ background: s.color }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">{s.label}</p>
            <p className="text-3xl font-bold font-mono tracking-tighter" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Toolbar ── */}
      <motion.div variants={row} className="flex flex-wrap gap-4 items-center justify-between mb-8">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-warning shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
          All Incidents
        </h2>
        <div className="flex gap-4 flex-wrap items-center">
          {/* Status filter pills */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  statusFilter === s ? 'bg-accent-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.35)]' : 'text-muted hover:text-white'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              className="pl-11 text-xs py-3.5 w-72 bg-white/5 border-white/10 rounded-xl shadow-inner outline-none focus:border-accent-primary transition-colors"
              placeholder="Search by REC#, name, or issue..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Table ── */}
      <motion.div variants={row} className="glass-panel p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="table-responsive">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                {['Ticket ID', 'Requester', 'Issue Summary', 'Priority', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="p-6 font-bold uppercase tracking-[0.2em] text-[10px] text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={container} className="divide-y divide-white/5">
              {filtered.map(ticket => {
                const pConf = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.LOW;
                const sConf = STATUS_CONFIG[ticket.status]   || STATUS_CONFIG.OPEN;
                const SIcon = sConf.icon;

                return (
                  <motion.tr
                    key={ticket.id}
                    variants={row}
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-white/[0.025] transition-colors cursor-pointer group"
                  >
                    <td className="p-6">
                      <p className="font-mono text-xs font-bold text-accent-primary">{ticket.recNumber}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold">{ticket.requesterName}</p>
                      <p className="text-[10px] text-muted mt-0.5 opacity-70">{ticket.email}</p>
                    </td>
                    <td className="p-6 max-w-xs">
                      <p className="text-sm text-muted/90 truncate">{ticket.issueImpact}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pConf.dot, boxShadow: `0 0 6px ${pConf.glow}` }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: pConf.dot }}>
                          {pConf.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`badge ${sConf.badge} flex items-center gap-2 w-fit py-1.5 px-3`}>
                        <SIcon size={11} />
                        <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{sConf.label}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-[11px] font-mono text-muted opacity-60">
                        {new Date(ticket.issueDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-6">
                      <ChevronRight size={18} className="text-muted opacity-20 group-hover:opacity-100 group-hover:text-accent-primary transition-all" />
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <Ticket size={48} className="text-muted opacity-10" />
            <p className="text-muted italic text-sm">No incidents match your filters.</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketEditModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={fetchTickets}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
