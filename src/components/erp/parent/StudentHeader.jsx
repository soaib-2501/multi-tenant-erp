import React, { useState } from "react";
import { useParent } from "../../../context/ParentProvider";

const StudentHeader = () => {
  const { profile, enrollment, dashboard, loading } = useParent();
  const [downloading, setDownloading] = useState(false);

  // ── Derived values ────────────────────────────────────────────────────────
  const displayName = (() => {
    if (profile?.user?.first_name)
      return `${profile.user.first_name} ${profile.user.last_name || ""}`.trim();
    if (profile?.first_name)
      return `${profile.first_name} ${profile.last_name || ""}`.trim();
    return "Student";
  })();

  const classSection =
    enrollment?.class_level_name && enrollment?.section_name
      ? `${enrollment.class_level_name} – ${enrollment.section_name}`
      : enrollment?.class_name && enrollment?.section_name
      ? `${enrollment.class_name} – ${enrollment.section_name}`
      : enrollment?.class_name || enrollment?.class_level_name || "—";

  const schoolName =
    enrollment?.school_name ||
    profile?.school_name ||
    "School";

  const teacherEmail =
    enrollment?.class_teacher_email ||
    enrollment?.teacher_email ||
    null;

  // ── Grade-letter helper (same scale as student GradeCard) ────────────────
  const getGradeDetails = (obtained, max) => {
    const pct = max > 0 ? (obtained / max) * 100 : 0;
    if (pct >= 90) return { letter: "A+", cls: "grade-Aplus" };
    if (pct >= 80) return { letter: "A",  cls: "grade-A" };
    if (pct >= 70) return { letter: "B+", cls: "grade-Bplus" };
    if (pct >= 60) return { letter: "B",  cls: "grade-B" };
    return                { letter: "C",  cls: "grade-C" };
  };

  // ── Download Report Card (mirrors student GradeCard.downloadReportCard) ──
  const downloadReportCard = () => {
    setDownloading(true);

    const grades = dashboard?.grades?.results || [];
    const exams  = dashboard?.exams?.results  || [];

    const pastExams = exams
      .filter((e) => new Date(e.end_date) < new Date())
      .sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
    const latestExam = pastExams.length > 0 ? pastExams[0] : null;

    let overallPercentage = 0;
    if (grades.length > 0) {
      const totalMarks = grades.reduce((sum, g) => sum + parseFloat(g.marks_obtained || 0), 0);
      const totalMax   = grades.reduce((sum, g) => sum + parseFloat(g.max_marks || 0), 0);
      overallPercentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;
    }

    const studentName  = displayName || "Student";
    const enrollmentNo = profile?.enrollment_number || "N/A";
    const className    = enrollment?.class_level_name || enrollment?.class_name || "N/A";
    const section      = enrollment?.section_name || "N/A";
    const rollNumber   = enrollment?.roll_number || "N/A";

    const printWindow = window.open("", "_blank");

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card - ${studentName}</title>
        <meta charset="UTF-8">
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background:#fff; padding:40px; color:#333; }
          .report-container { max-width:1200px; margin:0 auto; }
          .header { text-align:center; margin-bottom:30px; border-bottom:3px solid #3b82f6; padding-bottom:20px; }
          .header h1 { font-size:28px; color:#1e293b; margin-bottom:5px; }
          .header h2 { font-size:20px; color:#64748b; font-weight:normal; }
          .header p  { font-size:14px; color:#94a3b8; margin-top:5px; }
          .student-info { background:#f8fafc; padding:15px 20px; border-radius:12px; margin-bottom:25px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:15px; }
          .info-item { display:flex; gap:10px; }
          .info-label { font-weight:600; color:#64748b; font-size:12px; }
          .info-value { font-weight:700; color:#1e293b; font-size:14px; }
          .summary { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:30px; }
          .summary-card { background:linear-gradient(135deg,#3b82f6,#2563eb); color:white; padding:20px; border-radius:16px; text-align:center; }
          .summary-card h4 { font-size:12px; opacity:0.9; margin-bottom:8px; }
          .summary-card .value { font-size:32px; font-weight:bold; }
          .summary-card .sub { font-size:11px; opacity:0.8; margin-top:5px; }
          .grades-table { width:100%; border-collapse:collapse; margin-bottom:30px; }
          .grades-table th { background:#f1f5f9; padding:12px; text-align:left; font-size:12px; font-weight:600; color:#475569; text-transform:uppercase; border-bottom:2px solid #e2e8f0; }
          .grades-table td { padding:12px; font-size:13px; border-bottom:1px solid #e2e8f0; }
          .grade-badge { display:inline-block; padding:4px 12px; border-radius:20px; font-weight:bold; font-size:11px; }
          .grade-Aplus { background:#dcfce7; color:#166534; }
          .grade-A     { background:#dbeafe; color:#1e40af; }
          .grade-Bplus { background:#fef3c7; color:#92400e; }
          .grade-B     { background:#ffedd5; color:#9a3412; }
          .grade-C     { background:#fee2e2; color:#991b1b; }
          .footer { margin-top:30px; padding-top:20px; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; color:#94a3b8; }
          .signature { display:flex; justify-content:space-between; margin-top:40px; padding-top:20px; }
          .sign-line { text-align:center; width:200px; }
          .sign-line .line { border-top:1px solid #cbd5e1; margin-bottom:8px; }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>ACADEMIC REPORT CARD</h1>
            <h2>${className} - ${section}</h2>
            <p>Academic Year ${new Date().getFullYear()}</p>
          </div>
          <div class="student-info">
            <div class="info-item"><span class="info-label">Student Name:</span><span class="info-value">${studentName}</span></div>
            <div class="info-item"><span class="info-label">Enrollment No:</span><span class="info-value">${enrollmentNo}</span></div>
            <div class="info-item"><span class="info-label">Roll Number:</span><span class="info-value">${rollNumber}</span></div>
            <div class="info-item"><span class="info-label">Issue Date:</span><span class="info-value">${new Date().toLocaleDateString()}</span></div>
          </div>
          <div class="summary">
            <div class="summary-card">
              <h4>Overall Percentage</h4>
              <div class="value">${overallPercentage}%</div>
              <div class="sub">${grades.length} subjects evaluated</div>
            </div>
            <div class="summary-card" style="background:linear-gradient(135deg,#10b981,#059669);">
              <h4>Subjects Passed</h4>
              <div class="value">${grades.filter(g => parseFloat(g.marks_obtained) >= parseFloat(g.max_marks) * 0.4).length}</div>
              <div class="sub">Out of ${grades.length}</div>
            </div>
            <div class="summary-card" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);">
              <h4>Latest Exam</h4>
              <div class="value" style="font-size:18px;">${latestExam?.name || 'N/A'}</div>
              <div class="sub">${latestExam ? new Date(latestExam.end_date).toLocaleDateString() : ''}</div>
            </div>
          </div>
          <table class="grades-table">
            <thead>
              <tr><th>Subject</th><th>Exam Type</th><th>Marks Obtained</th><th>Max Marks</th><th>Percentage</th><th>Grade</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              ${grades.map(grade => {
                const obtained = parseFloat(grade.marks_obtained || 0);
                const max      = parseFloat(grade.max_marks || 0);
                const pct      = max > 0 ? ((obtained / max) * 100).toFixed(1) : "0.0";
                const gradeDetails = getGradeDetails(obtained, max);
                return `<tr>
                  <td><strong>${grade.subject_name}</strong></td>
                  <td>${grade.exam_name}</td>
                  <td>${grade.marks_obtained}</td>
                  <td>${grade.max_marks}</td>
                  <td><strong>${pct}%</strong></td>
                  <td><span class="grade-badge ${gradeDetails.cls}">${gradeDetails.letter}</span></td>
                  <td style="font-style:italic;color:#64748b;">${grade.remarks || 'No remarks'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          <div class="signature">
            <div class="sign-line"><div class="line"></div><div>Class Teacher</div></div>
            <div class="sign-line"><div class="line"></div><div>Principal</div></div>
            <div class="sign-line"><div class="line"></div><div>Parent Signature</div></div>
          </div>
          <div class="footer">
            <p>This is a system-generated report card. Generated on ${new Date().toLocaleString()}</p>
            <p>ScholarFlow Academic Management System</p>
          </div>
        </div>
        <script>window.print(); setTimeout(() => { window.close(); }, 500);</script>
      </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    setTimeout(() => setDownloading(false), 1000);
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center animate-pulse">
        <div className="md:col-span-2 space-y-3">
          <div className="h-8 bg-surface-container-low rounded w-56" />
          <div className="flex gap-4">
            <div className="h-4 bg-surface-container-low rounded w-28" />
            <div className="h-4 bg-surface-container-low rounded w-20" />
            <div className="h-4 bg-surface-container-low rounded w-32" />
          </div>
        </div>
        <div className="flex md:justify-end gap-3">
          <div className="h-10 w-36 bg-surface-container-low rounded-md" />
          <div className="h-10 w-36 bg-surface-container-low rounded-md" />
        </div>
      </section>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      <div className="md:col-span-2 space-y-2">
        <h2 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">
          Parent Dashboard
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">person</span>
            <span className="font-semibold">{displayName}</span>
          </div>

          <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/50" />

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">school</span>
            <span>{classSection}</span>
          </div>

          <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/50" />

          <div className="flex items-center gap-2 text-primary font-medium">
            <span>{schoolName}</span>
          </div>

        </div>
      </div>

      <div className="flex md:justify-end gap-3">
        <button
          onClick={downloadReportCard}
          disabled={downloading}
          className="bg-surface-container-high text-primary px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-surface-variant transition-colors active:scale-95 duration-75 disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">
            {downloading ? "hourglass_empty" : "picture_as_pdf"}
          </span>
          {downloading ? "Preparing..." : "Download Report"}
        </button>

        {teacherEmail ? (
          <a
            href={`mailto:${teacherEmail}`}
            className="bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-md font-semibold text-sm shadow-md hover:brightness-110 transition-all active:scale-95 duration-75"
          >
            Contact Teacher
          </a>
        ) : (
          <button
            disabled
            title="Teacher email not available"
            className="bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-md font-semibold text-sm shadow-md opacity-60 cursor-not-allowed"
          >
            Contact Teacher
          </button>
        )}
      </div>
    </section>
  );
};

export default StudentHeader;