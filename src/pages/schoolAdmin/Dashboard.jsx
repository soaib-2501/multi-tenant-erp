import React, { useState, useEffect, useMemo } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosClient";
import { schoolAdminApi } from "../../services/schoolAdminApi";

/* ─────────────────────────────────────────────
   Skeleton Shimmer Style Injection
───────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("skeleton-style")) {
  const s = document.createElement("style");
  s.id = "skeleton-style";
  s.textContent = `@keyframes skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(s);
}

const SHIMMER = {
  background: "linear-gradient(90deg,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 25%,color-mix(in srgb,var(--color-outline-variant) 28%,var(--color-surface-container-lowest)) 50%,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.4s ease infinite",
};

function Sk({ w, h, r = 6, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...SHIMMER, ...style }} />;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 md:px-8 pt-4 pb-12 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Sk w={180} h={28} />
          <Sk w={300} h={16} style={{ marginTop: 6 }} />
        </div>
        <Sk w={120} h={40} r={8} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-xl p-4 border border-outline-variant/10 bg-surface-container-lowest" style={{ minHeight: 90 }}>
            <div className="flex items-start justify-between"><Sk w={28} h={28} r={6} /><Sk w={45} h={16} r={999} /></div>
            <div className="flex flex-col gap-1.5 mt-2"><Sk w={70} h={10} /><Sk w={50} h={22} /></div>
          </div>
        ))}
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 flex flex-col lg:flex-row gap-6 min-h-[350px]">
        <div className="flex-1 flex flex-col gap-4">
          <Sk w={150} h={18} />
          <Sk w={220} h={12} />
          <div className="flex-1 flex items-end gap-2 pt-6">
            {Array.from({ length: 12 }, (_, i) => (
              <Sk key={i} style={{ flex: 1, height: `${30 + Math.abs(Math.sin(i * 0.9)) * 50}%`, borderRadius: "4px 4px 0 0" }} />
            ))}
          </div>
        </div>
        <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-outline-variant/10 pt-4 lg:pt-0 lg:pl-6 flex flex-col gap-3">
          <Sk w={120} h={16} />
          <Sk h={40} r={8} />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-1.5"><Sk w={80} h={12} /><Sk h={4} r={999} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stat Card (Responsive & Fluid Match)
───────────────────────────────────────────── */
function StatCard({ icon, label, value, badge, badgeColor, accentColor }) {
  return (
    <div className="relative overflow-hidden rounded-xl p-4 flex flex-col justify-between transition-all duration-200"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid color-mix(in srgb,var(--color-outline-variant) 12%,transparent)",
        borderLeft: `3px solid ${accentColor}`,
        minHeight: "84px"
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px color-mix(in srgb,${accentColor} 12%,transparent)`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
      <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full opacity-[0.04] pointer-events-none" style={{ background: accentColor }} />
      <div className="flex items-start justify-between mb-2">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `color-mix(in srgb,${accentColor} 12%,transparent)` }}>
          <span className="material-symbols-outlined" style={{ color: accentColor, fontSize: "16px" }}>{icon}</span>
        </div>
        {badge && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none uppercase tracking-wider"
            style={{ background: `color-mix(in srgb,${badgeColor || accentColor} 12%,transparent)`, color: badgeColor || accentColor }}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-on-surface-variant)" }}>{label}</p>
        <p className="text-xl font-headline font-black leading-none" style={{ color: "var(--color-on-surface)" }}>{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const MONTH_ORDER = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function safeMax(arr, fn = x => x) {
  return arr.reduce((m, x) => { const v = fn(x); return v > m ? v : m; }, 0);
}

function fmtCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

function toMonthAbbr(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  if (/^\d{4}-\d{2}/.test(s)) return MONTH_ORDER[parseInt(s.split("-")[1], 10) - 1] ?? null;
  const parsed = new Date(`${s} 1, 2000`);
  if (!isNaN(parsed)) return MONTH_ORDER[parsed.getMonth()];
  return s.slice(0, 3).toUpperCase();
}

function buildBarsFromTrends(trendsData) {
  const arr = Array.isArray(trendsData) ? trendsData : trendsData?.results ?? trendsData?.data ?? [];
  const countMap = {};
  for (const item of arr) {
    const raw = item.month ?? item.month_year ?? item.date ?? item.period ?? item.label;
    const cnt = Number(item.count ?? item.student_count ?? item.students ?? item.total ?? item.value ?? 0);
    const abbr = toMonthAbbr(raw);
    if (abbr) countMap[abbr] = (countMap[abbr] || 0) + cnt;
  }
  const counts = Object.values(countMap);
  const maxCount = counts.reduce((m, v) => v > m ? v : m, 1);

  return MONTH_ORDER.map(m => {
    const count = countMap[m];
    const hasData = count !== undefined && count > 0;
    return { m, count: hasData ? count : 0, v: hasData ? Math.round((count / maxCount) * 100) : 0, hasData };
  });
}

/* ─────────────────────────────────────────────
   Class Breakdown Panel
───────────────────────────────────────────── */
const CLASS_COLORS = ["var(--color-primary)", "var(--color-secondary)", "var(--color-tertiary)", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#be185d", "#047857", "#b45309"];

function ClassBreakdownPanel({ classLevels, sections, totalStudents, selectedMonth, enrollmentBars }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const enriched = useMemo(() => {
    const totalSections = sections.length || 1;
    return classLevels.map(cl => {
      const clSections = sections.filter(s => s.class_level === cl.id || s.class_level?.id === cl.id || s.class_level_name === (cl.name || cl.level_name));
      const sectionCount = clSections.length;
      const studentEst = sectionCount > 0 ? Math.round((sectionCount / totalSections) * totalStudents) : 0;
      return {
        id: cl.id,
        name: cl.name || cl.level_name || `Class ${cl.id}`,
        sectionCount,
        studentEst,
        isEstimated: !cl.student_count,
        realCount: cl.student_count ?? null,
      };
    });
  }, [classLevels, sections, totalStudents]);

  const maxStudents = useMemo(() => enriched.reduce((m, c) => { const v = c.realCount ?? c.studentEst; return v > m ? v : m; }, 1), [enriched]);
  const monthBar = enrollmentBars.find(b => b.m === selectedMonth);
  const isEstimated = enriched.some(c => c.isEstimated && c.sectionCount > 0);

  return (
    <div className="flex flex-col gap-4 w-full lg:w-64 shrink-0">
      <div>
        <h3 className="text-sm font-headline font-bold text-on-surface">Class Breakdown</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          {selectedMonth ? `${selectedMonth} · ${totalStudents.toLocaleString()} students` : `${totalStudents.toLocaleString()} students total`}
          {isEstimated && <span className="text-outline/70"> (est.)</span>}
        </p>
      </div>

      {/* Selected month highlight */}
      {monthBar?.hasData && (
        <div className="rounded-xl p-3 bg-primary/[0.06] border border-primary/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-primary">{selectedMonth} Enrollment</span>
            <span className="text-sm font-black text-primary">{monthBar.count.toLocaleString()}</span>
          </div>
          <div className="w-full bg-primary/15 rounded-full h-1">
            <div style={{ width: `${monthBar.v}%` }} className="h-full bg-primary rounded-full transition-all duration-300" />
          </div>
          <p className="text-[10px] mt-1 text-primary/70 font-medium">
            {monthBar.v}% of peak · {fmtCount(monthBar.count)} registered
          </p>
        </div>
      )}

      <div className="h-px bg-outline-variant/10" />

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[280px] pr-1">
        {enriched.length === 0 ? (
          <div className="py-6 text-center text-on-surface-variant opacity-60">
            <span className="material-symbols-outlined text-xl block mb-1">class</span>
            <p className="text-xs">No class data available</p>
          </div>
        ) : enriched.map((cl, i) => {
          const isHov = hoveredIdx === i;
          const color = CLASS_COLORS[i % CLASS_COLORS.length];
          const displayVal = cl.realCount ?? cl.studentEst;
          const fillPct = maxStudents > 0 ? Math.round((displayVal / maxStudents) * 100) : 0;

          return (
            <div key={cl.id || i} className="rounded-xl p-2 transition-all duration-150 cursor-default border border-transparent"
              style={{ background: isHov ? `color-mix(in srgb,${color} 8%,transparent)` : "transparent", borderColor: isHov ? `color-mix(in srgb,${color} 15%,transparent)` : "transparent" }}
              onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-on-surface truncate flex-1 mr-2" title={cl.name}>{cl.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {cl.sectionCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded leading-none" style={{ background: `color-mix(in srgb,${color} 10%,transparent)`, color }}>
                      {cl.sectionCount}s
                    </span>
                  )}
                  <span className="text-xs font-black text-on-surface">
                    {displayVal > 0 ? fmtCount(displayVal) : "–"}
                    {cl.isEstimated && displayVal > 0 && <span className="text-[9px] font-normal ml-0.5 text-on-surface-variant/70">est</span>}
                  </span>
                </div>
              </div>
              <div className="w-full bg-outline-variant/10 rounded-full h-1">
                <div style={{ width: `${fillPct}%`, background: color }} className="h-full rounded-full transition-all duration-300" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-2 border-t border-outline-variant/10 flex items-center justify-between text-xs text-on-surface-variant font-medium">
        <span>{sections.length} sections</span>
        <span>{classLevels.length} classes</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Analytics Card
───────────────────────────────────────────── */
function AnalyticsCard({ allBars, classLevels, sections, totalStudents }) {
  const [hovered, setHovered] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Always show all 12 months – no toggle
  const bars = allBars;

  // Auto-select last data month
  useEffect(() => {
    const visible = bars.filter(b => b.hasData);
    if (!selectedMonth || !visible.find(b => b.m === selectedMonth)) {
      setSelectedMonth(visible[visible.length - 1]?.m ?? null);
    }
  }, [bars]);

  const yLabels = useMemo(() => {
    const maxCount = safeMax(allBars, b => b.count) || 1;
    return [maxCount, Math.round(maxCount * 0.75), Math.round(maxCount * 0.5), Math.round(maxCount * 0.25), 0].map(v => fmtCount(v));
  }, [allBars]);

  const tooltipBar = hovered !== null ? bars[hovered] : null;
  const noTrendsData = allBars.every(b => !b.hasData);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-4 md:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8">
      
      {/* Chart Block */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h3 className="text-base font-headline font-bold text-on-surface">Enrollment Growth</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {noTrendsData ? `${totalStudents.toLocaleString()} students · current snapshot` : "Live registrations from trends API"}
          </p>
        </div>

        {/* Dynamic Context Tooltip Bar */}
        <div className="h-6 mb-3 text-xs flex items-center">
          {tooltipBar ? (
            tooltipBar.hasData ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-bold text-on-surface">{tooltipBar.m}:</span>
                <span className="font-bold text-primary">{tooltipBar.count.toLocaleString()} students</span>
                <span className="text-on-surface-variant text-[11px]">— click to inspect</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-outline" />
                <span>{tooltipBar.m}: Upcoming — no data yet</span>
              </div>
            )
          ) : selectedMonth ? (
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span>Viewing: <span className="text-primary font-extrabold">{selectedMonth}</span> — click any active bar to filter</span>
            </div>
          ) : null}
        </div>

        {/* Main Render Visualization */}
        <div className="flex gap-3 flex-1 min-h-[220px]">
          <div className="flex flex-col justify-between pb-6 text-right w-8 text-[10px] font-semibold text-outline">
            {yLabels.map((lbl, i) => <span key={i}>{lbl}</span>)}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              {[0, 25, 50, 75, 100].map(p => (
                <div key={p} className="absolute w-full border-b border-outline-variant/10" style={{ bottom: `${p}%` }} />
              ))}

              <div className="absolute inset-0 flex items-end gap-1.5 sm:gap-2">
                {bars.map((b, i) => {
                  const isSel = b.m === selectedMonth;
                  const isHov = hovered === i;
                  return (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end" style={{ cursor: b.hasData ? "pointer" : "default" }}
                      onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} onClick={() => b.hasData && setSelectedMonth(b.m)}>
                      {b.hasData ? (
                        <div className="w-full rounded-t-md transition-all duration-200"
                          style={{
                            height: `${Math.max(b.v, 4)}%`,
                            background: isSel ? "var(--color-secondary)" : isHov ? "var(--color-primary)" : "color-mix(in srgb,var(--color-primary) 20%,var(--color-surface-container-high))",
                            boxShadow: (isSel || isHov) ? `0 -2px 10px color-mix(in srgb,${isSel ? "var(--color-secondary)" : "var(--color-primary)"} 25%,transparent)` : "none",
                            transform: isHov ? "scaleY(1.03)" : "none",
                            transformOrigin: "bottom",
                            outline: isSel ? "2px solid var(--color-secondary)" : "none",
                            outlineOffset: "1px"
                          }} />
                      ) : (
                        <div className="w-full border-t-2 border-dashed border-outline-variant/30 bg-transparent h-[15%]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis labels */}
            <div className="flex pt-2 gap-1.5 sm:gap-2">
              {bars.map((b, i) => (
                <div key={i} className="flex-1 text-center text-[10px] font-bold">
                  <span style={{
                    color: b.m === selectedMonth ? "var(--color-secondary)" : !b.hasData ? "color-mix(in srgb,var(--color-outline) 40%,transparent)" : "var(--color-outline)"
                  }} className={b.m === selectedMonth ? "font-black scale-105 inline-block" : ""}>
                    {b.m}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Structural Visual Divider */}
      <div className="hidden lg:block w-px bg-outline-variant/10 self-stretch my-2" />

      {/* Right Breakdown Component */}
      <ClassBreakdownPanel classLevels={classLevels} sections={sections} totalStudents={totalStudents} selectedMonth={selectedMonth || ""} enrollmentBars={allBars} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Entry Component Layout
───────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const [studentsCount, setStudentsCount] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [classRes, sectionRes, studentsRes, teachersRes] = await Promise.all([
          api.get("academics/class-levels/"),
          api.get("academics/sections/"),
          api.get("profiles/students/"),
          api.get("profiles/teachers/"),
        ]);

        setClassLevels(classRes.data?.results ?? (Array.isArray(classRes.data) ? classRes.data : []));
        setSections(sectionRes.data?.results ?? (Array.isArray(sectionRes.data) ? sectionRes.data : []));

        const totalStu = studentsRes.data?.count ?? studentsRes.data?.results?.length ?? (Array.isArray(studentsRes.data) ? studentsRes.data.length : 0);
        setStudentsCount(totalStu);

        try {
          const activeRes = await api.get("profiles/students/?is_archived=false&page_size=1");
          setActiveStudents(activeRes.data?.count ?? activeRes.data?.results?.length ?? totalStu);
        } catch {
          const stuArr = studentsRes.data?.results ?? (Array.isArray(studentsRes.data) ? studentsRes.data : []);
          const activeFallback = stuArr.filter(s => s.is_archived === false || s.status === "ACTIVE" || s.is_active === true).length;
          setActiveStudents(activeFallback || totalStu);
        }

        setTeachersCount(teachersRes.data?.count ?? teachersRes.data?.results?.length ?? (Array.isArray(teachersRes.data) ? teachersRes.data.length : 0));

        try {
          const statsRes = await schoolAdminApi.getDashboardStats();
          if (statsRes?.total_students) setStudentsCount(statsRes.total_students);
          if (statsRes?.active_students) setActiveStudents(statsRes.active_students);
          if (statsRes?.total_teachers) setTeachersCount(statsRes.total_teachers);
        } catch {}

        try {
          const trendsRes = await schoolAdminApi.getEnrollmentTrends();
          const arr = trendsRes?.results ?? trendsRes?.data ?? trendsRes;
          setTrendsData(Array.isArray(arr) ? arr : []);
        } catch {}

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <SchoolLayout><DashboardSkeleton /></SchoolLayout>;

  const allBars = buildBarsFromTrends(trendsData);
  if (!allBars.some(b => b.hasData) && studentsCount > 0) {
    const nowMonth = MONTH_ORDER[new Date().getMonth()];
    const idx = allBars.findIndex(b => b.m === nowMonth);
    if (idx !== -1) allBars[idx] = { m: nowMonth, count: studentsCount, v: 100, hasData: true };
  }
  
// ── Only 4 stat cards – Engagement removed ──
  const stats = [
    { icon: "school", label: "Total Enrolled", value: studentsCount.toLocaleString(), badge: activeStudents > 0 && activeStudents < studentsCount ? `${activeStudents.toLocaleString()} active` : "all active", badgeColor: "var(--color-primary)", accentColor: "var(--color-primary)" },
    { icon: "supervisor_account", label: "Total Teachers", value: teachersCount.toLocaleString(), badge: "Staff", badgeColor: "var(--color-secondary)", accentColor: "var(--color-secondary)" },
    { icon: "meeting_room", label: "Class Levels", value: classLevels.length, accentColor: "var(--color-tertiary)" },
    { icon: "groups", label: "Active Sections", value: sections.length, accentColor: "#16a34a" },
  ];

  const quickActions = [
    { label: "Add Student", path: "/school-admin/students/add", icon: "person_add" },
    { label: "Add Teacher", path: "/school-admin/teachers/create", icon: "group_add" },
    { label: "Subject", path: "/school-admin/create-subject", icon: "menu_book" },
    { label: "Section", path: "/school-admin/create-section", icon: "groups" },
    { label: "Class Level", path: "/school-admin/class-levels", icon: "meeting_room" },
  ];

  return (
    <SchoolLayout>
      <div className="flex flex-col gap-6 px-4 md:px-8 pt-4 pb-12">
        
        {/* Responsive Header Block matching AcademicYears style */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Academic Overview</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Welcome back, Administrator. Here's what's happening today.
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <button onClick={() => setShowQuickActions(p => !p)}
              className="sm:w-auto whitespace-nowrap flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Quick Add
            </button>
            {showQuickActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowQuickActions(false)} />
                <div className="absolute lg:right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden z-20 py-1 border border-outline-variant/10"
                  style={{ background: "var(--color-surface-container-lowest)" }}>
                  {quickActions.map(a => (
                    <button key={a.label}
                      onClick={() => {
                        setShowQuickActions(false);
                        navigate(a.path, { state: { fromQuickAdd: true } });
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-primary/[0.06] transition-colors text-on-surface">
                      <span className="material-symbols-outlined text-sm opacity-70">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* 4 Stat Cards Grid — Responsive columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Flex Charts/Analysis Segment */}
        <AnalyticsCard allBars={allBars} classLevels={classLevels} sections={sections} totalStudents={studentsCount} />

      </div>
    </SchoolLayout>
  );
}