'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function ResponsiveLayout({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar when route changes on mobile
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: isMobile ? 'fixed' : 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 50,
          transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}
      >
        <Sidebar userRole={user.role} onNavigate={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ marginLeft: isMobile ? 0 : '260px' }}>
        <Header
          title="IT Administration"
          userFullName={user.fullName}
          userRole={user.role}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuBtn={isMobile}
        />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
