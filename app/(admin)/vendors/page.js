'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, User, Mail, Phone, Plus, Loader2, Package, 
  Trash2, ExternalLink, AlertCircle, X
} from 'lucide-react';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', contactPerson: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor)
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchVendors();
        setNewVendor({ name: '', contactPerson: '', email: '', phone: '' });
      } else {
        setError(data.error || 'Failed to create vendor');
      }
    } catch (err) {
      setError('A network error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/vendors/${confirmDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmDelete(null);
        fetchVendors();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item      = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted opacity-60">Syncing Vendor Registry...</p>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-10 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <header className="mb-14 flex justify-between items-end flex-wrap gap-6">
        <div className="flex items-center gap-6">
          <motion.div variants={item} className="w-16 h-16 rounded-[24px] bg-accent-secondary/10 flex items-center justify-center text-accent-secondary shadow-[0_10px_30px_rgba(139,92,246,0.15)]">
            <Truck size={28} />
          </motion.div>
          <div>
            <motion.h1 variants={item} className="text-4xl font-bold tracking-tight mb-1.5">Vendor Management</motion.h1>
            <motion.p variants={item} className="text-[11px] uppercase font-bold tracking-[0.2em] text-muted opacity-70">
              Supply Chain · External Suppliers · Purchase Orders
            </motion.p>
          </div>
        </div>
        <motion.button
          variants={item}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-primary px-10 py-5 rounded-2xl shadow-[0_12px_30px_rgba(59,130,246,0.25)] flex items-center gap-3"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} />
          <span className="font-bold uppercase tracking-widest text-xs">Register Vendor</span>
        </motion.button>
      </header>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'Active Vendors',  value: vendors.length, color: 'var(--accent-secondary)' },
          { label: 'Total Orders',    value: vendors.reduce((s, v) => s + (v._count?.orders || 0), 0), color: 'var(--info)' },
          { label: 'Stock Items',     value: vendors.reduce((s, v) => s + (v._count?.vendorAssets || 0), 0), color: 'var(--success)' },
        ].map((s, i) => (
          <motion.div key={i} variants={item} className="glass-card p-7 border-white/5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity -translate-x-2 -translate-y-2 group-hover:scale-125 duration-500"
                 style={{ background: s.color }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2">{s.label}</p>
            <p className="text-3xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Vendor Grid ── */}
      <motion.div variants={container} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {vendors.map(vendor => (
          <motion.div key={vendor.id} variants={item} className="glass-card p-0 overflow-hidden border-white/5 hover:border-accent-secondary/40 transition-all shadow-xl group flex flex-col">
            {/* Accent bar */}
            <div className="h-1 bg-gradient-to-r from-accent-secondary/60 to-transparent"></div>

            <div className="p-7 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent-secondary/10 flex items-center justify-center text-accent-secondary shadow-inner">
                  <Truck size={24} />
                </div>
                <button
                  onClick={() => setConfirmDelete({ id: vendor.id, name: vendor.name })}
                  className="w-9 h-9 rounded-xl bg-danger/10 hover:bg-danger/25 border border-danger/10 flex items-center justify-center text-danger transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Vendor"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <h3 className="text-xl font-bold tracking-tight mb-5">{vendor.name}</h3>

              <div className="space-y-3 mb-7 flex-1">
                <div className="flex items-center gap-3 text-sm">
                  <User size={14} className="text-muted flex-shrink-0 opacity-60" />
                  <span className="text-muted/70 text-xs">Contact</span>
                  <span className="font-medium text-xs ml-auto">{vendor.contactPerson}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={14} className="text-muted flex-shrink-0 opacity-60" />
                  <span className="text-xs text-muted/80 truncate">{vendor.email || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={14} className="text-muted flex-shrink-0 opacity-60" />
                  <span className="text-xs text-muted/80">{vendor.phone || '—'}</span>
                </div>
              </div>

              <Link
                href={`/vendors/${vendor.id}`}
                className="btn btn-secondary w-full flex items-center justify-center gap-2.5 py-3.5 text-xs font-bold uppercase tracking-widest border-white/10 hover:border-accent-secondary/40 hover:text-accent-secondary transition-all"
                style={{ textDecoration: 'none' }}
              >
                <Package size={15} /> View Stock & Orders
              </Link>
            </div>
          </motion.div>
        ))}

        {vendors.length === 0 && (
          <motion.div variants={item} className="col-span-full glass-panel py-28 text-center border-dashed border-white/10 opacity-50">
            <Truck size={64} className="text-muted mx-auto mb-6 opacity-20" />
            <h3 className="text-xl font-bold mb-3">No Vendors Registered</h3>
            <p className="text-muted text-sm mb-8">Add your first supplier to begin managing stock and purchase orders.</p>
            <button className="btn btn-primary px-10 py-4" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Register First Vendor
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {/* Add Vendor Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="modal-container p-0 border-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
              style={{ maxWidth: '500px' }}
            >
              <div className="p-7 border-b border-white/5 bg-white/[0.02] flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent-secondary via-info to-transparent opacity-60"></div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Register New Vendor</h2>
                  <p className="text-[10px] uppercase font-bold text-muted tracking-widest mt-1 opacity-70">Supply Chain Registry</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-muted hover:text-primary transition-all"
                ><X size={18} /></button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="p-7 space-y-5">
                  {error && (
                    <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-xs font-bold flex items-center gap-3">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}
                  {[
                    { label: 'Vendor Name', key: 'name', type: 'text', required: true, placeholder: 'e.g. Dell Technologies' },
                    { label: 'Contact Person', key: 'contactPerson', type: 'text', required: true, placeholder: 'Full name of account manager' },
                    { label: 'Email Address', key: 'email', type: 'email', required: false, placeholder: 'vendor@company.com' },
                    { label: 'Phone Number', key: 'phone', type: 'text', required: false, placeholder: '+1 (555) 000-0000' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] uppercase font-bold tracking-[0.18em] text-muted mb-2">{f.label}</label>
                      <input
                        type={f.type}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={newVendor[f.key]}
                        onChange={e => setNewVendor({ ...newVendor, [f.key]: e.target.value })}
                        className="w-full bg-white/5 border-white/10 py-3.5 px-4 rounded-xl text-sm focus:border-accent-primary outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-8 py-3.5 text-xs font-bold uppercase tracking-widest" disabled={creating}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-10 py-3.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2" disabled={creating}>
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={15}/> Save Vendor</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="modal-container p-10 text-center border-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
              style={{ maxWidth: '420px' }}
            >
              <div className="w-[72px] h-[72px] rounded-full bg-danger/10 text-danger mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.12)]">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Delete Vendor?</h3>
              <p className="text-sm text-muted mb-8 leading-relaxed">
                This will permanently remove <span className="text-primary font-bold">&quot;{confirmDelete.name}&quot;</span> including all their stock and purchase orders.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmDelete(null)} className="btn btn-secondary flex-1 py-4 text-xs font-bold uppercase tracking-widest">
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  disabled={deleting}
                  className="btn flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  style={{ background: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)', boxShadow: '0 8px 25px rgba(239,68,68,0.2)' }}
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={15} /> Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
