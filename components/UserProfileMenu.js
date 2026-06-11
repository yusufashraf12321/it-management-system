'use client';

import { useState } from 'react';
import { User, Mail, Shield, Camera, Edit2, LogOut, X, Loader2 } from 'lucide-react';

export default function UserProfileMenu({ user, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    personalEmail: user.email,
  });

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="glass-panel" style={styles.menu}>
      <div style={styles.header}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>My Profile</h3>
        <button onClick={onClose} className="icon-btn-small"><X size={16} /></button>
      </div>

      <div style={styles.content}>
        <div style={styles.avatarContainer}>
          <div style={styles.avatar}>
            <User size={32} />
            <button style={styles.cameraBtn} title="Update Photo">
              <Camera size={14} />
            </button>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>{user.role}</span>
          </div>
        </div>

        <div style={styles.infoSection}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            {isEditing ? (
              <input 
                type="text" 
                className="searchInput" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                style={{ width: '100%', fontSize: '0.875rem' }}
              />
            ) : (
              <div style={styles.value}>{user.fullName}</div>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Corporate Email</label>
            <div style={styles.value}>{user.email}</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Access Level</label>
            <div style={{...styles.value, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Shield size={14} className="text-accent-primary" />
              <span>Full Administrative Access</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        {isEditing ? (
          <div className="flex gap-2 w-full">
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1 }}>Save</button>
          </div>
        ) : (
          <>
            <button className="btn btn-secondary w-full mb-2" onClick={() => setIsEditing(true)}>
              <Edit2 size={14} /> Edit Information
            </button>
            <button className="btn btn-danger w-full" onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
              <LogOut size={14} /> Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  menu: {
    position: 'absolute', top: '55px', right: '0', width: '300px',
    zIndex: 100, border: '1px solid var(--border-color)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)', padding: 0, overflow: 'hidden'
  },
  header: {
    padding: '1rem', borderBottom: '1px solid var(--border-color)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255,255,255,0.03)'
  },
  content: { padding: '1.5rem' },
  avatarContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' },
  avatar: {
    width: '70px', height: '70px', borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary), #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
    position: 'relative'
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'var(--accent-primary)', border: '2px solid #0f172a',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
    cursor: 'pointer'
  },
  infoSection: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' },
  value: { fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 },
  footer: { padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)' }
};
