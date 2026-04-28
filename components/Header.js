'use client';
import { Bell, Search, User } from 'lucide-react';

export default function Header({ title, userFullName, userRole }) {
  return (
    <header style={styles.header} className="glass-panel">
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>{title}</h1>
      </div>

      <div style={styles.actions}>
        <div style={styles.searchContainer}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search..." 
            style={styles.searchInput}
          />
        </div>

        <button style={styles.iconBtn}>
          <Bell size={20} />
          <span style={styles.badge}></span>
        </button>

        <div style={styles.profile}>
          <div style={styles.avatar}>
            <User size={20} />
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{userFullName}</span>
            <span style={styles.userRole}>{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    borderBottom: '1px solid var(--border-color)',
    borderRadius: 0,
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
  },
  searchInput: {
    paddingLeft: '2.5rem',
    width: '250px',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    color: 'var(--text-primary)',
  },
  iconBtn: {
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '8px',
    right: '10px',
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--danger)',
    borderRadius: '50%',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    paddingLeft: '1.5rem',
    borderLeft: '1px solid var(--border-color)',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  }
};
