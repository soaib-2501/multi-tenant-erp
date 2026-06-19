import React, { useState, useEffect } from 'react';
import Sidebar from '../components/shared/Sidebar';
import TopNavbar from '../components/shared/TopNavbar';

export default function MainLayout({ children, title }) {
  /*
    ── SIDEBAR SYNC ──
    We listen to the 'sidebar-toggle' custom event fired by Sidebar.jsx
    to know how much left margin the main content needs.

    Desktop expanded  → marginLeft = 288px (w-72)
    Desktop collapsed → marginLeft = 64px  (w-16)
    Tablet/Mobile     → marginLeft = 0px   (sidebar overlays, doesn't push)

    Threshold is 1280px (not 768px) because a fixed 288px push-margin on an
    iPad-width screen (768–1024px) leaves too little content width and
    squeezes multi-column grids (e.g. the 3 stat cards on the dashboard).
    Below 1280px the sidebar overlays content instead of pushing it.
  */
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
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

  /*
    ── MARGIN LOGIC ──
    Mobile  → 0px   (sidebar slides OVER the content, not beside it)
    Desktop → 288px expanded | 64px collapsed
  */
  const marginLeft = isMobile
    ? '0px'
    : sidebarExpanded
      ? '288px'
      : '64px';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <Sidebar />
      <main
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft, backgroundColor: 'var(--color-background)' }}
      >
        <TopNavbar title={title} />
        {/*
          flex-1 ensures the content area grows to fill remaining vertical space.
          overflow-x-hidden prevents any child from causing horizontal scroll.
        */}
        <div className="flex-1 overflow-x-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
