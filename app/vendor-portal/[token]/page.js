'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Truck, Package, ShoppingCart, CheckCircle, Upload, Loader2, Plus, ArrowRight, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-react';

export default function VendorPortal() {
  const params = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [isShipOpen, setIsShipOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);

  // Forms
  const [uploadForm, setUploadForm] = useState({ category: '', brand: '', model: '', serials: '', price: '' });
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/vendor-portal/${params.token}`);
      if (!res.ok) { setError('Portal not found. Please check the link.'); return; }
      const data = await res.json();
      setVendor(data);
    } catch (e) {
      setError('Failed to load portal.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsset = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/vendor-portal/${params.token}/assets/${editingAsset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAsset)
      });
      if (res.ok) {
        setSuccessMsg('✅ Asset updated successfully!');
        setIsEditAssetOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (e) { setError('Failed to update asset.'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm('Are you sure you want to delete this item from your warehouse?')) return;
    try {
      const res = await fetch(`/api/vendor-portal/${params.token}/assets/${assetId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSuccessMsg('✅ Item deleted from warehouse.');
        fetchData();
      } else {
        setError('Failed to delete item.');
      }
    } catch (e) { setError('Delete failed.'); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const serialNumbers = uploadForm.serials.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    try {
      const res = await fetch(`/api/vendor-portal/${params.token}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...uploadForm, serialNumbers })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`✅ ${serialNumbers.length} items added to your warehouse!`);
        setIsUploadOpen(false);
        setUploadForm({ category: '', brand: '', model: '', serials: '' });
        fetchData();
      } else {
        setError(data.error);
      }
    } catch (e) { setError('Upload failed.'); }
    finally { setSubmitting(false); }
  };

  const handleShip = async () => {
    if (selectedSerials.length === 0) { setError('Please select at least one item to ship.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/vendor-portal/${params.token}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id, vendorAssetIds: selectedSerials })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`✅ Order ${selectedOrder.orderNumber} marked as shipped!`);
        setIsShipOpen(false);
        setSelectedSerials([]);
        fetchData();
      } else {
        setError(data.error);
      }
    } catch (e) { setError('Failed to ship order.'); }
    finally { setSubmitting(false); }
  };

  const openShipModal = (order) => {
    setSelectedOrder(order);
    setSelectedSerials([]);
    setIsShipOpen(true);
  };

  const toggleSerial = (id) => {
    setSelectedSerials(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) return (
    <div style={styles.fullPage}>
      <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
    </div>
  );

  if (error && !vendor) return (
    <div style={styles.fullPage}>
      <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
      <h2 style={{ color: 'var(--text-primary)' }}>Portal Not Found</h2>
      <p style={{ color: 'var(--text-muted)' }}>{error}</p>
    </div>
  );

  const availableForOrder = vendor?.vendorAssets?.filter(a => a.status === 'AVAILABLE') || [];
  const pendingOrders = vendor?.orders?.filter(o => o.status === 'PENDING') || [];
  const shippedOrders = vendor?.orders?.filter(o => o.status !== 'PENDING') || [];

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={styles.logo}><Truck size={28} /></div>
            <div>
              <h1 style={styles.vendorName}>{vendor?.name}</h1>
              <p style={styles.subtext}>Vendor Supply Portal · {vendor?.contactPerson}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={styles.statPill}>
              <Package size={16} /> {availableForOrder.length} In Stock
            </div>
            <div style={{ ...styles.statPill, background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
              <Clock size={16} /> {pendingOrders.length} Pending Orders
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={styles.successBanner} onClick={() => setSuccessMsg('')}>
          <CheckCircle size={20} /> {successMsg} (click to dismiss)
        </div>
      )}

      {/* Main Content */}
      <div style={styles.content}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {['orders', 'stock', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}>
              {tab === 'orders' ? <><ShoppingCart size={16} /> Pending Orders ({pendingOrders.length})</>
               : tab === 'stock' ? <><Package size={16} /> My Warehouse Stock</>
               : <><CheckCircle size={16} /> Shipped History</>}
            </button>
          ))}
        </div>

        {/* Pending Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {pendingOrders.length === 0 ? (
              <div style={styles.empty}>
                <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                <h3 style={{ color: 'var(--text-primary)' }}>All Clear!</h3>
                <p style={{ color: 'var(--text-muted)' }}>No pending orders at this time.</p>
              </div>
            ) : pendingOrders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderLeft}>
                  <div style={styles.orderIcon}><ShoppingCart size={22} /></div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{order.orderNumber}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {order.quantity}x {order.category}
                    </div>
                    {order.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{order.description}</div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Ordered: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={styles.pendingBadge}>PENDING</span>
                  <button onClick={() => openShipModal(order)} style={styles.shipBtn}>
                    Ship Items <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <button onClick={() => setIsUploadOpen(true)} style={styles.uploadBtn}>
                <Plus size={18} /> Add Items to Warehouse
              </button>
            </div>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span>Item</span><span>Serial Number</span><span>Price</span><span>Actions</span>
              </div>
              {availableForOrder.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No items in warehouse yet. Add some using the button above.
                </div>
              ) : availableForOrder.map(asset => (
                <div key={asset.id} style={styles.tableRow}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{asset.brand} {asset.model}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.category}</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{asset.serialNumber}</div>
                  <div style={{ color: 'var(--success)', fontWeight: 600 }}>${asset.price?.toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setEditingAsset(asset); setIsEditAssetOpen(true); }} style={styles.iconBtn} title="Edit Item"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteAsset(asset.id)} style={{ ...styles.iconBtn, color: 'var(--danger)' }} title="Delete Item"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {shippedOrders.length === 0 ? (
              <div style={styles.empty}><p style={{ color: 'var(--text-muted)' }}>No shipped orders yet.</p></div>
            ) : shippedOrders.map(order => (
              <div key={order.id} style={{ ...styles.orderCard, opacity: 0.8 }}>
                <div style={styles.orderLeft}>
                  <div style={{ ...styles.orderIcon, background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.orderNumber}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{order.quantity}x {order.category}</div>
                  </div>
                </div>
                <span style={{ ...styles.pendingBadge, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Add Items to Warehouse</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Upload serial numbers for items you have in stock.
            </p>
            <form onSubmit={handleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <input required placeholder="e.g. Laptop" value={uploadForm.category} onChange={e => setUploadForm({...uploadForm, category: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input required placeholder="e.g. Dell" value={uploadForm.brand} onChange={e => setUploadForm({...uploadForm, brand: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Model</label>
                  <input required placeholder="e.g. Latitude 5540" value={uploadForm.model} onChange={e => setUploadForm({...uploadForm, model: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Price per Item ($)</label>
                  <input required type="number" step="0.01" placeholder="e.g. 1200" value={uploadForm.price} onChange={e => setUploadForm({...uploadForm, price: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Serial Numbers (one per line)</label>
                <textarea required rows={6} placeholder={"SN001\nSN002\nSN003..."} value={uploadForm.serials} onChange={e => setUploadForm({...uploadForm, serials: e.target.value})} style={{ fontFamily: 'monospace' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {uploadForm.serials.split(/[\n,]+/).filter(s => s.trim()).length} serials detected
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsUploadOpen(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={submitting} style={styles.shipBtn}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <><Upload size={16} /> Upload to Warehouse</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {isEditAssetOpen && editingAsset && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Edit Warehouse Item</h2>
            <form onSubmit={handleEditAsset}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <input required value={editingAsset.category} onChange={e => setEditingAsset({...editingAsset, category: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input required value={editingAsset.brand} onChange={e => setEditingAsset({...editingAsset, brand: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Model</label>
                  <input required value={editingAsset.model} onChange={e => setEditingAsset({...editingAsset, model: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input required type="number" step="0.01" value={editingAsset.price} onChange={e => setEditingAsset({...editingAsset, price: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Serial Number</label>
                <input required value={editingAsset.serialNumber} onChange={e => setEditingAsset({...editingAsset, serialNumber: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsEditAssetOpen(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={submitting} style={styles.shipBtn}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ship Modal */}
      {isShipOpen && selectedOrder && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '700px' }}>
            <h2 style={{ marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Ship Order: {selectedOrder.orderNumber}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Select which serial numbers you are shipping for this order ({selectedOrder.quantity}x {selectedOrder.category}).
            </p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {availableForOrder.filter(a => a.category === selectedOrder.category).length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
                  No matching items found in warehouse for category: <strong>{selectedOrder.category}</strong>
                </div>
              ) : availableForOrder.filter(a => a.category === selectedOrder.category).map(asset => (
                <div key={asset.id} onClick={() => toggleSerial(asset.id)}
                  style={{ ...styles.selectRow, ...(selectedSerials.includes(asset.id) ? styles.selectRowActive : {}) }}>
                  <div style={styles.checkbox}>
                    {selectedSerials.includes(asset.id) && <CheckCircle size={18} color="var(--success)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{asset.brand} {asset.model}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{asset.serialNumber}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'block' }}>
                  {selectedSerials.length} of {selectedOrder.quantity} selected
                </span>
                <span style={{ color: 'var(--success)', fontSize: '1.1rem', fontWeight: 700 }}>
                  Total Value: ${
                    availableForOrder
                      .filter(a => selectedSerials.includes(a.id))
                      .reduce((sum, a) => sum + (a.price || 0), 0)
                      .toLocaleString()
                  }
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => { setIsShipOpen(false); setError(''); }} style={styles.cancelBtn}>Cancel</button>
                <button onClick={handleShip} disabled={submitting || selectedSerials.length === 0} style={styles.shipBtn}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Confirm Shipment <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)' },
  fullPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' },
  header: { background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 },
  headerContent: { maxWidth: '1200px', margin: '0 auto', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  vendorName: { fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  subtext: { fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 },
  statPill: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600 },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' },
  successBanner: { background: 'rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', justifyContent: 'center' },
  tab: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', fontFamily: 'inherit', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(59,130,246,0.1)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' },
  orderCard: { background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', backdropFilter: 'blur(12px)' },
  orderLeft: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  orderIcon: { width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pendingBadge: { padding: '0.35rem 0.85rem', borderRadius: '9999px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontWeight: 700, fontSize: '0.75rem' },
  shipBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.9rem' },
  uploadBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' },
  cancelBtn: { padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' },
  table: { background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '14px', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(15,23,42,0.4)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' },
  availableBadge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 },
  empty: { textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '14px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' },
  modal: { background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '560px', backdropFilter: 'blur(20px)' },
  selectRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' },
  selectRowActive: { background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.1)' },
  checkbox: { width: '24px', height: '24px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' },
  iconBtn: { padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
