'use client';

import { useState } from 'react';
import { X, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import PrintReceiptModal from './PrintReceiptModal';

export default function SwapAssetModal({ user, asset, onClose, onUpdate }) {
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [swapType, setSwapType] = useState('permanent'); // 'permanent', 'temporary'
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [swapResult, setSwapResult] = useState(null);

  const handleSwap = async (e) => {
    e.preventDefault();
    if (!newSerialNumber.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/assets/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          oldAssetId: asset.id,
          newSerialNumber: newSerialNumber.trim(),
          swapType,
          notes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSwapResult(data);
        if (onUpdate) onUpdate();
      } else {
        setError(data.error || 'Failed to swap asset');
      }
    } catch (err) {
      setError('An unexpected error occurred during the swap');
    } finally {
      setLoading(false);
    }
  };

  if (swapResult) {
    return (
      <PrintReceiptModal
        user={user}
        docTypePreset="change"
        changeTypePreset={swapType}
        swapData={{
          oldAsset: swapResult.oldAsset,
          newAsset: swapResult.newAsset,
          swapType,
          notes
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="modal-overlay animate-fade-in no-print">
      <div className="modal-container" style={{ maxWidth: '550px' }}>
        <div style={styles.header}>
          <div className="flex items-center gap-2 text-accent-primary">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <h2 className="text-xl">Swap Asset / تبديل جهاز عهدة</h2>
          </div>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSwap} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {error && (
              <div className="badge badge-danger mb-4" style={{ display: 'block', textAlign: 'center', padding: '0.75rem' }}>
                {error}
              </div>
            )}

            <div style={styles.swapFlowBox}>
              <div style={styles.flowItem}>
                <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>CURRENT ASSET (RETURNING):</span>
                <strong style={{ color: 'var(--text-primary)' }}>{asset.inventoryItem?.brand} {asset.inventoryItem?.model}</strong>
                <span className="text-muted font-mono" style={{ fontSize: '0.75rem', display: 'block' }}>S/N: {asset.serialNumber}</span>
              </div>
              
              <div style={styles.arrowContainer}>
                <ArrowRight size={20} className="text-accent-primary" />
              </div>

              <div style={styles.flowItem}>
                <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>REPLACEMENT ASSET (NEW):</span>
                <strong style={{ color: 'var(--text-primary)' }}>Pending Serial Input...</strong>
              </div>
            </div>

            {/* Serial input */}
            <div className="form-group">
              <label className="form-label">New Asset Serial Number / الرقم التسلسلي البديل</label>
              <input
                type="text"
                value={newSerialNumber}
                onChange={(e) => setNewSerialNumber(e.target.value)}
                placeholder="e.g. S/N from inventory"
                required
                autoFocus
              />
            </div>

            {/* Swap Type */}
            <div className="form-group">
              <label className="form-label">Swap Type / نوع التبديل</label>
              <div style={styles.radioGroup}>
                <label style={{ ...styles.radioLabel, border: swapType === 'permanent' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', background: swapType === 'permanent' ? 'rgba(59, 130, 246, 0.05)' : 'none' }}>
                  <input
                    type="radio"
                    name="swapType"
                    value="permanent"
                    checked={swapType === 'permanent'}
                    onChange={() => setSwapType('permanent')}
                    style={{ marginRight: '8px' }}
                  />
                  <div>
                    <strong style={{ display: 'block' }}>Permanent Swap / تبديل دائم</strong>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Old device returns to stock permanently</span>
                  </div>
                </label>

                <label style={{ ...styles.radioLabel, border: swapType === 'temporary' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', background: swapType === 'temporary' ? 'rgba(59, 130, 246, 0.05)' : 'none' }}>
                  <input
                    type="radio"
                    name="swapType"
                    value="temporary"
                    checked={swapType === 'temporary'}
                    onChange={() => setSwapType('temporary')}
                    style={{ marginRight: '8px' }}
                  />
                  <div>
                    <strong style={{ display: 'block' }}>Temporary for Maintenance / مؤقت للصيانة</strong>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Old device goes to repair, employee gets a temporary replacement</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes / ملاحظات التبديل</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for swapping, device state, etc."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !newSerialNumber}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm & Print Swap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  },
  swapFlowBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(255,255,255,0.02)',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    marginBottom: '1.5rem'
  },
  flowItem: {
    flex: 1,
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.5rem'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '0.875rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
