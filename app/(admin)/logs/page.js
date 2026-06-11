'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  User, 
  Shield, 
  Info, 
  Loader2, 
  Search, 
  Terminal, 
  AlertTriangle, 
  FileText,
  Server,
  Zap,
  CheckCircle,
  XCircle,
  Trash2,
  Plus
} from 'lucide-react';

export default function LogsPage() {
  const [activeSubTab, setActiveSubTab] = useState('activity');
  const [activityLogs, setActivityLogs] = useState([]);
  const [technicalLogs, setTechnicalLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const endpoint = activeSubTab === 'activity' ? '/api/logs' : '/api/logs/technical';
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (activeSubTab === 'activity') setActivityLogs(Array.isArray(data) ? data : []);
        else setTechnicalLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeSubTab]);

  const filteredLogs = activeSubTab === 'activity' 
    ? activityLogs.filter(log => 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : technicalLogs.filter(log => 
        log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemAnim = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD')) {
      return { class: 'badge-success', icon: Plus, glow: 'rgba(34, 197, 94, 0.2)' };
    }
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return { class: 'badge-danger', icon: Trash2, glow: 'rgba(239, 68, 68, 0.2)' };
    }
    if (act.includes('UPDATE') || act.includes('EDIT')) {
      return { class: 'badge-warning', icon: Activity, glow: 'rgba(245, 158, 11, 0.2)' };
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return { class: 'badge-primary', icon: Shield, glow: 'rgba(59, 130, 246, 0.2)' };
    }
    return { class: 'badge-secondary', icon: Info, glow: 'rgba(148, 163, 184, 0.2)' };
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-10 max-w-7xl mx-auto"
    >
      <header className="mb-16 flex justify-between items-end flex-wrap gap-8">
        <div className="flex items-center gap-6">
          <motion.div variants={itemAnim} className="w-16 h-16 rounded-[24px] bg-accent-primary/10 flex items-center justify-center text-accent-primary shadow-[0_10px_30px_rgba(59,130,246,0.2)] relative">
            <Activity size={28} />
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-success animate-ping"></span>
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-success shadow-[0_0_10px_var(--success)]"></span>
          </motion.div>
          <div>
            <motion.h1 variants={itemAnim} className="text-4xl font-bold tracking-tight mb-1.5">System Telemetry</motion.h1>
            <motion.nav variants={itemAnim} className="text-[11px] uppercase font-bold tracking-[0.2em] text-muted flex gap-3">
              <span className="opacity-60">Administration</span>
              <span className="opacity-20">/</span>
              <span className="text-accent-primary">Event Logs</span>
            </motion.nav>
          </div>
        </div>

        <motion.div variants={itemAnim} className="flex gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveSubTab('activity')}
            className={`px-8 py-3 rounded-xl flex items-center gap-3 text-sm font-bold uppercase tracking-widest transition-all ${activeSubTab === 'activity' ? 'bg-accent-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-muted hover:text-white hover:bg-white/5'}`}
          >
            <FileText size={16} /> Audit Trail
          </button>
          <button 
            onClick={() => setActiveSubTab('technical')}
            className={`px-8 py-3 rounded-xl flex items-center gap-3 text-sm font-bold uppercase tracking-widest transition-all ${activeSubTab === 'technical' ? 'bg-warning text-warning-foreground shadow-[0_0_20px_rgba(245,158,11,0.3)] text-black' : 'text-muted hover:text-white hover:bg-white/5'}`}
          >
            <Terminal size={16} /> Kernel Logs
          </button>
        </motion.div>
      </header>

      <motion.div variants={itemAnim} className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-accent-primary shadow-[0_0_15px_var(--accent-primary)]"></div>
          {activeSubTab === 'activity' ? 'User Activity Stream' : 'System Diagnostic Output'}
        </h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            className="pl-12 text-xs py-3.5 w-80 bg-white/5 border-white/10 rounded-2xl shadow-inner focus:border-accent-primary transition-colors outline-none"
            placeholder="Search events, users, or modules..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 glass-panel border-white/5">
          <Loader2 className="animate-spin text-accent-primary" size={48} />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted opacity-60">Intercepting Telemetry Stream...</p>
        </div>
      ) : (
        <motion.div variants={container} className="glass-panel overflow-hidden border-white/5 shadow-2xl p-0">
          {activeSubTab === 'activity' ? (
            <div className="table-responsive">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px] text-muted">Timestamp</th>
                    <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px] text-muted">Identity</th>
                    <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px] text-muted">Event Type</th>
                    <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px] text-muted">Payload Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.map(log => {
                    const badge = getActionBadge(log.action);
                    const BadgeIcon = badge.icon;
                    return (
                      <motion.tr variants={itemAnim} key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-3 text-muted group-hover:text-primary transition-colors">
                            <Clock size={14} className="opacity-50" />
                            <span className="font-mono text-[11px] tracking-wider">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-xs shadow-inner border border-accent-primary/20">
                              {log.userEmail ? log.userEmail[0].toUpperCase() : 'S'}
                            </div>
                            <span className="text-sm font-bold tracking-wide">{log.userEmail || 'SYSTEM'}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div 
                            className={`badge ${badge.class} py-1.5 px-3 flex items-center gap-2 w-fit`}
                            style={{ boxShadow: `0 0 10px ${badge.glow}` }}
                          >
                            <BadgeIcon size={12} />
                            <span className="font-bold tracking-[0.1em] uppercase text-[10px]">{log.action}</span>
                          </div>
                        </td>
                        <td className="p-6 text-sm text-muted max-w-md">
                          <p className="truncate font-medium group-hover:text-primary/80 transition-colors" title={log.details}>
                            {log.details}
                          </p>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#0a0a0a] p-8 font-mono text-[13px] relative overflow-x-auto border-t border-white/5 shadow-inner min-h-[500px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent opacity-50"></div>
              {filteredLogs.map((log, i) => (
                <motion.div variants={itemAnim} key={log.id || i} className="mb-3 flex gap-4 items-start hover:bg-white/[0.02] p-1.5 rounded transition-colors group">
                  <span className="text-muted/50 whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
                    [{new Date(log.timestamp || new Date()).toLocaleTimeString()}]
                  </span>
                  <span className={`font-bold tracking-widest uppercase w-16 flex-shrink-0 ${
                    log.level === 'ERROR' ? 'text-danger drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 
                    log.level === 'WARN' ? 'text-warning drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 
                    log.level === 'DEBUG' ? 'text-info' : 'text-success'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-accent-primary/80 whitespace-nowrap">
                    [{log.module}]
                  </span>
                  <span className="text-white/90 break-words">
                    {log.message}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
          {filteredLogs.length === 0 && (
            <motion.div variants={itemAnim} className="p-20 text-center text-muted border-t border-white/5 flex flex-col items-center">
              <Server size={48} className="opacity-20 mb-4" />
              <p className="italic text-sm tracking-wide">Telemetry feed is currently empty.</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
