import React, { useState, useEffect } from 'react';
import Sidebar from '../components/shared/Sidebar';
import TopNavbar from '../components/shared/TopNavbar';

export default function MainLayout({ children, title }) {
  // ✅ Default TRUE — matches sidebar default
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handler = (e) => setSidebarExpanded(e.detail.expanded);
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  // collapsed = 64px (w-16), expanded = 288px (w-72)
  const marginLeft = isMobile ? '0px' : sidebarExpanded ? '288px' : '64px';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <Sidebar />
      <main
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft, backgroundColor: 'var(--color-background)' }}
      >
        <TopNavbar title={title} />
        <div className="flex-1" style={{ backgroundColor: 'var(--color-background)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}