import { useNavigate, useLocation } from "react-router-dom";

export default function SchoolSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const menu = [
    { name: "Dashboard",             icon: "dashboard",       path: "/school-admin" },
    { name: "Academic Years",        icon: "calendar_today",  path: "/school-admin/academic-years" },
    { name: "Roles & Permissions",   icon: "security",        path: "/school-admin/roles" },
    { name: "Students",              icon: "school",          path: "/school-admin/students" },
    { name: "Teachers",              icon: "person_4",        path: "/school-admin/teachers" },
    { name: "Parents",               icon: "group",           path: "/school-admin/parents" },
    { name: "Parent-Student Mapping",icon: "diversity_1",     path: "/school-admin/mapping" },
    { name: "Teacher Assignment",    icon: "assignment_ind",  path: "/school-admin/teacher-assignment" },
    { name: "Grievance",             icon: "gavel",           path: "/school-admin/grievances" }, // ← ADDED
    { name: "Leave Management", icon: "event_busy", path: "/school-admin/leave-management" },
    { name: "Settings",              icon: "settings",        path: "/school-admin/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    navigate("/");
  };

  return (
    <aside className="h-screen w-56 fixed left-0 top-0 flex flex-col"
      style={{
        background: "linear-gradient(180deg, var(--color-surface-container-lowest) 0%, var(--color-surface-container-low) 100%)",
        borderRight: "1px solid color-mix(in srgb, var(--color-outline-variant) 15%, transparent)",
      }}>

      {/* ── Brand ── */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
          style={{ background: "var(--color-primary)" }}>
          <span className="material-symbols-outlined text-white text-sm font-bold">auto_stories</span>
        </div>
        <span className="text-sm font-headline font-black tracking-tight"
          style={{ color: "var(--color-primary)" }}>
          Academic Architect
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mb-2 h-px" style={{ background: "color-mix(in srgb, var(--color-outline-variant) 20%, transparent)" }} />

      {/* ── Nav ── */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {menu.map((item) => {
          const active = currentPath === item.path || currentPath.startsWith(item.path + "/");
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 group"
              style={active ? {
                background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                color: "var(--color-primary)",
              } : {
                color: "var(--color-on-surface-variant)",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "color-mix(in srgb, var(--color-primary) 6%, transparent)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = ""; }}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0" style={active ? { color: "var(--color-primary)" } : {}}>
                {item.icon}
              </span>
              <span className="text-xs font-semibold truncate">{item.name}</span>
              {active && (
                <span className="ml-auto w-1 h-4 rounded-full shrink-0" style={{ background: "var(--color-primary)" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="px-2 pb-3 pt-2" style={{ borderTop: "1px solid color-mix(in srgb, var(--color-outline-variant) 15%, transparent)" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-left"
          style={{ color: "var(--color-error)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "color-mix(in srgb, var(--color-error) 8%, transparent)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = ""; }}
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="text-xs font-semibold">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
