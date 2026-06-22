import React, { useState } from 'react';
import Sidebar from "./Sidebar";
import TopAppBar from "./TopAppBar";
import MobileNav from "./MobileNav";
const MainLayout = ({ children, title }) => {
  // Initialize sidebar state based on screen size
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768; // Open on desktop, closed on mobile
  });

  return (
    <div className="bg-surface font-body text-sm text-on-surface antialiased min-h-screen overflow-x-hidden">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out ${
        isSidebarOpen
          ? "translate-x-0"
          : "-translate-x-full"
      }`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className={`min-h-screen flex flex-col pb-20 md:pb-0 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "md:ml-64" : "md:ml-0"
      }`}>
        <TopAppBar
          title={title}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-grow">
          {children}
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
};

export default MainLayout;
