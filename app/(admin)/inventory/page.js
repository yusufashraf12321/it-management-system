'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, Loader2, Server, Monitor, Keyboard, Mouse, Headphones, Upload, Trash2 } from 'lucide-react';
import AddCategoryModal from '@/components/AddCategoryModal';
import BulkAddAssetsModal from '@/components/BulkAddAssetsModal';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForBulk, setSelectedItemForBulk] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      
      // Group by category for summary cards
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { total: 0, available: 0, items: [] };
        }
        acc[item.category].total += item.totalCount;
        acc[item.category].available += item.availableCount;
        acc[item.category].items.push(item);
        return acc;
      }, {});

      setItems(grouped);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (e, category) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete the "${category}" category? This will delete all items and serials inside it.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/inventory/category/${encodeURIComponent(category)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchInventory();
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('An error occurred while deleting');
    }
  };

  const getIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('laptop') || cat.includes('computer')) return <Monitor size={32} />;
    if (cat.includes('keyboard')) return <Keyboard size={32} />;
    if (cat.includes('mouse')) return <Mouse size={32} />;
    if (cat.includes('headset')) return <Headphones size={32} />;
    return <Server size={32} />;
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl">Inventory Management</h2>
          <p className="text-muted">Manage stock levels and add new inventory categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {Object.entries(items).map(([category, data]) => (
          <Link key={category} href={`/inventory/category/${encodeURIComponent(category)}`} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={styles.categoryCard}>
              <div style={styles.cardHeader}>
                <div style={styles.iconWrapper}>
                  {getIcon(category)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="text-xl" style={{ color: 'var(--text-primary)' }}>{category}</h3>
                </div>
                <button 
                  onClick={(e) => handleDeleteCategory(e, category)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}
                  title="Delete Category"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div style={styles.statsContainer}>
                <div style={styles.statBox}>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>Total Stock</span>
                  <span className="text-2xl" style={{ color: 'var(--text-primary)' }}>{data.total}</span>
                </div>
                <div style={styles.statBox}>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>Available</span>
                  <span className="text-2xl" style={{ color: 'var(--success)' }}>{data.available}</span>
                </div>
              </div>

              <div style={styles.modelsList}>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Models:</p>
                {data.items.slice(0, 3).map(item => (
                  <div key={item.id} style={styles.modelRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.brand} {item.model}</span>
                      <button 
                        onClick={(e) => { e.preventDefault(); setSelectedItemForBulk(item); }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Upload Serials in Bulk"
                      >
                        <Upload size={14} />
                      </button>
                    </div>
                    <span className="badge badge-success">{item.availableCount}</span>
                  </div>
                ))}
                {data.items.length > 3 && (
                  <div style={{ ...styles.modelRow, color: 'var(--accent-primary)', fontSize: '0.875rem' }}>
                    + {data.items.length - 3} more models
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}

        {Object.keys(items).length === 0 && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 className="text-xl mb-2">No Inventory Items</h3>
            <p className="text-muted mb-4">You haven't added any inventory items yet.</p>
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>Add Your First Item</button>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddCategoryModal 
          onClose={() => setIsAddModalOpen(false)} 
          onUpdate={fetchInventory} 
        />
      )}

      {selectedItemForBulk && (
        <BulkAddAssetsModal 
          inventoryItem={selectedItemForBulk} 
          onClose={() => setSelectedItemForBulk(null)} 
          onUpdate={fetchInventory} 
        />
      )}
    </div>
  );
}

const styles = {
  categoryCard: {
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  iconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: 'var(--radius-lg)',
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statBox: {
    flex: 1,
    background: 'rgba(15, 23, 42, 0.4)',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
  },
  modelsList: {
    marginTop: 'auto',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
  },
  modelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  }
};
