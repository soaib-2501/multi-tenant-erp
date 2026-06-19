// src/components/erp/parent/DashboardLayout.jsx

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
// import BottomNav from "./BottomNav";

export default function DashboardLayout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // ── Dark mode: default LIGHT on every fresh session (login/new tab),
  // persists only within the same session if the user explicitly chose dark
  // via Settings. ──
  useEffect(() => {
    const sessionInitialized = sessionStorage.getItem("parent_theme_session_init");

    if (!sessionInitialized) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("parent_theme", "light");
      sessionStorage.setItem("parent_theme_session_init", "true");
    } else {
      const saved = localStorage.getItem("parent_theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // Keep content area in sync with sidebar width (desktop collapse/expand)
  useEffect(() => {
    const handler = (e) => setSidebarExpanded(e.detail.expanded);
    window.addEventListener("parent-sidebar-toggle", handler);
    return () => window.removeEventListener("parent-sidebar-toggle", handler);
  }, []);

  return (
    // overflow-x-hidden + max-w-[100vw] → safety net, page can never scroll sideways
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-white dark:bg-slate-950 transition-colors duration-300">

      <Sidebar />

      {/*
        min-w-0 is the actual fix — without it, a flex child refuses to shrink
        below its content's intrinsic width (e.g. a 520px-wide table), which
        forces the WHOLE page to scroll horizontally instead of just that table.
        md:ml-72 / md:ml-20  → shift right of sidebar on desktop only.
        On mobile the sidebar is an off-canvas drawer (fixed, translated
        off-screen), so content never needs a left margin there — ml-0.
        pb-20                 → bottom padding on mobile so content doesn't hide behind BottomNav
      */}
      <div
        className={`flex-1 min-w-0 min-h-screen bg-white dark:bg-slate-950
                    transition-all duration-300
                    ml-0 pb-20 md:pb-0
                    ${sidebarExpanded ? "md:ml-72" : "md:ml-20"}`}
      >
        <Navbar />

        {/* Responsive page padding: tighter on mobile, comfortable on desktop */}
        <div className="p-4 sm:p-6 md:p-8 min-w-0">
          {children}
        </div>
      </div>

      {/* <BottomNav /> */}
    </div>
  );
}