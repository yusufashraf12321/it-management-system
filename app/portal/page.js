'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Send, 
  CheckCircle, 
  Loader2, 
  Monitor, 
  Clock, 
  Plus,
  Server,
  AlertCircle,
  Package,
  ShieldCheck,
  Headphones,
  Keyboard,
  Mouse
} from 'lucide-react';
import SubmitTicketModal from '@/components/SubmitTicketModal';

export default function PortalPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/me');
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching portal data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const getIcon = (category) => {
    const lower = (category || '').toLowerCase();
    if (lower.includes('laptop') || lower.includes('computer')) return <Monitor size={24} />;
    if (lower.includes('keyboard')) return <Keyboard size={24} />;
    if (lower.includes('mouse')) return <Mouse size={24} />;
    if (lower.includes('headset')) return <Headphones size={24} />;
    return <Server size={24} />;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICAL': return 'text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      case 'HIGH': return 'text-warning drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'MEDIUM': return 'text-info';
      default: return 'text-success';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading && !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted opacity-60">Initializing Secure Portal...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-10 max-w-7xl mx-auto"
    >
      <header className="mb-16 flex justify-between items-end flex-wrap gap-8">
        <div className="flex items-center gap-6">
          <motion.div variants={itemAnim} className="w-16 h-16 rounded-[24px] bg-accent-primary/10 flex items-center justify-center text-accent-primary shadow-[0_10px_30px_rgba(59,130,246,0.2)]">
            <UserAvatar name={userData?.fullName} size={32} />
          </motion.div>
          <div>
            <motion.h1 variants={itemAnim} className="text-4xl font-bold tracking-tight mb-1.5">
              Welcome, {userData?.fullName?.split(' ')[0] || 'User'}
            </motion.h1>
            <motion.nav variants={itemAnim} className="text-[11px] uppercase font-bold tracking-[0.2em] text-muted flex gap-3">
              <span className="opacity-60">{userData?.jobTitle || 'Employee'}</span>
              <span className="opacity-20">/</span>
              <span className="text-accent-primary">{userData?.department?.name || 'Self-Service'}</span>
            </motion.nav>
          </div>
        </div>

        <motion.button 
          variants={itemAnim}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSubmitModalOpen(true)}
          className="btn btn-primary px-10 py-5 rounded-2xl shadow-[0_12px_30px_rgba(59,130,246,0.25)] flex items-center gap-3"
        >
          <Plus size={20} />
          <span className="font-bold uppercase tracking-widest text-xs">Request IT Support</span>
        </motion.button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Assigned Assets */}
        <motion.section variants={itemAnim} className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 rounded-full bg-success shadow-[0_0_10px_var(--success)]"></div>
            My Hardware Assets
          </h2>
          
          <div className="space-y-4">
            {userData?.assignedAssets?.length > 0 ? (
              userData.assignedAssets.map(asset => (
                <div key={asset.id} className="glass-card p-6 border-white/5 relative overflow-hidden group hover:border-success/30 transition-colors">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-white/[0.02] rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-500"></div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center shadow-inner flex-shrink-0">
                      {getIcon(asset.inventoryItem?.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-wide leading-tight">
                        {asset.inventoryItem?.brand} {asset.inventoryItem?.model}
                      </h3>
                      <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mt-1.5 opacity-70">
                        {asset.serialNumber}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_5px_var(--success)]"></span>
                        <span className="text-[9px] uppercase font-bold text-success tracking-widest">Active & Operational</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel p-10 text-center border-dashed border-white/10 opacity-60">
                <Package className="mx-auto mb-4 text-muted opacity-40" size={32} />
                <p className="text-xs text-muted font-bold uppercase tracking-widest leading-relaxed">No hardware currently<br/>assigned to you.</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Right Column: Ticket History */}
        <motion.section variants={itemAnim} className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 rounded-full bg-accent-primary shadow-[0_0_10px_var(--accent-primary)]"></div>
            My Support Tickets
          </h2>

          <div className="glass-panel p-0 overflow-hidden border-white/5 shadow-2xl">
            {userData?.tickets?.length > 0 ? (
              <div className="table-responsive">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                      <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px] text-muted">Ticket ID</th>
                      <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px] text-muted">Issue Brief</th>
                      <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px] text-muted">Priority</th>
                      <th className="p-6 text-right font-bold uppercase tracking-[0.2em] text-[10px] text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {userData.tickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <Ticket size={14} className="text-muted opacity-50 group-hover:text-accent-primary transition-colors" />
                            <span className="font-mono text-xs font-bold text-primary">{ticket.recNumber}</span>
                          </div>
                          <p className="text-[9px] text-muted font-mono tracking-widest mt-1.5 opacity-60">
                            {new Date(ticket.issueDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-6">
                          <p className="text-sm font-medium text-primary/90 max-w-xs truncate" title={ticket.issueImpact}>
                            {ticket.issueImpact}
                          </p>
                        </td>
                        <td className="p-6">
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end">
                            <StatusBadge status={ticket.status} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center">
                  <CheckCircle size={32} className="text-muted opacity-40" />
                </div>
                <h3 className="text-xl font-bold mb-2">All Clear</h3>
                <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
                  You have no active support requests. Everything is running smoothly.
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {isSubmitModalOpen && (
          <SubmitTicketModal 
            user={userData} 
            onClose={() => setIsSubmitModalOpen(false)} 
            onUpdate={fetchPortalData} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UserAvatar({ name, size = 24 }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  return (
    <span className="font-bold font-mono" style={{ fontSize: `${size}px` }}>{initial}</span>
  );
}

function StatusBadge({ status }) {
  const configs = {
    OPEN: { label: 'Open', class: 'badge-warning', icon: AlertCircle, glow: 'rgba(245, 158, 11, 0.2)' },
    IN_PROGRESS: { label: 'In Progress', class: 'badge-info', icon: Clock, glow: 'rgba(59, 130, 246, 0.2)' },
    RESOLVED: { label: 'Resolved', class: 'badge-success', icon: ShieldCheck, glow: 'rgba(34, 197, 94, 0.2)' },
  };
  const config = configs[status] || { label: status, class: 'badge-secondary', icon: AlertCircle, glow: 'rgba(148, 163, 184, 0.2)' };
  const Icon = config.icon;

  return (
    <div 
      className={`badge ${config.class} py-1.5 px-3 flex items-center gap-2 w-fit`}
      style={{ boxShadow: `0 0 10px ${config.glow}` }}
    >
      <Icon size={12} />
      <span className="font-bold tracking-[0.1em] uppercase text-[9px]">{config.label}</span>
    </div>
  );
}
