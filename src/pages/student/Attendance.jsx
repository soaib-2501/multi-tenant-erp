import React, { useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import {
  getMonthName,
} from "../../utils/calculations";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function AttendanceSkeleton() {
  return (
    <MainLayout title="Attendance">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <section className="flex flex-wrap items-center gap-4">
          <div className="flex-1 flex flex-wrap gap-4 min-w-0">
            <Skeleton className="w-full sm:w-48 h-10 rounded-md" />
            <Skeleton className="w-full sm:w-48 h-10 rounded-md" />
          </div>
          <Skeleton className="w-28 h-10 rounded-md" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="w-28 h-3" />
                <Skeleton className="w-16 h-7" />
                <Skeleton className="w-full h-1.5 rounded-full" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-8 bg-white rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between">
              <Skeleton className="w-36 h-6" />
              <div className="flex gap-2">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="w-9 h-9 rounded-lg" />
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
    </MainLayout>
  );
}

export default function Attendance() {
  const { attendanceRecords: records, academic, dashboard, loading } = useStudent();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    let filtered = records.filter((record) => {
      const matchYear = selectedYear === "" || record.academic_year === selectedYear;
      return matchYear;
    });
    if (selectedSubject !== "") {
      filtered = filtered.filter((record) => record.subject === selectedSubject);
    }
    return filtered;
  }, [records, selectedYear, selectedSubject]);

  const attendanceMap = useMemo(() => {
    if (!filteredRecords || !Array.isArray(filteredRecords)) return {};
    return filteredRecords.reduce((acc, record) => {
      acc[record.date] = record;
      return acc;
    }, {});
  }, [filteredRecords]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysCount = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthWord = getMonthName(month);
  const academicYears = academic?.years || [];
  const subjects = Array.from(
    new Map((academic?.subs || []).map((s) => [s.name, s])).values()
  );

  // Use the same backend-calculated attendance percentage shown on the
  // Dashboard ("Attendance Rate"), instead of client-side calculating it
  // from filteredRecords — keeps both pages consistent.
  const attendance = Number(dashboard?.attendanceSummary?.attendance_percentage ?? 0);
  const minRequirement = 75;
  const attendanceDifference = attendance - minRequirement;
  const requirementMet = attendance >= minRequirement;

  const monthlyDistribution = useMemo(() => {
    const summary = { Present: 0, Absent: 0, Late: 0 };
    filteredRecords.forEach((record) => {
      const d = new Date(record.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (summary[record.status] !== undefined) summary[record.status]++;
      }
    });
    return summary;
  }, [filteredRecords, year, month]);

  if (loading) return <AttendanceSkeleton />;

  const statusClasses = {
    Present: "bg-green-100 text-green-700 border-green-200",
    Absent:  "bg-red-100 text-red-700 border-red-200",
    Late:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  // Calculate total weeks to determine calendar height
  const totalDays = emptyDays.length + days.length;
  const totalWeeks = Math.ceil(totalDays / 7);
  const calendarRows = totalWeeks;

  // Format number to 2 decimal places
  const formatToTwoDecimals = (num) => {
    return num.toFixed(2);
  };

  return (
    <MainLayout title="Attendance">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

        {/* FILTERS */}
        <section className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex-1 flex flex-wrap gap-3 sm:gap-4 min-w-0">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-surface-tint outline-none flex-1 min-w-[160px]"
            >
              <option value="">All Academic Years</option>
              {academicYears.map((yr) => (
                <option key={yr.id} value={yr.id}>{yr.name}</option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-surface-tint outline-none flex-1 min-w-[160px]"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </section>

        {/* MAIN LAYOUT: Equal height cards and calendar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: 3 stat cards - Equal height with calendar */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full">
            {/* Card 1: Attendance Rate - Flexible height */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 flex items-center justify-between gap-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">analytics</span>
                </span>
                <div>
                  <p className="text-xs font-medium text-on-surface-variant">Attendance Rate</p>
                  <p className="text-2xl font-bold font-headline text-on-surface leading-tight">
                    {formatToTwoDecimals(attendance)}<span className="text-sm font-semibold">%</span>
                  </p>
                </div>
              </div>
              <div className="w-16 flex flex-col items-end gap-1 flex-shrink-0">
                <div className="w-full bg-surface-container rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(attendance, 100)}%` }}
                  />
                </div>
                <span className="text-2xs text-on-surface-variant">{formatToTwoDecimals(attendance)}% of 100%</span>
              </div>
            </div>

            {/* Card 2: Min Requirement - Flexible height */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 flex items-center justify-between gap-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">gavel</span>
                </span>
                <div>
                  <p className="text-xs font-medium text-on-surface-variant">Min. Requirement</p>
                  <p className="text-2xl font-bold font-headline text-on-surface leading-tight">
                    {minRequirement}<span className="text-sm font-semibold">%</span>
                  </p>
                  <p className="text-2xs text-on-surface-variant italic">
                    {requirementMet
                      ? `${formatToTwoDecimals(Math.abs(attendanceDifference))}% above limit`
                      : `${formatToTwoDecimals(Math.abs(attendanceDifference))}% below limit`}
                  </p>
                </div>
              </div>
              <span className={`text-2xs font-bold px-2 py-1 rounded-full self-start whitespace-nowrap flex-shrink-0 ${
                requirementMet ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
              }`}>
                {requirementMet ? "Met" : "Not Met"}
              </span>
            </div>

            {/* Card 3: Monthly Breakdown - Flexible height */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 flex-1">
              <p className="text-xs font-medium text-on-surface-variant mb-0.5">Monthly Breakdown</p>
              <p className="text-2xs text-on-surface-variant/60 mb-3">{monthWord} {year}</p>

              {monthlyDistribution.Present === 0 &&
               monthlyDistribution.Absent === 0 &&
               monthlyDistribution.Late === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No data for this month</p>
              ) : (
                <div className="flex items-end gap-3 h-16">
                  {[
                    { label: "Present", count: monthlyDistribution.Present, barColor: "bg-green-400", textColor: "text-green-600" },
                    { label: "Absent",  count: monthlyDistribution.Absent,  barColor: "bg-red-400",   textColor: "text-red-600"   },
                    { label: "Late",    count: monthlyDistribution.Late,    barColor: "bg-yellow-400",textColor: "text-yellow-600"},
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
                        <span className="text-3xs text-slate-400">{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Calendar - Same height container */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-4 sm:p-6 shadow-sm border border-outline-variant/10 flex flex-col">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <div>
                <h3 className="text-base font-bold font-headline text-on-surface">
                  {monthWord} {year}
                </h3>
                <p className="text-xs text-on-surface-variant">Visual Presence Log</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-surface-container rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Calendar Grid - Dynamic height based on weeks */}
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                  <div key={d} className="text-center text-3xs sm:text-2xs font-bold text-slate-400 pb-1">{d}</div>
                ))}
                {emptyDays.map((b, idx) => <div key={`b-${idx}`} />)}
                {days.map((day) => {
                  const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const record = attendanceMap?.[dateKey];
                  return (
                    <div
                      key={day}
                      className={`h-8 sm:h-10 rounded-lg flex items-center justify-center text-xs sm:text-xs font-semibold border transition-all cursor-default ${
                        record
                          ? (statusClasses[record.status] ?? "bg-surface-container border-surface-container")
                          : "bg-surface-container-lowest border-surface-container text-on-surface-variant"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-5 mt-5 pt-4 border-t border-surface-container-low">
                {[
                  { color: "bg-green-400",  label: "Present"   },
                  { color: "bg-red-400",    label: "Absent"    },
                  { color: "bg-yellow-400", label: "Late"      },
                  { color: "bg-slate-200",  label: "No Record" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-xs font-medium text-on-surface-variant">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}