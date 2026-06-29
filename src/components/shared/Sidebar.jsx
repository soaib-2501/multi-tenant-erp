import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentProvider';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const navItems = [
  { icon: 'dashboard',              label: 'Dashboard',            path: '/student'            },
  { icon: 'menu_book',              label: 'My Subjects',          path: '/student/subjects'   },
  { icon: 'assignment',             label: 'Assignments',          path: '/student/assignments'},
  { icon: 'description',            label: 'Grades & Report Card', path: '/student/grades'     },
  { icon: 'event_available',        label: 'Attendance',           path: '/student/attendance' },
  { icon: 'psychology',             label: 'AI Tutor',             path: '/student/ai-tutor'   },
  { icon: 'account_balance_wallet', label: 'Fees',                 path: '/student/fees'       },
  { icon: 'support_agent',          label: 'Help Desk',            path: '/student/help'       },
  { icon: 'gavel',                  label: 'Grievance',            path: '/student/grievance' },
  { icon: 'campaign',               label: 'Circulars',            path: '/student/circulars'    },
];

const bottomItems = [
  { to: '/student/profile',  icon: 'person',   label: 'Profile'  },
  { to: '/student/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
  const { profile: student, enrollment: enroll } = useStudent();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile]     = useState(false);
  const [avatarUrl, setAvatarUrl]   = useState(null);

  const { first_name = '', last_name = '', enrollment_number = '' } = student || {};
  const { class_level_name = '', section_name = '' } = enroll || {};

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${first_name} ${last_name}`.trim() || "S")}&background=3b82f6&color=fff`;

  // ── Fetch signed avatar URL ──────────────────────────────────────────────
  useEffect(() => {
    if (!student?.profile_picture) {
      setAvatarUrl(null);
      return;
    }
    if (student.profile_picture.startsWith("http")) {
      setAvatarUrl(student.profile_picture);
      return;
    }
    const token = localStorage.getItem("access_token");
    fetch(
      `${API_BASE_URL}/api/v1/uploads/view-url/?file_path=${encodeURIComponent(student.profile_picture)}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
      .then((r) => r.json())
      .then((d) => setAvatarUrl(d.url || d.view_url || null))
      .catch(() => setAvatarUrl(null));
  }, [student?.profile_picture]);

  // ── Responsive sidebar ───────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1280;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
        window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { expanded: false } }));
      }
    };
    check();
    if (window.innerWidth >= 1280) {
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { expanded: true } }));
    }
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggle = () => {
    setIsExpanded(prev => {
      const next = !prev;
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { expanded: next } }));
      return next;
    });
  };

  const close = () => {
    if (isMobile) {
      setIsExpanded(false);
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { expanded: false } }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    navigate('/');
  };

  const navClass = ({ isActive }) =>
    `flex items-center rounded-lg transition-all duration-200
     text-sm font-semibold sidebar-nav-item
     ${isExpanded ? 'gap-3 px-2' : 'justify-center px-2'}
     ${isActive
       ? 'text-primary bg-surface-container-lowest shadow-sm'
       : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/60'
     }`;

  return (
    <>
      <style>{`
        .sidebar-nav-item {
          padding-top:    clamp(5px, 1.1vh, 10px);
          padding-bottom: clamp(5px, 1.1vh, 10px);
        }
        .sidebar-profile {
          padding-top:    clamp(8px, 1.2vh, 16px);
          padding-bottom: clamp(8px, 1.2vh, 16px);
        }
        .sidebar-topbar {
          height: clamp(52px, 7vh, 64px);
        }
      `}</style>

      {isMobile && isExpanded && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={close} aria-hidden="true" />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-surface-container-low border-r border-outline-variant/30
          transition-all duration-300 ease-in-out overflow-hidden
          ${isMobile
            ? `w-72 ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`
            : `${isExpanded ? 'w-72' : 'w-16'} translate-x-0`
          }
        `}
      >
        {/* ── TOP BAR ── */}
        <div className="sidebar-topbar flex items-center px-3 flex-shrink-0 border-b border-outline-variant/20">
          <button
            onClick={toggle}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">
              {isExpanded ? 'menu_open' : 'menu'}
            </span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0 ml-0'}`}>
            <span className="text-lg font-headline font-bold text-primary whitespace-nowrap">
              Academic Architect
            </span>
          </div>
        </div>

        {/* ── PROFILE SECTION ── */}
        <div className={`sidebar-profile flex items-center border-b border-outline-variant/20 flex-shrink-0
                         transition-all duration-300
                         ${isExpanded ? 'gap-3 px-4' : 'justify-center px-3'}`}>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary-container flex-shrink-0">
            <img
              src={avatarUrl || fallbackAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = fallbackAvatar; }}
            />
          </div>
          <div className={`overflow-hidden transition-all duration-300 min-w-0 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            <p className="font-bold text-sm text-on-surface whitespace-nowrap">
              {first_name} {last_name}
            </p>
            <p className="text-xs text-on-surface-variant whitespace-nowrap">
              {class_level_name} - {section_name}
            </p>
            <p className="text-[10px] text-primary font-bold whitespace-nowrap">
              ID: {enrollment_number}
            </p>
          </div>
        </div>

        {/* ── NAV ITEMS ── */}
        <nav className="flex-1 flex flex-col justify-between py-2 px-2 min-h-0">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === '/student'}
                onClick={close}
                title={!isExpanded ? item.label : undefined}
                className={navClass}
              >
                <span className="material-symbols-outlined text-xl flex-shrink-0">{item.icon}</span>
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="my-1 border-t border-outline-variant/20" />
            {bottomItems.map(({ to, icon, label }) => (
              <NavLink
                key={label}
                to={to}
                onClick={close}
                title={!isExpanded ? label : undefined}
                className={navClass}
              >
                <span className="material-symbols-outlined text-xl flex-shrink-0">{icon}</span>
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                  {label}
                </span>
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              title={!isExpanded ? 'Log Out' : undefined}
              className={`w-full flex items-center rounded-lg transition-all sidebar-nav-item
                          duration-200 text-sm font-semibold text-error
                          hover:bg-surface-container/60
                          ${isExpanded ? 'gap-3 px-2' : 'justify-center px-2'}`}
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0">logout</span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                Log Out
              </span>
            </button>
          </div>
        </nav>
      </aside>

      {isMobile && !isExpanded && (
        <button
          onClick={toggle}
          aria-label="Open menu"
          className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center
                     rounded-lg bg-primary text-white shadow-lg active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      )}
    </>
  );
}