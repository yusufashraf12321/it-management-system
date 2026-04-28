'use client';

import { useState } from 'react';
import { X, Save, Clock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function TicketEditModal({ ticket, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category || '',
    troubleshootingSteps: ticket.troubleshootingSteps || '',
    resolution: ticket.resolution || '',
    usersImpact: ticket.usersImpact || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="glass-card" style={styles.modal}>
        <div style={styles.header}>
          <div className="flex items-center gap-4">
            <h2 className="text-xl">{ticket.recNumber}</h2>
            <span className={`badge ${formData.status === 'OPEN' ? 'badge-warning' : formData.status === 'RESOLVED' ? 'badge-success' : 'badge-info'}`}>
              {formData.status}
            </span>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={styles.content}>
            
            {/* Requester Info Readonly */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={styles.sectionTitle}>Requester Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>Name</p>
                  <p style={{ fontWeight: 500 }}>{ticket.requesterName}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>Email</p>
                  <p style={{ fontWeight: 500 }}>{ticket.email}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>Issue Date</p>
                  <p style={{ fontWeight: 500 }}>{new Date(ticket.issueDate).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Issue Impact (From User)</p>
                <div style={styles.readOnlyText}>{ticket.issueImpact}</div>
              </div>
              
              {ticket.clientImpact && (
                <div className="mt-4">
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>Client Impact</p>
                  <div style={styles.readOnlyText}>
                    <span className="badge badge-danger mr-2">YES</span>
                    {ticket.clientName} - {ticket.clientImpact}
                  </div>
                </div>
              )}
            </div>

            {/* IT Team Section */}
            <div>
              <h3 style={styles.sectionTitle}>__To be filled by IT Team__</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="">Select Category...</option>
                    <option value="HARDWARE">Hardware Issue</option>
                    <option value="SOFTWARE">Software Issue</option>
                    <option value="NETWORK">Network / Internet</option>
                    <option value="ACCESS">Access / Account</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label>Users Impact</label>
                  <select name="usersImpact" value={formData.usersImpact} onChange={handleChange}>
                    <option value="">Select Impact Scope...</option>
                    <option value="SINGLE_USER">Single User</option>
                    <option value="MULTIPLE_USERS">Multiple Users</option>
                    <option value="DEPARTMENT">Whole Department</option>
                    <option value="COMPANY">Whole Company</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Troubleshooting Steps</label>
                <textarea 
                  name="troubleshootingSteps" 
                  value={formData.troubleshootingSteps} 
                  onChange={handleChange}
                  rows={3}
                  placeholder="What steps were taken to diagnose?"
                />
              </div>

              <div className="form-group mb-0">
                <label>Resolution</label>
                <textarea 
                  name="resolution" 
                  value={formData.resolution} 
                  onChange={handleChange}
                  rows={3}
                  placeholder="How was the issue resolved?"
                />
              </div>

            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Ticket</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '2rem',
  },
  modal: {
    width: '100%',
    maxWidth: '800px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.2s',
  },
  content: {
    padding: '2rem',
    overflowY: 'auto',
    flex: 1,
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  readOnlyText: {
    background: 'rgba(15, 23, 42, 0.4)',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    lineHeight: 1.5,
  },
  footer: {
    padding: '1.5rem 2rem',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    background: 'rgba(15, 23, 42, 0.4)',
  }
};
