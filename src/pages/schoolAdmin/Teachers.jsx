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
// Full‑page Skeleton
// ─────────────────────────────────────────────
function TeachersSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Skeleton style={{ width: 200, height: 28 }} />
          <Skeleton style={{ width: 300, height: 16, marginTop: 4 }} />
        </div>
        <Skeleton style={{ width: 140, height: 40, borderRadius: 8 }} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl p-4 border border-outline-variant/10 bg-surface-container-lowest"
            style={{ minHeight: "72px" }}
          >
            <div className="flex items-start justify-between">
              <Skeleton style={{ width: 28, height: 28, borderRadius: 6 }} />
            </div>
            <div>
              <Skeleton style={{ width: 70, height: 10 }} />
              <Skeleton style={{ width: 40, height: 20, marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
        <Skeleton style={{ flex: 1, minWidth: 200, height: 40, borderRadius: 8 }} />
        <Skeleton style={{ width: 120, height: 40, borderRadius: 8 }} />
        <Skeleton style={{ width: 120, height: 20, borderRadius: 4 }} />
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-4"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-6 py-4"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-6 py-4"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-6 py-4 text-center"><Skeleton style={{ width: 60, height: 12, margin: "0 auto" }} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton style={{ width: 36, height: 36, borderRadius: 999 }} />
                      <div>
                        <Skeleton style={{ width: 120, height: 14 }} />
                        <Skeleton style={{ width: 80, height: 10, marginTop: 4 }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Skeleton style={{ width: 80, height: 12 }} /></td>
                  <td className="px-6 py-4"><Skeleton style={{ width: 100, height: 12 }} /></td>
                  <td className="px-6 py-4 text-center"><Skeleton style={{ width: 60, height: 20, borderRadius: 999, margin: "0 auto" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination skeleton */}
        <div className="p-4 flex flex-wrap gap-4 justify-between items-center border-t border-outline-variant/10 bg-surface-container-high/30">
          <div className="flex items-center gap-2">
            <Skeleton style={{ width: 80, height: 16 }} />
            <Skeleton style={{ width: 60, height: 28, borderRadius: 4 }} />
            <Skeleton style={{ width: 100, height: 16 }} />
          </div>
          <div className="flex items-center gap-3">
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
function StatCard({ icon, label, value, accentColor }) {
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
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 25];

export default function Teachers() {
  const navigate = useNavigate();

  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, ARCHIVED

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  // Fetch teachers
  useEffect(() => {
    fetchAllTeachers(debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  const fetchAllTeachers = async (search, status) => {
    setLoading(true);
    setError(null);
    try {
      let page = 1;
      let results = [];
      let hasNext = true;
      while (hasNext) {
        const data = await schoolAdminApi.getTeachers(page, search, status);
        results = [...results, ...(data.results || data || [])];
        hasNext = Boolean(data.next);
        page += 1;
      }
      setAllTeachers(results);
    } catch (err) {
      console.error("Fetch Teachers Error:", err);
      setError(err.message || "Failed to fetch teacher directory.");
    } finally {
      setLoading(false);
    }
  };

  // Stats (always reflect the full directory, unaffected by the status filter)
  const totalTeachers = allTeachers.length;
  const activeTeachers = allTeachers.filter(t => !t.is_archived).length;
  const archivedTeachers = totalTeachers - activeTeachers;

  // Apply the status filter client-side (the list endpoint doesn't support it)
  const filteredTeachers = useMemo(() => {
    if (statusFilter === "ACTIVE") return allTeachers.filter(t => !t.is_archived);
    if (statusFilter === "ARCHIVED") return allTeachers.filter(t => t.is_archived);
    return allTeachers;
  }, [allTeachers, statusFilter]);

  const filteredCount = filteredTeachers.length;

  // Pagination (based on the filtered set)
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTeachers.slice(start, start + pageSize);
  }, [filteredTeachers, currentPage, pageSize]);

  const rangeStart = filteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredCount);

  // Helper for initials
  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "TC";
  };

  // ── Full‑page skeleton while loading ──
  if (loading) {
    return (
      <SchoolLayout>
        <TeachersSkeleton />
      </SchoolLayout>
    );
  }

  // ── Main render ──
  return (
    <SchoolLayout>
      <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Faculty Directory</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              Manage and oversee all teaching staff across departments.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/teachers/create")}
            className="sm:auto whitespace-nowrap bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Teacher
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-error/10 text-error rounded-xl border border-error/20 text-sm font-body">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon="school" label="Total Teachers" value={totalTeachers} accentColor="var(--color-primary)" />
          <StatCard icon="check_circle" label="Active" value={activeTeachers} accentColor="var(--color-secondary)" />
          <StatCard icon="archive" label="Archived" value={archivedTeachers} accentColor="var(--color-outline)" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary transition outline-none"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            style={{ color: "var(--color-on-surface)" }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="ARCHIVED">Archived Only</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-semibold text-on-surface-variant">
              {totalTeachers} {totalTeachers === 1 ? "teacher" : "teachers"} found
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm text-[12px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="lg:px-6 px-3 py-4">Faculty Profile</th>
                  <th className="lg:px-6 px-3 py-4">Employee ID</th>
                  <th className="lg:px-6 px-3 py-4">Qualification</th>
                  <th className="lg:px-6 px-3 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {paginatedTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">person_off</span>
                      <p className="text-sm font-medium">No teachers found</p>
                      <p className="text-xs">Try adjusting your filters or add a new teacher.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedTeachers.map((t, index) => {
                    const fName = t.first_name || t.user?.first_name || "";
                    const lName = t.last_name || t.user?.last_name || "";
                    const emailAddr = t.email || t.user?.email || "No Email";
                    const empId = t.employee_id || t.employee_number || "N/A";
                    const qualification = t.qualification || "N/A";
                    return (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/school-admin/teachers/${t.id}`)}
                        className="group cursor-pointer transition-all duration-150 hover:bg-surface-container-high/30 hover:shadow-inner"
                        style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs border border-outline-variant/20">
                              {getInitials(fName, lName, emailAddr)}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                                {fName || lName ? `${fName} ${lName}` : emailAddr}
                              </p>
                              <p className="text-2xs text-outline font-mono mt-0.5">{emailAddr}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-on-surface-variant">
                          {empId}
                        </td>
                        <td className="px-6 py-4 text-xs text-on-surface-variant">
                          {qualification}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {!t.is_archived ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-extrabold bg-success/20 text-success dark:bg-success/30 px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-extrabold bg-outline-variant/20 text-outline px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                              Archived
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalTeachers > 0 && (
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-outline-variant/10 bg-surface-container-high/30">
              
              {/* Left Side: Row Selection & Status Display */}
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
                <span>Showing {rangeStart}-{rangeEnd} of {totalTeachers}</span>
              </div>

              {/* Right Side: Page Navigation Buttons */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors whitespace-nowrap"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors whitespace-nowrap"
                >
                  Next
                </button>
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