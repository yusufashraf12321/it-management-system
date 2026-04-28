'use client';

import { useState, useEffect } from 'react';
import { Ticket, Send, CheckCircle, Loader2 } from 'lucide-react';

export default function PortalPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recNumber, setRecNumber] = useState('');
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    issueImpact: '',
    clientImpact: 'NO',
    clientName: '',
    priority: 'LOW'
  });

  useEffect(() => {
    // Get user info from cookie or API.
    // For simplicity, we decode JWT in a real app or fetch /api/auth/me
    // Here we'll do a quick fetch to get current session info if we had an endpoint
    // Since we don't have /api/auth/me, we'll ask the user to fill their name,
    // or better, extract it from token on server side.
    // Actually, let's just let them type their name for this demo if we don't have a /me endpoint,
    // or we can add it to formData.
    setFormData(prev => ({ ...prev, requesterName: '', email: '' }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setRecNumber(data.recNumber);
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTicket = () => {
    setSuccess(false);
    setRecNumber('');
    setFormData({
      requesterName: formData.requesterName, // Keep name/email
      email: formData.email,
      issueImpact: '',
      clientImpact: 'NO',
      clientName: '',
      priority: 'LOW'
    });
  };

  if (success) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto' }} className="animate-fade-in text-center">
        <div className="glass-card" style={{ padding: '4rem 2rem' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 className="text-3xl mb-4">Ticket Submitted!</h2>
          <p className="text-muted mb-6">
            Your support request has been successfully received by the IT department.
          </p>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'inline-block', marginBottom: '2rem' }}>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Reference Number</p>
            <p className="text-2xl" style={{ fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '2px' }}>
              {recNumber}
            </p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleNewTicket}>
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl">Submit IT Support Ticket</h2>
        <p className="text-muted">Please provide details about the issue you are facing.</p>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="form-group mb-0">
              <label>Your Full Name</label>
              <input 
                type="text" 
                name="requesterName"
                value={formData.requesterName || ''} 
                onChange={handleChange}
                placeholder="e.g. Ahmed Mahmoud"
                required 
              />
            </div>
            <div className="form-group mb-0">
              <label>Your Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email || ''} 
                onChange={handleChange}
                placeholder="e.g. ahmed.m@company.com"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Issue Description / Impact</label>
            <textarea 
              name="issueImpact"
              value={formData.issueImpact}
              onChange={handleChange}
              rows={5} 
              placeholder="Describe what is happening and how it affects your work..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="form-group mb-0">
              <label>Priority Level</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="LOW">Low (Not blocking work)</option>
                <option value="MEDIUM">Medium (Partial blocking)</option>
                <option value="HIGH">High (Completely blocked)</option>
                <option value="CRITICAL">Critical (System down)</option>
              </select>
            </div>
            
            <div className="form-group mb-0">
              <label>Is a Client Impacted?</label>
              <select name="clientImpact" value={formData.clientImpact} onChange={handleChange}>
                <option value="NO">No</option>
                <option value="YES">Yes</option>
              </select>
            </div>
          </div>

          {formData.clientImpact === 'YES' && (
            <div className="form-group animate-fade-in" style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <label style={{ color: 'var(--warning)' }}>Client Name</label>
              <input 
                type="text" 
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Enter the name of the impacted client"
                required={formData.clientImpact === 'YES'}
                style={{ background: 'rgba(15, 23, 42, 0.8)' }}
              />
            </div>
          )}

          <div className="form-group mb-8">
            <label>Screenshots (Optional)</label>
            <div style={styles.fileDrop}>
              <p className="text-muted text-center text-sm">Click to upload or drag and drop<br/>(PNG, JPG up to 5MB)</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 2rem' }}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} /> Submit Ticket</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  fileDrop: {
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '2rem',
    background: 'rgba(15, 23, 42, 0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  }
};
