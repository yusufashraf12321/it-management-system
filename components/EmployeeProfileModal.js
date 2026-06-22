'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Phone, Calendar, Monitor, Link2, Loader2, User, Printer, RefreshCw } from 'lucide-react';
import PrintReceiptModal from './PrintReceiptModal';
import SwapAssetModal from './SwapAssetModal';

export default function EmployeeProfileModal({ user, onClose, onAssetAssigned }) {
  const [currentUserState, setCurrentUserState] = useState(user);
  const [isAssigning, setIsAssigning] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inventory, setInventory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [swappingAsset, setSwappingAsset] = useState(null);

  // Sync state if user prop changes
  useEffect(() => {
    setCurrentUserState(user);
  }, [user]);

  // Fetch user details from API
  const refreshUser = async () => {
    try {
      const res = await fetch(`/api/users/${currentUserState.id}`);
      const data = await res.json();
      if (res.ok) {
        setCurrentUserState(data);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  // Fetch inventory when starting assignment
  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventory(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const handleToggleAssign = () => {
    if (!isAssigning) {
      fetchInventory();
    } else {
      setSelectedCategory('');
      setSelectedModel(null);
      setSerialNumber('');
      setError('');
    }
    setIsAssigning(!isAssigning);
  };

  const categories = [...new Set(inventory.map(item => item.category))];
  const models = inventory.filter(item => item.category === selectedCategory);

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/assets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber, userId: currentUserState.id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign asset');

      setSuccess('Asset assigned successfully!');
      setSerialNumber('');
      
      // Refresh list in parent and local modal
      if (onAssetAssigned) onAssetAssigned();
      await refreshUser();

      setTimeout(() => {
        setIsAssigning(false);
        setSuccess('');
        setIsPrinting(true); // Automatically open print custody handover modal!
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-container" style={{ maxWidth: '800px' }}>
        <div style={styles.header}>
          <h2 className="text-xl">Employee Profile</h2>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Profile Info */}
          <div style={styles.profileSection} className="flex-mobile-col">
            <div style={styles.avatarLarge}>
              <span style={{ fontSize: '2rem', fontWeight: 600, color: 'white' }}>
                {currentUserState.fullName?.charAt(0)}
              </span>
            </div>
            
            <div style={{ flex: 1 }}>
              <h2 className="text-2xl" style={{ marginBottom: '0.25rem' }}>{currentUserState.fullName}</h2>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>{currentUserState.jobTitle} • {currentUserState.department?.name}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div style={styles.infoRow}>
                  <Mail size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Personal Email</p>
                    <p style={styles.infoValue}>{currentUserState.personalEmail}</p>
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <Mail size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Konecta Mail</p>
                    <p style={styles.infoValue}>{currentUserState.konectaMail}</p>
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <Phone size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Contact No.</p>
                    <p style={styles.infoValue}>{currentUserState.contactNo}</p>
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <Calendar size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Hiring Date</p>
                    <p style={styles.infoValue}>{new Date(currentUserState.hiringDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <User size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Reporting To</p>
                    <p style={styles.infoValue}>{currentUserState.reportingTo || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Assets Section */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">Assigned Assets</h3>
            <div className="flex gap-2">
              {currentUserState.assignedAssets?.length > 0 && (
                <button className="btn btn-success btn-sm" onClick={() => setIsPrinting(true)}>
                  <Printer size={16} />
                  <span>Print Receipt / طباعة عهدة</span>
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={handleToggleAssign}>
                <Link2 size={16} />
                <span>{isAssigning ? 'Cancel' : 'Assign Asset'}</span>
              </button>
            </div>
          </div>

          {isAssigning && (
            <div style={styles.assignBox} className="animate-fade-in">
              <h4 style={{ marginBottom: '1.25rem', fontSize: '1.125rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Assign New Asset</h4>
              {error && <div className="badge badge-danger mb-4" style={{ display: 'block', padding: '0.75rem' }}>{error}</div>}
              {success && <div className="badge badge-success mb-4" style={{ display: 'block', padding: '0.75rem' }}>{success}</div>}
              
              {!selectedCategory ? (
                <div>
                  <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>Step 1: Select Category</p>
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map(cat => (
                      <button key={cat} className="btn btn-secondary" onClick={() => setSelectedCategory(cat)} style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{cat}</button>
                    ))}
                  </div>
                </div>
              ) : !selectedModel ? (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Step 2: Select Model ({selectedCategory})</p>
                    <button onClick={() => setSelectedCategory('')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }}>Change Category</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {models.map(model => (
                      <button key={model.id} className="btn btn-secondary" onClick={() => setSelectedModel(model)} style={{ padding: '0.75rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{model.brand} {model.model}</span>
                        <span className="badge badge-success">{model.availableCount} in stock</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Step 3: Enter Serial for <strong>{selectedModel.brand} {selectedModel.model}</strong></p>
                    <button onClick={() => setSelectedModel(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }}>Change Model</button>
                  </div>
                  
                  <form onSubmit={handleAssignAsset} className="flex gap-4">
                    <div className="form-group mb-0 flex-1">
                      <input type="text" placeholder="Enter Serial Number" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required autoFocus />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading || !serialNumber}>
                      {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Assignment'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          <div className="table-responsive" style={{ maxHeight: '300px' }}>
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="p-3">Category</th>
                  <th className="p-3">Brand & Model</th>
                  <th className="p-3">Serial Number</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUserState.assignedAssets?.map((asset) => (
                  <tr key={asset.id} className="border-b border-white/5">
                    <td className="p-3"><span className="badge badge-info">{asset.inventoryItem?.category}</span></td>
                    <td className="p-3 font-semibold">{asset.inventoryItem?.brand} {asset.inventoryItem?.model}</td>
                    <td className="p-3 font-mono text-sm">{asset.serialNumber}</td>
                    <td className="p-3 text-sm">{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSwappingAsset(asset)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <RefreshCw size={12} />
                        <span>Swap</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {(!currentUserState.assignedAssets || currentUserState.assignedAssets.length === 0) && (
                  <tr><td colSpan="5" className="p-8 text-center text-muted">No assets assigned to this employee.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Close Profile</button>
        </div>
      </div>

      {isPrinting && (
        <PrintReceiptModal 
          user={currentUserState}
          onClose={() => setIsPrinting(false)}
        />
      )}

      {swappingAsset && (
        <SwapAssetModal
          user={currentUserState}
          asset={swappingAsset}
          onClose={() => setSwappingAsset(null)}
          onUpdate={() => {
            if (onAssetAssigned) onAssetAssigned();
            refreshUser();
          }}
        />
      )}
    </div>
  );
}


const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  },
  profileSection: { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  avatarLarge: {
    width: '100px', height: '100px', borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary), var(--secondary))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
  },
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  infoLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' },
  infoValue: { fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 },
  divider: { border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' },
  assignBox: {
    background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem',
  }
};
