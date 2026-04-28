import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { LogOut, Monitor } from 'lucide-react';

export default function PortalLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);

  if (!user) {
    redirect('/login');
  }

  // Admin and IT staff shouldn't ideally use this portal, but we'll let them if they navigate to it
  // But typically they go to /dashboard. 
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="glass-panel" style={styles.header}>
        <div style={styles.logoContainer}>
          <Monitor size={24} color="var(--accent-primary)" />
          <h1 style={styles.logoText}>IT Service Portal</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontWeight: 500 }}>Welcome, {user.fullName}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} />
              Logout
            </button>
          </form>
        </div>
      </header>
      
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  header: {
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    borderRadius: 0,
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }
};
