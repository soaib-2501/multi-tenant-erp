import React, { useMemo } from "react";
import { useParent } from "../../../context/ParentProvider";

/**
 * ── How this works ──────────────────────────────────────────────────────
 * 1. dashboard.grades.results  → [{ exam_name, subject_name, marks_obtained, max_marks }]
 * 2. dashboard.exams.results   → [{ name, start_date, end_date, academic_year_name }]
 *
 * StudentGrade has NO date field of its own — it only links to an Exam
 * via `exam_name`. The Exam itself holds `start_date`. So we match grades
 * to exams by name to recover the month each grade belongs to, then
 * average all subject percentages per month to build a true trend line.
 */

const MONTH_LABELS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const PerformanceChart = () => {
  const { dashboard, loading } = useParent();

  const { points, monthLabels, yearLabel, hasData } = useMemo(() => {
    const grades = dashboard?.grades?.results || [];
    const exams  = dashboard?.exams?.results || [];

    if (!grades.length || !exams.length) {
      return { points: [], monthLabels: [], yearLabel: new Date().getFullYear(), hasData: false };
    }

    // Build a lookup: exam name -> start_date
    const examDateByName = {};
    exams.forEach((e) => {
      if (e.name && e.start_date) examDateByName[e.name] = new Date(e.start_date);
    });

    // Group grades by "YYYY-MM" using the matched exam date
    const monthBuckets = {}; // key: "2026-2" -> { totalObtained, totalMax, date }

    grades.forEach((g) => {
      const examDate = examDateByName[g.exam_name];
      if (!examDate) return; // skip grades whose exam couldn't be matched

      const key = `${examDate.getFullYear()}-${examDate.getMonth()}`;
      if (!monthBuckets[key]) {
        monthBuckets[key] = {
          totalObtained: 0,
          totalMax: 0,
          year: examDate.getFullYear(),
          month: examDate.getMonth(),
        };
      }
      monthBuckets[key].totalObtained += parseFloat(g.marks_obtained || 0);
      monthBuckets[key].totalMax      += parseFloat(g.max_marks || 0);
    });

    // Sort chronologically, take the most recent 6 months that have data
    const sortedKeys = Object.keys(monthBuckets).sort((a, b) => {
      const [ay, am] = a.split("-").map(Number);
      const [by, bm] = b.split("-").map(Number);
      return ay !== by ? ay - by : am - bm;
    });

    const recentKeys = sortedKeys.slice(-6); // last up to 6 months with actual exam data

    const pts = recentKeys.map((key) => {
      const b = monthBuckets[key];
      const pct = b.totalMax > 0 ? Math.round((b.totalObtained / b.totalMax) * 100) : 0;
      return { pct, month: b.month, year: b.year };
    });

    const labels = pts.map((p) => MONTH_LABELS[p.month]);
    const latestYear = pts.length > 0 ? pts[pts.length - 1].year : new Date().getFullYear();

    return { points: pts, monthLabels: labels, yearLabel: latestYear, hasData: pts.length > 0 };
  }, [dashboard]);

  // ── Build SVG path from real percentage points ───────────────────────────
  const { linePath, areaPath, dotPositions } = useMemo(() => {
    if (points.length === 0) return { linePath: "", areaPath: "", dotPositions: [] };

    const W = 1000, H = 300, PAD_TOP = 30, PAD_BOTTOM = 30;
    const usableH = H - PAD_TOP - PAD_BOTTOM;

    // If only 1 point, still render a flat reference line at its value
    const n = points.length;
    const stepX = n > 1 ? W / (n - 1) : 0;

    const coords = points.map((p, i) => {
      const x = n > 1 ? i * stepX : W / 2;
      // Higher % => higher on chart => smaller y. Clamp 0-100.
      const clamped = Math.max(0, Math.min(100, p.pct));
      const y = PAD_TOP + (1 - clamped / 100) * usableH;
      return { x, y, pct: p.pct };
    });

    let line = `M${coords[0].x},${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const midX = (prev.x + curr.x) / 2;
      line += ` Q${midX},${prev.y} ${curr.x},${curr.y}`;
    }

    const area = `${line} L${coords[coords.length - 1].x},${H} L0,${H} Z`;

    return { linePath: line, areaPath: area, dotPositions: coords };
  }, [points]);

  // ── Skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/5 animate-pulse">
        <div className="h-6 w-48 bg-surface-container-low rounded mb-2" />
        <div className="h-4 w-64 bg-surface-container-low rounded mb-10" />
        <div className="h-64 bg-surface-container-low rounded" />
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/5">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h3 className="text-xl font-bold font-headline mb-1">Performance Trend</h3>
          <p className="text-sm text-on-surface-variant">
            Average score across all subjects, exam by exam
          </p>
        </div>
        {hasData && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs font-medium text-on-surface-variant">{yearLabel}</span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-sm text-on-surface-variant">
          Not enough exam data yet to show a performance trend.
        </div>
      ) : (
        <div className="h-64 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            {/* Background Grid */}
            <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="1000" y1="50" y2="50" />
            <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="1000" y1="125" y2="125" />
            <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="1000" y1="200" y2="200" />
            <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="1000" y1="275" y2="275" />

            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2170e4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#2170e4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area fill under the real line */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Real performance line */}
            <path d={linePath} fill="none" stroke="#0058be" strokeLinecap="round" strokeWidth="4" />

            {/* Data points with real % shown on hover via <title> */}
            {dotPositions.map((d, i) => (
              <g key={i}>
                <circle cx={d.x} cy={d.y} fill="#0058be" r="6" stroke="white" strokeWidth="2">
                  <title>{`${monthLabels[i]}: ${d.pct}%`}</title>
                </circle>
              </g>
            ))}
          </svg>

          {/* Month labels — last one (most recent) highlighted */}
          <div className="flex justify-between mt-4 px-2">
            {monthLabels.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className={`text-xs font-semibold ${
                  i === monthLabels.length - 1
                    ? "text-primary font-bold underline underline-offset-4"
                    : "text-on-surface-variant"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;