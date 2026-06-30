import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ isExpanded, isMobile, onToggle, onClose }) {
  const navigate = useNavigate();

  // ── Avatar state ──
  const [avatarUrl, setAvatarUrl] = React.useState(null);

  React.useEffect(() => {
    const fetchPic = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://localhost:8000/api/v1/profiles/me/picture/?profile_type=parent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.has_picture) setAvatarUrl(data.url);
      } catch {
        setAvatarUrl(null);
      }
    };
    fetchPic();
  }, []);

  // Get parent data from localStorage
  const userData = JSON.parse(localStorage.getItem('user_data') || 'null');
  const parentData = userData?.identity;
  const parentFirstName = parentData?.first_name || '';
  const parentLastName = parentData?.last_name || '';

  const formattedFirstName = parentFirstName
    ? parentFirstName[0].toUpperCase() + parentFirstName.slice(1)
    : 'Guardian';
  const formattedLastName = parentLastName
    ? parentLastName[0].toUpperCase() + parentLastName.slice(1)
    : '';

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    navigate("/");
  };

  const navItems = [
    { to: "/parent",                end: true,  icon: "dashboard",      label: "Dashboard"       },
    { to: "/parent/child-overview", end: false, icon: "child_care",     label: "Child Overview"  },
    { to: "/parent/attendance",     end: false, icon: "calendar_today", label: "Attendance"      },
    { to: "/parent/assignments",    end: false, icon: "assignment",     label: "Assignments"     },
    { to: "/parent/grades",         end: false, icon: "assessment",     label: "Grades & Report" },
    { to: "/parent/circulars",      end: false, icon: "campaign",       label: "Circulars"       },
    { to: "/parent/timetable",      end: false, icon: "calendar_month", label: "Timetable"       },
    { to: "/parent/ai-insights",    end: false, icon: "psychology",     label: "AI Insights"     },
  ];

  const navClass = ({ isActive }) =>
    `flex items-center rounded-xl transition-all duration-200 font-semibold text-sm flex-shrink-0
     py-[clamp(0.3rem,1vh,0.625rem)]
     ${isExpanded ? "gap-3 px-3" : "justify-center px-2"}
     ${isActive
      ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm"
      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-300"
    }`;

  return (
    <>
      {isMobile && isExpanded && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        style={{ height: "100dvh" }}
        className={`
          fixed top-0 left-0 z-50
          flex flex-col
          bg-[#eff4ff] dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700/50
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${isMobile
            ? `w-72 ${isExpanded ? "translate-x-0" : "-translate-x-full"}`
            : `${isExpanded ? "w-72" : "w-20"} translate-x-0`
          }
        `}
      >
        <div className="flex flex-col h-full px-3 py-[clamp(0.5rem,1.5vh,0.75rem)] min-h-0">

          {/* ── Logo + toggle ── */}
          <div className={`flex items-center mb-[clamp(0.4rem,1.5vh,1rem)] px-1 flex-shrink-0 ${isExpanded ? "gap-3" : "justify-center"}`}>
            {isMobile ? (
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/60 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                aria-label="Close sidebar"
              >
                <span className="material-symbols-outlined text-blue-800 dark:text-blue-300 text-xl">close</span>
              </button>
            ) : (
              <button
                onClick={onToggle}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/60 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                <span className="material-symbols-outlined text-blue-800 dark:text-blue-300 text-xl">
                  {isExpanded ? "menu_open" : "menu"}
                </span>
              </button>
            )}
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              <h1 className="text-base font-black text-blue-800 dark:text-blue-300 whitespace-nowrap">
                Academic Architect
              </h1>
            </div>
          </div>

          {/* ── Profile card ── */}
          <div className={`flex items-center mb-[clamp(0.4rem,1.5vh,1rem)] rounded-xl bg-white dark:bg-slate-800 shadow-sm flex-shrink-0
                           py-[clamp(0.3rem,1vh,0.75rem)]
                           ${isExpanded ? "gap-3 px-3" : "justify-center p-2"}`}>
            <img
              src={
                avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(`${formattedFirstName} ${formattedLastName}`.trim() || "P")}&background=3b82f6&color=fff`
              }
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              alt="Profile"
            />
            <div className={`overflow-hidden transition-all duration-300 min-w-0 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap">
                {formattedFirstName} {formattedLastName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Guardian ID: #8821</p>
            </div>
          </div>

          {/* ── Nav ── */}
          <nav className="flex flex-col flex-1 justify-between gap-[clamp(0.05rem,0.5vh,0.25rem)] overflow-hidden min-h-0">
            {navItems.map(({ to, end, icon, label }) => (
              <NavLink key={label} to={to} end={end} onClick={onClose} title={!isExpanded ? label : undefined} className={navClass}>
                <span className="material-symbols-outlined flex-shrink-0 text-[20px]">{icon}</span>
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                  {label}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="my-[clamp(0.2rem,0.8vh,0.5rem)] border-t border-slate-200 dark:border-slate-700/60 flex-shrink-0" />

          {/* ── Bottom ── */}
          <div className="flex flex-col gap-[clamp(0.05rem,0.5vh,0.25rem)] flex-shrink-0">
            <NavLink to="/parent/settings" onClick={onClose} title={!isExpanded ? "Settings" : undefined} className={navClass}>
              <span className="material-symbols-outlined flex-shrink-0 text-[20px]">settings</span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                Settings
              </span>
            </NavLink>

            <button
              onClick={handleLogout}
              title={!isExpanded ? "Log Out" : undefined}
              className={`flex items-center rounded-xl transition-all font-semibold text-sm flex-shrink-0
                         py-[clamp(0.3rem,1vh,0.625rem)]
                         text-red-500 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600
                         w-full text-left
                         ${isExpanded ? "gap-3 px-3" : "justify-center px-2"}`}
            >
              <span className="material-symbols-outlined flex-shrink-0 text-[20px]">logout</span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                Log Out
              </span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}