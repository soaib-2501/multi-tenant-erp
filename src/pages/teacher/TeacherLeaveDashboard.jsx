import React, { useState, useEffect, useMemo, useCallback } from "react";
import MainLayout from "../../components/erp/teacher/MainLayout";
import { teacherLeaveApi } from "../../services/teacherLeaveApi";


// ─── Constants ───────────────────────────────────────────────────────────────
const LEAVE_TYPES = ["Sick", "Casual", "Emergency", "Other"];
const PAGE_SIZE_OPTIONS = [10, 25];

const STATUS_META = {
  Pending:   { dot: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50",   ring: "ring-amber-200",   icon: "hourglass_empty" },
  Approved:  { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", icon: "check_circle"    },
  Rejected:  { dot: "bg-rose-500",    text: "text-rose-700",    bg: "bg-rose-50",    ring: "ring-rose-200",    icon: "cancel"          },
  Cancelled: { dot: "bg-slate-400",   text: "text-slate-600",   bg: "bg-slate-100",  ring: "ring-slate-200",   icon: "block"           },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
};

const fmt = (d) => {
  if (!d) return "—";
  return new Date(d + (d.includes("T") ? "" : "T00:00:00")).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const fmtRange = (s, e) => (s === e ? fmt(s) : `${fmt(s)} – ${fmt(e)}`);

const initials = (name = "") =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ style = {}, className = "" }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background:
          "linear-gradient(90deg, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 25%, color-mix(in srgb, var(--color-outline-variant) 28%, var(--color-surface-container-lowest)) 50%, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease infinite",
        ...style,
      }}
    />
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div><Skeleton style={{ width: 220, height: 28 }} /><Skeleton style={{ width: 280, height: 16, marginTop: 6 }} /></div>
        <Skeleton style={{ width: 130, height: 38, borderRadius: 8 }} />
      </div>
      <div className="flex gap-2 border-b border-outline-variant/10 pb-1">
        <Skeleton style={{ width: 100, height: 32, borderRadius: 8 }} />
        <Skeleton style={{ width: 120, height: 32, borderRadius: 8 }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} style={{ height: 84, borderRadius: 12 }} />)}
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-outline-variant/10 last:border-0">
            <Skeleton style={{ width: 36, height: 36, borderRadius: 999 }} />
            <div className="flex-1"><Skeleton style={{ width: "40%", height: 12 }} /><Skeleton style={{ width: "25%", height: 10, marginTop: 6 }} /></div>
            <Skeleton style={{ width: 70, height: 20, borderRadius: 999 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reusable UI ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accentColor }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 flex flex-col justify-between"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid color-mix(in srgb, var(--color-outline-variant) 12%, transparent)",
        borderLeft: `3px solid ${accentColor}`,
        minHeight: "84px",
      }}
    >
      <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full opacity-[0.04] pointer-events-none" style={{ background: accentColor }} />
      <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}>
        <span className="material-symbols-outlined" style={{ color: accentColor, fontSize: "16px" }}>{icon}</span>
      </div>
      <div className="mt-2">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-on-surface-variant)" }}>{label}</p>
        <p className="text-xl font-headline font-black leading-none" style={{ color: "var(--color-on-surface)" }}>{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.Pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full leading-none ring-1 ${m.bg} ${m.text} ${m.ring}`}>
      <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>{m.icon}</span>
      {status}
    </span>
  );
}

function Avatar({ name }) {
  return (
    <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs border border-outline-variant/20 shrink-0">
      {initials(name)}
    </div>
  );
}

// Bottom-sheet on mobile, centered modal on desktop
function Sheet({ children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-surface-container-lowest w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto p-5 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function SheetHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between mb-4 gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-headline font-bold text-on-surface">{title}</h2>
        {subtitle && <p className="text-sm text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high shrink-0">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-4">
      <div className={`px-4 py-2.5 rounded-lg text-sm font-semibold shadow-lg ${toast.type === "success" ? "bg-success text-white" : "bg-error text-white"}`}>
        {toast.message}
      </div>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);
  const showToast = useCallback((message, type = "success") => setToast({ message, type }), []);
  return { toast, showToast };
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, total, rangeStart, rangeEnd, pageSize, onPageChange, onPageSizeChange }) {
  if (total === 0) return null;
  return (
    <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-outline-variant/10 bg-surface-container-high/30">
      <div className="flex items-center justify-between w-full sm:w-auto gap-2 text-xs font-body text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span>Rows:</span>
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-surface-container-low border border-outline-variant/20 text-xs rounded-md px-1.5 py-1 outline-none focus:border-primary text-on-surface">
            {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <span>Showing {rangeStart}–{rangeEnd} of {total}</span>
      </div>
      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        <button onClick={() => onPageChange((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
          className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors whitespace-nowrap">
          Previous
        </button>
        <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Page {currentPage} of {totalPages}</span>
        <button onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          className="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors whitespace-nowrap">
          Next
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — My Leaves
// ─────────────────────────────────────────────────────────────────────────────
function MyLeavesTab({ showToast }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, pageSize]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await teacherLeaveApi.getMyLeaveRequests();
      setLeaves(toList(data));
    } catch (e) {
      setError(e.message || "Failed to load your leave requests.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    total:     leaves.length,
    pending:   leaves.filter((l) => l.status === "Pending").length,
    approved:  leaves.filter((l) => l.status === "Approved").length,
    rejected:  leaves.filter((l) => l.status === "Rejected").length,
  }), [leaves]);

  const filtered = useMemo(() => {
    return leaves.filter((l) => {
      if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!(l.leave_type || "").toLowerCase().includes(q) && !(l.reason || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [leaves, statusFilter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage, pageSize]);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  const handleCancel = async (leave) => {
    if (!window.confirm("Cancel this leave request?")) return;
    setCancelling(leave.id);
    try {
      const updated = await teacherLeaveApi.cancelMyLeaveRequest(leave.id);
      setLeaves((prev) => prev.map((l) => (l.id === leave.id ? updated : l)));
      showToast("Leave request cancelled.");
      setSelected(null);
    } catch (e) {
      showToast(e.message || "Could not cancel the request.", "error");
    } finally { setCancelling(null); }
  };

  const handleApplied = (newLeave) => {
    setLeaves((prev) => [newLeave, ...prev]);
    showToast("Leave request submitted successfully.");
    setShowApplyForm(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">My Leave Requests</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">Track and manage your leave applications.</p>
          </div>
          <button
            onClick={() => setShowApplyForm(true)}
            className="whitespace-nowrap bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Apply for Leave
          </button>
        </div>

        {error && (
          <div className="p-3 bg-error/10 text-error rounded-xl border border-error/20 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={load} className="font-bold underline underline-offset-2">Retry</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="list_alt"      label="Total"    value={stats.total}    accentColor="var(--color-primary)"  />
          <StatCard icon="hourglass_empty" label="Pending" value={stats.pending}  accentColor="var(--color-tertiary)" />
          <StatCard icon="check_circle"  label="Approved" value={stats.approved} accentColor="var(--color-secondary)"/>
          <StatCard icon="cancel"        label="Rejected" value={stats.rejected} accentColor="var(--color-error)"    />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 min-w-[180px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by type or reason..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary transition outline-none"
              style={{ color: "var(--color-on-surface)" }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary outline-none"
            style={{ color: "var(--color-on-surface)" }}>
            <option value="ALL">All statuses</option>
            {Object.keys(STATUS_META).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-auto text-xs font-semibold text-on-surface-variant">{filtered.length} request{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table (desktop) */}
        <div className="hidden md:block bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm text-[12px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Days</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Applied On</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-6 py-4"><Skeleton style={{ height: 16 }} /></td></tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">event_busy</span>
                      <p className="text-sm font-medium">No requests found</p>
                      <p className="text-xs">{statusFilter !== "ALL" ? "Try a different status filter." : "Apply for your first leave using the button above."}</p>
                    </td>
                  </tr>
                ) : paginated.map((l, idx) => (
                  <tr key={l.id} onClick={() => setSelected(l)}
                    className="group cursor-pointer transition-all duration-150 hover:bg-surface-container-high/30"
                    style={{ animation: `fadeInUp 0.25s ease ${idx * 0.04}s both` }}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">{l.leave_type}</p>
                      <p className="text-xs text-on-surface-variant truncate max-w-[200px]">{l.reason}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">{fmtRange(l.start_date, l.end_date)}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{l.total_days}</td>
                    <td className="px-6 py-4 text-center"><StatusPill status={l.status} /></td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant whitespace-nowrap">{fmt(l.applied_at)}</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {l.status === "Pending" ? (
                        <button
                          disabled={cancelling === l.id}
                          onClick={() => handleCancel(l)}
                          className="text-xs text-error border border-error/30 px-2.5 py-1 rounded-md hover:bg-error/10 transition disabled:opacity-50"
                        >
                          {cancelling === l.id ? "Cancelling…" : "Cancel"}
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant">{l.reviewed_by_name ? `By ${l.reviewed_by_name}` : "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} total={filtered.length}
            rangeStart={rangeStart} rangeEnd={rangeEnd} pageSize={pageSize}
            onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden flex flex-col gap-3">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} style={{ height: 110, borderRadius: 12 }} />)
          ) : paginated.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 px-6 py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">event_busy</span>
              <p className="text-sm font-medium">No requests found</p>
            </div>
          ) : paginated.map((l) => (
            <div key={l.id} onClick={() => setSelected(l)}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-4 active:scale-[0.99] transition-transform">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-on-surface">{l.leave_type} Leave</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{fmtRange(l.start_date, l.end_date)} · {l.total_days}d</p>
                </div>
                <StatusPill status={l.status} />
              </div>
              <p className="mt-2 text-xs text-on-surface-variant line-clamp-2">{l.reason}</p>
              {l.status === "Pending" && (
                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    disabled={cancelling === l.id}
                    onClick={() => handleCancel(l)}
                    className="text-xs text-error border border-error/30 px-3 py-1.5 rounded-md hover:bg-error/10 transition"
                  >
                    {cancelling === l.id ? "Cancelling…" : "Cancel request"}
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* Mobile pagination */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40">
                Previous
              </button>
              <span className="text-xs text-on-surface-variant whitespace-nowrap">Page {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40">
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Sheet */}
      {selected && (
        <Sheet onClose={() => setSelected(null)}>
          <SheetHeader
            title={`${selected.leave_type} Leave`}
            subtitle={`${fmtRange(selected.start_date, selected.end_date)} · ${selected.total_days} day${selected.total_days > 1 ? "s" : ""}`}
            onClose={() => setSelected(null)}
          />
          <div className="mb-4"><StatusPill status={selected.status} /></div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-wide font-bold text-on-surface-variant mb-1">Reason</dt>
              <dd className="text-on-surface">{selected.reason}</dd>
            </div>
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
              Applied on {fmt(selected.applied_at)}
            </div>
            {/* {selected.attachment && (
              <a href={selected.attachment} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px]">attach_file</span> View attachment
              </a>
            )} */}
            {selected.status !== "Pending" && (
              <div className="bg-surface-container-high/40 border border-outline-variant/10 rounded-lg px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wide font-bold text-on-surface-variant mb-1">Review details</p>
                {selected.review_remarks && <p className="text-on-surface">{selected.review_remarks}</p>}
                <p className="text-xs text-on-surface-variant mt-1.5">
                  {selected.reviewed_by_name || "—"} · {fmt(selected.reviewed_at)}
                </p>
              </div>
            )}
          </dl>
          {selected.status === "Pending" && (
            <button
              disabled={cancelling === selected.id}
              onClick={() => handleCancel(selected)}
              className="mt-6 w-full border border-error/30 text-error rounded-lg py-2.5 text-sm font-bold hover:bg-error/10 transition disabled:opacity-50"
            >
              {cancelling === selected.id ? "Cancelling…" : "Cancel this request"}
            </button>
          )}
        </Sheet>
      )}

      {/* Apply for Leave Form */}
      {showApplyForm && (
        <ApplyLeaveForm onClose={() => setShowApplyForm(false)} onSuccess={handleApplied} />
      )}
    </>
  );
}

// ─── Apply Leave Form (sheet) ─────────────────────────────────────────────────
function ApplyLeaveForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ leave_type: "Casual", start_date: "", end_date: "", reason: "", attachment: null });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.start_date) e.start_date = "Start date is required.";
    if (!form.end_date) e.end_date = "End date is required.";
    if (form.start_date && form.end_date && form.start_date > form.end_date)
      e.end_date = "End date cannot be before start date.";
    if (!form.reason.trim()) e.reason = "Please provide a reason.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.attachment) delete payload.attachment;
      const result = await teacherLeaveApi.applyForLeave(payload);
      onSuccess(result);
    } catch (e) {
      setErrors({ submit: e.message || "Failed to submit request. Please try again." });
    } finally { setSubmitting(false); }
  };

  return (
    <Sheet onClose={onClose}>
      <SheetHeader title="Apply for Leave" onClose={onClose} />

      <div className="flex flex-col gap-4">
        {/* Leave Type */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">Leave Type</label>
          <div className="grid grid-cols-2 gap-2">
            {LEAVE_TYPES.map((t) => (
              <button key={t} onClick={() => set("leave_type", t)}
                className="py-2 rounded-lg text-sm font-semibold border transition-all"
                style={form.leave_type === t ? {
                  background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                  borderColor: "var(--color-primary)", color: "var(--color-primary)",
                } : {
                  background: "var(--color-surface-container-high)", borderColor: "transparent",
                  color: "var(--color-on-surface-variant)",
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">Start Date</label>
            <input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-high/30 ${errors.start_date ? "border-error" : "border-outline-variant/20"}`}
              style={{ color: "var(--color-on-surface)" }} />
            {errors.start_date && <p className="text-[11px] text-error mt-1">{errors.start_date}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">End Date</label>
            <input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)}
              min={form.start_date || new Date().toISOString().slice(0, 10)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-high/30 ${errors.end_date ? "border-error" : "border-outline-variant/20"}`}
              style={{ color: "var(--color-on-surface)" }} />
            {errors.end_date && <p className="text-[11px] text-error mt-1">{errors.end_date}</p>}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">Reason</label>
          <textarea value={form.reason} onChange={(e) => set("reason", e.target.value)}
            rows={3} placeholder="Describe the reason for your leave..."
            className={`w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-high/30 ${errors.reason ? "border-error" : "border-outline-variant/20"}`}
            style={{ color: "var(--color-on-surface)" }} />
          {errors.reason && <p className="text-[11px] text-error mt-1">{errors.reason}</p>}
        </div>

        {/* Attachment */}
        {/* <div>
          <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">
            Attachment <span className="normal-case font-normal">(optional)</span>
          </label>
          <label className="flex items-center gap-2 border border-dashed border-outline-variant/30 rounded-lg px-3 py-2.5 cursor-pointer hover:border-primary/50 transition">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">attach_file</span>
            <span className="text-sm text-on-surface-variant truncate">
              {form.attachment ? form.attachment.name : "Choose file (PDF, JPG, PNG)"}
            </span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
              onChange={(e) => set("attachment", e.target.files?.[0] || null)} />
          </label>
        </div> */}

        {errors.submit && (
          <div className="p-3 bg-error/10 text-error rounded-lg border border-error/20 text-sm">{errors.submit}</div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 border border-outline-variant/20 rounded-lg py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-high/50 transition">
            Cancel
          </button>
          <button disabled={submitting} onClick={handleSubmit}
            className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-bold hover:bg-primary/90 transition disabled:opacity-60">
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Student Reviews
// ─────────────────────────────────────────────────────────────────────────────
function StudentReviewsTab({ showToast }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(null);
  const [reviewing, setReviewing] = useState(null); // { leave, action }
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, pageSize]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await teacherLeaveApi.getPendingStudentReviews();
      setReviews(toList(data));
    } catch (e) {
      setError(e.message || "Failed to load student leave review queue.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return reviews;
    const q = debouncedSearch.toLowerCase();
    return reviews.filter((l) =>
      (l.applicant_name || "").toLowerCase().includes(q) ||
      (l.reason || "").toLowerCase().includes(q) ||
      (l.leave_type || "").toLowerCase().includes(q)
    );
  }, [reviews, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage, pageSize]);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  const openReview = (leave, action) => { setRemarks(""); setReviewing({ leave, action }); };

  const submitReview = async () => {
    if (!reviewing) return;
    const { leave, action } = reviewing;
    setSubmitting(true);
    try {
      const fn = action === "approve" ? teacherLeaveApi.approveStudentLeave : teacherLeaveApi.rejectStudentLeave;
      await fn(leave.id, remarks);
      setReviews((prev) => prev.filter((l) => l.id !== leave.id));
      showToast(`Leave request ${action === "approve" ? "approved" : "rejected"}.`);
      setReviewing(null);
      setSelected(null);
    } catch (e) {
      showToast(e.message || "Could not submit review.", "error");
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Student Leave Reviews</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              Pending leave applications from your homeroom / section students.
            </p>
          </div>
          <button onClick={load}
            className="whitespace-nowrap border border-outline-variant/20 text-on-surface px-4 py-2 rounded-lg text-sm font-bold hover:bg-surface-container-high/50 transition-all active:scale-95 flex items-center gap-2">
            <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>refresh</span>
            Refresh
          </button>
        </div>

        {/* Pending count banner */}
        {!loading && reviews.length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl border"
            style={{
              background: "color-mix(in srgb, var(--color-tertiary) 8%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-tertiary) 20%, transparent)",
            }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: "var(--color-tertiary)" }}>pending_actions</span>
            <p className="text-sm font-semibold" style={{ color: "var(--color-tertiary)" }}>
              {reviews.length} student leave{reviews.length !== 1 ? "s" : ""} awaiting your review.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-error/10 text-error rounded-xl border border-error/20 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={load} className="font-bold underline underline-offset-2">Retry</button>
          </div>
        )}

        {/* Search */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 min-w-[180px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name, type or reason..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-surface-container-high/50 border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary transition outline-none"
              style={{ color: "var(--color-on-surface)" }} />
          </div>
          <span className="ml-auto text-xs font-semibold text-on-surface-variant">{filtered.length} pending</span>
        </div>

        {/* Table (desktop) */}
        <div className="hidden md:block bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm text-[12px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/30 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Days</th>
                  <th className="px-6 py-4">Applied</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-6 py-4"><Skeleton style={{ height: 16 }} /></td></tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">task_alt</span>
                      <p className="text-sm font-medium">All caught up!</p>
                      <p className="text-xs">No pending student leave requests.</p>
                    </td>
                  </tr>
                ) : paginated.map((l, idx) => (
                  <tr key={l.id} onClick={() => setSelected(l)}
                    className="group cursor-pointer transition-all duration-150 hover:bg-surface-container-high/30"
                    style={{ animation: `fadeInUp 0.25s ease ${idx * 0.04}s both` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={l.applicant_name} />
                        <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">{l.applicant_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{l.leave_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">{fmtRange(l.start_date, l.end_date)}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{l.total_days}</td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant whitespace-nowrap">{fmt(l.applied_at)}</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openReview(l, "approve")}
                          className="p-1.5 rounded-md text-success hover:bg-success/10 transition" title="Approve">
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </button>
                        <button onClick={() => openReview(l, "reject")}
                          className="p-1.5 rounded-md text-error hover:bg-error/10 transition" title="Reject">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} total={filtered.length}
            rangeStart={rangeStart} rangeEnd={rangeEnd} pageSize={pageSize}
            onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden flex flex-col gap-3">
          {loading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} style={{ height: 130, borderRadius: 12 }} />)
          ) : paginated.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 px-6 py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">task_alt</span>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs">No pending student leaves.</p>
            </div>
          ) : paginated.map((l) => (
            <div key={l.id} onClick={() => setSelected(l)}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-4 active:scale-[0.99] transition-transform">
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={l.applicant_name} />
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface truncate">{l.applicant_name}</p>
                  <p className="text-xs text-on-surface-variant">{l.leave_type} · {l.total_days}d</p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mb-1">{fmtRange(l.start_date, l.end_date)}</p>
              <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{l.reason}</p>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openReview(l, "approve")}
                  className="flex-1 bg-success/10 text-success rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">check</span> Approve
                </button>
                <button onClick={() => openReview(l, "reject")}
                  className="flex-1 bg-error/10 text-error rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">close</span> Reject
                </button>
              </div>
            </div>
          ))}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40">Previous</button>
              <span className="text-xs text-on-surface-variant">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Sheet */}
      {selected && !reviewing && (
        <Sheet onClose={() => setSelected(null)}>
          <SheetHeader
            title={selected.applicant_name}
            subtitle={`${selected.leave_type} leave · ${fmtRange(selected.start_date, selected.end_date)} · ${selected.total_days}d`}
            onClose={() => setSelected(null)}
          />
          <div className="mb-4"><StatusPill status={selected.status} /></div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-wide font-bold text-on-surface-variant mb-1">Reason</dt>
              <dd className="text-on-surface">{selected.reason}</dd>
            </div>
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
              Applied on {fmt(selected.applied_at)}
            </div>
            {selected.attachment && (
              <a href={selected.attachment} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary font-semibold">
                <span className="material-symbols-outlined text-[16px]">attach_file</span> View attachment
              </a>
            )}
          </dl>
          <div className="flex gap-2 mt-6">
            <button onClick={() => openReview(selected, "approve")}
              className="flex-1 bg-success text-white rounded-lg py-2.5 text-sm font-bold flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check</span> Approve
            </button>
            <button onClick={() => openReview(selected, "reject")}
              className="flex-1 border border-error/40 text-error rounded-lg py-2.5 text-sm font-bold flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">close</span> Reject
            </button>
          </div>
        </Sheet>
      )}

      {/* Review Confirmation Sheet */}
      {reviewing && (
        <Sheet onClose={() => setReviewing(null)}>
          <SheetHeader
            title={`${reviewing.action === "approve" ? "Approve" : "Reject"} leave request`}
            subtitle={`${reviewing.leave.applicant_name} · ${fmtRange(reviewing.leave.start_date, reviewing.leave.end_date)}`}
            onClose={() => setReviewing(null)}
          />
          <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">
            Remarks {reviewing.action === "approve" ? "(optional)" : "(recommended)"}
          </label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
            placeholder={reviewing.action === "approve" ? "e.g. Get well soon." : "e.g. Clashes with exam duty."}
            className="w-full border border-outline-variant/20 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-4 bg-surface-container-high/30"
            style={{ color: "var(--color-on-surface)" }} />
          <div className="flex gap-2">
            <button onClick={() => setReviewing(null)}
              className="flex-1 border border-outline-variant/20 rounded-lg py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-high/50 transition">
              Cancel
            </button>
            <button disabled={submitting} onClick={submitReview}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-60 transition ${reviewing.action === "approve" ? "bg-success" : "bg-error"}`}>
              {submitting ? "Submitting…" : `Confirm ${reviewing.action}`}
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root Component
// ─────────────────────────────────────────────────────────────────────────────
export default function TeacherLeaveDashboard() {
  const [activeTab, setActiveTab] = useState("my"); // "my" | "reviews"
  const { toast, showToast } = useToast();

  const tabs = [
    { key: "my",      label: "My Leaves",       icon: "person"          },
    { key: "reviews", label: "Student Reviews",  icon: "pending_actions" },
  ];

  return (
    <MainLayout title="Leave Management">
      <div className="flex flex-col gap-4">

        {/* Page title */}
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-on-surface">Leave Management</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Apply for your own leaves and review student applications for your section.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-outline-variant/10">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                activeTab === tab.key
                  ? "border-primary text-primary bg-surface-container-high/30"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/20"
              }`}>
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "my"      && <MyLeavesTab      showToast={showToast} />}
        {activeTab === "reviews" && <StudentReviewsTab showToast={showToast} />}
      </div>

      <Toast toast={toast} />

      <style>{`
        @keyframes skeleton-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </MainLayout>
  );
}