'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Wrench, Loader2, AlertCircle, Truck, Calendar, MessageSquare } from 'lucide-react';

export default function SendToMaintenanceModal({ asset, onClose, onUpdate }) {
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    serialNumber: asset.serialNumber,
    vendorName: '',
    notes: '',
    sendDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendorName) {
      setError('Please select a validated service vendor');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Dispatch failed');
      
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-container" 
        style={{ maxWidth: '480px' }}
      >
        <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Wrench size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Dispatch to Maintenance</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Serial Code:</span>
                <span className="text-[10px] font-mono font-bold text-accent-primary">{asset.serialNumber}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn-small"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold text-muted flex items-center gap-2 tracking-widest">
              <Truck size={12} className="text-accent-primary" />
              Logistics Vendor
            </label>
            <select 
              required
              value={formData.vendorName}
              onChange={e => setFormData({...formData, vendorName: e.target.value})}
              className="w-full bg-white/5 border-white/10 text-sm py-3 px-4 rounded-xl focus:border-accent-primary outline-none"
            >
              <option value="" className="bg-slate-900">Choose authorized vendor...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.name} className="bg-slate-900">{v.name}</option>
              ))}
              <option value="Other" className="bg-slate-900">External / New Vendor</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold text-muted flex items-center gap-2 tracking-widest">
              <Calendar size={12} className="text-accent-primary" />
              Dispatch Schedule
            </label>
            <input 
              type="date"
              required
              className="w-full bg-white/5 border-white/10 text-sm py-3 px-4 rounded-xl focus:border-accent-primary outline-none"
              value={formData.sendDate}
              onChange={e => setFormData({...formData, sendDate: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold text-muted flex items-center gap-2 tracking-widest">
              <MessageSquare size={12} className="text-accent-primary" />
              Maintenance Directives
            </label>
            <textarea 
              placeholder="State technical diagnostics or reason for repair..."
              rows={4}
              className="w-full bg-white/5 border-white/10 text-sm py-3 px-4 rounded-xl focus:border-accent-primary outline-none resize-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          {error && (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-[11px] font-bold flex items-center gap-3"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
        </form>

        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
          <button type="button" onClick={onClose} className="btn btn-secondary px-6">Cancel</button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={submitting} 
            className="btn btn-primary px-8"
            style={{ 
              background: 'var(--warning)', 
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)',
              borderColor: 'rgba(245, 158, 11, 0.3)'
            }}
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Dispatch Unit'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
