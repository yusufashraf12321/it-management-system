'use client';

import { useState } from 'react';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';

export default function BulkAddAssetsModal({ inventoryItem, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serialsText, setSerialsText] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const serialNumbers = serialsText
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (serialNumbers.length === 0) {
      setError('Please enter at least one valid serial number.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/assets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: inventoryItem.id,
          serialNumbers
        })
      });
      
      if (res.ok) {
        setSuccess(`Successfully added ${serialNumbers.length} assets!`);
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add assets');
      }
    } catch (error) {
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
            <h2 className="text-xl">Bulk Add Assets</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>{inventoryItem.brand} {inventoryItem.model}</p>
          </div>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          {error && <div className="badge badge-danger mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}
          {success && <div className="badge badge-success mb-4" style={{ display: 'block', textAlign: 'center' }}>{success}</div>}

          <div className="form-group mb-4">
            <label>List of Serial Numbers</label>
            <textarea 
              value={serialsText}
              onChange={(e) => setSerialsText(e.target.value)}
              placeholder="Paste serials here (one per line)..."
              rows={8}
              required 
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
          </div>

          <div className="glass-panel mb-6" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.1)' }}>
            <AlertCircle size={18} color="var(--accent-primary)" />
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Detected: <strong style={{ color: 'var(--text-primary)' }}>{serialsText.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0).length}</strong> serials
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-auto">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !serialsText.trim()}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Upload size={18} /> Bulk Upload</>}
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
