import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  calculateAttendance,
  calculateGPA,
  getMonthName,
} from "../../utils/calculations";
import { useStudent } from "../../context/StudentProvider";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
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

export default function Dashboard() {
  const {
    profile: student,
    dashboard: studentData,
    enrollment: enroll,
    academic,
    attendanceRecords,
    loading,
  } = useStudent();

  const now       = useMemo(() => new Date(), []);
  const year      = now.getFullYear();
  const month     = now.getMonth();
  const monthWord = getMonthName(month);

  const daysCount      = new Date(year, month + 1, 0).getDate();
  const days           = Array.from({ length: daysCount }, (_, i) => i + 1);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const emptyDays      = Array.from({ length: firstDayOfWeek }, (_, i) => i);

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
    const grades   = studentData?.grades?.results || [];
    const subjects = academic?.subs              || [];
    const seen = new Set();
    const uniqueSubjects = subjects.filter((sub) => {
      const key = sub.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return uniqueSubjects
      .map((sub) => ({
        subject:   sub,
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
        if (!a.gradeInfo && b.gradeInfo) return  1;
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

  if (loading || !studentData || !student) {
    return <DashboardSkeleton />;
  }

  const allAttendance  = studentData?.attendance?.results || [];
  const attendanceRate = Number(calculateAttendance(allAttendance));
  const grades         = studentData?.grades?.results     || [];
  const gpa            = calculateGPA(grades);

  const attendanceStatus =
    attendanceRate >= 80
      ? { label: "ON TRACK",     className: "text-green-800 bg-green-100" }
      : attendanceRate >= 65
      ? { label: "SATISFACTORY", className: "text-amber-800 bg-amber-100" }
      : { label: "AT RISK",      className: "text-red-800 bg-red-100"     };

  const getSubjectIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("math"))                            return { icon: "calculate",     bg: "bg-blue-50   text-blue-600"   };
    if (n.includes("phys"))                            return { icon: "rocket_launch", bg: "bg-purple-50 text-purple-600" };
    if (n.includes("comp") || n.includes("code"))      return { icon: "code",          bg: "bg-orange-50 text-orange-600" };
    if (n.includes("eng")  || n.includes("lit"))       return { icon: "history_edu",   bg: "bg-indigo-50 text-indigo-600" };
    if (n.includes("chem"))                            return { icon: "science",        bg: "bg-green-50  text-green-600"  };
    if (n.includes("bio"))                             return { icon: "biotech",        bg: "bg-teal-50   text-teal-600"   };
    if (n.includes("hindi") || n.includes("sanskrit")) return { icon: "translate",      bg: "bg-rose-50   text-rose-600"   };
    return                                                    { icon: "menu_book",      bg: "bg-slate-100 text-slate-600"  };
  };

  const getGradeLetter = (obtained, max) => {
    const p = (obtained / max) * 100;
    if (p >= 90) return { letter: "A+", cls: "text-green-700  bg-green-100"  };
    if (p >= 80) return { letter: "A",  cls: "text-blue-700   bg-blue-100"   };
    if (p >= 70) return { letter: "B+", cls: "text-yellow-700 bg-yellow-100" };
    if (p >= 60) return { letter: "B",  cls: "text-orange-700 bg-orange-100" };
    return              { letter: "C",  cls: "text-red-700    bg-red-100"    };
  };

  const dayStatusCls = {
    Present: "bg-green-100  text-green-700  border-green-200",
    Absent:  "bg-red-100    text-red-700    border-red-200",
    Late:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <MainLayout title="Dashboard">
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
            <span className="material-symbols-outlined text-[160px] opacity-10">
              auto_awesome
            </span>
          </div>
        </section>

        {/* ── ROW 1: 3 STAT CARDS (compact) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Attendance */}
          <div className="bg-surface-container-lowest px-4 py-3 rounded-xl custom-shadow flex items-center justify-between border border-outline-variant/10 hover:scale-[1.01] transition-all">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-md bg-blue-50 text-blue-700 flex-shrink-0">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
              </span>
              <div>
                <p className="text-xs font-medium text-on-surface-variant">Attendance Rate</p>
                <p className="text-xl font-bold font-headline text-on-surface leading-tight">
                  {attendanceRate}<span className="text-sm font-semibold">%</span>
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${attendanceStatus.className}`}>
              {attendanceStatus.label}
            </span>
          </div>

          {/* GPA */}
          <div className="bg-surface-container-lowest px-4 py-3 rounded-xl custom-shadow flex items-center justify-between border border-outline-variant/10 hover:scale-[1.01] transition-all">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-md bg-secondary-fixed text-secondary flex-shrink-0">
                <span className="material-symbols-outlined text-xl">grade</span>
              </span>
              <div>
                <p className="text-xs font-medium text-on-surface-variant">Current GPA</p>
                <p className="text-xl font-bold font-headline text-on-surface leading-tight">
                  {gpa}<span className="text-sm font-semibold">/4.0</span>
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-secondary bg-secondary-fixed px-2 py-1 rounded-full">
              EXCELLENT
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
                <p className="text-[10px] text-on-surface-variant">Next due: Oct 15, 2024</p>
              </div>
            </div>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          </div>

        </div>

        {/* ── ROW 2: Calendar + Subjects + Right col ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 grid grid-cols-2 gap-6 items-stretch">

            <Link to="/student/attendance" className="block group h-full">
              <div className="h-full bg-surface-container-lowest rounded-xl p-4 custom-shadow border border-outline-variant/10 group-hover:border-primary/40 transition-all duration-200 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-on-surface">{monthWord} {year}</p>
                    <p className="text-[10px] text-on-surface-variant">Visual Presence Log</p>
                  </div>
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-primary group-hover:underline">
                    View all
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-7 gap-0.5">
                    {["S","M","T","W","T","F","S"].map((d, i) => (
                      <div key={i} className="text-center text-[8px] font-bold text-outline pb-0.5">{d}</div>
                    ))}
                    {emptyDays.map((_, i) => <div key={`e-${i}`} />)}
                    {days.map((day) => {
                      const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                      const record  = attendanceMap[dateKey];
                      return (
                        <div key={day}
                          className={`aspect-square flex items-center justify-center rounded text-[9px] font-semibold border transition-all ${
                            record
                              ? (dayStatusCls[record.status] ?? "bg-surface-container border-surface-container")
                              : "bg-surface-container-lowest border-surface-container text-on-surface-variant"
                          }`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3 mt-3 pt-2 border-t border-surface-container-low flex-wrap">
                  {[
                    { color: "bg-green-400",  label: "Present", count: monthlyDist.Present },
                    { color: "bg-red-400",    label: "Absent",  count: monthlyDist.Absent  },
                    { color: "bg-yellow-400", label: "Late",    count: monthlyDist.Late    },
                  ].map(({ color, label, count }) => (
                    <div key={label} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                      <span className="text-[9px] font-semibold text-on-surface-variant">
                        {label}<span className="ml-0.5 font-bold text-on-surface">{count}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>

            <div className="h-full bg-surface-container-lowest rounded-xl custom-shadow border border-outline-variant/10 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-surface-container-low flex-shrink-0">
                <div>
                  <p className="text-xs font-bold text-on-surface">My Subjects</p>
                  <p className="text-[10px] text-on-surface-variant">Graded first</p>
                </div>
                <Link to="/student/grades" className="flex items-center gap-0.5 text-[10px] font-bold text-primary hover:underline">
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
                    const percentage   = gradeInfo ? Math.round((gradeInfo.marks_obtained / gradeInfo.max_marks) * 100) : 0;
                    const grade = gradeInfo ? getGradeLetter(gradeInfo.marks_obtained, gradeInfo.max_marks) : null;
                    return (
                      <div key={subject.id} className="flex items-center gap-3 px-4 py-5 hover:bg-surface-container-low/40 transition-colors">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${bg}`}>
                          <span className="material-symbols-outlined text-sm">{icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-bold text-on-surface truncate pr-1">{subject.name}</p>
                            {gradeInfo ? (
                              <span className="text-xs text-on-surface-variant flex-shrink-0">{gradeInfo.marks_obtained}/{gradeInfo.max_marks}</span>
                            ) : (
                              <span className="text-[10px] text-outline flex-shrink-0">N/A</span>
                            )}
                          </div>
                          <div className="w-full bg-surface-container-high rounded-full h-1 overflow-hidden">
                            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                        {grade ? (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${grade.cls}`}>{grade.letter}</span>
                        ) : (
                          <span className="text-[10px] text-outline flex-shrink-0 w-6 text-center">—</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="px-4 py-2 border-t border-surface-container-low flex-shrink-0">
                <Link to="/student/grades" className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-primary hover:text-primary-container transition-colors py-0.5">
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                  View Full Report Card
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <section className="bg-surface-container-low rounded-xl p-5">
              <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/student/help" className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-lg custom-shadow hover:bg-blue-50 transition-colors group">
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">support_agent</span>
                  <span className="text-sm font-bold text-on-surface">Help Desk</span>
                </Link>
                <Link to="/student/fees" className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-lg custom-shadow hover:bg-blue-50 transition-colors group">
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">account_balance_wallet</span>
                  <span className="text-sm font-bold text-on-surface">Fees</span>
                </Link>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-5 custom-shadow">
              <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-5">Recent Activity</h3>
              <div className="relative space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-white">
                    <span className="material-symbols-outlined text-green-700 text-xs">check_circle</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface">Grade Updated: Physics Lab</p>
                  <p className="text-xs text-on-surface-variant">You received an <span className="font-bold text-green-700">A</span> for the Optics experiment.</p>
                  <span className="text-[10px] text-outline-variant mt-1 block">15 mins ago</span>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-white">
                    <span className="material-symbols-outlined text-blue-700 text-xs">upload</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface">Submission Received</p>
                  <p className="text-xs text-on-surface-variant">English Literature Essay: &quot;Modernism in 1920s&quot;</p>
                  <span className="text-[10px] text-outline-variant mt-1 block">2 hours ago</span>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center ring-4 ring-white">
                    <span className="material-symbols-outlined text-amber-700 text-xs">info</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface">Attendance Marked</p>
                  <p className="text-xs text-on-surface-variant">Present for Period 4: Computer Science.</p>
                  <span className="text-[10px] text-outline-variant mt-1 block">4 hours ago</span>
                </div>
              </div>
              <button className="w-full mt-5 py-3 border-t border-surface-container text-xs font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-tight">
                Show More History
              </button>
            </section>

            <div className="relative p-5 rounded-lg bg-surface-container-highest overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-on-surface">Active</div>
              <h4 className="text-sm font-medium text-on-surface-variant mb-4">Course Credits</h4>
              <div className="text-2xl font-bold font-headline text-on-surface">24.0 / 30.0</div>
              <div className="w-full bg-white/30 h-1.5 rounded-full mt-4">
                <div className="bg-primary h-full rounded-full" style={{ width: "80%" }} />
              </div>
              <p className="text-[10px] text-on-surface-variant mt-3">You are on track to graduate early in June 2025.</p>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}