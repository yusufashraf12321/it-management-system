'use client';

import { useState } from 'react';
import { X, Save, Loader2, List, FileText } from 'lucide-react';

export default function AddItemToCategoryModal({ category, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addMode, setAddMode] = useState('single'); // 'single' or 'bulk'
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    bulkSerials: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const serials = addMode === 'single' 
        ? [formData.serialNumber.trim()].filter(s => s.length > 0)
        : formData.bulkSerials.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);

      const res = await fetch('/api/inventory/add-with-serials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          brand: formData.brand,
          model: formData.model,
          serialNumbers: serials
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(`Successfully added!`);
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to add items');
      }
    } catch (error) {
      console.error('Error adding items:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="glass-card" style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 className="text-xl">Add New Model</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Category: {category}</p>
          </div>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          {error && <div className="badge badge-danger mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}
          {success && <div className="badge badge-success mb-4" style={{ display: 'block', textAlign: 'center' }}>{success}</div>}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label>Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Dell" required />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Latitude 5540" required />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block">Entry Mode</label>
            <div className="flex gap-4">
              <button 
                type="button" 
                className={`btn ${addMode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAddMode('single')}
                style={{ flex: 1, height: '45px' }}
              >
                <List size={18} /> Single
              </button>
              <button 
                type="button" 
                className={`btn ${addMode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAddMode('bulk')}
                style={{ flex: 1, height: '45px' }}
              >
                <FileText size={18} /> Bulk
              </button>
            </div>
          </div>

          <div className="form-group mb-6">
            <label>{addMode === 'single' ? 'Serial Number' : 'List of Serial Numbers'}</label>
            {addMode === 'single' ? (
              <input 
                type="text" 
                name="serialNumber" 
                value={formData.serialNumber} 
                onChange={handleChange} 
                placeholder="Enter Serial Number" 
                required={addMode === 'single'} 
              />
            ) : (
              <textarea 
                name="bulkSerials" 
                value={formData.bulkSerials} 
                onChange={handleChange} 
                placeholder="Paste serials here (one per line)..." 
                rows={5}
                required={addMode === 'bulk'}
                style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
            )}
          </div>

          <div className="flex justify-end gap-4 mt-auto">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save to Stock</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  modal: { width: '100%', maxWidth: '600px', padding: 0, overflow: 'hidden' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  }
};
