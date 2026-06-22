import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStaleData } from "../../../hooks/useStaleData";
import { getMyProfile } from "../../../services/api";
import { navItems, secondaryNavItems } from "./navigation";
import { useTheme } from "../../../context/ThemeContext";

const handleLogout = (navigate) => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  navigate('/');
};


const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { data: profile } = useStaleData("profile:me", getMyProfile);

  const identity = profile?.identity;
  const teacherProfile = profile?.profiles?.teacher;
  const fullName = [teacherProfile?.first_name || identity?.first_name, teacherProfile?.last_name || identity?.last_name]
    .filter(Boolean)
    .join(" ") || "Loading...";
  const subtitle = teacherProfile?.qualification || profile?.roles?.[0] || "Current User";

  const handleNavClick = (e) => {
    // Close sidebar when clicking navigation on mobile
    if (onClose) {
      // Small delay to allow navigation to start
      setTimeout(() => onClose(), 100);
    }
  };

  return (
    <aside className={`flex h-full w-64 flex-col p-4 gap-1.5 border-r overflow-hidden shadow-xl transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' 
        : 'bg-slate-50 border-slate-100'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-3 px-3 py-3 group cursor-pointer rounded-xl transition-all duration-300 shadow-transparent flex-shrink-0 flex-1 ${
          darkMode 
            ? 'hover:bg-slate-700/50 hover:shadow-slate-900/50' 
            : 'hover:bg-white hover:shadow-slate-200/50'
        }`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500 ${
            darkMode ? 'bg-blue-600 text-white' : 'bg-primary-container text-white'
          }`}>
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div>
            <h3 className={`font-body text-xs font-extrabold tracking-tight transition-colors ${
              darkMode 
                ? 'text-white group-hover:text-blue-300' 
                : 'text-slate-800 group-hover:text-primary'
            }`}>{fullName}</h3>
            <p className="text-2xs font-medium text-slate-400">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={handleNavClick}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'text-slate-300 hover:bg-slate-700 hover:text-white' 
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav className="flex flex-col gap-0.5 overflow-hidden pr-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 group ${
                darkMode
                  ? isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 translate-x-1'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-sm hover:translate-x-1'
                  : isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1'
                    : 'text-slate-500 hover:text-primary hover:bg-white hover:shadow-sm hover:translate-x-1'
              }`}
              to={item.path}
              onClick={handleNavClick}
            >
              <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              <span className="font-body text-sm font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
        <div className={`mt-4 pt-3 flex flex-col gap-0.5 border-t flex-shrink-0 ${
          darkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <p className={`px-3 text-3xs font-bold uppercase tracking-[0.2em] mb-1 ${
            darkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>Account</p>
          {secondaryNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                  darkMode
                    ? isActive
                      ? 'bg-slate-700 text-blue-300 shadow-sm translate-x-1 duration-200'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : isActive
                      ? 'bg-white text-blue-700 shadow-sm translate-x-1 duration-200'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                }`}
                to={item.path}
                onClick={handleNavClick}
              >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                <span className="font-body text-xs font-semibold tracking-wide">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => handleLogout(navigate)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all w-full text-left ${
              darkMode
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                : 'text-red-500 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="font-body text-xs font-semibold tracking-wide">Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
