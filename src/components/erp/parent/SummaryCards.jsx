import React, { useMemo } from "react";
import { useParent } from "../../../context/ParentProvider";

// ─── grade letter (same as GradesAssessmentHub) ───────────────────────────────
const getGradeLetter = (pct) => {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  return "C";
};

const SummaryCards = () => {
  const { dashboard, attendanceRecords, loading } = useParent();

  // ── 1. Attendance % + MoM ────────────────────────────────────────────────
  const { overallAttendance, attendanceMoM } = useMemo(() => {
    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0)
      return { overallAttendance: 0, attendanceMoM: null };

    const present = attendanceRecords.filter((r) => r.status === "Present").length;
    const overall = Math.round((present / attendanceRecords.length) * 100);

    const now   = new Date();
    const curM  = now.getMonth();
    const curY  = now.getFullYear();
    const prevM = curM === 0 ? 11 : curM - 1;
    const prevY = curM === 0 ? curY - 1 : curY;

    const pctOf = (recs) => {
      if (!recs.length) return null;
      return Math.round((recs.filter((r) => r.status === "Present").length / recs.length) * 100);
    };

    const thisPct = pctOf(
      attendanceRecords.filter((r) => {
        const d = new Date(r.date);
        return d.getFullYear() === curY && d.getMonth() === curM;
      })
    );
    const lastPct = pctOf(
      attendanceRecords.filter((r) => {
        const d = new Date(r.date);
        return d.getFullYear() === prevY && d.getMonth() === prevM;
      })
    );

    const mom = thisPct !== null && lastPct !== null ? thisPct - lastPct : null;
    return { overallAttendance: overall, attendanceMoM: mom };
  }, [attendanceRecords]);

  // ── 2. Avg Grade from grades results ─────────────────────────────────────
  const { avgPercentage, avgGradeLetter } = useMemo(() => {
    const grades = dashboard?.grades?.results || [];
    if (!grades.length) return { avgPercentage: 0, avgGradeLetter: "—" };

    const totalObt = grades.reduce((s, g) => s + parseFloat(g.marks_obtained || 0), 0);
    const totalMax = grades.reduce((s, g) => s + parseFloat(g.max_marks || 0), 0);
    const pct = totalMax > 0 ? parseFloat(((totalObt / totalMax) * 100).toFixed(1)) : 0;
    return { avgPercentage: pct, avgGradeLetter: getGradeLetter(pct) };
  }, [dashboard]);

  // ── 3. Pending Assignments ────────────────────────────────────────────────
  const { pendingCount, hasDueSoon } = useMemo(() => {
    const assignments = dashboard?.assignments?.results || [];
    const now = new Date();
    const pending = assignments.filter((a) => {
      const status = (a.status || a.submission_status || "").toLowerCase();
      return !["submitted", "graded", "completed"].includes(status);
    });
    const dueSoon = pending.some((a) => {
      if (!a.due_date) return false;
      const diff = (new Date(a.due_date) - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3;
    });
    return { pendingCount: pending.length, hasDueSoon: dueSoon };
  }, [dashboard]);

  // ── 4. Upcoming Exams ─────────────────────────────────────────────────────
  const { upcomingExamCount, nextExamLabel } = useMemo(() => {
    const exams = dashboard?.exams?.results || [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = exams
      .filter((e) => new Date(e.start_date ?? e.date ?? e.end_date) >= now)
      .sort(
        (a, b) =>
          new Date(a.start_date ?? a.date ?? a.end_date) -
          new Date(b.start_date ?? b.date ?? b.end_date)
      );

    let nextLabel = "None";
    if (upcoming.length > 0) {
      const nextDate = new Date(upcoming[0].start_date ?? upcoming[0].date ?? upcoming[0].end_date);
      const diff = Math.round((nextDate - now) / (1000 * 60 * 60 * 24));
      if (diff === 0)      nextLabel = "Today";
      else if (diff === 1) nextLabel = "Tomorrow";
      else                 nextLabel = nextDate.toLocaleDateString("en-US", { weekday: "short" });
    }

    return { upcomingExamCount: upcoming.length, nextExamLabel: nextLabel };
  }, [dashboard]);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/10 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 bg-surface-container-low rounded-md" />
              <div className="w-14 h-3 bg-surface-container-low rounded" />
            </div>
            <div className="w-24 h-3 bg-surface-container-low rounded mb-2" />
            <div className="w-16 h-8 bg-surface-container-low rounded" />
          </div>
        ))}
      </section>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* Attendance */}
      <div className="bg-surface-container-lowest p-6 rounded-lg group hover:bg-primary/5 transition-colors border border-outline-variant/10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-surface-container-low rounded-md group-hover:bg-primary-fixed-dim transition-colors">
            <span className="material-symbols-outlined text-primary">calendar_check</span>
          </div>
          {attendanceMoM !== null ? (
            <span className={`font-bold text-xs uppercase tracking-widest ${attendanceMoM >= 0 ? "text-tertiary" : "text-error"}`}>
              {attendanceMoM >= 0 ? "+" : ""}{attendanceMoM}% MoM
            </span>
          ) : (
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Overall</span>
          )}
        </div>
        <p className="text-on-surface-variant text-sm font-medium">Attendance</p>
        <h3 className="text-3xl font-extrabold text-on-surface mt-1">{overallAttendance}%</h3>
      </div>

      {/* Avg Grade */}
      <div className="bg-surface-container-lowest p-6 rounded-lg group hover:bg-secondary/5 transition-colors border border-outline-variant/10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-surface-container-low rounded-md group-hover:bg-secondary-fixed-dim transition-colors">
            <span className="material-symbols-outlined text-secondary">star_rate</span>
          </div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest">{avgPercentage}%</span>
        </div>
        <p className="text-on-surface-variant text-sm font-medium">Avg Grade</p>
        <h3 className="text-3xl font-extrabold text-on-surface mt-1">{avgGradeLetter}</h3>
      </div>

      {/* Pending Assignments */}
      <div className="bg-surface-container-lowest p-6 rounded-lg group hover:bg-tertiary/5 transition-colors border border-outline-variant/10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-surface-container-low rounded-md group-hover:bg-tertiary-fixed-dim transition-colors">
            <span className="material-symbols-outlined text-tertiary">pending_actions</span>
          </div>
          <span className={`font-bold text-xs uppercase tracking-widest ${hasDueSoon ? "text-error" : pendingCount === 0 ? "text-tertiary" : "text-on-surface-variant"}`}>
            {hasDueSoon ? "Due Soon" : pendingCount === 0 ? "All Done" : "Pending"}
          </span>
        </div>
        <p className="text-on-surface-variant text-sm font-medium">Pending Assignments</p>
        <h3 className="text-3xl font-extrabold text-on-surface mt-1">{pendingCount}</h3>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-surface-container-lowest p-6 rounded-lg group hover:bg-primary/5 transition-colors border border-outline-variant/10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-surface-container-low rounded-md group-hover:bg-primary-fixed-dim transition-colors">
            <span className="material-symbols-outlined text-primary">event_note</span>
          </div>
          <span className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">
            {upcomingExamCount > 0 ? `Next: ${nextExamLabel}` : "None"}
          </span>
        </div>
        <p className="text-on-surface-variant text-sm font-medium">Upcoming Exams</p>
        <h3 className="text-3xl font-extrabold text-on-surface mt-1">{upcomingExamCount}</h3>
      </div>

    </section>
  );
};

export default SummaryCards;