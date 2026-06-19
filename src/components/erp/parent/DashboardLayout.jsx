// src/components/erp/parent/DashboardLayout.jsx

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
// import BottomNav from "./BottomNav";

const SIDEBAR_STORAGE_KEY = "parent_sidebar_expanded";

export default function DashboardLayout({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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

  // ── Sidebar expand/collapse + mobile detection — owned HERE, the only
  // place this state lives. Sidebar and Navbar receive it as props and
  // call back up via onToggle/onOpenSidebar/onClose. No CustomEvents, no
  // second copy of the state anywhere — so the sidebar's visual width and
  // the content's left margin can NEVER go out of sync (that mismatch was
  // the cause of the "ghost sidebar" overlap bug). ──
  useEffect(() => {
    const applyModeState = (mobile) => {
      let expanded;
      if (mobile) {
        expanded = false;
      } else {
        const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        expanded = saved !== null ? saved === "true" : true;
      }
      setIsExpanded(expanded);
    };

    let lastMobile = window.innerWidth < 768;
    setIsMobile(lastMobile);
    applyModeState(lastMobile);

    // Only re-apply when crossing the mobile/desktop breakpoint — not on
    // every resize tick (that wipes out manual toggles).
    const check = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== lastMobile) {
        lastMobile = mobile;
        setIsMobile(mobile);
        applyModeState(mobile);
      }
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (!isMobile) localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  // Navbar hamburger calls this to open the mobile drawer
  const openSidebar = () => setIsExpanded(true);

  // NavLink click / backdrop click calls this to close the mobile drawer
  const closeSidebar = () => {
    if (isMobile) setIsExpanded(false);
  };

  return (
    // overflow-x-hidden + max-w-[100vw] → safety net, page can never scroll sideways
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-white dark:bg-slate-950 transition-colors duration-300">

      <Sidebar
        isExpanded={isExpanded}
        isMobile={isMobile}
        onToggle={toggleSidebar}
        onClose={closeSidebar}
      />

      {/*
        min-w-0 is the actual fix — without it, a flex child refuses to shrink
        below its content's intrinsic width (e.g. a 520px-wide table), which
        forces the WHOLE page to scroll horizontally instead of just that table.
        md:ml-72 / md:ml-20  → shift right of sidebar on desktop only.
        On mobile the sidebar is an off-canvas drawer (fixed, translated
        off-screen), so content never needs a left margin there — ml-0.
      */}
      <div
        className={`flex-1 min-w-0 min-h-screen bg-white dark:bg-slate-950
                    transition-all duration-300
                    ml-0 w-full min-w-0
                    ${isExpanded ? "md:ml-72" : "md:ml-20"}`}
      >
        <Navbar
          onOpenSidebar={openSidebar}
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        {/* Responsive page padding: tighter on very small screens, comfortable on desktop */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden min-w-0">
          {children}
        </div>
      </div>

      {/* <BottomNav /> */}
    </div>
  );
}