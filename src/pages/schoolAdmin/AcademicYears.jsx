import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

// ─────────────────────────────────────────────
// Skeleton Loader (same as Dashboard)
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
function AcademicYearsSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Skeleton style={{ width: 180, height: 28 }} />
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
        <Skeleton style={{ width: 80, height: 20, borderRadius: 4 }} />
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-4"><Skeleton style={{ width: 60, height: 12 }} /></th>
                <th className="px-6 py-4"><Skeleton style={{ width: 70, height: 12 }} /></th>
                <th className="px-6 py-4"><Skeleton style={{ width: 70, height: 12 }} /></th>
                <th className="px-6 py-4 text-center"><Skeleton style={{ width: 50, height: 12, margin: "0 auto" }} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton style={{ width: 140, height: 14 }} /></td>
                  <td className="px-6 py-4"><Skeleton style={{ width: 90, height: 12 }} /></td>
                  <td className="px-6 py-4"><Skeleton style={{ width: 90, height: 12 }} /></td>
                  <td className="px-6 py-4 text-center"><Skeleton style={{ width: 60, height: 20, borderRadius: 999, margin: "0 auto" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination skeleton – optional if you have pagination, but here we don't */}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat Card (reused)
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
export default function AcademicYears() {
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, archived

  // Fetch data
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await api.get(`academics/academic-years/`);
        setYears(response.data.results || response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchYears();
  }, []);

  // Filtered years
  const filteredYears = useMemo(() => {
    return years.filter(y => {
      const matchesSearch = y.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true :
          statusFilter === "active" ? y.is_active :
            statusFilter === "archived" ? !y.is_active : true;
      return matchesSearch && matchesStatus;
    });
  }, [years, searchTerm, statusFilter]);

  // Stats
  const total = years.length;
  const active = years.filter(y => y.is_active).length;
  const archived = total - active;

  // ── Full‑page skeleton while loading ──
  if (loading) {
    return (
      <SchoolLayout>
        <AcademicYearsSkeleton />
      </SchoolLayout>
    );
  }

  // ── Main render ──
  return (
    <SchoolLayout>
      <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Academic Years</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              Manage institutional academic year periods and their status.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/academic-years/create")}
            className="sm:w-auto bg-primary whitespace-nowrap text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Year
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon="event_note" label="Total Years" value={total} accentColor="var(--color-primary)" />
          <StatCard icon="check_circle" label="Active" value={active} accentColor="var(--color-secondary)" />
          <StatCard icon="archive" label="Archived" value={archived} accentColor="var(--color-outline)" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary transition outline-none"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              style={{ color: "var(--color-on-surface)" }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <span className="text-xs font-semibold text-on-surface-variant">
              {filteredYears.length} {filteredYears.length === 1 ? "record" : "records"}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">End Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredYears.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">event_note</span>
                      <p className="text-sm font-medium">No academic years found</p>
                      <p className="text-xs">Try adjusting your filters or create a new year.</p>
                    </td>
                  </tr>
                ) : (
                  filteredYears.map((y, index) => (
                    <tr
                      key={y.id}
                      onClick={() => navigate(`/school-admin/academic-years/edit/${y.id}`)}
                      className="group cursor-pointer transition-all duration-150 hover:bg-surface-container-high/30 hover:shadow-inner"
                      style={{ animation: `fadeInUp 0.3s ease ${index * 0.05}s both` }}
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {y.name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-on-surface-variant">{y.start_date}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-on-surface-variant">{y.end_date}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {y.is_active ? (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
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