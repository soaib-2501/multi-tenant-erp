import React, { useState, useMemo } from "react";
import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import { useParent } from "../../context/ParentProvider";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function AssignmentsSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="w-40 h-7" />
          <Skeleton className="w-64 h-4" />
        </div>
        {/* AI banner */}
        <Skeleton className="w-full h-20 rounded-xl" />
        {/* Metric cards */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 border space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-14 h-8" />
            </div>
          ))}
        </div>
        {/* Roadmap + sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ── Subject icons ── */
const SUBJECT_ICONS = {
  physics:     { icon: "science",      bg: "bg-blue-50",    color: "text-blue-600"    },
  mathematics: { icon: "calculate",    bg: "bg-purple-50",  color: "text-purple-600"  },
  math:        { icon: "calculate",    bg: "bg-purple-50",  color: "text-purple-600"  },
  literature:  { icon: "menu_book",    bg: "bg-orange-50",  color: "text-orange-600"  },
  english:     { icon: "menu_book",    bg: "bg-orange-50",  color: "text-orange-600"  },
  chemistry:   { icon: "experiment",   bg: "bg-green-50",   color: "text-green-600"   },
  biology:     { icon: "biotech",      bg: "bg-emerald-50", color: "text-emerald-600" },
  "computer science": { icon: "code",  bg: "bg-indigo-50",  color: "text-indigo-600"  },
  history:     { icon: "history_edu",  bg: "bg-amber-50",   color: "text-amber-600"   },
};

function getSubjectMeta(subjectName) {
  const key = (subjectName || "").toLowerCase();
  return SUBJECT_ICONS[key] || { icon: "assignment", bg: "bg-slate-50", color: "text-slate-600" };
}

const STATUS_BADGE = {
  Pending:   "bg-amber-100  text-amber-700",
  Submitted: "bg-purple-100 text-purple-700",
  Graded:    "bg-blue-100   text-blue-700",
};

function formatDueDate(dueDateStr) {
  const due  = new Date(dueDateStr);
  const now  = new Date();
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  const timeStr = due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diff < 0)  return { text: `Overdue — ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, urgent: true };
  if (diff === 0) return { text: `Today, ${timeStr}`, urgent: true };
  if (diff === 1) return { text: `Tomorrow, ${timeStr}`, urgent: true };
  return { text: due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), urgent: false };
}

export default function AssignmentsOverview() {
  const { profile, assignments, loading, error } = useParent();
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [statusFilter,  setStatusFilter]  = useState("All Status");

  /* ── All hooks unconditionally at top ── */
  const list = assignments || [];

  const subjectOptions = useMemo(
    () => ["All Subjects", ...Array.from(new Set(list.map(a => a.subject_name).filter(Boolean)))],
    [list]
  );

  const total          = list.length;
  const submittedCount = list.filter(a => a.submission_status === "Submitted" || a.submission_status === "Graded").length;
  const pendingCount   = list.filter(a => a.submission_status === "Pending").length;
  const submissionRate = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

  const gradedAssignments = list.filter(a => a.submission_status === "Graded" && a.grade != null);
  const avgGradePct = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((sum, a) => sum + parseFloat(a.grade), 0) / gradedAssignments.length)
    : null;

  const upcomingPending = [...list]
    .filter(a => a.submission_status === "Pending")
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  const filteredList = list.filter(a => {
    const matchSubject = subjectFilter === "All Subjects" || a.subject_name === subjectFilter;
    const matchStatus  = statusFilter  === "All Status"  || a.submission_status === statusFilter;
    return matchSubject && matchStatus;
  });

  const sortedList = [...filteredList].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  /* ── Early returns after all hooks ── */
  if (loading) return <AssignmentsSkeleton />;

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-700 rounded-lg p-5 text-sm">
          Could not load assignments. {error?.message || "Please try again later."}
        </div>
      </DashboardLayout>
    );
  }

  const studentFirstName = profile?.first_name || "your child";

  return (
    <DashboardLayout>
      {/*
        max-w-7xl + responsive padding handled by DashboardLayout's inner wrapper.
        We just provide the page content with tight vertical spacing.
        All paddings are responsive: tighter on mobile/tablet, comfortable on desktop.
      */}
      <div className="space-y-4 sm:space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Track, review, and manage {studentFirstName}&apos;s coursework.
            </p>
          </div>
        </div>

        {/* ── AI INSIGHT BANNER ── */}
        {upcomingPending ? (
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl p-4 sm:p-5
                          flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-start sm:items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                <span className="material-symbols-outlined text-white text-lg">psychology</span>
              </div>
              <div>
                <p className="text-[10px] text-blue-100 uppercase tracking-wider font-bold">AI Intelligence Insight</p>
                <p className="text-white font-semibold text-sm sm:text-base leading-snug">
                  {upcomingPending.title} ({upcomingPending.subject_name}) is due{" "}
                  {formatDueDate(upcomingPending.due_date).text.toLowerCase()}.
                </p>
              </div>
            </div>
            <button className="self-start sm:self-auto shrink-0 bg-white text-blue-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-50 transition">
              Review Now
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-xl p-4 sm:p-5 flex items-center gap-3 shadow-md">
            <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-white text-lg">check_circle</span>
            </div>
            <p className="text-white font-semibold text-sm sm:text-base">
              All caught up — no pending assignments right now.
            </p>
          </div>
        )}

        {/* ── METRIC CARDS ──
            2-col on mobile/tablet, 3-col on xl+ (sidebar fully expanded on xl)
        ── */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Total</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5">{total}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-blue-600 text-lg">analytics</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Submitted</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-0.5">{submittedCount}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-purple-600 text-lg">check_circle</span>
            </div>
          </div>

          <div className="col-span-2 xl:col-span-1 bg-white rounded-xl p-4 sm:p-5 shadow-sm border flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-700 mt-0.5">{pendingCount}</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-amber-700 text-lg">pending_actions</span>
            </div>
          </div>
        </div>

        {/* ── ROADMAP + SIDEBAR ──
            1-col on mobile → stacked
            tablet (md): still 1-col stacked (sidebar takes space, not enough room for 2-col)
            xl+: 3-col grid, roadmap gets col-span-2
        ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">

          {/* ROADMAP */}
          <div className="xl:col-span-2 space-y-3">
            {/* Filter row */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold">Assignment Roadmap</h3>
              <div className="flex gap-2 w-full xs:w-auto">
                <select
                  value={subjectFilter}
                  onChange={e => setSubjectFilter(e.target.value)}
                  className="flex-1 xs:flex-none border rounded-md px-2 py-1.5 text-xs sm:text-sm bg-white min-w-0"
                >
                  {subjectOptions.map(s => <option key={s}>{s}</option>)}
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="flex-1 xs:flex-none border rounded-md px-2 py-1.5 text-xs sm:text-sm bg-white min-w-0"
                >
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Submitted</option>
                  <option>Graded</option>
                </select>
              </div>
            </div>

            {sortedList.length === 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm border text-center text-sm text-gray-500">
                No assignments match the selected filters.
              </div>
            )}

            {sortedList.map(a => {
              const meta = getSubjectMeta(a.subject_name);
              const due  = formatDueDate(a.due_date);
              const isGraded    = a.submission_status === "Graded";
              const isSubmitted = a.submission_status === "Submitted";

              return (
                <div
                  key={a.id}
                  className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border
                             flex items-center gap-3 sm:gap-4 hover:shadow-md transition"
                >
                  {/* Subject icon */}
                  <div className={`${meta.bg} p-2 sm:p-3 rounded-lg shrink-0`}>
                    <span className={`material-symbols-outlined ${meta.color} text-lg sm:text-xl`}>
                      {meta.icon}
                    </span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-medium truncate">
                      {a.subject_name}{a.section_name ? ` • ${a.section_name}` : ""}
                    </p>
                    <p className="font-semibold text-sm sm:text-base leading-tight truncate">{a.title}</p>
                    {a.teacher_name && (
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">By {a.teacher_name}</p>
                    )}
                  </div>

                  {/* Due / grade — hidden on very small screens, shown sm+ */}
                  <div className="hidden sm:block text-right shrink-0">
                    {isGraded ? (
                      <>
                        <p className="text-[10px] text-gray-400">Grade</p>
                        <p className="text-blue-600 font-semibold text-sm">{a.grade}</p>
                      </>
                    ) : isSubmitted ? (
                      <>
                        <p className="text-[10px] text-gray-400">Submitted</p>
                        <p className="text-gray-700 text-sm font-semibold">
                          {a.submitted_at
                            ? new Date(a.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "—"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] text-gray-400">Deadline</p>
                        <p className={`text-sm font-semibold ${due.urgent ? "text-red-500" : "text-gray-700"}`}>
                          {due.text}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Status badge */}
                  <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold shrink-0
                                   ${STATUS_BADGE[a.submission_status] || "bg-slate-100 text-slate-700"}`}>
                    {a.submission_status}
                  </span>

                  <span className="material-symbols-outlined text-gray-300 text-lg shrink-0 hidden sm:block">
                    chevron_right
                  </span>
                </div>
              );
            })}
          </div>

          {/* QUICK STATS SIDEBAR */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border h-fit">
            <h4 className="font-semibold mb-4 text-sm sm:text-base">Quick Statistics</h4>

            <div className="mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Submission Rate</span>
                <span className="font-semibold text-blue-600">{submissionRate}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full mt-2">
                <div className="h-1.5 bg-blue-600 rounded-full" style={{ width: `${submissionRate}%` }} />
              </div>
            </div>

            <div className="flex justify-between text-xs sm:text-sm mb-4">
              <span className="text-gray-500">Avg. Grade</span>
              <span className="text-purple-600 font-semibold">
                {avgGradePct != null ? `${avgGradePct}%` : "No grades yet"}
              </span>
            </div>

            <div className="border-t pt-4">
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold mb-2">Pending</p>
              {pendingCount === 0 ? (
                <p className="text-xs sm:text-sm text-gray-400">Nothing pending right now.</p>
              ) : (
                list
                  .filter(a => a.submission_status === "Pending")
                  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                  .slice(0, 3)
                  .map(a => (
                    <div key={a.id} className="mb-2.5">
                      <div className="flex gap-2 items-start text-xs sm:text-sm">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                        <span className="font-medium truncate">{a.title}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400 ml-3.5">
                        {formatDueDate(a.due_date).text}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}