'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Users, Monitor, Loader2, Plus } from 'lucide-react';
import AddDepartmentModal from '@/components/AddDepartmentModal';

export default function Assets() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl">Asset Tracking</h2>
          <p className="text-muted">Track assigned assets by department and employee</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Link key={dept.id} href={`/assets/${dept.id}`} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={styles.deptCard}>
              <div style={styles.cardHeader}>
                <div style={styles.iconWrapper}>
                  <Building2 size={24} />
                </div>
                <h3 className="text-xl" style={{ color: 'var(--text-primary)' }}>{dept.name}</h3>
              </div>
              
              <p className="text-muted" style={{ marginBottom: '1.5rem', minHeight: '40px' }}>
                {dept.description || 'No description provided'}
              </p>

              <div style={styles.statsContainer}>
                <div style={styles.statBox}>
                  <Users size={18} color="var(--accent-primary)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{dept._count.users}</span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Employees</span>
                </div>
                <div style={styles.statBox}>
                  <Monitor size={18} color="var(--success)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{dept._count.assets}</span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Assets</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {departments.length === 0 && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 className="text-xl mb-2">No Departments</h3>
            <p className="text-muted mb-4">No departments found in the system.</p>
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>Add Your First Department</button>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddDepartmentModal 
          onClose={() => setIsAddModalOpen(false)} 
          onUpdate={fetchDepartments} 
        />
      )}
    </div>
  );
}

const styles = {
  deptCard: {
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: 'auto',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
  },
  statBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(15, 23, 42, 0.4)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  }
};
