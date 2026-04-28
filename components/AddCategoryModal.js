'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export default function AddCategoryModal({ onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    brand: '',
    model: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add item');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
        <div style={styles.header}>
          <h2 className="text-xl">Create New Category</h2>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          {error && <div className="badge badge-danger mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

          <div className="form-group">
            <label>Category Name</label>
            <input 
              type="text" 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              placeholder="e.g. Laptop, Monitor..."
              required 
            />
          </div>

          <div className="form-group">
            <label>First Brand</label>
            <input 
              type="text" 
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              placeholder="e.g. Dell, HP..."
              required 
            />
          </div>

          <div className="form-group mb-6">
            <label>First Model</label>
            <input 
              type="text" 
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              placeholder="e.g. Latitude 5540..."
              required 
            />
          </div>

          <div className="flex justify-end gap-4 mt-auto">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Initialize Category</>}
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
