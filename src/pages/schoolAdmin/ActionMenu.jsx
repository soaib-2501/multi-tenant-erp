import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ActionMenu({ studentId }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-[#0058be] hover:bg-[#e5eeff] p-2 rounded-full transition-colors"
      >
        <span className="material-symbols-outlined text-xl">more_vert</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
          <button 
            onClick={() => { setIsOpen(false); navigate(`/school-admin/students/${studentId}`); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
          >
            View Details
          </button>
          <button 
            onClick={() => { setIsOpen(false); navigate(`/school-admin/students/edit/${studentId}`); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}