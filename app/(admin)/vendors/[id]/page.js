'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Package, ShoppingCart, Loader2, Plus, 
  CheckCircle, ArrowRight, ClipboardList, Upload, Copy, ExternalLink, Edit2, Trash2
} from 'lucide-react';

export default function VendorDetail() {
  const params = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [assets, setAssets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [copied, setCopied] = useState(false);

  // Modals
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Forms
  const [assetForm, setAssetForm] = useState({ category: '', brand: '', model: '', serials: '' });
  const [orderForm, setOrderForm] = useState({ category: '', quantity: '', description: '' });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [vRes, aRes, oRes] = await Promise.all([
        fetch(`/api/vendors/${params.id}`),
        fetch(`/api/vendors/${params.id}/assets`),
        fetch(`/api/orders?vendorId=${params.id}`)
      ]);
      
      const [vData, aData, oData] = await Promise.all([
        vRes.json(),
        aRes.json(),
        oRes.json()
      ]);

      setVendor(vData);
      setAssets(Array.isArray(aData) ? aData : []);
      setOrders(Array.isArray(oData) ? oData : []);
    } catch (err) {
      console.error('FetchData Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const portalLink = vendor?.token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/vendor-portal/${vendor.token}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(portalLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    const serialNumbers = assetForm.serials.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
    try {
      const res = await fetch(`/api/vendors/${params.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assetForm, serialNumbers })
      });
      if (res.ok) {
        setIsAssetModalOpen(false);
        fetchData();
        setAssetForm({ category: '', brand: '', model: '', serials: '' });
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.category || !orderForm.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const isEdit = !!orderForm.id;
      const url = isEdit ? `/api/orders/${orderForm.id}` : `/api/orders`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: orderForm.category,
          quantity: parseInt(orderForm.quantity),
          description: orderForm.description,
          vendorId: params.id 
        })
      });
      
      if (res.ok) {
        setIsOrderModalOpen(false);
        setOrderForm({ category: '', quantity: '', description: '' });
        fetchData();
      } else {
        const errorData = await res.json();
        alert('Error: ' + (errorData.error || 'Failed to place order'));
      }
    } catch (err) { 
      console.error('Order Submission Error:', err);
      alert('Failed to connect to the server');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEditOrder = (order) => {
    setOrderForm({
      id: order.id,
      category: order.category,
      quantity: order.quantity,
      description: order.description || ''
    });
    setIsOrderModalOpen(true);
  };

  const handleReceiveOrder = async (order) => {
    // Logic: Find assets in vendor stock that match the order category and are AVAILABLE
    const matchingAssets = assets
      .filter(a => a.category === order.category && a.status === 'AVAILABLE')
      .slice(0, order.quantity);

    if (matchingAssets.length < order.quantity) {
      alert(`Not enough stock in vendor warehouse. Order needs ${order.quantity}, but only ${matchingAssets.length} available.`);
      return;
    }

    if (!confirm(`Receive ${matchingAssets.length} items from ${vendor.name} to internal stock?`)) return;

    try {
      const res = await fetch(`/api/orders/${order.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorAssetIds: matchingAssets.map(a => a.id) })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="icon-btn-small"><ArrowLeft size={20} /></button>
        <div>
          <h2 className="text-2xl">{vendor?.name}</h2>
          <p className="text-muted">Manage stock levels and purchase orders for this vendor</p>
        </div>
      </div>

      {/* Vendor Portal Link Banner */}
      {vendor?.token && (
        <div style={styles.portalBanner}>
          <ExternalLink size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', fontSize: '0.9rem' }}>
              Vendor Portal Link
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
              {portalLink}
            </div>
          </div>
          <button onClick={copyLink} style={styles.copyBtn}>
            <Copy size={16} /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <button 
          className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('stock')}
        >
          <Package size={18} /> Vendor Warehouse
        </button>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingCart size={18} /> Purchase Orders
        </button>
      </div>

      {activeTab === 'stock' ? (
        <>
          {!selectedCategory ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg">Vendor Warehouse Categories</h3>
              </div>
              <div className="grid grid-cols-4 gap-6 mb-8">
                {Object.entries(assets.reduce((acc, a) => {
                  if (!acc[a.category]) acc[a.category] = { available: 0, total: 0 };
                  if (a.status === 'AVAILABLE') acc[a.category].available++;
                  acc[a.category].total++;
                  return acc;
                }, {})).map(([cat, counts]) => (
                  <div key={cat} onClick={() => setSelectedCategory(cat)} className="glass-card hover-scale cursor-pointer" style={{ borderBottom: '4px solid var(--accent-primary)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
                        <Package size={20} />
                      </div>
                      <h4 className="font-semibold text-lg">{cat}</h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-muted text-xs uppercase tracking-wider">Available Stock</p>
                        <p className="text-2xl font-bold">{counts.available}</p>
                      </div>
                      <ArrowRight size={18} className="text-muted" />
                    </div>
                  </div>
                ))}
                {Object.keys(assets).length === 0 && (
                  <div className="col-span-4 p-12 text-center glass-panel text-muted">
                    No items in vendor warehouse.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setSelectedCategory(null)} className="icon-btn-small"><ArrowLeft size={16} /></button>
                <h3 className="text-xl font-bold">{selectedCategory} Stock Details</h3>
              </div>

              {/* Model Summary Cards for Selected Category */}
              <div className="flex gap-4 mb-6">
                {Object.entries(assets.filter(a => a.category === selectedCategory).reduce((acc, a) => {
                  const key = `${a.brand} ${a.model}`;
                  if (!acc[key]) acc[key] = { available: 0, total: 0 };
                  if (a.status === 'AVAILABLE') acc[key].available++;
                  acc[key].total++;
                  return acc;
                }, {})).map(([model, counts]) => (
                  <div key={model} className="glass-card flex-1" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{model}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{counts.available}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available Units</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-panel overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-white/10">
                      <th className="p-4">Model</th>
                      <th className="p-4">Serial Number</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.filter(a => a.category === selectedCategory).map(asset => (
                      <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <div className="font-semibold">{asset.brand} {asset.model}</div>
                        </td>
                        <td className="p-4 font-mono text-sm">{asset.serialNumber}</td>
                        <td className="p-4">
                          <span className={`badge ${asset.status === 'AVAILABLE' ? 'badge-success' : 'badge-info'}`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted">{new Date(asset.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg">Purchase Order History</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setIsOrderModalOpen(true)}>
              <ClipboardList size={16} /> New Purchase Order
            </button>
          </div>

          <div className="grid gap-4">
            {orders.map(order => (
              <div key={order.id} className="glass-card flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="badge badge-info" style={{ padding: '1rem', borderRadius: '12px' }}>
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-muted">{order.orderNumber}</div>
                    <h4 className="text-lg font-bold">{order.quantity}x {order.category}</h4>
                    {order.totalAmount > 0 && <div className="text-success font-bold">${order.totalAmount.toLocaleString()}</div>}
                    <div className="text-xs text-muted">Requested on: {new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={`badge ${order.status === 'RECEIVED' ? 'badge-success' : order.status === 'SHIPPED' ? 'badge-info' : 'badge-warning'}`}>
                      {order.status}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleEditOrder(order)} className="icon-btn-small" title="Edit Order"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteOrder(order.id)} className="icon-btn-small danger" title="Delete Order"><Trash2 size={16} /></button>
                      </>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button 
                        onClick={() => handleReceiveOrder(order)}
                        className="btn btn-primary btn-sm"
                      >
                        Receive Stock <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div className="glass-panel p-8 text-center text-muted">No purchase orders found.</div>}
          </div>
        </>
      )}

      {/* Asset Modal */}
      {isAssetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '550px' }}>
            <div className="p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl">Add Stock to Vendor Warehouse</h2>
              <p className="text-xs text-muted">Items added here belong to the vendor until transferred to internal stock.</p>
            </div>
            <form onSubmit={handleAddAsset}>
              <div className="modal-body">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" required placeholder="e.g. Monitor" value={assetForm.category} onChange={e => setAssetForm({...assetForm, category: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Brand</label>
                    <input type="text" required placeholder="e.g. Dell" value={assetForm.brand} onChange={e => setAssetForm({...assetForm, brand: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input type="text" required placeholder="e.g. U2415" value={assetForm.model} onChange={e => setAssetForm({...assetForm, model: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Serial Numbers (one per line)</label>
                  <textarea rows="5" required placeholder="SN123456\nSN789012..." value={assetForm.serials} onChange={e => setAssetForm({...assetForm, serials: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsAssetModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><Upload size={16} /> Upload to Vendor Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {isOrderModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <div className="p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl">{orderForm.id ? 'Edit Purchase Order' : 'New Purchase Order'}</h2>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Item Category</label>
                  <input type="text" required placeholder="e.g. Laptop" value={orderForm.category} onChange={e => setOrderForm({...orderForm, category: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" required placeholder="10" value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Description/Notes</label>
                  <textarea rows="3" placeholder="Additional details..." value={orderForm.description} onChange={e => setOrderForm({...orderForm, description: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setIsOrderModalOpen(false); setOrderForm({ category: '', quantity: '', description: '' }); }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <ShoppingCart size={16} /> {orderForm.id ? 'Update Order' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  portalBanner: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
    borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem',
  },
  copyBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 1.2rem', borderRadius: '8px',
    background: 'rgba(59,130,246,0.1)', border: '1px solid var(--accent-primary)',
    color: 'var(--accent-primary)', cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
  }
};
