import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  const getNavLinkClass = ({ isActive }) => {
    const baseClass = "flex flex-col items-center ";
    return baseClass + (isActive ? "text-blue-700" : "text-slate-400");
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 flex items-center justify-around px-4 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] border-t border-slate-100 dark:border-slate-800">
      <NavLink to="/" end className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
            <span className="text-2xs font-medium mt-1">Home</span>
          </>
        )}
      </NavLink>
      <NavLink to="/child-overview" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>child_care</span>
            <span className="text-2xs font-medium mt-1">Child</span>
          </>
        )}
      </NavLink>
      <NavLink to="/assignments" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>assignment</span>
            <span className="text-2xs font-medium mt-1">Tasks</span>
          </>
        )}
      </NavLink>
      <NavLink to="/settings" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
            <span className="text-2xs font-medium mt-1">Profile</span>
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default BottomNav;
