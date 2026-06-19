import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

// ─────────────────────────────────────────────
// Skeleton Loader (reused)
// ─────────────────────────────────────────────
function Skeleton({ className = "", style = {} }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background: "linear-gradient(90deg, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 25%, color-mix(in srgb, var(--color-outline-variant) 28%, var(--color-surface-container-lowest)) 50%, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease infinite",
        ...style,
      }}
    />
  );
}

// ─────────────────────────────────────────────
// Full‑page Skeleton for TeacherAssignment
// ─────────────────────────────────────────────
function TeacherAssignmentSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Skeleton style={{ width: 200, height: 28 }} />
          <Skeleton style={{ width: 340, height: 16, marginTop: 4 }} />
        </div>
        <Skeleton style={{ width: 140, height: 40, borderRadius: 8 }} className="w-full sm:w-auto" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl p-4 border border-outline-variant/10 bg-surface-container-lowest" style={{ minHeight: "72px" }}>
            <div className="flex items-start justify-between">
              <Skeleton style={{ width: 28, height: 28, borderRadius: 6 }} />
            </div>
            <div className="mt-2">
              <Skeleton style={{ width: 70, height: 10 }} />
              <Skeleton style={{ width: 40, height: 20, marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
        <Skeleton style={{ flex: 1, height: 40, borderRadius: 8 }} />
        <Skeleton style={{ width: 100, height: 20, borderRadius: 4 }} className="self-end sm:self-auto" />
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
              <tr>
                <th className="px-4 md:px-5 py-4"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-4 md:px-5 py-4 hidden sm:table-cell"><Skeleton style={{ width: 60, height: 12 }} /></th>
                <th className="px-4 md:px-5 py-4 hidden md:table-cell"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-4 md:px-5 py-4 hidden lg:table-cell"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-4 md:px-5 py-4"><Skeleton style={{ width: 60, height: 12 }} /></th>
                <th className="px-4 md:px-5 py-4 text-right"><Skeleton style={{ width: 60, height: 12, marginLeft: "auto" }} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 md:px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton style={{ width: 36, height: 36, borderRadius: 999 }} />
                      <div>
                        <Skeleton style={{ width: 100, height: 14 }} />
                        <Skeleton style={{ width: 60, height: 10, marginTop: 4 }} className="sm:hidden" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-5 py-4 hidden sm:table-cell"><Skeleton style={{ width: 60, height: 20, borderRadius: 999 }} /></td>
                  <td className="px-4 md:px-5 py-4 hidden md:table-cell">
                    <Skeleton style={{ width: 80, height: 14 }} />
                    <Skeleton style={{ width: 60, height: 10, marginTop: 4 }} />
                  </td>
                  <td className="px-4 md:px-5 py-4 hidden lg:table-cell"><Skeleton style={{ width: 70, height: 12 }} /></td>
                  <td className="px-4 md:px-5 py-4"><Skeleton style={{ width: 70, height: 12 }} /></td>
                  <td className="px-4 md:px-5 py-4 text-right"><Skeleton style={{ width: 60, height: 24, marginLeft: "auto" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination skeleton */}
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-outline-variant/10 bg-surface-container-high/30">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <Skeleton style={{ width: 80, height: 16 }} />
            <Skeleton style={{ width: 60, height: 28, borderRadius: 4 }} />
            <Skeleton style={{ width: 100, height: 16 }} />
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <Skeleton style={{ width: 70, height: 28, borderRadius: 4 }} />
            <Skeleton style={{ width: 80, height: 16 }} />
            <Skeleton style={{ width: 70, height: 28, borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat Card (unchanged)
// ─────────────────────────────────────────────
function StatCard({ icon, label, value, accentColor, subtitle }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 flex flex-col justify-between transition-all duration-200"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid color-mix(in srgb, var(--color-outline-variant) 12%, transparent)",
        borderLeft: `3px solid ${accentColor}`,
        minHeight: "72px",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px color-mix(in srgb, ${accentColor} 12%, transparent)`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: accentColor }} />
      <div className="flex items-start justify-between">
        <div className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}>
          <span className="material-symbols-outlined" style={{ color: accentColor, fontSize: "16px" }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
          style={{ color: "var(--color-on-surface-variant)" }}>{label}</p>
        <p className="text-xl font-headline font-black leading-none"
          style={{ color: "var(--color-on-surface)" }}>{value}</p>
        {subtitle && <p className="text-[9px] font-medium text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, pageSize]);

  // Fetch assignments
  useEffect(() => {
    fetchAllAssignments(debouncedSearch);
  }, [debouncedSearch]);

  const fetchAllAssignments = async (search) => {
    setLoading(true);
    setError(null);
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

  // Stats
  const totalCount = allAssignments.length;
  const uniqueClasses = new Set(allAssignments.map(a => a.class_level_name)).size;
  const uniqueSubjects = new Set(allAssignments.map(a => a.subject_name)).size;
  const activeAssignments = allAssignments.filter(a => a.is_active !== false).length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const assignments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allAssignments.slice(start, start + pageSize);
  }, [allAssignments, currentPage, pageSize]);

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalCount);

  // Delete handler
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

  // Helpers
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

  // ── Full‑page skeleton while loading ──
  if (loading) {
    return (
      <SchoolLayout>
        <TeacherAssignmentSkeleton />
      </SchoolLayout>
    );
  }

  // ── Main render ──
  return (
    <SchoolLayout>
      <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12">

        {/* Responsive Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Resource Allocation</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              Manage teaching staff roles across departments, subjects, and specific class sections.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/teacher-assignment/create")}
            className="sm:w-auto whitespace-nowrap bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Assign Teacher
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-error/10 text-error rounded-xl border border-error/20 text-sm font-body">
            {error}
          </div>
        )}

        {/* Responsive Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="assignment" label="Active Assignments" value={activeAssignments} accentColor="var(--color-primary)" />
          <StatCard icon="class" label="Classes Covered" value={uniqueClasses} accentColor="var(--color-secondary)" />
          <StatCard icon="menu_book" label="Subjects Taught" value={uniqueSubjects} accentColor="var(--color-tertiary)" />
          <StatCard icon="people" label="Total Assignments" value={totalCount} accentColor="var(--color-outline)" />
        </div>

        {/* Responsive Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by teacher, subject, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary transition outline-none"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0">
            <span className="text-xs font-semibold text-on-surface-variant">
              {totalCount} {totalCount === 1 ? "record" : "records"} found
            </span>
          </div>
        </div>

        {/* Table Container with Controlled Column Breakdown */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-4 md:px-5 py-4">Teacher Name</th>
                  <th className="px-4 md:px-5 py-4 hidden sm:table-cell">Subject</th>
                  <th className="px-4 md:px-5 py-4 hidden md:table-cell">Class / Section</th>
                  <th className="px-4 md:px-5 py-4 hidden lg:table-cell">Academic Year</th>
                  <th className="px-4 md:px-5 py-4">Role</th>
                  <th className="px-4 md:px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 md:px-5 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">assignment_ind</span>
                      <p className="text-sm font-medium">No assignments found</p>
                      <p className="text-xs">{searchQuery ? "Try adjusting your search." : "Create a new teacher assignment."}</p>
                    </td>
                  </tr>
                ) : (
                  assignments.map((a, index) => (
                    <tr
                      key={a.id}
                      className="group cursor-pointer transition-all duration-150 hover:bg-surface-container-high/30 hover:shadow-inner"
                      style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}
                      onClick={() => navigate(`/school-admin/teacher-assignment/edit/${a.id}`)}
                    >
                      <td className="px-4 md:px-5 py-3 md:py-4">
                        <div className="flex items-center gap-3">
                          <div className={`hidden w-8 h-8 md:w-9 md:h-9 rounded-full lg:flex items-center justify-center font-bold text-xs border border-outline-variant/20 shrink-0 ${getColorClass(index)}`}>
                            {getInitials(a.teacher_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-xs">
                              {a.teacher_name || "Unknown Teacher"}
                            </p>
                            <p className="text-[10px] md:text-2xs text-outline font-mono mt-0.5 truncate">
                              EMP: {a.teacher_employee_id || "N/A"}
                            </p>
                            {/* Inline parameters exposed exclusively on mobile viewports */}
                            <div className="sm:hidden mt-1 flex flex-col gap-0.5 text-[10px] text-on-surface-variant">
                              <span className="font-semibold text-secondary">{a.subject_name}</span>
                              <span>{a.class_level_name} (Sec: {a.section_name || "N/A"})</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 py-3 md:py-4 hidden sm:table-cell">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-secondary/10 text-secondary border border-secondary/20 whitespace-nowrap">
                          {a.subject_name || "Unknown Subject"}
                        </span>
                      </td>
                      <td className="px-4 md:px-5 py-3 md:py-4 hidden md:table-cell">
                        <p className="font-semibold text-on-surface text-sm">{a.class_level_name || "Unknown Class"}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">Section: {a.section_name || "N/A"}</p>
                      </td>
                      <td className="px-4 md:px-5 py-3 md:py-4 hidden lg:table-cell text-xs text-on-surface-variant font-medium whitespace-nowrap">
                        {a.academic_year_name || "Current Year"}
                      </td>
                      <td className="px-4 md:px-5 py-3 md:py-4">
                        {a.is_class_teacher ? (
                          <span className="inline-flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 whitespace-nowrap">
                            <span className="material-symbols-outlined text-[12px]">star</span>
                            <span className="hidden sm:inline">Class Teacher</span>
                            <span className="sm:hidden">Class</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] md:text-[10px] font-medium text-on-surface-variant whitespace-nowrap">
                            <span className="material-symbols-outlined text-[12px]">person</span>
                            <span className="hidden sm:inline">Subject Teacher</span>
                            <span className="sm:hidden">Subject Teacher</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-5 py-3 md:py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/school-admin/teacher-assignment/edit/${a.id}`);
                            }}
                            className="p-1.5 hover:bg-primary/10 text-primary rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(a.id);
                            }}
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

          {/* Responsive Pagination Strip */}
          {totalCount > 0 && (
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-outline-variant/10 bg-surface-container-high/30">
              <div className="flex items-center justify-between w-full sm:w-auto gap-2 text-xs font-body text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span>Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="bg-surface-container-low border border-outline-variant/20 text-xs rounded-md px-1.5 py-1 outline-none focus:border-primary text-on-surface"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <span>Showing {rangeStart}-{rangeEnd} of {totalCount}</span>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors whitespace-nowrap"
                >Previous</button>
                <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors whitespace-nowrap"
                >Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Animation keyframes */}
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </SchoolLayout>
  );
}