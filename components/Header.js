'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Search, User, Menu, X, Check, AlertCircle, Info } from 'lucide-react';
import UserProfileMenu from '@/components/UserProfileMenu';

export default function Header({ title, userFullName, userRole, onMenuClick, showMenuBtn }) {
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const audioRef = useRef(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.id) setCurrentUser(data);
    } catch (e) { console.error(e); }
  };

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (Array.isArray(data)) {
        const unread = data.filter(n => !n.isRead);
        if (unread.length > (notifications.filter(n => !n.isRead).length)) {
          if (audioRef.current) audioRef.current.play().catch(e => console.log('Audio play blocked'));
          setHasNew(true);
        }
        setNotifications(data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchUser();
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const markRead = async () => {
    setShowNotif(!showNotif);
    if (!showNotif && notifications.some(n => !n.isRead)) {
      await fetch('/api/notifications', { method: 'PATCH' });
      setHasNew(false);
      fetchNotifs();
    }
  };

  return (
    <header className="header-container glass-panel">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3" preload="auto" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {showMenuBtn && (
          <button onClick={onMenuClick} className="mobile-menu-btn" style={{ display: 'flex' }}>
            <Menu size={22} />
          </button>
        )}
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-actions">
        <div className="header-search-container search-hide-mobile">
          <Search size={18} className="header-search-icon" />
          <input type="text" placeholder="Search..." className="header-search-input" />
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={markRead} className="header-icon-btn">
            <Bell size={20} />
            {notifications.some(n => !n.isRead) && <span className="header-notif-badge"></span>}
          </button>

          {showNotif && (
            <div className="glass-panel header-notif-dropdown">
              <div style={styles.notifHeader}>
                <span style={{ fontWeight: 600 }}>Notifications</span>
                <span className="text-xs text-muted">{notifications.filter(n => !n.isRead).length} Unread</span>
              </div>
              <div style={styles.notifList}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No notifications
                  </div>
                ) : notifications.map(n => (
                  <div key={n.id} style={{
                    ...styles.notifItem,
                    borderLeft: `3px solid ${n.type === 'SUCCESS' ? 'var(--success)' : 'var(--accent-primary)'}`
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfile(!showProfile)} 
            className="header-profile-btn"
          >
            <div className="header-avatar">
              <User size={20} />
            </div>
            <div className="header-user-info user-info-hide-mobile">
              <span className="header-user-name">{userFullName}</span>
              <span className="header-user-role">{userRole}</span>
            </div>
          </button>

          {showProfile && currentUser && (
            <UserProfileMenu 
              user={currentUser} 
              onClose={() => setShowProfile(false)} 
            />
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .search-hide-mobile { display: none !important; }
          .user-info-hide-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}

const styles = {
  notifHeader: {
    padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  notifList: { overflowY: 'auto' },
  notifItem: {
    padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)',
    transition: 'background 0.2s', cursor: 'default',
  }
};
