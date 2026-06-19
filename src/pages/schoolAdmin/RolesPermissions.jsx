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
function RolesPermissionsSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 max-w-7xl animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Skeleton style={{ width: 200, height: 28 }} />
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
                <th className="px-4 md:px-6 py-4 text-center"><Skeleton style={{ width: 80, height: 12, margin: "0 auto" }} /></th>
                <th className="px-4 md:px-6 py-4 hidden md:table-cell"><Skeleton style={{ width: 80, height: 12 }} /></th>
                <th className="px-4 md:px-6 py-4 text-right"><Skeleton style={{ width: 60, height: 12, marginLeft: "auto" }} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton style={{ width: 36, height: 36, borderRadius: 6 }} />
                      <Skeleton style={{ width: 100, height: 14 }} />
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center"><Skeleton style={{ width: 60, height: 20, borderRadius: 999, margin: "0 auto" }} /></td>
                  <td className="px-4 md:px-6 py-4 hidden md:table-cell"><Skeleton style={{ width: 140, height: 12 }} /></td>
                  <td className="px-4 md:px-6 py-4 text-right"><Skeleton style={{ width: 70, height: 28, borderRadius: 6, marginLeft: "auto" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination skeleton */}
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-outline-variant/10 bg-surface-container-high/30">
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

export default function RolesPermissions() {
  const navigate = useNavigate();

  const [allRoles, setAllRoles] = useState([]);
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
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, pageSize]);
  
 // Fetch roles when search changes
  useEffect(() => {
    fetchAllRoles(debouncedSearch);
  }, [debouncedSearch]);

  const fetchAllRoles = async (search) => {
    setLoading(true);
    setError(null);
    try {
      let page = 1;
      let results = [];
      let hasNext = true;
      while (hasNext) {
        const data = await schoolAdminApi.getRoles(page, search);
        results = [...results, ...(data.results || data || [])];
        hasNext = Boolean(data.next);
        page += 1;
      }
      setAllRoles(results);
    } catch (err) {
      console.error("Fetch Roles Error:", err);
      setError(err.message || "Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const totalRoles = allRoles.length;
  const totalPermissions = allRoles.reduce((sum, r) => sum + (r.permissions?.length || 0), 0);
  const rolesWithDescription = allRoles.filter(r => r.description && r.description.trim().length > 0).length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalRoles / pageSize));
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allRoles.slice(start, start + pageSize);
  }, [allRoles, currentPage, pageSize]);

  const rangeStart = totalRoles === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalRoles);

  // Helper for role icon/color
  const getRoleAesthetics = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin")) return { icon: "admin_panel_settings", bg: "bg-primary/10", text: "text-primary" };
    if (name.includes("teacher")) return { icon: "school", bg: "bg-secondary/10", text: "text-secondary" };
    if (name.includes("finance") || name.includes("account")) return { icon: "account_balance", bg: "bg-success/10", text: "text-success" };
    if (name.includes("lib")) return { icon: "menu_book", bg: "bg-tertiary/10", text: "text-tertiary" };
    if (name.includes("parent")) return { icon: "family_history", bg: "bg-warning/10", text: "text-warning" };
    return { icon: "verified_user", bg: "bg-outline/10", text: "text-outline" };
  };

  // ── Full‑page skeleton while loading ──
  if (loading) {
    return (
      <SchoolLayout>
        <RolesPermissionsSkeleton />
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
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Roles & Permissions</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              Manage access control and permission sets across the institution.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/roles/create")}
            className="sm:w-auto whitespace-nowrap bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Role
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
          <StatCard icon="shield" label="Total Roles" value={totalRoles} accentColor="var(--color-primary)" />
          <StatCard icon="lock" label="Total Permissions" value={totalPermissions} accentColor="var(--color-secondary)" />
          <StatCard icon="description" label="Roles with Description" value={rolesWithDescription} accentColor="var(--color-tertiary)" />
        </div>

        {/* Responsive Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search roles by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary transition outline-none"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0">
            <span className="text-xs font-semibold text-on-surface-variant">
              {totalRoles} {totalRoles === 1 ? "role" : "roles"} found
            </span>
          </div>
        </div>

        {/* Table Container with Controlled Column Breakdown */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-4 md:px-6 py-4">Role Name</th>
                  <th className="px-4 md:px-6 py-4 text-center">Permissions</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell">Description</th>
                  <th className="px-4 md:px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {paginatedRoles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 md:px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">shield</span>
                      <p className="text-sm font-medium">No roles found</p>
                      <p className="text-xs">Try adjusting your search or create a new role.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRoles.map((r, index) => {
                    const aes = getRoleAesthetics(r.name);
                    const permCount = r.permissions?.length || 0;
                    return (
                      <tr
                        key={r.id}
                        className="group cursor-pointer transition-all duration-150 hover:bg-surface-container-high/30 hover:shadow-inner"
                        style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}
                        onClick={() => navigate(`/school-admin/roles/edit/${r.id}`)}
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`w-8 h-8 md:w-9 md:h-9 rounded-md flex items-center justify-center shrink-0 ${aes.bg}`}>
                              <span className={`material-symbols-outlined text-[16px] md:text-[18px] ${aes.text}`}>{aes.icon}</span>
                            </div>
                            <p className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-xs">
                              {r.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase font-extrabold bg-primary/10 text-primary px-2 md:px-2.5 py-1 rounded-full border border-primary/20 whitespace-nowrap">
                            {permCount} <span className="hidden sm:inline">assigned</span>
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                          <p className={`text-xs font-body truncate max-w-xs md:max-w-md ${r.description && r.description.trim().length > 0 ? "text-on-surface-variant" : "text-outline italic"}`}>
                            {r.description?.trim() || "No description provided."}
                          </p>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/school-admin/roles/edit/${r.id}`); }}
                            className="px-2.5 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors whitespace-nowrap"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Responsive Pagination Strip */}
          {totalRoles > 0 && (
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
                <span>Showing {rangeStart}-{rangeEnd} of {totalRoles}</span>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
                >Previous</button>
                <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
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