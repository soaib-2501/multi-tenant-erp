import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from "../../context/ThemeContext";

const PAGE_SIZE_OPTIONS = [10, 25];

export default function TeacherAssignment() {
  const navigate = useNavigate();

  const [allAssignments, setAllAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, pageSize]);

  useEffect(() => {
    fetchAllAssignments(debouncedSearch);
  }, [debouncedSearch]);

  const fetchAllAssignments = async (search) => {
    setLoading(true); setError(null);
    try {
      let page = 1;
      let results = [];
      let hasNext = true;
      while (hasNext) {
        const data = await schoolAdminApi.getTeacherAssignments(page, search);
        results = [...results, ...(data.results || data || [])];
        hasNext = Boolean(data.next);
        page += 1;
      }
      setAllAssignments(results);
    } catch (err) {
      console.error("Fetch Assignments Error:", err);
      setError(err.message || "Failed to fetch teacher assignments.");
    } finally {
      setLoading(false);
    }
  };

  const totalCount = allAssignments.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const assignments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allAssignments.slice(start, start + pageSize);
  }, [allAssignments, currentPage, pageSize]);

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalCount);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      try {
        await schoolAdminApi.deleteTeacherAssignment(id);
        setAllAssignments(prev => prev.filter((item) => item.id !== id));
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
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl pb-8">

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
            <h3 className="text-xl font-headline font-bold text-on-surface">{new Set(allAssignments.map(a => a.class_level_name)).size}</h3>
            <p className="text-xs text-on-surface-variant font-body">Classes Covered</p>
          </div>
          <div className="bg-tertiary/10 p-5 rounded-lg shadow-sm border border-tertiary/20">
            <span className="material-symbols-outlined text-tertiary text-[24px] mb-2">menu_book</span>
            <h3 className="text-xl font-headline font-bold text-on-surface">{new Set(allAssignments.map(a => a.subject_name)).size}</h3>
            <p className="text-xs text-on-surface-variant font-body">Subjects Taught</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden border border-outline-variant/10">

          {/* FILTER BAR */}
          <div className="p-4 flex flex-wrap gap-3 justify-between bg-surface-container-high/50 border-b border-outline-variant/10 items-center">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input
                  placeholder="Search assignment records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-md outline-none border border-outline-variant/20 focus:border-primary transition-colors text-sm font-body text-on-surface placeholder:text-outline"
                />
              </div>
            </div>
            <div className="text-xs font-bold text-outline uppercase tracking-wider font-body">
              {totalCount} Records Found
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50 text-xs uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/10">
                <tr>
                  <th className="px-5 py-4 font-headline font-bold">Teacher Name</th>
                  <th className="px-5 py-4 font-headline font-bold">Subject</th>
                  <th className="px-5 py-4 font-headline font-bold">Class / Section</th>
                  <th className="px-5 py-4 font-headline font-bold">Academic Year</th>
                  <th className="px-5 py-4 font-headline font-bold">Role</th>
                  <th className="px-5 py-4 text-right font-headline font-bold"></th>
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
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border border-outline-variant/20 ${getColorClass(i)}`}>
                            {getInitials(a.teacher_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface font-body">{a.teacher_name || "Unknown Teacher"}</p>
                            <p className="text-2xs text-outline font-mono mt-0.5">EMP: {a.teacher_employee_id || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-secondary/10 text-secondary border border-secondary/20 font-body">
                          {a.subject_name || "Unknown Subject"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-on-surface text-sm font-body">{a.class_level_name || "Unknown Class"}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-body">Section: {a.section_name || "N/A"}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-on-surface-variant font-medium font-body">
                        {a.academic_year_name || "Current Year"}
                      </td>
                      <td className="px-5 py-4">
                        {a.is_class_teacher ? (
                          <span className="text-[10px] font-bold flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full w-max border border-primary/20 font-body">
                            <span className="material-symbols-outlined text-[12px]">star</span> Class Teacher
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-on-surface-variant flex items-center gap-1 font-body">
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

          {/* PAGINATION BAR */}
          {!loading && totalCount > 0 && (
            <div className="p-4 flex flex-wrap gap-4 justify-between items-center border-t border-outline-variant/10 bg-surface-container-high/30">
              <div className="flex items-center gap-2 text-xs font-body text-on-surface-variant">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-surface-container-low border border-outline-variant/20 text-xs rounded-md px-2 py-1.5 outline-none focus:border-primary text-on-surface font-body"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="ml-2">
                  Showing {rangeStart}-{rangeEnd} of {totalCount}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors font-body"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-on-surface-variant font-body">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors font-body"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}