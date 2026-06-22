'use client';

import { useState } from 'react';
import { X, Trash2, Printer, Loader2, AlertTriangle, Monitor } from 'lucide-react';
import PrintReceiptModal from './PrintReceiptModal';

export default function ResignEmployeeModal({ user, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);

  const handleResign = async () => {
    if (!hasPrinted && user.assignedAssets?.length > 0) {
      if (!confirm('You have not printed the return & clearance document. Are you sure you want to proceed without printing? / لم تقم بطباعة مستند إخلاء الطرف بعد. هل أنت متأكد من المتابعة؟')) {
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/users/${user.id}/resign`, {
        method: 'POST'
      });

      const data = await res.json();
      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        setError(data.error || 'Failed to complete resignation');
      }
    } catch (err) {
      setError('An unexpected error occurred during resignation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay animate-fade-in no-print">
        <div className="modal-container" style={{ maxWidth: '600px' }}>
          <div style={styles.header}>
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle size={22} />
              <h2 className="text-xl">Employee Resignation & Clearance</h2>
            </div>
            <button onClick={onClose} className="icon-btn-small">
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {error && (
              <div className="badge badge-danger mb-4" style={{ display: 'block', textAlign: 'center', padding: '0.75rem' }}>
                {error}
              </div>
            )}

            <div style={styles.infoBox}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>RE-ASSIGNMENT & RETIREMENT FLOW FOR:</p>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{user.fullName}</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {user.jobTitle} • {user.department?.name || 'No Department'}
              </p>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Assigned Assets to Return ({user.assignedAssets?.length || 0}):
            </h4>

            <div style={styles.assetList}>
              {user.assignedAssets?.map((asset) => (
                <div key={asset.id} style={styles.assetItem}>
                  <Monitor size={18} className="text-muted" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {asset.inventoryItem?.brand} {asset.inventoryItem?.model}
                    </div>
                    <div className="text-muted font-mono" style={{ fontSize: '0.75rem' }}>
                      S/N: {asset.serialNumber}
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    {asset.inventoryItem?.category}
                  </span>
                </div>
              ))}
              {(!user.assignedAssets || user.assignedAssets.length === 0) && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No assets assigned to this employee. / لا توجد أصول عهدة لدى هذا الموظف.
                </div>
              )}
            </div>

            <p style={styles.warningText}>
              <strong>Notice:</strong> Completing this action will return all assets to stock, increase stock count by 1 for each device, and permanently remove the employee.
            </p>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <div className="flex gap-2">
              {user.assignedAssets?.length > 0 && (
                <button
                  onClick={() => { setIsPrinting(true); setHasPrinted(true); }}
                  className="btn btn-success"
                >
                  <Printer size={16} />
                  <span>Print Clearance Form</span>
                </button>
              )}
              <button
                onClick={handleResign}
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Complete Resignation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPrinting && (
        <PrintReceiptModal
          user={user}
          docTypePreset="release"
          onClose={() => setIsPrinting(false)}
        />
      )}
    </>
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
  infoBox: {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  assetList: {
    maxHeight: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(15, 23, 42, 0.3)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    marginBottom: '1.5rem',
  },
  assetItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  warningText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    margin: 0,
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
  }
};
