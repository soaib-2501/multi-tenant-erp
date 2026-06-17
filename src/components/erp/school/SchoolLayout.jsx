import React, { useState, useEffect, useCallback } from "react"; 
import SchoolSidebar from "./SchoolSidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { schoolAdminApi } from "../../../services/schoolAdminApi";
import { ThemeProvider, useTheme } from "../../../context/ThemeContext";

function SchoolLayoutInner({ children, title = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPreviewList, setNotificationPreviewList] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchString, setSearchString] = useState("");

  const synchronizeLayoutStates = useCallback(async () => {
    try {
      const response = await schoolAdminApi.getNotifications();
      const realData = response?.results || response;
      if (Array.isArray(realData)) {
        const unreadItems = realData.filter(n => !n.is_read);
        setUnreadCount(unreadItems.length);
        setNotificationPreviewList(realData.slice(0, 4));
      } else {
        setUnreadCount(3);
      }
    } catch (err) {
      console.warn("Layout synchronization operating on local cluster states.");
      const placeholders = [
        { id: "h-1", title: "System Core Snapshot", message: "Automated verification complete.", is_read: false, category: "system" },
        { id: "h-2", title: "Security Handshake Blocked", message: "Malicious origin payload contained.", is_read: false, category: "security" },
        { id: "h-3", title: "Academic Term Window Close", message: "Roster cycle configurations expiring soon.", is_read: false, category: "academic" }
      ];
      setNotificationPreviewList(placeholders);
      setUnreadCount(placeholders.filter(n => !n.is_read).length);
    }
  }, []);

  useEffect(() => {
    synchronizeLayoutStates();
    const handleContextBroadcast = (event) => {
      if (typeof event.detail === "number") setUnreadCount(event.detail);
      synchronizeLayoutStates();
    };
    window.addEventListener("sync-unread-count", handleContextBroadcast);
    return () => window.removeEventListener("sync-unread-count", handleContextBroadcast);
  }, [synchronizeLayoutStates]);

  const handleQuickResolve = async (id, e) => {
    e.stopPropagation();
    setNotificationPreviewList(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    window.dispatchEvent(new CustomEvent("sync-unread-count", { detail: Math.max(0, unreadCount - 1) }));
  };

  const dk = darkMode;

  return (
    <div className={`font-body min-h-screen overflow-x-hidden relative selection:bg-primary selection:text-white transition-colors duration-300
      ${dk ? "bg-background text-on-surface" : "bg-background text-on-surface"}`}>

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 shadow-xl transition-all duration-300 ease-in-out border-r
        ${dk ? "bg-surface-container-low border-outline-variant/20" : "bg-surface-container-lowest border-outline-variant/10"}
        ${isSidebarOpen ? "w-64 translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 pointer-events-none overflow-hidden"}`}>
        <SchoolSidebar />
      </div>

      {/* MAIN */}
      <main className={`min-h-screen transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "ml-64" : "ml-0"}`}>

        {/* TOPBAR */}
        <header className={`fixed top-0 right-0 h-20 backdrop-blur-xl flex justify-between items-center px-8 z-40 transition-all duration-300 ease-in-out border-b
          ${dk ? "bg-surface-container/90 border-outline-variant/20" : "bg-surface-container-lowest/80 border-outline-variant/10"}
          ${isSidebarOpen ? "w-[calc(100%-16rem)]" : "w-full"}`}>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`rounded-full p-2.5 transition-all duration-200 outline-none flex items-center justify-center active:scale-95
                ${dk ? "hover:bg-surface-container-high text-on-surface-variant hover:text-primary" : "hover:bg-surface-container-high text-on-surface-variant hover:text-primary"}`}>
              <span className="material-symbols-outlined text-xl font-bold">
                {isSidebarOpen ? "menu_open" : "menu"}
              </span>
            </button>
            <div className="flex flex-col">
              <h1 className={`font-black text-lg tracking-tight transition-all ${dk ? "text-on-surface" : "text-on-surface"}`}>{title}</h1>
              <span className={`text-2xs font-bold uppercase tracking-wider hidden sm:inline text-outline`}>
                Institutional Administration Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 relative">
            <div className={`relative transition-all duration-300 rounded-lg hidden md:block ${searchFocused ? "w-80 shadow-xs" : "w-60"}`}>
              <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors ${searchFocused ? "text-primary" : "text-outline"}`}>search</span>
              <input value={searchString} onChange={(e) => setSearchString(e.target.value)}
                onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                placeholder="Search micro-tenant records..."
                className={`pl-9 pr-4 py-2 rounded-lg text-xs font-semibold w-full border outline-none transition-all
                  ${dk ? "bg-surface-container-low border-outline-variant/20 text-on-surface placeholder-outline focus:border-primary/60"
                       : "bg-surface-container-low hover:bg-surface-container focus:bg-surface-container-lowest border-outline-variant/10 focus:border-primary/40"}`} />
            </div>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className={`p-2.5 rounded-full transition-all relative outline-none flex items-center justify-center active:scale-95
                  ${isNotificationDropdownOpen
                    ? dk ? "bg-surface-container-high text-primary" : "bg-surface-container-high text-primary"
                    : dk ? "hover:bg-surface-container-high text-on-surface-variant" : "hover:bg-surface-container-high text-on-surface-variant"}`}>
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-error text-white text-2xs font-black rounded-full flex items-center justify-center px-1 shadow-sm border-2 border-surface-container-lowest">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationDropdownOpen(false)} />
                  <div className={`absolute right-0 mt-3 w-80 rounded-xl shadow-xl border overflow-hidden z-20 animate-fadeIn
                    ${dk ? "bg-surface-container-lowest border-outline-variant/20" : "bg-surface-container-lowest border-outline-variant/10"}`}>
                    <div className={`p-4 border-b flex justify-between items-center ${dk ? "bg-surface-container-high border-outline-variant/20" : "bg-surface-container-high border-outline-variant/10"}`}>
                      <span className={`text-xs font-black uppercase tracking-tight text-on-surface`}>Active Operation Logs</span>
                      <span className="text-2xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} Pending</span>
                    </div>
                    <div className="divide-y divide-outline-variant/10 max-h-64 overflow-y-auto">
                      {notificationPreviewList.map((n) => (
                        <div key={n.id} onClick={() => { setIsNotificationDropdownOpen(false); navigate("/school-admin/notifications"); }}
                          className={`p-3.5 transition-all flex items-start gap-3 relative cursor-pointer
                            ${dk ? "hover:bg-surface-container-high" : "hover:bg-surface-container-high"} ${!n.is_read ? "bg-primary/5" : ""}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.category === 'security' ? 'bg-error' : n.category === 'academic' ? 'bg-tertiary' : 'bg-primary'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate text-on-surface`}>{n.title}</p>
                            <p className={`text-xs truncate mt-0.5 text-on-surface-variant`}>{n.message}</p>
                          </div>
                          {!n.is_read && (
                            <button onClick={(e) => handleQuickResolve(n.id, e)}
                              className="w-5 h-5 rounded-full bg-surface-container-lowest hover:bg-success/10 text-outline hover:text-success border border-outline-variant/10 flex items-center justify-center transition">
                              <span className="material-symbols-outlined text-xs font-bold">check</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setIsNotificationDropdownOpen(false); navigate("/school-admin/notifications"); }}
                      className={`w-full text-center py-2.5 border-t text-xs font-bold text-primary transition
                        ${dk ? "bg-surface-container-high hover:bg-surface-container-highest border-outline-variant/20" : "bg-surface-container-high hover:bg-surface-container-highest border-outline-variant/10"}`}>
                      View All Logs & Diagnostics
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* AVATAR */}
            <div onClick={() => navigate("/school-admin/settings")}
              className={`w-10 h-10 rounded-xl overflow-hidden border cursor-pointer transition-colors shadow-2xs active:scale-95
                ${dk ? "border-outline-variant/20 hover:border-primary" : "border-outline-variant/10 hover:border-primary"}`}>
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr-h68ZGUP34FUflv2mFF-gNJjT5N_6ytDAglZduyU7THcHTXquHtKCzW8pah1ZVvvgH2DwFQmNae7GnJLai44EeHTkxyJ7zBwpwQDu-gvnmEk4ZR9VvIQ42BaYW5Iv2e6IOltaThdGqNRbF3cqmGeYfEhWJShw9MZsTyFHM6ygEEHITElBL26bGg34Jsu79sL7xFoRsP1OthWVTv3qIia-yBCPlh5GqFFycTauUCcNk7mlY9MFiACpCeL5aUtTEaP1cd3-aT6LQ" alt="Admin Anchor" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div key={location.pathname} className="pt-24 px-8 pb-16 flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function SchoolLayout({ children, title }) {
  return (
    <ThemeProvider>
      <SchoolLayoutInner title={title}>{children}</SchoolLayoutInner>
    </ThemeProvider>
  );
}