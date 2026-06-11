'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, Monitor, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import AddDepartmentModal from '@/components/AddDepartmentModal';
import EditDepartmentModal from '@/components/EditDepartmentModal';

const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function Assets() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/departments/${confirmDelete.id}`, { method: 'DELETE' });
      if (res.ok) { setConfirmDelete(null); fetchDepartments(); }
    } catch (error) { console.error(error); }
    finally { setDeleting(false); }
  };

  const totalEmployees = departments.reduce((s, d) => s + (d._count?.users || 0), 0);
  const totalAssets    = departments.reduce((s, d) => s + (d._count?.assets || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1.5rem' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-primary)' }} />
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--text-muted)', opacity: 0.6 }}>Loading Asset Registry...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '24px',
            background: 'rgba(14,165,233,0.1)', color: 'var(--info)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(14,165,233,0.15)',
          }}>
            <Building2 size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>Asset Tracking</h1>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted)', opacity: 0.7 }}>
              Department Registry · Hardware Assignments
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
          style={{ padding: '1.1rem 2.5rem', borderRadius: '1rem', boxShadow: '0 12px 30px rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          <Plus size={20} /> Add Department
        </motion.button>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'Departments',     value: departments.length, color: 'var(--info)' },
          { label: 'Total Employees', value: totalEmployees,     color: 'var(--accent-primary)' },
          { label: 'Assets in Use',   value: totalAssets,        color: 'var(--success)' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card"
            style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div style={{ position: 'absolute', right: '-12px', top: '-12px', width: '80px', height: '80px', borderRadius: '50%', background: s.color, opacity: 0.08 }} />
            <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{s.label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Fira Code, monospace', color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Section Title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: '6px', height: '32px', borderRadius: '99px', background: 'var(--info)', boxShadow: '0 0 12px rgba(14,165,233,0.5)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>All Departments</h2>
      </div>

      {/* ── Department Grid — inline CSS grid, guaranteed 3-columns ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {departments.map((dept, index) => (
          <motion.div
            key={dept.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.07 }}
            onMouseEnter={() => setHoveredId(dept.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ position: 'relative' }}
          >
            <Link href={`/assets/${dept.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: 'rgba(15,23,42,0.6)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${hoveredId === dept.id ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '1.25rem',
                overflow: 'hidden',
                transition: 'all 0.3s',
                boxShadow: hoveredId === dept.id ? '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(14,165,233,0.1)' : '0 8px 24px rgba(0,0,0,0.3)',
                transform: hoveredId === dept.id ? 'translateY(-4px)' : 'none',
              }}>
                {/* Accent bar */}
                <div style={{ height: '3px', background: 'linear-gradient(90deg, rgba(14,165,233,0.7) 0%, transparent 100%)' }} />

                <div style={{ padding: '1.75rem' }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '16px',
                      background: 'rgba(14,165,233,0.1)', color: 'var(--info)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Building2 size={24} />
                    </div>

                    {/* Edit/Delete — always visible on hover */}
                    <div style={{ display: 'flex', gap: '0.5rem', opacity: hoveredId === dept.id ? 1 : 0, transition: 'opacity 0.2s' }}>
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setEditingDepartment(dept); }}
                        style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.color='#f8fafc'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='var(--text-muted)'; }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setConfirmDelete({ id: dept.id, name: dept.name }); }}
                        style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {dept.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, minHeight: '36px', marginBottom: '1.5rem', opacity: 0.7 }}>
                    {dept.description || 'No description provided for this department.'}
                  </p>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.875rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Users size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.15em' }}>Staff</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Fira Code, monospace', color: 'var(--accent-primary)' }}>{dept._count?.users || 0}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.875rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Monitor size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.15em' }}>Assets</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Fira Code, monospace', color: 'var(--success)' }}>{dept._count?.assets || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {departments.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '7rem 2rem', opacity: 0.4 }}>
            <Building2 size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>No Departments Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '2rem' }}>Create your first department to start tracking assets by team.</p>
            <button className="btn btn-primary" style={{ padding: '0.875rem 2.5rem' }} onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} /> Create First Department
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddDepartmentModal onClose={() => setIsAddModalOpen(false)} onUpdate={fetchDepartments} />
        )}
        {editingDepartment && (
          <EditDepartmentModal department={editingDepartment} onClose={() => setEditingDepartment(null)} onUpdate={fetchDepartments} />
        )}
        {confirmDelete && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              style={{ maxWidth: '420px', width: '90vw', background: 'rgba(12,20,38,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.5rem', padding: '3rem', textAlign: 'center', boxShadow: '0 32px 96px rgba(0,0,0,0.6)' }}
            >
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(239,68,68,0.12)' }}>
                <Trash2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Delete Department?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '2rem' }}>
                This permanently deletes <strong style={{ color: 'var(--text-primary)' }}>&quot;{confirmDelete.name}&quot;</strong> and cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setConfirmDelete(null)} className="btn btn-secondary" style={{ flex: 1, padding: '0.9rem', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  disabled={deleting}
                  style={{ flex: 1, padding: '0.9rem', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', background: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(239,68,68,0.2)' }}
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={15} /> Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
