'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Monitor, Ticket, Users, LogOut } from 'lucide-react';

export default function Sidebar({ userRole }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'Assets', path: '/assets', icon: Monitor, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'Tickets', path: '/tickets', icon: Ticket, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'My Portal', path: '/portal', icon: Ticket, roles: ['EMPLOYEE'] },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside style={styles.sidebar} className="glass-panel">
      <div style={styles.logoContainer}>
        <Monitor size={32} color="var(--accent-primary)" />
        <h2 style={styles.logoText}>IT System</h2>
      </div>

      <nav style={styles.nav}>
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path} 
              href={item.path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    borderRight: '1px solid var(--border-color)',
    borderRadius: 0,
    zIndex: 50,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '3rem',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.875rem 1rem',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--accent-primary)',
    boxShadow: 'inset 4px 0 0 var(--accent-primary)',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-color)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    padding: '0.875rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontFamily: 'inherit',
  }
};
