import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

export default function TeacherAssignment() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchAssignments(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const fetchAssignments = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);

    try {
      const data = await schoolAdminApi.getTeacherAssignments(page, search);
      
      if (data.results) {
        setAssignments(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10)); 
      } else {
        setAssignments(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch Assignments Error:", err);
      setError(err.message || "Failed to fetch teacher assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      try {
        await schoolAdminApi.deleteTeacherAssignment(id);
        setAssignments(assignments.filter((item) => item.id !== id));
        setTotalCount(prevCount => prevCount - 1);
      } catch (err) {
        alert("Failed to delete assignment.");
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "TR";
    const parts = name.split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = ["bg-[#e9ddff] text-[#6b38d4]", "bg-[#d8e2ff] text-[#0058be]", "bg-[#ffdcc6] text-[#924700]", "bg-[#eff4ff] text-[#2170e4]"];
    return colors[index % colors.length];
  };

  return (
    <SchoolLayout title="Teacher Assignment">
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-8">

        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Resource Allocation</h1>
            <p className="text-sm text-[#6b7280] mt-1 max-w-2xl">
              Manage teaching staff roles across departments, subjects, and specific class sections.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/teacher-assignment/create")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-semibold rounded shadow-sm hover:shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Assign Teacher
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 bg-white p-5 rounded-lg border-l-4 border-[#0058be] shadow-sm">
            <p className="text-[10px] font-bold text-[#0058be] uppercase tracking-wider">Allocation Overview</p>
            <div className="flex items-end gap-3 mt-2">
              <h3 className="text-3xl font-bold text-slate-800">{totalCount}</h3>
              <p className="text-xs text-[#6b7280] pb-1">Active Assignments</p>
            </div>
            <div className="h-1.5 bg-[#eff4ff] rounded-full mt-3">
              <div className="bg-[#0058be] h-full w-[84%] rounded-full"></div>
            </div>
          </div>
          <div className="bg-[#eff4ff] p-5 rounded-lg shadow-sm border border-blue-50">
            <span className="material-symbols-outlined text-[#0058be] text-[24px] mb-2">class</span>
            <h3 className="text-xl font-bold text-slate-800">{new Set(assignments.map(a => a.class_level_name)).size}</h3>
            <p className="text-xs text-[#6b7280]">Classes Covered</p>
          </div>
          <div className="bg-[#fff4ed] p-5 rounded-lg shadow-sm border border-orange-50">
            <span className="material-symbols-outlined text-[#924700] text-[24px] mb-2">menu_book</span>
            <h3 className="text-xl font-bold text-[#924700]">{new Set(assignments.map(a => a.subject_name)).size}</h3>
            <p className="text-xs text-[#924700]/80">Subjects Taught</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 flex gap-3 items-center border-b border-gray-100 bg-[#f8f9ff]">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-[18px]">search</span>
              <input
                placeholder="Search assignment records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded outline-none border border-gray-200 focus:border-[#0058be]/30 shadow-sm transition-all text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-[11px] uppercase text-[#6b7280] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Teacher Name</th>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Class / Section</th>
                  <th className="px-5 py-3 font-semibold">Academic Year</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[#0058be]">progress_activity</span>
                        Loading assignment matrix...
                      </div>
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      {searchQuery ? "No assignments match your search." : "No teachers assigned to classes yet."}
                    </td>
                  </tr>
                ) : (
                  assignments.map((a, i) => (
                    <tr key={a.id} className="hover:bg-[#fcfdff] transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm ${getColorClass(i)}`}>
                            {getInitials(a.teacher_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{a.teacher_name || "Unknown Teacher"}</p>
                            <p className="text-[10px] text-[#6b7280] font-mono mt-0.5">EMP: {a.teacher_employee_id || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e9ddff] text-[#6b38d4] border border-[#d6beff]">
                          {a.subject_name || "Unknown Subject"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 text-sm">{a.class_level_name || "Unknown Class"}</p>
                        <p className="text-[11px] text-[#6b7280] mt-0.5">Section: {a.section_name || "N/A"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#475569] font-medium">
                        {a.academic_year_name || "Current Year"}
                      </td>
                      <td className="px-5 py-4">
                        {a.is_class_teacher ? (
                          <span className="text-[11px] font-bold flex items-center gap-1 text-[#0058be] bg-blue-50 px-2 py-0.5 rounded-full w-max border border-blue-100">
                            <span className="material-symbols-outlined text-[12px]">star</span> Class Teacher
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">person</span> Subject Teacher
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => navigate(`/school-admin/teacher-assignment/edit/${a.id}`)} className="p-1.5 hover:bg-blue-50 text-[#0058be] rounded transition-colors">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-[#6b7280] font-medium">Showing page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 rounded text-gray-500 transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                <span className="w-8 h-8 flex items-center justify-center bg-[#0058be] text-white rounded text-sm font-bold shadow-sm">{currentPage}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 rounded text-gray-500 transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}