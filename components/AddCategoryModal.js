'use client';

import { useState } from 'react';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';

export default function AddCategoryModal({ onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState('');

  const handleAddField = () => {
    const trimmed = newField.trim();
    if (trimmed && !fields.includes(trimmed)) {
      setFields([...fields, trimmed]);
      setNewField('');
    }
  };

  const handleRemoveField = (fieldToRemove) => {
    setFields(fields.filter(f => f !== fieldToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          fields
        })
      });
      
      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add category');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-container">
        <div style={styles.header}>
          <h2 className="text-xl">Create New Category</h2>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {error && <div className="badge badge-danger mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

            <div className="form-group">
              <label>Category Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. LAPTOPS, HEADSETS, SCREENS, TV..."
                required 
                autoFocus
              />
            </div>

            <div className="form-group mt-6">
              <label className="mb-2 block">Custom Tracking Fields (Optional)</label>
              <p className="text-muted text-xs mb-3">Define the details that will be tracked and filled in for every device under this category.</p>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  placeholder="e.g. Gen, Processor, RAM, Wifi MAC..."
                  style={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddField();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddField}
                  style={{ padding: '0 1.25rem', height: '44px' }}
                >
                  <Plus size={18} />
                </button>
              </div>

              {fields.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {fields.map((field, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(255,255,255,0.05)', padding: '0.375rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                      <span>{field}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--danger)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Create Category</>}
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
