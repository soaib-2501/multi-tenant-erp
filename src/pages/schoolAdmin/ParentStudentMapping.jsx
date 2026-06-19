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
// Full‑page Skeleton for Mapping
// ─────────────────────────────────────────────
function MappingSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 max-w-7xl animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Skeleton style={{ width: 220, height: 28 }} />
          <Skeleton style={{ width: 320, height: 16, marginTop: 4 }} />
        </div>
        <Skeleton style={{ width: 140, height: 40, borderRadius: 8 }} className="w-full sm:w-auto" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
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
                <th className="px-4 md:px-6 py-4"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-4 md:px-6 py-4"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-4 md:px-6 py-4 hidden sm:table-cell"><Skeleton style={{ width: 70, height: 12 }} /></th>
                <th className="px-4 md:px-6 py-4 hidden md:table-cell text-center"><Skeleton style={{ width: 50, height: 12, margin: "0 auto" }} /></th>
                <th className="px-4 md:px-6 py-4 text-center"><Skeleton style={{ width: 70, height: 12, margin: "0 auto" }} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton style={{ width: 36, height: 36, borderRadius: 999 }} />
                      <Skeleton style={{ width: 100, height: 14 }} />
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton style={{ width: 24, height: 24, borderRadius: 999 }} />
                      <Skeleton style={{ width: 80, height: 14 }} />
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden sm:table-cell"><Skeleton style={{ width: 60, height: 20, borderRadius: 999 }} /></td>
                  <td className="px-4 md:px-6 py-4 hidden md:table-cell text-center"><div className="flex justify-center gap-2"><Skeleton style={{ width: 20, height: 20 }} /><Skeleton style={{ width: 20, height: 20 }} /></div></td>
                  <td className="px-4 md:px-6 py-4 text-center"><Skeleton style={{ width: 80, height: 20, borderRadius: 999, margin: "0 auto" }} /></td>
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

export default function ParentStudentMapping() {
  const navigate = useNavigate();

  const [allMappings, setAllMappings] = useState([]);
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

  // Fetch mappings (only search, no status filter)
  useEffect(() => {
    fetchAllMappings(debouncedSearch);
  }, [debouncedSearch]);

  const fetchAllMappings = async (search) => {
    setLoading(true);
    setError(null);
    try {
      let page = 1;
      let results = [];
      let hasNext = true;
      while (hasNext) {
        const data = await schoolAdminApi.getParentStudentMappings(page, search);
        results = [...results, ...(data.results || data || [])];
        hasNext = Boolean(data.next);
        page += 1;
      }
      setAllMappings(results);
    } catch (err) {
      console.error("Fetch Mappings Error:", err);
      setError(err.message || "Failed to fetch relationship mappings.");
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalMappings = allMappings.length;
  const verifiedMappings = allMappings.filter(m => m.is_verified !== false).length;
  const primaryContacts = allMappings.filter(m => m.is_primary_contact).length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalMappings / pageSize));
  const paginatedMappings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allMappings.slice(start, start + pageSize);
  }, [allMappings, currentPage, pageSize]);

  const rangeStart = totalMappings === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalMappings);

  // Helpers
  const getInitials = (name) => {
    if (!name) return "PR";
    const parts = name.split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = ["bg-primary/20 text-primary", "bg-tertiary/20 text-tertiary", "bg-secondary/20 text-secondary"];
    return colors[index % colors.length];
  };

  // ── Full‑page skeleton while loading ──
  if (loading) {
    return (
      <SchoolLayout>
        <MappingSkeleton />
      </SchoolLayout>
    );
  }

  // ── Main render ──
  return (
    <SchoolLayout>
      <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 max-w-7xl">

        {/* Responsive Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface whitespace-nowrap">Relationship Management</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              Configure and manage connections between students and their guardians.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/mapping/create")}
            className="sm:w-auto whitespace-nowrap bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Mapping
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-error/10 text-error rounded-xl border border-error/20 text-sm font-body">
            {error}
          </div>
        )}

        {/* Responsive Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon="family_history" label="Total Mappings" value={totalMappings} accentColor="var(--color-primary)" />
          <StatCard icon="verified" label="Verified" value={verifiedMappings} accentColor="var(--color-success)" />
          <StatCard icon="star" label="Primary Contacts" value={primaryContacts} accentColor="var(--color-secondary)" />
        </div>

        {/* Responsive Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by parent, student, or relationship..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary transition outline-none"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0">
            <span className="text-xs font-semibold text-on-surface-variant">
              {totalMappings} {totalMappings === 1 ? "mapping" : "mappings"} found
            </span>
          </div>
        </div>

        {/* Table Container with Controlled Breakdowns */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-4 md:px-6 py-4">Guardian Info</th>
                  <th className="px-4 md:px-6 py-4">Student Info</th>
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Relationship</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell text-center">Permissions</th>
                  <th className="px-4 md:px-6 py-4 text-center sm:text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {paginatedMappings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 md:px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">family_history</span>
                      <p className="text-sm font-medium">No mappings found</p>
                      <p className="text-xs">Try adjusting your search or create a new mapping.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedMappings.map((m, index) => {
                    const isVerified = m.is_verified !== false;
                    const parentName = m.parent_name || "Unknown Parent";
                    const studentName = m.student_name || "Unknown Student";
                    const relationship = m.relationship || "Guardian";
                    const isPrimary = m.is_primary_contact || false;
                    const canViewAcademics = m.can_view_academics || false;
                    const canPayFees = m.can_pay_fees || false;

                    return (
                      <tr
                        key={m.id}
                        onClick={() => navigate(`/school-admin/mapping/${m.id}`)}
                        className="group cursor-pointer transition-all duration-150 hover:bg-surface-container-high/30 hover:shadow-inner"
                        style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-xs border border-outline-variant/20 shrink-0 ${getColorClass(index)}`}>
                              {getInitials(parentName)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-xs">
                                {parentName}
                              </p>
                              {isPrimary && (
                                <span className="inline-block text-[9px] md:text-2xs uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-0.5">
                                  Primary
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/20 shrink-0">
                              <span className="material-symbols-outlined text-outline text-[14px] md:text-[16px]">school</span>
                            </div>
                            <p className="font-semibold text-on-surface truncate max-w-[120px] sm:max-w-xs">
                              {studentName}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 whitespace-nowrap">
                            {relationship}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                          <div className="flex justify-center gap-3">
                            <span title="Academics Access" className={`material-symbols-outlined text-[18px] ${canViewAcademics ? 'text-success' : 'text-outline/40'}`}>menu_book</span>
                            <span title="Fee Payment Access" className={`material-symbols-outlined text-[18px] ${canPayFees ? 'text-primary' : 'text-outline/40'}`}>payments</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-center sm:text-left">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase font-extrabold bg-success/20 text-success px-2.5 py-1 rounded-full whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                              <span className="hidden sm:inline">Verified Sync</span>
                              <span className="sm:hidden">OK</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase font-extrabold bg-warning/20 text-warning px-2.5 py-1 rounded-full whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                              Pending
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

          {/* Responsive Pagination Strip */}
          {totalMappings > 0 && (
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
                <span>Showing {rangeStart}-{rangeEnd} of {totalMappings}</span>
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