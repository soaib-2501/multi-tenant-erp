// src/components/erp/parent/Navbar.jsx

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Route → page name mapping
const PAGE_NAMES = {
  "/parent":                "Dashboard",
  "/parent/child-overview": "Child Overview",
  "/parent/attendance":     "Attendance",
  "/parent/assignments":    "Assignments",
  "/parent/grades":         "Grades & Report",
  "/parent/insights":       "AI Insights",
  "/parent/settings":       "Settings",
  "/parent/notifications":  "Notifications",
};

const Navbar = ({ onOpenSidebar, onToggleSidebar, isMobile }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Mobile: drawer is closed by default → hamburger opens it.
  // Desktop/laptop: sidebar is expanded by default → hamburger toggles
  // collapse/expand (same as the toggle button inside the sidebar itself).
  const handleHamburgerClick = () => {
    if (isMobile) {
      onOpenSidebar();
    } else {
      onToggleSidebar();
    }
  };

  const userData = JSON.parse(localStorage.getItem('user_data') || 'null');
  const parentData = userData?.identity;
  const parentFirstName = parentData?.first_name;
  const parentLastName = parentData?.last_name;

  const displayName =
    parentFirstName && parentLastName
      ? `${parentFirstName[0].toUpperCase() + parentFirstName.slice(1)} ${parentLastName[0].toUpperCase() + parentLastName.slice(1)}`
      : "Parent";

  // Match current path — exact first, then prefix
  const pageName =
    PAGE_NAMES[location.pathname] ||
    Object.entries(PAGE_NAMES).find(([key]) =>
      location.pathname.startsWith(key + "/")
    )?.[1] ||
    "Parent Portal";

  return (
    <header
      className="w-full sticky top-0 z-30
                 bg-white/80 dark:bg-slate-900/80
                 backdrop-blur-xl
                 border-b border-slate-200 dark:border-slate-700/50
                 flex justify-between items-center px-3 sm:px-6 h-14 sm:h-16
                 transition-colors duration-300 gap-2"
    >
      {/* Left: mobile hamburger (desktop already has its own toggle inside the sidebar) + page title */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={handleHamburgerClick}
          className="md:hidden w-8 h-8 sm:w-9 sm:h-9 -ml-1 flex items-center justify-center rounded-lg
                     text-blue-700 dark:text-blue-300
                     hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl">menu</span>
        </button>

        <h1 className="font-bold tracking-tight text-blue-800 dark:text-blue-300 font-headline truncate
                       text-sm sm:text-base md:text-xl min-w-0">
          <span className="md:hidden">{pageName}</span>
          <span className="hidden md:inline">The Academic Architect</span>
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 flex-shrink-0">
        {/* Name + divider — desktop only */}
        <div className="hidden lg:flex items-center gap-4">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400 whitespace-nowrap">
            {displayName}
          </span>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <span className="material-symbols-outlined text-blue-700 dark:text-blue-400 cursor-pointer text-lg sm:text-xl hidden sm:block">
          search
        </span>

        <button
          onClick={() => navigate("/parent/notifications")}
          className="relative text-slate-600 dark:text-slate-300
                     hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">notifications</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;