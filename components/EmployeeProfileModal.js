'use client';

import { useState } from 'react';
import { X, Mail, Phone, Calendar, Monitor, Link2, Search, Loader2 } from 'lucide-react';

export default function EmployeeProfileModal({ user, onClose, onAssetAssigned }) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inventory, setInventory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);

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
      // Reset state when canceling
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
        body: JSON.stringify({
          serialNumber,
          userId: user.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign asset');
      }

      setSuccess('Asset assigned successfully!');
      setSerialNumber('');
      
      // We should ideally reload the user data here or let the parent do it
      if (onAssetAssigned) {
        onAssetAssigned();
      }

      // Close assign mode after 1.5 seconds
      setTimeout(() => {
        setIsAssigning(false);
        setSuccess('');
        onClose(); // Also close modal so user clicks again to see updated, or we could lift state up
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="glass-card" style={styles.modal}>
        <div style={styles.header}>
          <h2 className="text-xl">Employee Profile</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Profile Info */}
          <div style={styles.profileSection}>
            <div style={styles.avatarLarge}>
              <span style={{ fontSize: '2rem', fontWeight: 600, color: 'white' }}>
                {user.fullName.charAt(0)}
              </span>
            </div>
            
            <div style={{ flex: 1 }}>
              <h2 className="text-2xl" style={{ marginBottom: '0.25rem' }}>{user.fullName}</h2>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>{user.jobTitle} • {user.department?.name}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div style={styles.infoRow}>
                  <Mail size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Personal Email</p>
                    <p style={styles.infoValue}>{user.personalEmail}</p>
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <Mail size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Konecta Mail</p>
                    <p style={styles.infoValue}>{user.konectaMail}</p>
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <Phone size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Contact No.</p>
                    <p style={styles.infoValue}>{user.contactNo}</p>
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <Calendar size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Hiring Date</p>
                    <p style={styles.infoValue}>{new Date(user.hiringDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <User size={16} className="text-muted" />
                  <div>
                    <p style={styles.infoLabel}>Reporting To</p>
                    <p style={styles.infoValue}>{user.reportingTo || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Assets Section */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">Assigned Assets</h3>
            <button 
              className="btn btn-primary" 
              onClick={handleToggleAssign}
              style={{ padding: '0.5rem 1rem' }}
            >
              <Link2 size={16} />
              <span>{isAssigning ? 'Cancel' : 'Assign Asset'}</span>
            </button>
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
                      <button 
                        key={cat} 
                        className="btn btn-secondary" 
                        onClick={() => setSelectedCategory(cat)}
                        style={{ padding: '0.75rem', fontSize: '0.875rem' }}
                      >
                        {cat}
                      </button>
                    ))}
                    {categories.length === 0 && <p className="text-muted col-span-3">No categories found in inventory.</p>}
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
                      <button 
                        key={model.id} 
                        className="btn btn-secondary" 
                        onClick={() => setSelectedModel(model)}
                        style={{ padding: '0.75rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
                      >
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
                  
                  <form onSubmit={handleAssignAsset} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Monitor size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Enter Serial Number (e.g. SN-DELL-101)"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        required
                        autoFocus
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading || !serialNumber}>
                      {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Assignment'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          <div className="table-container" style={{ marginTop: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Brand & Model</th>
                  <th>Serial Number</th>
                  <th>Assigned Date</th>
                </tr>
              </thead>
              <tbody>
                {user.assignedAssets?.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <span className="badge badge-info">{asset.inventoryItem?.category}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {asset.inventoryItem?.brand} {asset.inventoryItem?.model}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{asset.serialNumber}</td>
                    <td>{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
                {(!user.assignedAssets || user.assignedAssets.length === 0) && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                      No assets assigned to this employee.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import User for the 'Reporting To' icon since it wasn't in the initial import list
import { User } from 'lucide-react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '2rem',
  },
  modal: {
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    transition: 'all 0.2s',
  },
  content: {
    padding: '2rem',
    overflowY: 'auto',
  },
  profileSection: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
  },
  avatarLarge: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  infoValue: {
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border-color)',
    margin: '2rem 0',
  },
  assignBox: {
    background: 'rgba(59, 130, 246, 0.05)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  }
};
