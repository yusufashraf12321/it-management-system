'use client';

import { useState, useEffect } from 'react';
import { FileText, TrendingUp, PieChart, Download, Calendar, DollarSign, Package, Users, Loader2 } from 'lucide-react';

export default function Reports() {
  const [finData, setFinData] = useState(null);
  const [invData, setInvData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/reports/financial').then(res => res.json()),
      fetch('/api/reports/inventory').then(res => res.json())
    ]).then(([fin, inv]) => {
      setFinData(fin);
      setInvData(inv);
      setLoading(false);
    }).catch(err => console.error(err));
  }, []);

  const handlePrint = () => window.print();

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="animate-fade-in print-area">
      <div className="flex justify-between items-center mb-8 no-print">
        <div>
          <h2 className="text-2xl">Financial & Year-End Reports</h2>
          <p className="text-muted">Analyze company investments and asset distribution</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Download size={18} />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="glass-card">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-success" size={20} />
            <span className="text-muted text-sm font-medium uppercase tracking-wider">Total Investment</span>
          </div>
          <h3 className="text-3xl font-bold">${finData?.totalInvestment?.toLocaleString()}</h3>
          <p className="text-xs text-muted mt-2">Total spent on received orders</p>
        </div>

        <div className="glass-card">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-accent-primary" size={20} />
            <span className="text-muted text-sm font-medium uppercase tracking-wider">Total Active Assets</span>
          </div>
          <h3 className="text-3xl font-bold">{invData?.totalAssetsCount}</h3>
          <p className="text-xs text-muted mt-2">Across all categories & status</p>
        </div>

        <div className="glass-card">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-warning" size={20} />
            <span className="text-muted text-sm font-medium uppercase tracking-wider">Dept. Distribution</span>
          </div>
          <h3 className="text-3xl font-bold">{invData?.deptValue?.length}</h3>
          <p className="text-xs text-muted mt-2">Active departments with assets</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-accent-primary" /> Vendor Spending Analysis
          </h3>
          <div className="space-y-4">
            {finData?.vendorStats?.map(v => (
              <div key={v.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{v.name}</span>
                  <span className="font-bold">${v.totalSpent.toLocaleString()}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'var(--accent-primary)', 
                    width: `${(v.totalSpent / (finData.totalInvestment || 1)) * 100}%` 
                  }} />
                </div>
                <div className="text-right text-xs text-muted mt-1">{v.orderCount} Orders</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-success" /> Asset Status Report
          </h3>
          <div className="space-y-4">
            {Object.entries(invData?.statusDistribution || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-sm font-medium">{status.replace('_', ' ')}</span>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">{count}</span>
                  <span className="badge badge-info">{Math.round((count / invData.totalAssetsCount) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-warning" /> Departmental Asset Valuation
        </h3>
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/10 text-sm text-muted">
              <th className="pb-4">Department</th>
              <th className="pb-4">Asset Count</th>
              <th className="pb-4">Total Value</th>
              <th className="pb-4">Avg. Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {invData?.deptValue?.map(d => (
              <tr key={d.name} className="border-b border-white/5">
                <td className="py-4 font-semibold">{d.name}</td>
                <td className="py-4">{d.count}</td>
                <td className="py-4 font-bold text-success">${d.value.toLocaleString()}</td>
                <td className="py-4 text-muted">${d.count > 0 ? (d.value / d.count).toLocaleString() : 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { padding: 0 !important; color: black !important; }
          .glass-panel, .glass-card { 
            background: white !important; 
            border: 1px solid #ddd !important; 
            color: black !important; 
            box-shadow: none !important;
          }
          .text-muted { color: #666 !important; }
          .badge { border: 1px solid #333 !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
