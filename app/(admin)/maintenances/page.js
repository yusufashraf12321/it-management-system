'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  Truck, 
  Search, 
  AlertCircle, 
  X, 
  ArrowRight,
  Monitor,
  LayoutDashboard,
  Calendar,
  Loader2
} from 'lucide-react';

export default function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmReturnId, setConfirmReturnId] = useState(null);
  
  const [formData, setFormData] = useState({
    serialNumber: '',
    vendorName: '',
    notes: ''
  });

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    try {
      const res = await fetch('/api/maintenances');
      const data = await res.json();
      setMaintenances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit');
      
      setFormData({ serialNumber: '', vendorName: '', notes: '' });
      setShowForm(false);
      fetchMaintenances();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (id) => {
    try {
      const res = await fetch(`/api/maintenances/${id}/return`, { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
      setConfirmReturnId(null);
      fetchMaintenances();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeRepairs = maintenances.filter(m => m.status === 'OUT_FOR_REPAIR');
  const completedRepairs = maintenances.filter(m => m.status === 'RETURNED');
  
  const filteredActive = activeRepairs.filter(m => 
    m.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.asset?.inventoryItem?.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Active Repairs', value: activeRepairs.length, icon: Wrench, color: 'var(--accent-primary)' },
    { label: 'Validated Vendors', value: [...new Set(activeRepairs.map(m => m.vendorName))].length, icon: Truck, color: 'var(--info)' },
    { label: 'Monthly Throughput', value: completedRepairs.filter(m => m.returnDate && new Date(m.returnDate).getMonth() === new Date().getMonth()).length, icon: CheckCircle, color: 'var(--success)' },
    { label: 'System Health', value: 'OPTIMAL', icon: Clock, color: 'var(--warning)' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted opacity-60">Synchronizing Maintenance Logs...</p>
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
        <div>
          <motion.h1 variants={itemAnim} className="text-4xl font-bold tracking-tight mb-2.5">Maintenance Hub</motion.h1>
          <motion.p variants={itemAnim} className="text-sm text-muted max-w-lg leading-relaxed">Centralized telemetry for infrastructure repairs and hardware lifecycle service.</motion.p>
        </div>
        <motion.button 
          variants={itemAnim}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'} px-10 py-5 rounded-2xl shadow-[0_12px_30px_rgba(59,130,246,0.25)]`}
        >
          {showForm ? <><X size={20} /> Abort Dispatch</> : <><Plus size={22} /> Register Repair</>}
        </motion.button>
      </header>

      {/* Stats Row */}
      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemAnim} className="glass-card p-8 flex items-center gap-6 border-white/5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-white/[0.02] rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform"></div>
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner" style={{ color: stat.color }}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1.5">{stat.label}</p>
              <p className="text-2xl font-bold font-mono tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.section 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-16 overflow-hidden"
          >
            <div className="glass-panel p-10 bg-accent-primary/[0.04] border-accent-primary/20 relative shadow-2xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <Truck size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Manual Logistics Dispatch</h2>
                  <p className="text-[10px] uppercase font-bold text-accent-primary tracking-widest mt-1 opacity-70">Infrastructure Repair Protocol</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-muted tracking-widest ml-1 flex items-center gap-2">
                    <Monitor size={12} /> Asset Serial Code
                  </label>
                  <input 
                    required
                    className="w-full bg-white/5 border-white/10 py-4 px-5 rounded-xl text-sm"
                    placeholder="E.g., SN-2024-XXXX"
                    value={formData.serialNumber}
                    onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-muted tracking-widest ml-1 flex items-center gap-2">
                    <Truck size={12} /> Service Vendor
                  </label>
                  <input 
                    required
                    className="w-full bg-white/5 border-white/10 py-4 px-5 rounded-xl text-sm"
                    placeholder="Authorized Service Name..."
                    value={formData.vendorName}
                    onChange={e => setFormData({...formData, vendorName: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-muted tracking-widest ml-1 flex items-center gap-2">
                    <AlertCircle size={12} /> Diagnostic Notes
                  </label>
                  <input 
                    className="w-full bg-white/5 border-white/10 py-4 px-5 rounded-xl text-sm"
                    placeholder="Reason for repair dispatch..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-5 pt-8 border-t border-white/5">
                  <button type="submit" disabled={submitting} className="btn btn-primary px-12 py-4 shadow-[0_8px_25px_rgba(59,130,246,0.3)]">
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Execute Dispatch'}
                  </button>
                </div>
              </form>
              {error && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mt-8 p-5 bg-danger/10 border border-danger/20 text-danger rounded-2xl text-[11px] font-bold flex items-center gap-4">
                  <AlertCircle size={20} /> {error}
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="space-y-16">
        <section>
          <div className="flex justify-between items-center mb-10 flex-wrap gap-6">
            <h2 className="text-2xl font-bold flex items-center gap-4">
              <div className="w-2 h-8 rounded-full bg-accent-primary shadow-[0_0_15px_var(--accent-primary)]"></div>
              Active Infrastructure Repairs
            </h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                className="pl-12 text-xs py-3.5 w-80 bg-white/5 border-white/10 rounded-2xl shadow-inner"
                placeholder="Search across telemetry fields..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActive.map((item) => (
              <motion.div 
                key={item.id} 
                variants={itemAnim}
                className="glass-card p-0 overflow-hidden group hover:border-accent-primary/50 transition-all shadow-2xl"
              >
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary shadow-inner">
                      <Monitor size={24} />
                    </div>
                    <span className="badge badge-warning text-[9px] px-3 py-1.5 font-bold tracking-[0.2em] shadow-lg shadow-warning/10">DISPATCHED</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-xl tracking-tight leading-tight">{item.asset?.inventoryItem?.brand || 'Manual'} {item.asset?.inventoryItem?.model || 'Asset'}</h3>
                    <p className="text-[10px] font-mono text-muted uppercase tracking-[0.25em] mt-1.5 opacity-60">{item.serialNumber}</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                      <span className="text-muted flex items-center gap-2 opacity-50"><Truck size={12} /> Service Provider</span>
                      <span className="text-primary">{item.vendorName}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                      <span className="text-muted flex items-center gap-2 opacity-50"><Clock size={12} /> Dispatch Date</span>
                      <span className="text-primary">{item.sendDate ? new Date(item.sendDate).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.03] border-t border-white/5 group-hover:bg-accent-primary/10 transition-all duration-300">
                  <button 
                    onClick={() => setConfirmReturnId(item.id)}
                    className="w-full py-3.5 rounded-xl bg-accent-primary/10 hover:bg-success/20 text-accent-primary hover:text-success text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-sm"
                  >
                    <CheckCircle size={16} /> Finalize Return
                  </button>
                </div>
              </motion.div>
            ))}
            {activeRepairs.length === 0 && (
              <div className="col-span-full py-32 text-center glass-panel border-dashed border-white/10 opacity-30 bg-white/[0.01]">
                <Wrench className="mx-auto mb-6 text-muted opacity-20" size={64} />
                <p className="text-muted italic text-lg font-light tracking-wide">Infrastructure operational health is 100%.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-10 flex items-center gap-4">
            <div className="w-2 h-8 rounded-full bg-success shadow-[0_0_15px_var(--success)]"></div>
            Historical Repair Registry
          </h2>
          <div className="glass-panel overflow-hidden border-white/5 shadow-2xl">
            <div className="table-responsive">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px]">Asset Configuration</th>
                    <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px]">Service Provider</th>
                    <th className="p-6 font-bold uppercase tracking-[0.2em] text-[10px]">Lifecycle Cycle</th>
                    <th className="p-6 text-right font-bold uppercase tracking-[0.2em] text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {completedRepairs.slice(0, 15).map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="font-bold text-base tracking-tight">{item.asset?.inventoryItem?.brand || 'Manual'} {item.asset?.inventoryItem?.model || 'Entry'}</div>
                        <div className="text-[10px] text-muted font-mono tracking-widest mt-1 opacity-60">{item.serialNumber}</div>
                      </td>
                      <td className="p-6 font-bold text-primary/70 tracking-wide">{item.vendorName}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-4 text-[12px] font-mono">
                          <span className="text-muted opacity-40">{item.sendDate ? new Date(item.sendDate).toLocaleDateString() : '—'}</span>
                          <ArrowRight size={14} className="text-muted opacity-20" />
                          <span className="text-success font-bold">{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '—'}</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end">
                          <span className="badge badge-success text-[10px] py-1.5 px-3 border-success/10 bg-success/5 tracking-[0.1em] font-bold">ARCHIVED</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {confirmReturnId && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="modal-container p-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.5)] border-white/5"
              style={{ maxWidth: '440px' }}
            >
              <div className="w-20 h-20 rounded-full bg-success/10 text-success mx-auto mb-8 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Finalize Infrastructure Return?</h3>
              <p className="text-sm text-muted mb-10 leading-relaxed font-medium">
                This asset will be reintegrated into active deployment and its status will be updated to <span className="text-success font-bold uppercase tracking-widest px-1">In Stock</span>.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmReturnId(null)} className="btn btn-secondary flex-1 py-4 font-bold uppercase tracking-widest text-xs">Cancel</button>
                <button 
                  onClick={() => handleReturn(confirmReturnId)} 
                  className="btn btn-primary flex-1 py-4 font-bold uppercase tracking-widest text-xs"
                  style={{ background: 'var(--success)', borderColor: 'rgba(34, 197, 94, 0.2)', boxShadow: '0 8px 25px rgba(34, 197, 94, 0.25)' }}
                >
                  Confirm Return
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
