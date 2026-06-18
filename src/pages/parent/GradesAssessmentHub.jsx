import React, { useState, useMemo } from "react";
import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import { useParent } from "../../context/ParentProvider";

// ─── grade helpers (matching student GradeCard exactly) ──────────────────────

const getGradeLetter = (pct) => {
  if (pct >= 90) return { letter: "A+", color: "bg-green-100 text-green-700" };
  if (pct >= 80) return { letter: "A",  color: "bg-blue-100 text-blue-700"  };
  if (pct >= 70) return { letter: "B+", color: "bg-yellow-100 text-yellow-700" };
  if (pct >= 60) return { letter: "B",  color: "bg-orange-100 text-orange-700" };
  return           { letter: "C",  color: "bg-red-100 text-red-700" };
};

const getOverallGrade = (avg) => {
  if (avg >= 90) return "A+";
  if (avg >= 80) return "A";
  if (avg >= 70) return "B+";
  if (avg >= 60) return "B";
  return "C";
};

// ─── helper: calc percentage from a grade record ────────────────────────────

const calcPct = (record) => {
  if (!record) return null;
  const obt = record.marks_obtained ?? record.obtained_marks ?? record.score ?? null;
  const tot = record.max_marks    ?? record.total_marks    ?? record.maximum_marks ?? null;
  if (obt != null && tot)
    return parseFloat(((parseFloat(obt) / parseFloat(tot)) * 100).toFixed(1));
  return parseFloat(record.percentage ?? record.percentage_score ?? 0);
};

// ─── helper: is exam a "midterm" type? ───────────────────────────────────────
//  Checks exam_name / exam_type string for common midterm keywords

const isMidterm = (record) => {
  const name = (
    record.exam_name ??
    record.exam_type ??
    record.exam?.name ??
    ""
  ).toLowerCase();
  return (
    name.includes("mid") ||
    name.includes("term 1") ||
    name.includes("first term") ||
    name.includes("half yearly") ||
    name.includes("unit 1")
  );
};

const isFinal = (record) => {
  const name = (
    record.exam_name ??
    record.exam_type ??
    record.exam?.name ??
    ""
  ).toLowerCase();
  return (
    name.includes("final") ||
    name.includes("term 2") ||
    name.includes("second term") ||
    name.includes("annual") ||
    name.includes("year end") ||
    name.includes("unit 2")
  );
};

// ─── subject icon map ────────────────────────────────────────────────────────

const SUBJECT_STYLES = {
  mathematics: { icon: "functions",   bg: "bg-blue-100",   text: "text-blue-700"   },
  math:        { icon: "functions",   bg: "bg-blue-100",   text: "text-blue-700"   },
  science:     { icon: "biotech",     bg: "bg-purple-100", text: "text-purple-700" },
  english:     { icon: "translate",   bg: "bg-orange-100", text: "text-orange-700" },
  history:     { icon: "history_edu", bg: "bg-teal-100",   text: "text-teal-700"   },
  geography:   { icon: "public",      bg: "bg-green-100",  text: "text-green-700"  },
  physics:     { icon: "bolt",        bg: "bg-yellow-100", text: "text-yellow-700" },
  chemistry:   { icon: "science",     bg: "bg-pink-100",   text: "text-pink-700"   },
  biology:     { icon: "ecology",     bg: "bg-lime-100",   text: "text-lime-700"   },
  social:      { icon: "public",      bg: "bg-teal-100",   text: "text-teal-700"   },
  hindi:       { icon: "translate",   bg: "bg-red-100",    text: "text-red-700"    },
  default:     { icon: "menu_book",   bg: "bg-slate-100",  text: "text-slate-700"  },
};

const getSubjectStyle = (name = "") => {
  const key = name.toLowerCase().split(" ")[0];
  return SUBJECT_STYLES[key] || SUBJECT_STYLES.default;
};

// ─── circular progress ───────────────────────────────────────────────────────

const CircleProgress = ({ percentage }) => {
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
      <circle
        className="text-surface-container-low"
        cx="80" cy="80" r={r}
        fill="transparent" stroke="currentColor" strokeWidth="8"
      />
      <circle
        className="text-primary"
        cx="80" cy="80" r={r}
        fill="transparent" stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
};

