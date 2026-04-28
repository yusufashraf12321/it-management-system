'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Monitor, Server, Keyboard, Mouse, Headphones, Package, Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import AddItemToCategoryModal from '@/components/AddItemToCategoryModal';
import EditInventoryItemModal from '@/components/EditInventoryItemModal';
import EditAssetModal from '@/components/EditAssetModal';

export default function CategoryDetail() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], category: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState(null);

  useEffect(() => {
    fetchData();
  }, [params.category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const decodedCategory = decodeURIComponent(params.category);
      const res = await fetch('/api/inventory');
      const allItems = await res.json();
      
      const filteredItems = allItems.filter(item => item.category === decodedCategory);
      
      const itemsWithAssets = await Promise.all(filteredItems.map(async (item) => {
        const itemRes = await fetch(`/api/inventory/${item.id}`);
        return await itemRes.json();
      }));

      setData({ items: itemsWithAssets, category: decodedCategory });
    } catch (err) {
      console.error('Error fetching category data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (itemId) => {
    if (!confirm('Are you sure you want to delete this model and all its serial numbers?')) return;
    try {
      const res = await fetch(`/api/inventory/${itemId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm('Are you sure you want to delete this serial number?')) return;
    try {
      const res = await fetch(`/api/assets/${assetId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const getIcon = (cat) => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('laptop') || lower.includes('computer')) return <Monitor size={24} />;
    if (lower.includes('keyboard')) return <Keyboard size={24} />;
    if (lower.includes('mouse')) return <Mouse size={24} />;
    if (lower.includes('headset')) return <Headphones size={24} />;
    return <Server size={24} />;
  };

  const totalAssets = data.items.reduce((acc, item) => acc + item.totalCount, 0);
  const availableAssets = data.items.reduce((acc, item) => acc + item.availableCount, 0);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={styles.iconWrapper}>
              {getIcon(data.category)}
            </div>
            <div>
              <h2 className="text-2xl">{data.category}</h2>
              <p className="text-muted">Detailed view of all models and serial numbers</p>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Add New Model</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
        <div>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Total Models</p>
          <p className="text-2xl">{data.items.length}</p>
        </div>
        <div>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Total Stock</p>
          <p className="text-2xl">{totalAssets}</p>
        </div>
        <div>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Available Stock</p>
          <p className="text-2xl" style={{ color: 'var(--success)' }}>{availableAssets}</p>
        </div>
      </div>

      {data.items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 className="text-xl mb-2">No Items Found</h3>
          <p className="text-muted">There are no items in this category yet.</p>
        </div>
      ) : (
        data.items.map(item => (
          <div key={item.id} className="glass-card mb-6" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={styles.modelHeader}>
              <div className="flex items-center gap-4">
                <h3 className="text-xl" style={{ margin: 0 }}>{item.brand} {item.model}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedItemForEdit(item)} className="icon-btn-small" title="Edit Model"><Edit2 size={14} /></button>
                  <button onClick={() => handleDeleteModel(item.id)} className="icon-btn-small danger" title="Delete Model"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="badge badge-info">Total: {item.totalCount}</span>
                <span className="badge badge-success">Available: {item.availableCount}</span>
              </div>
            </div>

            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {item.assets?.map(asset => (
                    <tr key={asset.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{asset.serialNumber}</td>
                      <td>
                        <span className={`badge ${asset.status === 'IN_STOCK' ? 'badge-success' : 'badge-warning'}`}>
                          {asset.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{asset.assignedToUser ? asset.assignedToUser.fullName : '-'}</td>
                      <td>{asset.department ? asset.department.name : '-'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedAssetForEdit(asset)} className="icon-btn-small" title="Edit Serial"><Edit2 size={12} /></button>
                          <button 
                            onClick={() => handleDeleteAsset(asset.id)} 
                            className="icon-btn-small danger" 
                            title="Delete Serial"
                            disabled={asset.status === 'ASSIGNED'}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!item.assets || item.assets.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                        No serials added for this model yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {isAddModalOpen && (
        <AddItemToCategoryModal 
          category={data.category} 
          onClose={() => setIsAddModalOpen(false)} 
          onUpdate={fetchData} 
        />
      )}

      {selectedItemForEdit && (
        <EditInventoryItemModal 
          item={selectedItemForEdit} 
          onClose={() => setSelectedItemForEdit(null)} 
          onUpdate={fetchData} 
        />
      )}

      {selectedAssetForEdit && (
        <EditAssetModal 
          asset={selectedAssetForEdit} 
          onClose={() => setSelectedAssetForEdit(null)} 
          onUpdate={fetchData} 
        />
      )}
    </div>
  );
}

const styles = {
  iconWrapper: {
    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
    background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modelHeader: {
    padding: '1.5rem', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
  }
};
