'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Monitor, 
  Server, 
  Keyboard, 
  Mouse, 
  Headphones, 
  Package, 
  Plus, 
  Loader2, 
  Edit2, 
  Trash2, 
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import AddItemToCategoryModal from '@/components/AddItemToCategoryModal';
import EditInventoryItemModal from '@/components/EditInventoryItemModal';
import EditAssetModal from '@/components/EditAssetModal';
import SendToMaintenanceModal from '@/components/SendToMaintenanceModal';

export default function CategoryDetail() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], category: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState(null);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState(null);

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

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemAnim = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-accent-primary" size={40} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Syncing Infrastructure Data...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-10 max-w-7xl mx-auto"
    >
      <header className="flex flex-wrap items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-8">
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()} 
            className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-muted hover:text-accent-primary transition-all border-white/5"
          >
            <ArrowLeft size={22} />
          </motion.button>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[24px] bg-accent-primary/10 flex items-center justify-center text-accent-primary shadow-[0_10px_30px_rgba(59,130,246,0.2)]">
              {getIcon(data.category)}
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-1">{data.category}</h1>
              <nav className="text-[11px] uppercase font-bold tracking-[0.2em] text-muted flex gap-3">
                <span className="opacity-60">Inventory</span>
                <span className="opacity-20">/</span>
                <span className="text-accent-primary">Architecture Hub</span>
              </nav>
            </div>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-primary px-10 py-5 rounded-2xl shadow-[0_12px_30px_rgba(59,130,246,0.25)] flex items-center gap-3" 
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={20} />
          <span className="font-bold uppercase tracking-widest text-xs">Add New Model</span>
        </motion.button>
      </header>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <StatCard label="Active Model Architectures" value={data.items.length} color="var(--accent-primary)" />
        <StatCard label="Total Hardware Inventory" value={totalAssets} color="var(--info)" />
        <StatCard label="Verified Operational Stock" value={availableAssets} color="var(--success)" isStock />
      </motion.div>

      <div className="space-y-12">
        {data.items.length === 0 ? (
          <motion.div variants={itemAnim} className="glass-panel py-32 text-center border-dashed border-white/10 bg-white/[0.01]">
            <Package size={80} className="text-muted mx-auto mb-8 opacity-10" />
            <h3 className="text-2xl font-bold mb-3">Void Detected</h3>
            <p className="text-muted text-sm max-w-sm mx-auto leading-relaxed">The architecture registry for this category is currently unpopulated. Initialize your first model to begin tracking.</p>
          </motion.div>
        ) : (
          data.items.map(item => (
            <motion.section key={item.id} variants={itemAnim} className="glass-card p-0 overflow-hidden border-white/5 shadow-2xl">
              <div className="p-8 border-b border-white/5 bg-white/[0.03] flex justify-between items-center flex-wrap gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-1.5 h-10 rounded-full bg-accent-primary shadow-[0_0_15px_var(--accent-primary)]"></div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{item.brand} {item.model}</h3>
                    <div className="flex gap-4 mt-1.5">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-[0.1em] flex items-center gap-1.5 opacity-60">
                        <Info size={11} /> Registry Code: {item.id}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-muted uppercase font-bold tracking-widest mb-0.5">Total</span>
                      <span className="text-sm font-mono font-bold text-info">{item.totalCount}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-muted uppercase font-bold tracking-widest mb-0.5">Ready</span>
                      <span className="text-sm font-mono font-bold text-success">{item.availableCount}</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => setSelectedItemForEdit(item)} className="w-10 h-10 rounded-xl glass-panel hover:bg-white/10 transition-all flex items-center justify-center text-muted hover:text-primary" title="Edit Model"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteModel(item.id)} className="w-10 h-10 rounded-xl glass-panel hover:bg-danger/20 transition-all flex items-center justify-center text-muted hover:text-danger" title="Retire Model"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.25em] text-muted border-b border-white/5 bg-white/[0.01]">
                      <th className="p-6 font-bold">Serial Identifier</th>
                      <th className="p-6 font-bold">Valuation</th>
                      <th className="p-6 font-bold text-center">Lifecycle Status</th>
                      <th className="p-6 font-bold">Current Deployment</th>
                      <th className="p-6 text-right font-bold">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {item.assets?.map(asset => (
                      <tr key={asset.id} className="hover:bg-white/[0.02] transition-all group">
                        <td className="p-6">
                          <div className="font-mono font-bold text-sm text-primary flex items-center gap-3">
                            <ShieldCheck size={16} className="text-accent-primary/30 group-hover:text-accent-primary transition-colors" />
                            {asset.serialNumber}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="font-mono text-sm font-bold text-success">
                            {asset.price ? `$${asset.price.toLocaleString()}` : '—'}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center">
                            <StatusBadge status={asset.status} />
                          </div>
                        </td>
                        <td className="p-6">
                          {asset.assignedToUser ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold text-primary">{asset.assignedToUser.fullName}</span>
                              <span className="text-[10px] font-bold text-accent-primary uppercase tracking-widest opacity-80">{asset.department?.name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-muted opacity-30 italic">Unassigned Unit</span>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all duration-300">
                            {asset.status === 'IN_STOCK' && (
                              <button 
                                onClick={() => setSelectedAssetForMaintenance(asset)} 
                                className="w-10 h-10 rounded-xl bg-warning/10 hover:bg-warning/20 text-warning border border-warning/10 flex items-center justify-center transition-all shadow-sm"
                                title="Initiate Repair Dispatch"
                              >
                                <Wrench size={16} />
                              </button>
                            )}
                            <button onClick={() => setSelectedAssetForEdit(asset)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-primary border border-white/5 flex items-center justify-center transition-all" title="Edit Metadata"><Edit2 size={16} /></button>
                            <button 
                              onClick={() => handleDeleteAsset(asset.id)} 
                              className="w-10 h-10 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger border border-danger/10 flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed" 
                              title="Delete Record"
                              disabled={asset.status === 'ASSIGNED' || asset.status === 'MAINTENANCE'}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          ))
        )}
      </div>

      <AnimatePresence>
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
        {selectedAssetForMaintenance && (
          <SendToMaintenanceModal 
            asset={selectedAssetForMaintenance} 
            onClose={() => setSelectedAssetForMaintenance(null)} 
            onUpdate={fetchData} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ label, value, color, isStock }) {
  return (
    <div className="glass-card p-8 relative overflow-hidden group border-white/5">
      <div className="absolute right-0 top-0 w-32 h-32 bg-white/[0.03] rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-all duration-500"></div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-3">{label}</p>
      <div className="flex items-baseline gap-3">
        <p className="text-4xl font-bold font-mono tracking-tighter" style={{ color: color }}>
          {value}
        </p>
        {isStock && <span className="text-[10px] font-bold uppercase text-muted opacity-50 tracking-widest">Units Ready</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    IN_STOCK: { label: 'In Stock', class: 'badge-success', icon: ShieldCheck, glow: 'rgba(34, 197, 94, 0.2)' },
    MAINTENANCE: { label: 'At Repair', class: 'badge-warning', icon: Wrench, glow: 'rgba(245, 158, 11, 0.2)' },
    ASSIGNED: { label: 'Deployed', class: 'badge-info', icon: Package, glow: 'rgba(59, 130, 246, 0.2)' },
  };
  const config = configs[status] || { label: status, class: 'badge-secondary', icon: Info, glow: 'rgba(148, 163, 184, 0.2)' };
  const Icon = config.icon;

  return (
    <div 
      className={`badge ${config.class} py-2 px-4 flex items-center gap-2.5 w-fit shadow-lg`}
      style={{ boxShadow: `0 0 15px ${config.glow}` }}
    >
      <Icon size={12} />
      <span className="font-bold tracking-[0.1em] uppercase text-[10px]">{config.label}</span>
    </div>
  );
}
