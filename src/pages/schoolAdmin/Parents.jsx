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
// Full‑page Skeleton for Parents
// ─────────────────────────────────────────────
function ParentsSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 max-w-7xl">
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
                <th className="px-6 py-4"><Skeleton style={{ width: 70, height: 12 }} /></th>
                <th className="px-6 py-4"><Skeleton style={{ width: 70, height: 12 }} /></th>
                <th className="px-6 py-4"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-6 py-4"><Skeleton style={{ width: 60, height: 12 }} /></th>
                <th className="px-6 py-4 text-right"><Skeleton style={{ width: 24, height: 24, borderRadius: 999, marginLeft: "auto" }} /></th>
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
                  <td className="px-6 py-4"><Skeleton style={{ width: 90, height: 12 }} /></td>
                  <td className="px-6 py-4"><Skeleton style={{ width: 60, height: 20, borderRadius: 999 }} /></td>
                  <td className="px-6 py-4 text-right"><Skeleton style={{ width: 24, height: 24, borderRadius: 999, marginLeft: "auto" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

export default function Parents() {
  const navigate = useNavigate();

  const [allParents, setAllParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  // Fetch parents (status filter applied on frontend)
  useEffect(() => {
    fetchAllParents(debouncedSearch);
  }, [debouncedSearch]);

  const fetchAllParents = async (search) => {
    setLoading(true);
    setError(null);
    try {
      let page = 1;
      let results = [];
      let hasNext = true;
      while (hasNext) {
        const data = await schoolAdminApi.getParents(page, search);
        results = [...results, ...(data.results || data || [])];
        hasNext = Boolean(data.next);
        page += 1;
      }
      setAllParents(results);
    } catch (err) {
      console.error("Fetch Parents Error:", err);
      setError(err.message || "Failed to fetch parent directory.");
    } finally {
      setLoading(false);
    }
  };

  // ── Filters ──
  const filteredParents = useMemo(() => {
    return allParents.filter(p => {
      // Search filter
      const searchStr = debouncedSearch.toLowerCase();
      const nameMatch = (p.first_name || "").toLowerCase().includes(searchStr) ||
        (p.last_name || "").toLowerCase().includes(searchStr) ||
        (p.email || "").toLowerCase().includes(searchStr) ||
        (p.phone_number || "").includes(searchStr);
      if (!nameMatch) return false;

      // Status filter
      if (statusFilter === "ACTIVE") return p.is_archived === false;
      if (statusFilter === "ARCHIVED") return p.is_archived === true;
      return true; // ALL
    });
  }, [allParents, debouncedSearch, statusFilter]);

  // Stats
  const totalParents = allParents.length;
  const activeParents = allParents.filter(p => !p.is_archived).length;
  const archivedParents = totalParents - activeParents;

  // Pagination
  const totalFiltered = filteredParents.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedParents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredParents.slice(start, start + pageSize);
  }, [filteredParents, currentPage, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalFiltered);

  // Helpers
  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "PR";
  };

  const getColorClass = (index) => {
    const colors = ["bg-secondary/20 text-secondary", "bg-primary/20 text-primary", "bg-tertiary/20 text-tertiary", "bg-surface-container-high text-on-surface-variant"];
    return colors[index % colors.length];
  };

  // ── Skeleton ──
  if (loading) {
    return (
      <SchoolLayout>
        <ParentsSkeleton />
      </SchoolLayout>
    );
  }

  // ── Render ──
  return (
    <SchoolLayout>
      <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Guardian Directory</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              Manage emergency contacts and parental access for students.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/parents/create")}
            className="sm:w-auto whitespace-nowrap bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Parent
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
          <StatCard icon="family_history" label="Total Parents" value={totalParents} accentColor="var(--color-primary)" />
          <StatCard icon="check_circle" label="Active" value={activeParents} accentColor="var(--color-secondary)" />
          <StatCard icon="archive" label="Archived" value={archivedParents} accentColor="var(--color-outline)" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
              {totalFiltered} {totalFiltered === 1 ? "parent" : "parents"} found
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-4 md:px-6 py-4">Parent Details</th>
                  <th className="px-4 md:px-6 py-4">Contact Info</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell">Occupation</th>
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Emergency Contact</th>
                  <th className="px-4 md:px-6 py-4 text-center">Status</th>
                  <th className="px-4 md:px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {paginatedParents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 md:px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">family_history</span>
                      <p className="text-sm font-medium">No parents found</p>
                      <p className="text-xs">Try adjusting your filters or add a new parent.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedParents.map((p, index) => {
                    const fName = p.first_name || "";
                    const lName = p.last_name || "";
                    const emailAddr = p.email || "No email provided";
                    const phone = p.phone_number || "N/A";
                    const occupation = p.occupation || "Unspecified";
                    const emergency = p.emergency_contact_number;
                    const isArchived = p.is_archived || false;

                    return (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/school-admin/parents/${p.id}`)}
                        className="group cursor-pointer transition-all duration-150 hover:bg-surface-container-high/30 hover:shadow-inner"
                        style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {p.profile_picture ? (
                              <img src={p.profile_picture} alt="Profile" className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-outline-variant/20 shrink-0" />
                            ) : (
                              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-xs border border-outline-variant/20 shrink-0 ${getColorClass(index)}`}>
                                {getInitials(fName, lName, emailAddr)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-xs">
                                {fName || lName ? `${fName} ${lName}` : "Pending Name"}
                              </p>
                              <p className="text-[10px] md:text-2xs text-outline font-mono mt-0.5 truncate max-w-[120px] sm:max-w-none">{emailAddr}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 font-mono text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                          {phone}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs text-on-surface-variant hidden md:table-cell truncate max-w-[150px]">
                          {occupation}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell whitespace-nowrap">
                          {emergency ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-error/10 text-error rounded-full text-[10px] font-bold border border-error/20">
                              <span className="material-symbols-outlined text-[13px]">emergency</span>
                              {emergency}
                            </span>
                          ) : (
                            <span className="text-xs text-outline italic">Not setup</span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                          {!isArchived ? (
                            <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase font-extrabold bg-success/20 text-success dark:bg-success/30 px-2 md:px-2.5 py-1 rounded-full whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase font-extrabold bg-outline-variant/20 text-outline px-2 md:px-2.5 py-1 rounded-full whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                              Archived
                            </span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-base md:text-xl">chevron_right</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Responsive Footer Controls */}
          {totalFiltered > 0 && (
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
                <span>Showing {rangeStart}-{rangeEnd} of {totalFiltered}</span>
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