// ─── skeleton ────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
    <div className="h-10 bg-surface-container-low rounded w-64" />
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4 h-64 bg-surface-container-low rounded-lg" />
      <div className="col-span-8 h-64 bg-surface-container-low rounded-lg" />
      <div className="col-span-12 h-96 bg-surface-container-low rounded-lg" />
    </div>
  </div>
);

// ─── main ────────────────────────────────────────────────────────────────────

const GradesAssessmentHub = () => {
  const { grades, academic, profile, enrollment, loading } = useParent();

  // "midterm" | "final" — controls which exam rows show in table
  const [activeTab, setActiveTab] = useState("midterm");

  // subject id → name lookup
  const subjectMap = useMemo(() => {
    const map = {};
    (academic?.subs || []).forEach((s) => { map[s.id] = s.name; });
    return map;
  }, [academic]);

  // ── Detect which tabs have data so we auto-select the right one ──────────
  // Also classify every grade record as midterm / final / other
  const classifiedGrades = useMemo(() => {
    return (grades || []).map((g) => ({
      ...g,
      _isMidterm: isMidterm(g),
      _isFinal:   isFinal(g),
    }));
  }, [grades]);

  const hasMidtermData = useMemo(
    () => classifiedGrades.some((g) => g._isMidterm),
    [classifiedGrades]
  );
  const hasFinalData = useMemo(
    () => classifiedGrades.some((g) => g._isFinal),
    [classifiedGrades]
  );

  // ── Build rows for the ACTIVE tab ────────────────────────────────────────
  //
  // PROGRESS LOGIC (key part):
  //   • If activeTab === "midterm" → show midterm marks, compare vs nothing (flat)
  //     because midterm IS the first exam — nothing before it to compare.
  //   • If activeTab === "final"   → show final marks, compare vs midterm marks
  //     for same subject — this gives real ↑↓ progress.
  //   • If exam_name doesn't match midterm/final keywords (e.g. API has custom names):
  //     fall back to chronological order — latest vs second-latest record.
  //
  const subjectRows = useMemo(() => {
    if (!classifiedGrades.length) return [];

    // Group ALL records by subject id
    const bySubject = {};
    classifiedGrades.forEach((g) => {
      const subId = g.subject ?? g.subject_id ?? g.subject_detail?.id;
      if (subId == null) return;
      if (!bySubject[subId]) bySubject[subId] = [];
      bySubject[subId].push(g);
    });

    const rows = [];

    Object.entries(bySubject).forEach(([subId, allRecords]) => {
      // Subject name — prefer subject_name field directly (student API pattern)
      const subjectName =
        allRecords[0].subject_name ||
        subjectMap[subId] ||
        `Subject ${subId}`;

      const style = getSubjectStyle(subjectName);

      // Separate by exam type
      const midtermRecords = allRecords.filter((r) => r._isMidterm);
      const finalRecords   = allRecords.filter((r) => r._isFinal);
      const otherRecords   = allRecords.filter((r) => !r._isMidterm && !r._isFinal);

      // Pick the "current" record based on active tab
      let currentRecord = null;
      let previousRecord = null;

      if (activeTab === "midterm") {
        // Show midterm record. If no midterm keyword found, show first/only record.
        currentRecord  = midtermRecords[midtermRecords.length - 1]
          ?? otherRecords[0]
          ?? allRecords[0];
        previousRecord = null; // nothing before midterm to compare
      } else {
        // final tab
        currentRecord  = finalRecords[finalRecords.length - 1]
          ?? otherRecords[otherRecords.length - 1]
          ?? allRecords[allRecords.length - 1];
        // Previous = midterm (or second-last record if no midterm keyword data)
        previousRecord = midtermRecords[midtermRecords.length - 1]
          ?? (allRecords.length >= 2 ? allRecords[allRecords.length - 2] : null);
      }

      if (!currentRecord) return;

      // Marks from current record
      const obtained =
        currentRecord.marks_obtained ??
        currentRecord.obtained_marks ??
        currentRecord.score ??
        null;
      const total =
        currentRecord.max_marks ??
        currentRecord.total_marks ??
        currentRecord.maximum_marks ??
        null;

      const percentage = calcPct(currentRecord);
      const { letter, color } = getGradeLetter(percentage);

      // Progress vs previous
      let progressPct = "0";
      let progressDir = "flat";

      if (previousRecord) {
        const prevPct = calcPct(previousRecord);
        if (prevPct !== null) {
          const diff = percentage - prevPct;
          progressPct = Math.abs(diff).toFixed(1);
          if (diff > 0.05)       progressDir = "up";
          else if (diff < -0.05) progressDir = "down";
          else                   progressDir = "flat";
        }
      }

      // Remarks
      const rawRemarks =
        currentRecord.remarks ??
        currentRecord.teacher_comment ??
        currentRecord.comment ??
        "";
      const remarks =
        rawRemarks && rawRemarks.trim() !== ""
          ? rawRemarks.trim()
          : "No remarks provided.";

      // Exam label for display
      const examLabel =
        currentRecord.exam_name ??
        currentRecord.exam_type ??
        currentRecord.exam?.name ??
        "";

      rows.push({
        subjectName,
        obtained,
        total,
        percentage,
        letter,
        gradeColor: color,
        style,
        progressPct,
        progressDir,
        remarks,
        examLabel,
      });
    });

    // Sort by percentage descending
    return rows.sort((a, b) => b.percentage - a.percentage);
  }, [classifiedGrades, subjectMap, activeTab]);

  // Overall percentage — weighted average of current tab's rows
  const avgPercentage = useMemo(() => {
    if (!subjectRows.length) return 0;
    const hasMarks = subjectRows.every((r) => r.obtained != null && r.total);
    if (hasMarks) {
      const totalObt = subjectRows.reduce((s, r) => s + parseFloat(r.obtained), 0);
      const totalMax = subjectRows.reduce((s, r) => s + parseFloat(r.total), 0);
      return totalMax > 0
        ? parseFloat(((totalObt / totalMax) * 100).toFixed(1))
        : 0;
    }
    return parseFloat(
      (subjectRows.reduce((s, r) => s + r.percentage, 0) / subjectRows.length).toFixed(1)
    );
  }, [subjectRows]);

  const overallGrade = getOverallGrade(avgPercentage);

  // Best / weakest
  const sorted     = [...subjectRows].sort((a, b) => b.percentage - a.percentage);
  const bestSub    = sorted[0];
  const weakestSub = sorted[sorted.length - 1];

  const studentFirstName =
    profile?.user?.first_name || profile?.first_name || "Your child";
  const studentFullName =
    `${profile?.user?.first_name || profile?.first_name || "Student"} ${profile?.user?.last_name || profile?.last_name || ""}`.trim();
  const guardianId   = profile?.id || profile?.user?.id || "N/A";
  const className    = enrollment?.class_name  || academic?.current_class?.name  || "N/A";
  const sectionName  = enrollment?.section_name || academic?.current_section?.name || "N/A";

  const [downloading, setDownloading] = useState(false);

  // ── PDF Download ─────────────────────────────────────────────────────────
  const downloadReportCard = () => {
    setDownloading(true);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to download the report card.");
      setDownloading(false);
      return;
    }

    // Grade badge colour for print
    const badgeStyle = (letter) => {
      if (letter === "A+") return "background:#dcfce7;color:#166534;";
      if (letter === "A")  return "background:#dbeafe;color:#1e40af;";
      if (letter === "B+") return "background:#fef3c7;color:#92400e;";
      if (letter === "B")  return "background:#ffedd5;color:#9a3412;";
      return "background:#fee2e2;color:#991b1b;";
    };

    // Progress arrow for print
    const progressHTML = (row) => {
      if (row.progressDir === "up")
        return `<span style="color:#16a34a;font-weight:700;">▲ ${row.progressPct}%</span>`;
      if (row.progressDir === "down")
        return `<span style="color:#ef4444;font-weight:700;">▼ ${row.progressPct}%</span>`;
      return `<span style="color:#94a3b8;font-weight:600;">— 0%</span>`;
    };

    const examTabLabel = activeTab === "midterm" ? "Mid Term" : "Final";
    const passCount    = subjectRows.filter((r) => r.percentage >= 40).length;

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card — ${studentFullName}</title>
        <meta charset="UTF-8">
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background:#fff; padding:40px; color:#1e293b; }
          .container { max-width:960px; margin:0 auto; }

          /* Header */
          .header { text-align:center; padding-bottom:20px; border-bottom:3px solid #3b82f6; margin-bottom:24px; }
          .header h1 { font-size:26px; font-weight:800; color:#1e293b; letter-spacing:-0.5px; }
          .header h2 { font-size:16px; color:#64748b; font-weight:400; margin-top:4px; }
          .header p  { font-size:13px; color:#94a3b8; margin-top:4px; }

          /* Student info strip */
          .info-strip { display:flex; flex-wrap:wrap; gap:16px; background:#f8fafc; padding:14px 20px; border-radius:10px; margin-bottom:22px; }
          .info-item  { display:flex; flex-direction:column; gap:2px; }
          .info-label { font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.5px; }
          .info-value { font-size:13px; font-weight:700; color:#1e293b; }

          /* Summary cards */
          .summary { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:26px; }
          .card { padding:18px 20px; border-radius:12px; text-align:center; }
          .card.blue   { background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; }
          .card.green  { background:linear-gradient(135deg,#10b981,#059669); color:#fff; }
          .card.purple { background:linear-gradient(135deg,#8b5cf6,#7c3aed); color:#fff; }
          .card-label  { font-size:11px; opacity:.85; margin-bottom:6px; font-weight:600; }
          .card-value  { font-size:30px; font-weight:800; line-height:1; }
          .card-sub    { font-size:11px; opacity:.75; margin-top:4px; }

          /* Table */
          table { width:100%; border-collapse:collapse; margin-bottom:28px; }
          thead tr { background:#f1f5f9; }
          th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.5px; border-bottom:2px solid #e2e8f0; }
          td { padding:12px 14px; font-size:13px; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
          tr:hover td { background:#f8fafc; }
          .badge { display:inline-block; padding:3px 10px; border-radius:6px; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:.5px; }
          .pct   { font-weight:700; color:#3b82f6; }

          /* Signature */
          .signatures { display:flex; justify-content:space-between; margin-top:36px; padding-top:20px; border-top:1px solid #e2e8f0; }
          .sign-box   { text-align:center; width:180px; }
          .sign-line  { border-top:1px solid #cbd5e1; margin-bottom:7px; }
          .sign-label { font-size:12px; color:#64748b; }

          /* Footer */
          .footer { margin-top:24px; text-align:center; font-size:11px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:14px; }

          @media print {
            body { padding:20px; }
            .container { max-width:100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">

          <div class="header">
            <h1>ACADEMIC REPORT CARD</h1>
            <h2>${className} — ${sectionName} &nbsp;|&nbsp; ${examTabLabel} Examination</h2>
            <p>Academic Year ${new Date().getFullYear()}</p>
          </div>

          <div class="info-strip">
            <div class="info-item">
              <span class="info-label">Student Name</span>
              <span class="info-value">${studentFullName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Guardian ID</span>
              <span class="info-value">#${guardianId}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Class</span>
              <span class="info-value">${className}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Section</span>
              <span class="info-value">${sectionName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Exam</span>
              <span class="info-value">${examTabLabel}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Issue Date</span>
              <span class="info-value">${new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div class="summary">
            <div class="card blue">
              <div class="card-label">Overall Percentage</div>
              <div class="card-value">${avgPercentage}%</div>
              <div class="card-sub">Grade: ${overallGrade}</div>
            </div>
            <div class="card green">
              <div class="card-label">Subjects Passed</div>
              <div class="card-value">${passCount}</div>
              <div class="card-sub">Out of ${subjectRows.length}</div>
            </div>
            <div class="card purple">
              <div class="card-label">Top Subject</div>
              <div class="card-value" style="font-size:16px;margin-top:4px;">${sorted[0]?.subjectName || "—"}</div>
              <div class="card-sub">${sorted[0]?.percentage || 0}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks Obtained</th>
                <th>Max Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Progress</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${subjectRows.map((row) => `
                <tr>
                  <td><strong>${row.subjectName}</strong>${row.examLabel ? `<br><span style="font-size:11px;color:#94a3b8;">${row.examLabel}</span>` : ""}</td>
                  <td>${row.obtained != null ? parseFloat(row.obtained).toFixed(2) : "N/A"}</td>
                  <td>${row.total    != null ? parseFloat(row.total).toFixed(2)    : "N/A"}</td>
                  <td class="pct">${row.percentage}%</td>
                  <td><span class="badge" style="${badgeStyle(row.letter)}">${row.letter}</span></td>
                  <td>${progressHTML(row)}</td>
                  <td style="font-style:italic;color:#64748b;">${row.remarks}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="signatures">
            <div class="sign-box"><div class="sign-line"></div><div class="sign-label">Class Teacher</div></div>
            <div class="sign-box"><div class="sign-line"></div><div class="sign-label">Principal</div></div>
            <div class="sign-box"><div class="sign-line"></div><div class="sign-label">Parent / Guardian</div></div>
          </div>

          <div class="footer">
            <p>System-generated report card &nbsp;·&nbsp; Generated on ${new Date().toLocaleString()}</p>
            <p>Academic Architect — School ERP</p>
          </div>

        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 800);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    setTimeout(() => setDownloading(false), 1200);
  };

  if (loading) return <DashboardLayout><Skeleton /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">
              Grades &amp; Report Card
            </h1>
            <p className="text-on-surface-variant max-w-lg">
              Track academic progress, view detailed subject performance, and
              access formal evaluation reports.
            </p>
          </div>
          <button
            onClick={downloadReportCard}
            disabled={downloading}
            className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            <span className="material-symbols-outlined text-xl">
              {downloading ? "hourglass_top" : "download"}
            </span>
            {downloading ? "Preparing PDF…" : "Download Full Report Card (PDF)"}
          </button>
        </div>

        {/* ── Bento Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Overall Performance */}
          <div className="md:col-span-4 bg-surface-container-lowest rounded-lg p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
              Overall Performance
            </span>
            <div className="relative">
              <CircleProgress percentage={avgPercentage} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-on-surface leading-none">
                  {avgPercentage}%
                </span>
                <span className="text-lg font-bold text-primary mt-1">
                  {overallGrade}
                </span>
              </div>
            </div>
            <p className="mt-6 text-on-surface-variant font-medium">
              {subjectRows.length} subject{subjectRows.length !== 1 ? "s" : ""} evaluated this term.
            </p>
          </div>

          {/* AI Insights */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-lg p-8 border border-transparent hover:border-surface-variant transition-all flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="material-symbols-outlined text-tertiary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    psychology
                  </span>
                  <h3 className="text-xl font-bold text-on-surface">
                    AI Performance Insight
                  </h3>
                </div>
                <p className="text-lg text-on-surface font-medium leading-relaxed max-w-2xl">
                  {bestSub ? (
                    <>
                      "{studentFirstName} is showing{" "}
                      <span className="text-primary font-bold">
                        strong performance in {bestSub.subjectName}
                      </span>{" "}
                      with {bestSub.percentage}%.
                      {weakestSub && weakestSub.subjectName !== bestSub.subjectName
                        ? ` More focus on ${weakestSub.subjectName} (${weakestSub.percentage}%) could boost the overall grade.`
                        : " Keep up the great work!"}
                      "
                    </>
                  ) : (
                    '"No grade data available yet for this term."'
                  )}
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="bg-tertiary-container/10 p-4 rounded-xl">
                  <span className="material-symbols-outlined text-tertiary text-4xl">
                    trending_up
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-container-low p-4 rounded-md">
                <span className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Focus Area
                </span>
                <span className="text-on-surface font-semibold">
                  {weakestSub?.subjectName || "—"}
                </span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-md">
                <span className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Strength
                </span>
                <span className="text-on-surface font-semibold">
                  {bestSub?.subjectName || "—"}
                </span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-md">
                <span className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Class / Section
                </span>
                <span className="text-on-surface font-semibold">
                  {enrollment?.section_name || enrollment?.class_name || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Subject-wise Table */}
          <div className="md:col-span-12 bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm mt-4">
            <div className="p-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold text-on-surface">
                  Detailed Assessment
                </h3>
                {/* Progress note — only show on Final tab */}
                {activeTab === "final" && hasMidtermData && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    Progress shows change vs Midterm exam
                  </p>
                )}
                {activeTab === "midterm" && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    Switch to Final tab to see progress comparison
                  </p>
                )}
              </div>

              {/* Tab switcher */}
              <div className="flex items-center bg-surface-container-low rounded-xl p-1">
                <button
                  onClick={() => setActiveTab("midterm")}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === "midterm"
                      ? "bg-white shadow-sm text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Midterm
                  {hasMidtermData && (
                    <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-primary inline-block align-middle" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("final")}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "final"
                      ? "bg-white shadow-sm text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Final
                  {hasFinalData && (
                    <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-primary inline-block align-middle" />
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">
                      Progress
                      {activeTab === "final" && hasMidtermData && (
                        <span className="block text-2xs font-normal normal-case text-on-surface-variant/60">
                          vs Midterm
                        </span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low font-body">
                  {subjectRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-on-surface-variant">
                        No grade records found for this term.
                      </td>
                    </tr>
                  ) : (
                    subjectRows.map((row) => (
                      <tr
                        key={row.subjectName}
                        className="hover:bg-surface-container-low/30 transition-colors"
                      >
                        {/* Subject */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${row.style.bg} flex items-center justify-center ${row.style.text}`}>
                              <span className="material-symbols-outlined">{row.style.icon}</span>
                            </div>
                            <div>
                              <span className="font-bold text-on-surface block">{row.subjectName}</span>
                              {row.examLabel && (
                                <span className="text-xs text-on-surface-variant">{row.examLabel}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Marks — 53.00 / 100.00 format */}
                        <td className="px-8 py-6 text-on-surface font-semibold">
                          {row.obtained != null && row.total ? (
                            <>
                              {parseFloat(row.obtained).toFixed(2)}
                              <span className="text-on-surface-variant font-normal text-xs">
                                {" / "}{parseFloat(row.total).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-on-surface-variant font-normal text-sm">N/A</span>
                          )}
                        </td>

                        {/* Percentage */}
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold text-primary">{row.percentage}%</span>
                        </td>

                        {/* Grade badge */}
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest ${row.gradeColor}`}>
                            {row.letter}
                          </span>
                        </td>

                        {/* Remarks */}
                        <td className="px-8 py-6 text-on-surface-variant italic text-sm leading-relaxed max-w-xs">
                          "{row.remarks}"
                        </td>

                        {/* Progress */}
                        <td className="px-8 py-6 text-right">
                          {row.progressDir === "up" && (
                            <span className="text-green-600 font-bold flex items-center justify-end gap-1">
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                arrow_upward
                              </span>
                              {row.progressPct}%
                            </span>
                          )}
                          {row.progressDir === "down" && (
                            <span className="text-red-500 font-bold flex items-center justify-end gap-1">
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                arrow_downward
                              </span>
                              {row.progressPct}%
                            </span>
                          )}
                          {row.progressDir === "flat" && (
                            <span className="text-slate-400 font-semibold flex items-center justify-end gap-1">
                              — 0%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 bg-surface-container-low/30 text-center">
              <p className="text-sm text-on-surface-variant">
                Grades are verified by the Academic Board.
              </p>
            </div>
          </div>

          {/* Bottom Cards */}
          <div className="md:col-span-12 grid md:grid-cols-2 gap-6 mt-6">

            {/* Teacher Note */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-md bg-gradient-to-br from-blue-700 to-blue-600">
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-3">Teacher's Note</h4>
                <p className="opacity-95 leading-relaxed mb-8 max-w-lg">
                  {bestSub
                    ? `${studentFirstName} shows great potential, especially in ${bestSub.subjectName}. Keep encouraging consistent study habits at home.`
                    : "No teacher note available yet for this term."}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Class Teacher</p>
                    <p className="text-xs text-blue-100">
                      {enrollment?.section_name || enrollment?.class_name || "Homeroom"}
                    </p>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined absolute bottom-2 right-4 text-white/10 text-[110px]">
                format_quote
              </span>
            </div>

            {/* Recommended Learning */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-md bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold mb-3">Recommended Learning</h4>
                <p className="opacity-95 leading-relaxed mb-6 max-w-xs">
                  {weakestSub
                    ? `Improve ${weakestSub.subjectName} scores with curated practice resources.`
                    : "Explore curated learning materials to support academic growth."}
                </p>
                <button className="flex items-center gap-2 font-semibold hover:gap-3 transition-all">
                  View Materials
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              <span className="material-symbols-outlined text-white/20 text-[80px] hidden sm:block">
                menu_book
              </span>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GradesAssessmentHub;