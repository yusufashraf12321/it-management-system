'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export default function EditEmployeeModal({ user, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    jobTitle: user.jobTitle,
    personalEmail: user.personalEmail,
    konectaMail: user.konectaMail,
    contactNo: user.contactNo,
    hiringDate: new Date(user.hiringDate).toISOString().split('T')[0],
    reportingTo: user.reportingTo || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update employee');
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
          <h2 className="text-xl">Edit Employee Details</h2>
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
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Personal Email</label>
                <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Konecta Mail</label>
                <input type="email" name="konectaMail" value={formData.konectaMail} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" name="contactNo" value={formData.contactNo} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Hiring Date</label>
                <input type="date" name="hiringDate" value={formData.hiringDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Reporting To</label>
                <input type="text" name="reportingTo" value={formData.reportingTo} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
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
