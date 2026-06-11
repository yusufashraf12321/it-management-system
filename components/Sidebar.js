'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Monitor, Ticket, Users, LogOut, Truck, ChevronDown, ChevronRight, ArrowRight, PieChart, Activity, Wrench } from 'lucide-react';

export default function Sidebar({ userRole, onNavigate }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'Vendors', path: '/vendors', icon: Truck, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'Assets', path: '/assets', icon: Monitor, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'Maintenances', path: '/maintenances', icon: Wrench, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'Tickets', path: '/tickets', icon: Ticket, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'Logs', path: '/logs', icon: Activity, roles: ['ADMIN'] },
    { name: 'My Portal', path: '/portal', icon: Ticket, roles: ['EMPLOYEE'] },
  ];

  const [vendors, setVendors] = useState([]);
  const [showVendors, setShowVendors] = useState(false);

  useEffect(() => {
    if (userRole !== 'EMPLOYEE') {
      fetch('/api/vendors')
        .then(res => res.json())
        .then(data => setVendors(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    }
  }, [userRole]);

  const allowedItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo-container">
        <Monitor size={32} color="var(--accent-primary)" />
        <h2 className="sidebar-logo-text">IT System</h2>
      </div>

      <nav className="sidebar-nav">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);
          
          if (item.name === 'Vendors') {
            return (
              <div key={item.path}>
                <div 
                  onClick={() => setShowVendors(!showVendors)}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <Icon size={20} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  {showVendors ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {showVendors && (
                  <div className="sidebar-dropdown">
                    <Link href="/vendors" className="sidebar-dropdown-item" onClick={onNavigate}>
                      <LayoutDashboard size={14} /> Overview
                    </Link>
                    {vendors.map(v => (
                      <Link key={v.id} href={`/vendors/${v.id}`} className="sidebar-dropdown-item" onClick={onNavigate}>
                        <ArrowRight size={14} /> {v.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={onNavigate}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
