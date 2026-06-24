'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, List, FileText } from 'lucide-react';

export default function AddItemToCategoryModal({ category, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addMode, setAddMode] = useState('single'); // 'single' or 'bulk'
  const [fields, setFields] = useState([]);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    bulkSerials: '',
    status: 'IN_STOCK',
    vendorName: '',
    specs: {}
  });

  useEffect(() => {
    const fetchCategoryFields = async () => {
      try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        const match = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
        if (match && match.fields) {
          setFields(match.fields);
          const initialSpecs = {};
          match.fields.forEach(f => {
            initialSpecs[f] = '';
          });
          setFormData(prev => ({
            ...prev,
            specs: initialSpecs
          }));
        }
      } catch (e) {
        console.error('Error fetching category fields:', e);
      }
    };
    fetchCategoryFields();
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [field]: value
      }
    }));
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
          serialNumbers: serials,
          status: formData.status,
          vendorName: formData.vendorName,
          specs: fields.length > 0 ? formData.specs : null
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
      <div className="modal-container" style={{ maxWidth: '600px' }}>
        <div style={styles.header}>
          <div>
            <h2 className="text-xl">Add New Model</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Category: {category}</p>
          </div>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
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

            {fields.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 animate-fade-in">
                <h4 className="text-xs uppercase font-bold tracking-wider text-accent-primary mb-3">Specifications & Custom Info</h4>
                <div className="grid grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field} className="form-group">
                      <label>{field}</label>
                      <input
                        type="text"
                        value={formData.specs[field] || ''}
                        onChange={(e) => handleSpecChange(field, e.target.value)}
                        placeholder={`Enter ${field}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label>Device Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-accent-primary outline-none transition-all"
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="MAINTENANCE">Maintenance (External Repair)</option>
                </select>
              </div>
              {formData.status === 'MAINTENANCE' && (
                <div className="form-group animate-fade-in">
                  <label>Service Vendor</label>
                  <input 
                    type="text" 
                    name="vendorName" 
                    value={formData.vendorName} 
                    onChange={handleChange} 
                    placeholder="e.g. Service Center" 
                    required 
                  />
                </div>
              )}
            </div>

            <div className="form-group">
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
          </div>

          <div className="modal-footer">
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
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  }
};
