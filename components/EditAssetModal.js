'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export default function EditAssetModal({ asset, category, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState([]);
  const [specs, setSpecs] = useState({});

  const [formData, setFormData] = useState({
    serialNumber: asset.serialNumber,
    status: asset.status,
    notes: asset.notes || ''
  });

  useEffect(() => {
    const fetchCategoryFields = async () => {
      try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        const match = categories.find(c => c.name.toLowerCase() === category?.toLowerCase());
        if (match && match.fields) {
          setFields(match.fields);
          
          let existingSpecs = {};
          try {
            const parsed = JSON.parse(asset.notes);
            if (typeof parsed === 'object' && parsed !== null) {
              existingSpecs = parsed;
            }
          } catch (e) {
            // notes is plain text
          }
          
          const specsObj = {};
          match.fields.forEach(f => {
            specsObj[f] = existingSpecs[f] || '';
          });
          setSpecs(specsObj);
        }
      } catch (e) {
        console.error('Error fetching category fields:', e);
      }
    };
    if (category) {
      fetchCategoryFields();
    }
  }, [category, asset]);

  const handleSpecChange = (field, value) => {
    setSpecs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        serialNumber: formData.serialNumber,
        status: formData.status,
        notes: fields.length > 0 ? JSON.stringify(specs) : formData.notes
      };

      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update asset');
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
          <h2 className="text-xl">Edit Serial Number</h2>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {error && <div className="badge badge-danger mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

            <div className="form-group">
              <label>Serial Number</label>
              <input 
                type="text" 
                value={formData.serialNumber}
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                required 
              />
            </div>

            <div className="form-group">
              <label>Device Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                disabled={asset.status === 'ASSIGNED'}
              >
                <option value="IN_STOCK">In Stock</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RETIRED">Retired</option>
                {asset.status === 'ASSIGNED' && <option value="ASSIGNED">Assigned (ReadOnly)</option>}
              </select>
              {asset.status === 'ASSIGNED' && <p className="text-muted text-xs mt-1">Cannot change status while assigned.</p>}
            </div>

            {fields.length > 0 ? (
              <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 animate-fade-in">
                <h4 className="text-xs uppercase font-bold tracking-wider text-accent-primary mb-3">Specifications</h4>
                <div className="grid grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field} className="form-group">
                      <label>{field}</label>
                      <input
                        type="text"
                        value={specs[field] || ''}
                        onChange={(e) => handleSpecChange(field, e.target.value)}
                        placeholder={`Enter ${field}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Notes / Condition</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  placeholder="Add details about the device condition..."
                />
              </div>
            )}
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
