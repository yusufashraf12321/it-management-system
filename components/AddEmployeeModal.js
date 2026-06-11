'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export default function AddEmployeeModal({ departmentId, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    personalEmail: '',
    contactNo: '',
    hiringDate: new Date().toISOString().split('T')[0],
    reportingTo: '',
    konectaMail: '',
    role: 'EMPLOYEE',
    password: 'password123'
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, departmentId: parseInt(departmentId) })
      });
      
      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add employee');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-container" style={{ maxWidth: '700px' }}>
        <div style={styles.header}>
          <h2 className="text-xl">Add New Employee</h2>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {error && <div className="badge badge-danger mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Full Name" required />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" value={formData.jobTitle} onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} placeholder="Title" required />
              </div>
              <div className="form-group">
                <label>Personal Email</label>
                <input type="email" value={formData.personalEmail} onChange={(e) => setFormData({...formData, personalEmail: e.target.value})} placeholder="email@gmail.com" required />
              </div>
              <div className="form-group">
                <label>Konecta Mail</label>
                <input type="email" value={formData.konectaMail} onChange={(e) => setFormData({...formData, konectaMail: e.target.value})} placeholder="email@konecta.com" required />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" value={formData.contactNo} onChange={(e) => setFormData({...formData, contactNo: e.target.value})} placeholder="Number" required />
              </div>
              <div className="form-group">
                <label>Hiring Date</label>
                <input type="date" value={formData.hiringDate} onChange={(e) => setFormData({...formData, hiringDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Reporting To</label>
                <input type="text" value={formData.reportingTo} onChange={(e) => setFormData({...formData, reportingTo: e.target.value})} placeholder="Manager Name" />
              </div>
              <div className="form-group">
                <label>Initial Password</label>
                <input type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Employee</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  }
};
