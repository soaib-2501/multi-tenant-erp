import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from "../../context/ThemeContext";

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
    const colors = [
      "bg-secondary/20 text-secondary",
      "bg-primary/20 text-primary",
      "bg-tertiary/20 text-tertiary",
      "bg-surface-container-high text-on-surface-variant"
    ];
    return colors[index % colors.length];
  };

  return (
    <SchoolLayout title="Teacher Assignment">
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto pb-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface">Resource Allocation</h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-2xl font-body">
              Manage teaching staff roles across departments, subjects, and specific class sections.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/teacher-assignment/create")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-all font-body"
          >
            <span className="material-symbols-outlined text-lg">add</span> Assign Teacher
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-md text-sm border border-error/20 font-body">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-2 bg-surface-container-lowest p-5 rounded-lg border-l-4 border-primary shadow-sm">
            <p className="text-2xs font-headline font-bold text-primary uppercase tracking-wider">Allocation Overview</p>
            <div className="flex items-end gap-3 mt-2">
              <h3 className="text-3xl font-headline font-bold text-on-surface">{totalCount}</h3>
              <p className="text-xs text-on-surface-variant pb-1 font-body">Active Assignments</p>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full mt-3">
              <div className="bg-primary h-full w-[84%] rounded-full"></div>
            </div>
          </div>
          <div className="bg-surface-container-high/50 p-5 rounded-lg shadow-sm border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-[24px] mb-2">class</span>
            <h3 className="text-xl font-headline font-bold text-on-surface">{new Set(assignments.map(a => a.class_level_name)).size}</h3>
            <p className="text-xs text-on-surface-variant font-body">Classes Covered</p>
          </div>
          <div className="bg-tertiary/10 p-5 rounded-lg shadow-sm border border-tertiary/20">
            <span className="material-symbols-outlined text-tertiary text-[24px] mb-2">menu_book</span>
            <h3 className="text-xl font-headline font-bold text-on-surface">{new Set(assignments.map(a => a.subject_name)).size}</h3>
            <p className="text-xs text-on-surface-variant font-body">Subjects Taught</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden border border-outline-variant/10">
          <div className="p-4 flex gap-3 items-center border-b border-outline-variant/10 bg-surface-container-high/50">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input
                placeholder="Search assignment records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-md outline-none border border-outline-variant/20 focus:border-primary/30 shadow-sm transition-all text-sm font-body text-on-surface placeholder:text-outline"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50 text-xs uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/10">
                <tr>
                  <th className="px-5 py-3 font-headline font-bold">Teacher Name</th>
                  <th className="px-5 py-3 font-headline font-bold">Subject</th>
                  <th className="px-5 py-3 font-headline font-bold">Class / Section</th>
                  <th className="px-5 py-3 font-headline font-bold">Academic Year</th>
                  <th className="px-5 py-3 font-headline font-bold">Role</th>
                  <th className="px-5 py-3 text-right font-headline font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-on-surface-variant font-body">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                        Loading assignment matrix...
                      </div>
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-on-surface-variant font-body">
                      {searchQuery ? "No assignments match your search." : "No teachers assigned to classes yet."}
                    </td>
                  </tr>
                ) : (
                  assignments.map((a, i) => (
                    <tr key={a.id} className="hover:bg-surface-container-high/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-2xs shadow-sm ${getColorClass(i)}`}>
                            {getInitials(a.teacher_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface font-body">{a.teacher_name || "Unknown Teacher"}</p>
                            <p className="text-2xs text-outline font-mono mt-0.5">EMP: {a.teacher_employee_id || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 font-body">
                          {a.subject_name || "Unknown Subject"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-on-surface text-sm font-body">{a.class_level_name || "Unknown Class"}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5 font-body">Section: {a.section_name || "N/A"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-on-surface-variant font-medium font-body">
                        {a.academic_year_name || "Current Year"}
                      </td>
                      <td className="px-5 py-4">
                        {a.is_class_teacher ? (
                          <span className="text-xs font-bold flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full w-max border border-primary/20 font-body">
                            <span className="material-symbols-outlined text-[12px]">star</span> Class Teacher
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1 font-body">
                            <span className="material-symbols-outlined text-[12px]">person</span> Subject Teacher
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => navigate(`/school-admin/teacher-assignment/edit/${a.id}`)} 
                            className="p-1.5 hover:bg-primary/10 text-primary rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(a.id)} 
                            className="p-1.5 hover:bg-error/10 text-error rounded transition-colors"
                          >
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
            <div className="flex justify-between items-center p-4 border-t border-outline-variant/10 bg-surface-container-low/50">
              <p className="text-xs text-on-surface-variant font-medium font-body">Showing page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="w-8 h-8 flex items-center justify-center border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-high rounded text-outline transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <span className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded text-sm font-bold shadow-sm">{currentPage}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages} 
                  className="w-8 h-8 flex items-center justify-center border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-high rounded text-outline transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}