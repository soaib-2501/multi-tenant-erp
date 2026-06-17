import React, { useState, useMemo } from "react";
import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import { useParent } from "../../context/ParentProvider";

/* ─── Skeleton ─────────────────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-slate-700 rounded-md ${className}`} />;
}

function AttendanceSkeleton() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-64 h-3" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-24 h-9 rounded-md" />
            <Skeleton className="w-28 h-9 rounded-md" />
          </div>
        </div>
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm space-y-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="w-28 h-3" />
                <Skeleton className="w-16 h-7" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between">
              <Skeleton className="w-36 h-5" />
              <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

/* ─── Request Leave Modal ───────────────────────────────────────────────── */
function RequestLeaveModal({ studentName, onClose, onSubmit }) {
  const [form, setForm] = useState({ fromDate: "", toDate: "", reason: "", type: "Medical" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const leaveTypes = ["Medical", "Family Emergency", "Travel", "Personal", "Other"];

  const handleSubmit = async () => {
    if (!form.fromDate || !form.toDate || !form.reason.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => { onSubmit?.(); onClose(); }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <div>
            <h2 className="text-sm font-bold font-headline text-gray-900 dark:text-white">Request Leave</h2>
            <p className="text-xs text-on-surface-variant dark:text-slate-200 mt-0.5">For {studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container dark:hover:bg-slate-700 text-on-surface-variant dark:text-slate-300 hover:text-on-surface dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 px-6">
            <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-green-600 dark:text-green-300">check_circle</span>
            </div>
            <p className="text-sm font-bold font-headline text-on-surface dark:text-white">Leave request submitted</p>
            <p className="text-xs text-on-surface-variant dark:text-slate-200 mt-1">The school will review and respond shortly.</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant dark:text-slate-200 mb-1">From date</label>
                <input
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))}
                  className="w-full text-sm bg-surface-container-low dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-surface-tint"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant dark:text-slate-200 mb-1">To date</label>
                <input
                  type="date"
                  value={form.toDate}
                  onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))}
                  className="w-full text-sm bg-surface-container-low dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-surface-tint"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant dark:text-slate-200 mb-1">Leave type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full text-sm bg-surface-container-low dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-surface-tint"
              >
                {leaveTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant dark:text-slate-200 mb-1">Reason</label>
              <textarea
                rows={3}
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Briefly describe the reason for leave..."
                className="w-full text-sm bg-surface-container-low dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-on-surface dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-surface-tint"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 text-sm py-2.5 rounded-lg bg-surface-container-low dark:bg-slate-700 text-on-surface-variant dark:text-slate-200 font-medium hover:bg-surface-container dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.fromDate || !form.toDate || !form.reason.trim()}
                className="flex-1 text-sm py-2.5 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Export CSV helper ─────────────────────────────────────────────────── */
