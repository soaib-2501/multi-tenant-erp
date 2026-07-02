import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getMonthName } from "../../utils/calculations";
import { useStudent } from "../../context/StudentProvider";
import IDCardModal from "./IDCard";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function buildRecentActivity(grades, submissions, attendanceRecords) {
  const events = [];

  (grades || []).forEach((g) => {
    if (!g.created_at && !g.updated_at) return;
    events.push({
      id: `grade-${g.id}`,
      type: 'grade',
      title: `Grade Updated: ${g.subject_name || g.subject || 'Subject'}`,
      detail: (
        <>
          You received a{' '}
          <span className="font-bold text-green-700">
            {g.letter_grade || g.grade || `${g.marks_obtained}/${g.max_marks}`}
          </span>{' '}
          for {g.exam_name || g.exam_type || 'your exam'}.
        </>
      ),
      timestamp: new Date(g.updated_at || g.created_at),
      icon: 'check_circle',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-700',
    });
  });

  (submissions || []).forEach((s) => {
    if (!s.submitted_at && !s.created_at) return;
    events.push({
      id: `sub-${s.id}`,
      type: 'submission',
      title: 'Submission Received',
      detail: s.assignment_title || s.assignment_name || 'Assignment submitted successfully.',
      timestamp: new Date(s.submitted_at || s.created_at),
      icon: 'upload',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
    });
  });

  (attendanceRecords || []).forEach((r) => {
    if (!r.date) return;
    events.push({
      id: `att-${r.id || r.date}`,
      type: 'attendance',
      title: 'Attendance Marked',
      detail: `${r.status} for ${r.subject_name || r.period || 'the day'}.`,
      timestamp: new Date(r.date),
      icon: r.status === 'Present' ? 'event_available'
        : r.status === 'Absent' ? 'event_busy'
          : 'info',
      iconBg: r.status === 'Present' ? 'bg-green-100'
        : r.status === 'Absent' ? 'bg-red-100'
          : 'bg-amber-100',
      iconColor: r.status === 'Present' ? 'text-green-700'
        : r.status === 'Absent' ? 'text-red-700'
          : 'text-amber-700',
    });
  });

  return events
    .filter((e) => !isNaN(e.timestamp))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function DashboardSkeleton() {
  return (
    <MainLayout title="Dashboard">
      <div className="px-8 py-8 space-y-8">
        <div className="rounded-xl bg-gray-200 animate-pulse h-36" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between">
                <Skeleton className="w-9 h-9 rounded-md" />
                <Skeleton className="w-20 h-5 rounded-full" />
              </div>
              <Skeleton className="w-28 h-3 mt-2" />
              <Skeleton className="w-20 h-7" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
              <div className="flex justify-between">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-12 h-4" />
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 42 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded" />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex justify-between">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-4" />
              </div>
              <div className="divide-y divide-gray-50">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 px-4 py-4">
                    <Skeleton className="w-7 h-7 rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-3/4 h-3" />
                      <Skeleton className="w-full h-1.5 rounded-full" />
                    </div>
                    <Skeleton className="w-6 h-5 rounded shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <Skeleton className="w-28 h-3" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
              <Skeleton className="w-32 h-3" />
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="w-3/4 h-3" />
                    <Skeleton className="w-full h-2.5" />
                    <Skeleton className="w-16 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <MainLayout title="Dashboard">
      <div className="px-8 py-16 flex flex-col items-center text-center gap-4">
        <span className="material-symbols-outlined text-5xl text-red-400">error</span>
        <p className="text-base font-bold text-on-surface">Couldn&apos;t load your dashboard</p>
        <p className="text-sm text-on-surface-variant max-w-md">{message}</p>
        <button
          onClick={onRetry}
          className="mt-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    </MainLayout>
  );
}

export default function Dashboard() {
  const {
    profile: student,
    dashboard: studentData,
    enrollment: enroll,
    academic,
    attendanceRecords,
    submissions,
    circulars,
    loading,
    error,
    reload,
  } = useStudent();

  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showIDCard, setShowIDCard] = useState(false);

  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthWord = getMonthName(month);

  const daysCount = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const attendanceMap = useMemo(() => {
    if (!Array.isArray(attendanceRecords)) return {};
    return attendanceRecords.reduce((acc, r) => {
      acc[r.date] = r;
      return acc;
    }, {});
  }, [attendanceRecords]);

  const monthlyDist = useMemo(() => {
    const s = { Present: 0, Absent: 0, Late: 0 };
    if (!Array.isArray(attendanceRecords)) return s;
    attendanceRecords.forEach((r) => {
      const d = new Date(r.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (s[r.status] !== undefined) s[r.status]++;
      }
    });
    return s;
  }, [attendanceRecords, year, month]);

  const top4Subjects = useMemo(() => {
    const grades = studentData?.grades?.results || [];
    const subjects = academic?.subs || [];
    const seen = new Set();
    const uniqueSubjects = subjects.filter((sub) => {
      const key = sub.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return uniqueSubjects
      .map((sub) => ({
        subject: sub,
        gradeInfo:
          grades.find((g) => g.subject === sub.id) ||
          grades.find(
            (g) =>
              g.subject_name?.trim().toLowerCase() ===
              sub.name.trim().toLowerCase()
          ) ||
          null,
      }))
      .sort((a, b) => {
        if (a.gradeInfo && !b.gradeInfo) return -1;
        if (!a.gradeInfo && b.gradeInfo) return 1;
        if (a.gradeInfo && b.gradeInfo) {
          return (
            b.gradeInfo.marks_obtained / b.gradeInfo.max_marks -
            a.gradeInfo.marks_obtained / a.gradeInfo.max_marks
          );
        }
        return 0;
      })
      .slice(0, 4);
  }, [studentData, academic]);

  // Derived recent activity — computed once, not inside render
  const recentActs = useMemo(() => {
    const grades = studentData?.grades?.results || [];
    return buildRecentActivity(grades, submissions, attendanceRecords);
  }, [studentData, submissions, attendanceRecords]);

  if (loading) return <DashboardSkeleton />;

  if (!student) {
    return (
      <DashboardError
        message={error || "Your profile couldn't be loaded."}
        onRetry={reload}
      />
    );
  }

  const attendanceRate = Number(studentData?.attendanceSummary?.attendance_percentage ?? 0);

  const percentage = studentData?.reportCard?.overall_percentage != null
    ? Number(studentData.reportCard.overall_percentage).toFixed(1)
    : "0.0";

  const percentageStatus =
    parseFloat(percentage) >= 75
      ? { label: "EXCELLENT", className: "text-green-800 bg-green-100" }
      : parseFloat(percentage) >= 60
        ? { label: "GOOD", className: "text-blue-800  bg-blue-100" }
        : parseFloat(percentage) >= 45
          ? { label: "SATISFACTORY", className: "text-amber-800 bg-amber-100" }
          : { label: "AT RISK", className: "text-red-800   bg-red-100" };

  const attendanceStatus =
    attendanceRate >= 80
      ? { label: "ON TRACK", className: "text-green-800 bg-green-100" }
      : attendanceRate >= 65
        ? { label: "SATISFACTORY", className: "text-amber-800 bg-amber-100" }
        : { label: "AT RISK", className: "text-red-800 bg-red-100" };

  const getSubjectIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("math")) return { icon: "calculate", bg: "bg-blue-50   text-blue-600" };
    if (n.includes("phys")) return { icon: "rocket_launch", bg: "bg-purple-50 text-purple-600" };
    if (n.includes("comp") || n.includes("code")) return { icon: "code", bg: "bg-orange-50 text-orange-600" };
    if (n.includes("eng") || n.includes("lit")) return { icon: "history_edu", bg: "bg-indigo-50 text-indigo-600" };
    if (n.includes("chem")) return { icon: "science", bg: "bg-green-50  text-green-600" };
    if (n.includes("bio")) return { icon: "biotech", bg: "bg-teal-50   text-teal-600" };
    if (n.includes("hindi") || n.includes("sanskrit")) return { icon: "translate", bg: "bg-rose-50   text-rose-600" };
    return { icon: "menu_book", bg: "bg-slate-100 text-slate-600" };
  };

  const getGradeLetter = (obtained, max) => {
    const p = (obtained / max) * 100;
    if (p >= 90) return { letter: "A+", cls: "text-green-700  bg-green-100" };
    if (p >= 80) return { letter: "A", cls: "text-blue-700   bg-blue-100" };
    if (p >= 70) return { letter: "B+", cls: "text-yellow-700 bg-yellow-100" };
    if (p >= 60) return { letter: "B", cls: "text-orange-700 bg-orange-100" };
    return { letter: "C", cls: "text-red-700    bg-red-100" };
  };

  const dayStatusCls = {
    Present: "bg-green-100  text-green-700  border-green-200",
    Absent: "bg-red-100    text-red-700    border-red-200",
    Late: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const INITIAL_SHOW = 3;
  const displayedActs = showAllActivity ? recentActs : recentActs.slice(0, INITIAL_SHOW);
  const hasMoreActs = recentActs.length > INITIAL_SHOW;

  return (
    <>
      {showIDCard && <IDCardModal onClose={() => setShowIDCard(false)} />}

      <MainLayout
        title="Dashboard"
        headerActions={
          <button
            onClick={() => setShowIDCard(true)}
            title="Download ID Card"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-primary hover:text-white text-on-surface-variant border border-outline-variant/30 transition-all duration-200 text-xs font-bold group"
          >
            <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">
              badge
            </span>
            <span className="hidden sm:inline">ID Card</span>
          </button>
        }
      >
        <div className="px-8 py-8 space-y-6">

          {/* ── HERO BANNER ── */}
          <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 text-white">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-extrabold font-headline mb-2">
                Welcome back, {student?.first_name}!
              </h2>
              <p className="text-white/80 text-lg">
                You are currently leading {enroll?.class_level_name} with
                exceptional progress. Here&apos;s what&apos;s happening in your
                academic journey today.
              </p>
            </div>
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute right-12 bottom-0 hidden lg:block">
              <span className="material-symbols-outlined text-[160px] opacity-10">auto_awesome</span>
            </div>
          </section>

          {/* ── ROW 1: 3 STAT CARDS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Attendance */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl custom-shadow flex items-center justify-between border border-outline-variant/10 hover:scale-[1.01] transition-all">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-md bg-blue-50 text-blue-700 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">calendar_today</span>
                </span>
                <div>
                  <p className="text-xs font-medium text-on-surface-variant whitespace-nowrap">Attendance Rate</p>
                  <p className="text-xl font-bold font-headline text-on-surface leading-tight">
                    {attendanceRate}<span className="text-sm font-semibold">%</span>
                  </p>
                </div>
              </div>
              <span className={`text-2xs font-bold px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${attendanceStatus.className}`}>
                {attendanceStatus.label}
              </span>
            </div>

            {/* Overall Percentage */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl custom-shadow flex items-center justify-between border border-outline-variant/10 hover:scale-[1.01] transition-all">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-md bg-secondary-fixed text-secondary flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">grade</span>
                </span>
                <div>
                  <p className="text-xs font-medium text-on-surface-variant whitespace-nowrap">Overall Percentage</p>
                  <p className="text-xl font-bold font-headline text-on-surface leading-tight">
                    {percentage}<span className="text-sm font-semibold">%</span>
                  </p>
                </div>
              </div>
              <span className={`text-2xs font-bold px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${percentageStatus.className}`}>
                {percentageStatus.label}
              </span>
            </div>

            {/* Fees */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl custom-shadow flex items-center justify-between border border-outline-variant/10 hover:scale-[1.01] transition-all">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-md bg-green-50 text-green-700 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">verified</span>
                </span>
                <div>
                  <p className="text-xs font-medium text-on-surface-variant">Fees Status</p>
                  <p className="text-xl font-bold font-headline text-on-surface leading-tight">Paid</p>
                  <p className="text-2xs text-on-surface-variant">Next due: Oct 15, 2024</p>
                </div>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            </div>

          </div>

          {/* ── ROW 2: Calendar + Subjects + Right col ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

              {/* Calendar */}
              <Link to="/student/attendance" className="block group xl:h-full">
                <div className="xl:h-full bg-surface-container-lowest rounded-xl p-4 custom-shadow border border-outline-variant/10 group-hover:border-primary/40 transition-all duration-200 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-on-surface">{monthWord} {year}</p>
                      <p className="text-2xs text-on-surface-variant">Visual Presence Log</p>
                    </div>
                    <span className="flex items-center gap-0.5 text-2xs font-bold text-primary group-hover:underline">
                      View all
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-7 gap-0.5">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <div key={i} className="text-center text-[8px] font-bold text-outline pb-0.5">{d}</div>
                      ))}
                      {emptyDays.map((_, i) => <div key={`e-${i}`} />)}
                      {days.map((day) => {
                        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const record = attendanceMap[dateKey];
                        return (
                          <div
                            key={day}
                            className={`aspect-square flex items-center justify-center rounded text-3xs font-semibold border transition-all ${record
                                ? (dayStatusCls[record.status] ?? "bg-surface-container border-surface-container")
                                : "bg-surface-container-lowest border-surface-container text-on-surface-variant"
                              }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3 pt-2 border-t border-surface-container-low flex-wrap">
                    {[
                      { color: "bg-green-400", label: "Present", count: monthlyDist.Present },
                      { color: "bg-red-400", label: "Absent", count: monthlyDist.Absent },
                      { color: "bg-yellow-400", label: "Late", count: monthlyDist.Late },
                    ].map(({ color, label, count }) => (
                      <div key={label} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                        <span className="text-3xs font-semibold text-on-surface-variant">
                          {label}<span className="ml-0.5 font-bold text-on-surface">{count}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>

              {/* Subjects */}
              <div className="xl:h-full bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant/10 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-surface-container-low flex-shrink-0">
                  <div>
                    <p className="text-xs font-bold text-on-surface">My Subjects</p>
                    <p className="text-2xs text-on-surface-variant">Graded first</p>
                  </div>
                  <Link to="/student/grades" className="flex items-center gap-0.5 text-2xs font-bold text-primary hover:underline">
                    View More
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
                <div className="flex-1 divide-y divide-surface-container-low overflow-hidden">
                  {top4Subjects.length === 0 ? (
                    <div className="px-4 py-4 text-center text-xs text-on-surface-variant">No subjects found.</div>
                  ) : (
                    top4Subjects.map(({ subject, gradeInfo }) => {
                      const { icon, bg } = getSubjectIcon(subject.name);
                      const subPct = gradeInfo
                        ? ((parseFloat(gradeInfo.marks_obtained) / parseFloat(gradeInfo.max_marks)) * 100).toFixed(1)
                        : null;
                      const grade = gradeInfo ? getGradeLetter(gradeInfo.marks_obtained, gradeInfo.max_marks) : null;
                      return (
                        <div key={subject.id} className="flex items-center gap-3 px-4 py-5 hover:bg-surface-container-low/40 transition-colors">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${bg}`}>
                            <span className="material-symbols-outlined text-sm">{icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-bold text-on-surface truncate pr-1">{subject.name}</p>
                              {subPct ? (
                                <span className="text-xs text-on-surface-variant flex-shrink-0 font-semibold">{subPct}%</span>
                              ) : (
                                <span className="text-2xs text-outline flex-shrink-0">N/A</span>
                              )}
                            </div>
                            <div className="w-full bg-surface-container-high rounded-full h-1 overflow-hidden">
                              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${subPct || 0}%` }} />
                            </div>
                          </div>
                          {grade ? (
                            <span className={`text-2xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${grade.cls}`}>{grade.letter}</span>
                          ) : (
                            <span className="text-2xs text-outline flex-shrink-0 w-6 text-center">—</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="px-4 py-2 border-t border-surface-container-low flex-shrink-0">
                  <Link to="/student/grades" className="w-full flex items-center justify-center gap-1 text-2xs font-bold text-primary hover:text-primary-container transition-colors py-0.5">
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                    View Full Report Card
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="flex flex-col gap-4">

              {/* Quick Actions */}
              <section className="bg-surface-container-low rounded-xl p-5">
                <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* ID Card */}
                  <button
                    onClick={() => setShowIDCard(true)}
                    className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-lg custom-shadow hover:bg-blue-50 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">badge</span>
                    <span className="text-sm font-bold text-on-surface">ID Card</span>
                  </button>
                  <Link
                    to="/student/help"
                    className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-lg custom-shadow hover:bg-blue-50 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">support_agent</span>
                    <span className="text-sm font-bold text-on-surface">Help Desk</span>
                  </Link>
                  <Link
                    to="/student/fees"
                    className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-lg custom-shadow hover:bg-blue-50 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">account_balance_wallet</span>
                    <span className="text-sm font-bold text-on-surface">Fees</span>
                  </Link>
                </div>
              </section>

              {/* Circulars — replaces Recent Activity */}
              <Link to="/student/circulars" className="block group">
                <section className="bg-surface-container-lowest rounded-xl p-5 custom-shadow border border-outline-variant/10 group-hover:border-primary/40 transition-all duration-200">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest">
                      Circulars
                    </h3>
                    <span className="flex items-center gap-0.5 text-2xs font-bold text-primary group-hover:underline">
                      View all
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </div>

                  {(!circulars || circulars.length === 0) ? (
                    <p className="text-xs text-on-surface-variant text-center py-4">
                      No circulars yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {circulars.slice(0, 3).map((c) => (
                        <div key={c.id} className="flex items-start gap-3">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-primary" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-on-surface truncate">{c.title}</p>
                            <p className="text-2xs text-on-surface-variant mt-0.5">
                              {c.created_by_name || 'School Administration'}
                              {c.created_at && ` · ${new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </Link>

              {/* Course Credits */}
              <div className="relative p-5 rounded-lg bg-surface-container-highest overflow-hidden">
                <div className="absolute top-4 right-4 bg-white/40 backdrop-blur-md px-3 py-1 rounded-full text-2xs font-black uppercase tracking-widest text-on-surface">
                  Active
                </div>
                <h4 className="text-sm font-medium text-on-surface-variant mb-4">Course Credits</h4>
                <div className="text-2xl font-bold font-headline text-on-surface">24.0 / 30.0</div>
                <div className="w-full bg-white/30 h-1.5 rounded-full mt-4">
                  <div className="bg-primary h-full rounded-full" style={{ width: "80%" }} />
                </div>
                <p className="text-2xs text-on-surface-variant mt-3">
                  You are on track to graduate early in June 2025.
                </p>
              </div>

            </div>
          </div>

        </div>
      </MainLayout>
    </>
  );
}