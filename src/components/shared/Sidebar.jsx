import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentProvider';

const navItems = [
  { icon: 'dashboard',       label: 'Dashboard',           path: '/student'            },
  { icon: 'menu_book',       label: 'My Subjects',          path: '/student/subjects'   },
  { icon: 'description',     label: 'Grades & Report Card', path: '/student/grades'     },
  { icon: 'event_available', label: 'Attendance',           path: '/student/attendance' },
  { icon: 'psychology',      label: 'AI Tutor',             path: '/student/ai-tutor'   },
  { icon: 'account_balance_wallet', label: 'Fees',          path: '/student/fees'       },
  { icon: 'support_agent',   label: 'Help Desk',            path: '/student/help'       },
];

export default function Sidebar() {
  const { profile: student, enrollment: enroll } = useStudent();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile]     = useState(false);

  const { first_name = '', last_name = '', enrollment_number = '' } = student || {};
  const { class_level_name = '', section_name = '' } = enroll || {};

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
        window.dispatchEvent(
          new CustomEvent('sidebar-toggle', { detail: { expanded: false } })
        );
      }
    };

    check();

    if (window.innerWidth >= 768) {
      window.dispatchEvent(
        new CustomEvent('sidebar-toggle', { detail: { expanded: true } })
      );
    }

    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggle = () => {
    setIsExpanded(prev => {
      const next = !prev;
      window.dispatchEvent(
        new CustomEvent('sidebar-toggle', { detail: { expanded: next } })
      );
      return next;
    });
  };

  const close = () => {
    if (isMobile) {
      setIsExpanded(false);
      window.dispatchEvent(
        new CustomEvent('sidebar-toggle', { detail: { expanded: false } })
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    navigate('/');
  };

  return (
    <>
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={close}
          aria-hidden="true"
        />
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
        {/* ── TOP BAR: hamburger + logo ── */}
        <div className="flex items-center h-16 px-3 flex-shrink-0 border-b border-outline-variant/20">
          <button
            onClick={toggle}
            className="w-10 h-10 flex items-center justify-center rounded-lg
                       hover:bg-surface-container transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">
              {isExpanded ? 'menu_open' : 'menu'}
            </span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0 ml-0'
          }`}>
            <span className="text-lg font-headline font-bold text-primary whitespace-nowrap">
              Academic Architect
            </span>
          </div>
        </div>

        {/* ── PROFILE SECTION ── */}
        <div className={`flex items-center border-b border-outline-variant/20 flex-shrink-0
                         transition-all duration-300
                         ${isExpanded ? 'gap-3 px-4 py-4' : 'justify-center px-3 py-4'}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary-container flex-shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4LdDXGxUTIj7HONBN-CW82BGC6EFYuHPaHMAz6iW8UEXuuCT3zciyD0shypraeKaWTvVsV441roXBXes6KJauvXAIOdDGtrEtm-cEwnnIAkoYgpP1Yw--PtNzgrsuo5VK1mtG2j9neJr3yMZN7wz4XZGUGptnG1_dzKJZtFlD5ACkwx6xGhU3i5P1pkg1JQ7sxojTwzbsLIVQ_1rdxqVCQmpbt9WBfGB5Gej7XxjuUbCWSutuKvzc-AX7Ovp3gp-NRpGpaMCAvg"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`overflow-hidden transition-all duration-300 min-w-0 ${
            isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
          }`}>
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
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/student'}
              onClick={close}
              title={!isExpanded ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center py-2.5 px-2 rounded-lg transition-all duration-200
                 text-sm font-semibold
                 ${isExpanded ? 'gap-4' : 'justify-center'}
                 ${isActive
                   ? 'text-primary bg-surface-container-lowest shadow-sm'
                   : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/60'
                 }`
              }
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0">
                {item.icon}
              </span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}>
                {item.label}
              </span>
            </NavLink>
          ))}

          <div className="my-2 border-t border-outline-variant/20" />

          {[
            { to: '/student/profile',  icon: 'person',   label: 'Profile'  },
            { to: '/student/settings', icon: 'settings', label: 'Settings' },
          ].map(({ to, icon, label }) => (
            <NavLink
              key={label}
              to={to}
              onClick={close}
              title={!isExpanded ? label : undefined}
              className={({ isActive }) =>
                `flex items-center py-2.5 px-2 rounded-lg transition-all duration-200
                 text-sm font-semibold
                 ${isExpanded ? 'gap-4' : 'justify-center'}
                 ${isActive
                   ? 'text-primary bg-surface-container-lowest shadow-sm'
                   : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/60'
                 }`
              }
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0">{icon}</span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}>
                {label}
              </span>
            </NavLink>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={!isExpanded ? 'Log Out' : undefined}
            className={`w-full flex items-center py-2.5 px-2 rounded-lg transition-all
                        duration-200 text-sm font-semibold text-error
                        hover:bg-surface-container/60
                        ${isExpanded ? 'gap-4' : 'justify-center'}`}
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">logout</span>
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
            }`}>
              Log Out
            </span>
          </button>
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