function exportToCSV(records, studentName) {
  const headers = ["Date", "Day", "Status", "Remarks"];
  const rows = records.map((r) => {
    const d = new Date(r.date);
    return [
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      d.toLocaleDateString("en-US", { weekday: "long" }),
      r.status || "",
      r.remarks || "",
    ];
  });

  const csvContent = [
    [`Attendance Report — ${studentName}`],
    [`Generated on: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`],
    [],
    headers,
    ...rows,
  ]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `attendance_${studentName.replace(/\s+/g, "_").toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function AttendanceTracker() {
  const { profile, dashboard, attendanceRecords, enrollment, loading, error } = useParent();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthWord = currentDate.toLocaleString("en-US", { month: "long" });

  const attendanceMap = useMemo(() => {
    if (!Array.isArray(attendanceRecords)) return {};
    return attendanceRecords.reduce((acc, r) => { acc[r.date] = r; return acc; }, {});
  }, [attendanceRecords]);

  const daysCount = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyDays = Array.from({ length: firstDayOfMonth });

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const overallAttendance = useMemo(() => {
    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) return 0;
    const present = attendanceRecords.filter((r) => r.status === "Present").length;
    return Math.round((present / attendanceRecords.length) * 100);
  }, [attendanceRecords]);

  const minRequirement = 75;
  const attendanceDifference = overallAttendance - minRequirement;
  const requirementMet = overallAttendance >= minRequirement;

  const monthlyDistribution = useMemo(() => {
    const s = { Present: 0, Absent: 0, Late: 0 };
    if (!Array.isArray(attendanceRecords)) return s;
    attendanceRecords.forEach((r) => {
      const d = new Date(r.date);
      if (d.getFullYear() === year && d.getMonth() === month && s[r.status] !== undefined) s[r.status]++;
    });
    return s;
  }, [attendanceRecords, year, month]);

  const grades = dashboard?.grades?.results || [];

  const statusClasses = {
    Present: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
    Absent:  "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
    Late:    "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
  };

  const badgeCls = {
    Present: "bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    Absent:  "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    Late:    "bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  };

  const handleExport = () => {
    const sorted = [...(attendanceRecords || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    exportToCSV(sorted, studentFullName);
    setExportFeedback(true);
    setTimeout(() => setExportFeedback(false), 2000);
  };

  if (loading) return <AttendanceSkeleton />;

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-xl p-5 text-sm">
            Could not load attendance data. {error?.message || "Please try again later."}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const studentFirstName = profile?.first_name || "your child";
  const studentFullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || studentFirstName;
  const sortedRecords = [...(attendanceRecords || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-base font-bold font-headline text-on-surface dark:text-white">Child Attendance</h1>
            <p className="text-xs text-on-surface-variant dark:text-slate-200 mt-0.5">
              Tracking {studentFirstName}&apos;s academic presence
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-surface-container-high dark:bg-slate-700 text-primary dark:text-blue-300 px-4 py-2.5 rounded-md font-semibold text-sm hover:bg-surface-variant dark:hover:bg-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                {exportFeedback ? "check" : "download"}
              </span>
              {exportFeedback ? "Exported!" : "Export Report"}
            </button>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-base">event_busy</span>
              Request Leave
            </button>
          </div>
        </div>

        {/* ── Main grid: left stat cards + right calendar ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: 3 stat cards */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full">

            {/* Card 1: Overall Attendance */}
            <div className="bg-surface-container-lowest dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 dark:border-slate-700 flex items-center justify-between gap-3 flex-1 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">analytics</span>
                </span>
                <div>
                  <p className="text-xs font-medium text-on-surface-variant dark:text-slate-200">Overall Attendance</p>
                  <p className="text-2xl font-bold font-headline text-on-surface dark:text-white leading-tight">
                    {overallAttendance}<span className="text-sm font-semibold">%</span>
                  </p>
                </div>
              </div>
              <div className="w-16 flex flex-col items-end gap-1 flex-shrink-0">
                <div className="w-full bg-surface-container dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(overallAttendance, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-on-surface-variant dark:text-slate-300">{overallAttendance}% of 100%</span>
              </div>
            </div>

            {/* Card 2: Min Requirement */}
            <div className="bg-surface-container-lowest dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 dark:border-slate-700 flex items-center justify-between gap-3 flex-1 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">gavel</span>
                </span>
                <div>
                  <p className="text-xs font-medium text-on-surface-variant dark:text-slate-200">Min. Requirement</p>
                  <p className="text-2xl font-bold font-headline text-on-surface dark:text-white leading-tight">
                    {minRequirement}<span className="text-sm font-semibold">%</span>
                  </p>
                  <p className="text-[10px] text-on-surface-variant dark:text-slate-300 italic">
                    {requirementMet
                      ? `${Math.abs(attendanceDifference)}% above limit`
                      : `${Math.abs(attendanceDifference)}% below limit`}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full self-start whitespace-nowrap flex-shrink-0 ${
                requirementMet ? "text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/30" : "text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30"
              }`}>
                {requirementMet ? "Met" : "Not Met"}
              </span>
            </div>

            {/* Card 3: Monthly Breakdown bar chart */}
            <div className="bg-surface-container-lowest dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 dark:border-slate-700 flex-1 transition-colors duration-300">
              <p className="text-xs font-medium text-on-surface-variant dark:text-slate-200 mb-0.5">Monthly Breakdown</p>
              <p className="text-[10px] text-on-surface-variant/60 dark:text-slate-400 mb-3">{monthWord} {year}</p>

              {monthlyDistribution.Present === 0 &&
               monthlyDistribution.Absent === 0 &&
               monthlyDistribution.Late === 0 ? (
                <p className="text-xs text-on-surface-variant dark:text-slate-300 text-center py-4">No data for this month</p>
              ) : (
                <div className="flex items-end gap-3 h-16">
                  {[
                    { label: "Present", count: monthlyDistribution.Present, barColor: "bg-green-400", textColor: "text-green-600 dark:text-green-300" },
                    { label: "Absent",  count: monthlyDistribution.Absent,  barColor: "bg-red-400",   textColor: "text-red-600 dark:text-red-300"   },
                    { label: "Late",    count: monthlyDistribution.Late,    barColor: "bg-yellow-400",textColor: "text-yellow-600 dark:text-yellow-300"},
                  ].map(({ label, count, barColor, textColor }) => {
                    const total = monthlyDistribution.Present + monthlyDistribution.Absent + monthlyDistribution.Late;
                    const heightPercent = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1">
                        <span className={`text-2xs font-bold ${textColor}`}>{count}</span>
                        <div className="w-full flex items-end" style={{ height: "44px" }}>
                          <div
                            className={`w-full ${barColor} rounded-t-md transition-all duration-500`}
                            style={{ height: `${heightPercent}%`, minHeight: count > 0 ? "3px" : "0px" }}
                          />
                        </div>
                        <span className="text-[9px] text-on-surface-variant dark:text-slate-300">{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Calendar */}
          <div className="lg:col-span-8 bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-outline-variant/10 dark:border-slate-700 flex flex-col transition-colors duration-300">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <div>
                <h3 className="text-base font-bold font-headline text-on-surface dark:text-white">
                  {monthWord} {year}
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-slate-200">Visual Presence Log</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-surface-container dark:hover:bg-slate-700 rounded-lg transition-colors text-on-surface dark:text-white"
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-surface-container dark:hover:bg-slate-700 rounded-lg transition-colors text-on-surface dark:text-white"
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <div key={d} className="text-center text-[9px] sm:text-[10px] font-bold text-on-surface-variant dark:text-slate-300 pb-1">{d}</div>
                ))}
                {emptyDays.map((_, idx) => <div key={`b-${idx}`} />)}
                {days.map((day) => {
                  const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const record = attendanceMap?.[dateKey];
                  return (
                    <div
                      key={day}
                      title={record?.status || ""}
                      className={`h-8 sm:h-10 rounded-lg flex items-center justify-center text-xs sm:text-xs font-semibold border transition-all cursor-default ${
                        record
                          ? (statusClasses[record.status] ?? "bg-surface-container dark:bg-slate-700 border-surface-container dark:border-slate-600")
                          : "bg-surface-container-lowest dark:bg-slate-800 border-surface-container dark:border-slate-700 text-on-surface-variant dark:text-slate-300"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-5 mt-5 pt-4 border-t border-surface-container-low dark:border-slate-700">
                {[
                  { color: "bg-green-400",  label: "Present"   },
                  { color: "bg-red-400",    label: "Absent"    },
                  { color: "bg-yellow-400", label: "Late"      },
                  { color: "bg-surface-container dark:bg-slate-700", label: "No record" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-xs font-medium text-on-surface-variant dark:text-slate-200">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Enrollment info row ── */}
        <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-sm border border-outline-variant/10 dark:border-slate-700 px-4 py-3 transition-colors duration-300">
          <p className="text-xs font-medium text-on-surface-variant dark:text-slate-200 mb-3">Enrollment Details</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { label: "Student",       value: studentFullName },
              { label: "Class",         value: enrollment ? `${enrollment.class_level_name} – ${enrollment.section_name}` : "N/A" },
              { label: "Roll no.",      value: enrollment?.roll_number || "N/A" },
              { label: "Academic year", value: enrollment?.academic_year_name || "N/A" },
              { label: "Subjects",      value: grades.length || "N/A" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-on-surface-variant dark:text-slate-300 mb-0.5">{label}</p>
                <p className="text-xs font-bold font-headline text-on-surface dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Log Table ── */}
        <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-sm border border-outline-variant/10 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container-low dark:border-slate-700">
            <h2 className="text-sm font-bold font-headline text-on-surface dark:text-white">Attendance Log</h2>
            <span className="text-xs text-on-surface-variant dark:text-slate-300">{sortedRecords.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50 dark:bg-slate-900/50">
                <tr>
                  {["Date", "Day", "Remarks", "Status"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-slate-300 ${i === 3 ? "text-center" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low dark:divide-slate-700">
                {sortedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-xs text-on-surface-variant dark:text-slate-300">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  sortedRecords.map((rec) => {
                    const d = new Date(rec.date);
                    return (
                      <tr key={rec.id} className="hover:bg-surface-container-low/30 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-on-surface dark:text-white">
                          {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant dark:text-slate-200">
                          {d.toLocaleDateString("en-US", { weekday: "long" })}
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant dark:text-slate-200">{rec.remarks || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeCls[rec.status] || "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                            {rec.status || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Leave Modal ── */}
      {showLeaveModal && (
        <RequestLeaveModal
          studentName={studentFullName}
          onClose={() => setShowLeaveModal(false)}
          onSubmit={() => setShowLeaveModal(false)}
        />
      )}
    </DashboardLayout>
  );
}