import React from 'react';
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";


const TopAppBar = ({ title, isSidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  return (
    <header className={`backdrop-blur-xl flex justify-between items-center w-full px-4 md:px-6 py-4 sticky top-0 z-40 shadow-lg transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700'
        : 'bg-white/80 border-b border-slate-100/60'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className={`flex md:flex rounded-full p-2.5 transition-all duration-200 outline-none items-center justify-center active:scale-95 ${
            darkMode
              ? 'hover:bg-slate-700 text-slate-300 hover:text-white'
              : 'hover:bg-slate-50 text-slate-500 hover:text-blue-600'
          }`}
          title="Toggle Menu"
        >
          <span className="material-symbols-outlined text-xl font-bold">
            {isSidebarOpen ? "menu_open" : "menu"}
          </span>
        </button>
        <h1 className={`text-base md:text-lg font-extrabold tracking-tight font-display truncate max-w-[200px] md:max-w-none ${
          darkMode ? 'text-white' : 'text-blue-700'
        }`}>{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className={`p-2 rounded-full transition-colors ${
          darkMode 
            ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
            : 'text-slate-500 hover:bg-blue-50'
        }`}>
          <span className="material-symbols-outlined text-xl">search</span>
        </button>
       <button
onClick={() => navigate("/teacher/notifications")}
className={`relative p-2 rounded-lg transition ${
  darkMode
    ? 'hover:bg-slate-700 text-slate-300 hover:text-white'
    : 'hover:bg-slate-100'
}`}
>

<span className="material-symbols-outlined text-xl">
notifications
</span>

</button>
      </div>
    </header>
  );
};

export default TopAppBar;
