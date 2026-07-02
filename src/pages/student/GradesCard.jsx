import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function GradeCardSkeleton() {
  return (
    <MainLayout title="Grades & Report Card">
      <section className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-gray-200 animate-pulse rounded-xl min-h-[180px]" />
          <div className="bg-white rounded-xl p-8 shadow-sm space-y-4">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-40 h-7" />
            <Skeleton className="w-32 h-3" />
            <Skeleton className="w-full h-2 rounded-full mt-4" />
            <div className="flex justify-between">
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-10 h-3" />
            </div>
            <Skeleton className="w-36 h-6 rounded-full mt-2" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Skeleton className="w-48 h-6" />
            <div className="flex gap-3">
              <Skeleton className="w-32 h-9 rounded-md" />
              <Skeleton className="w-32 h-9 rounded-md" />
              <Skeleton className="w-10 h-9 rounded-md" />
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-4 grid grid-cols-6 gap-4">
            {["w-20","w-20","w-24","w-16","w-28","w-20"].map((w, i) => (
              <Skeleton key={i} className={`${w} h-3`} />
            ))}
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="px-8 py-5 grid grid-cols-6 gap-4 border-t border-gray-50 items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <Skeleton className="w-24 h-4" />
              </div>
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-10 h-6 rounded-md" />
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-28 h-3 ml-auto" />
            </div>
          ))}
          <div className="p-6 border-t border-gray-100">
            <Skeleton className="w-40 h-3" />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

/* ─── Exam name shortener ───────────────────────────────────────────────── */
// Maps common long exam names to short codes for table display.
// Falls back to the original name if no pattern matches.
function shortenExamName(name = "") {
  const n = name.toLowerCase();
  if (n.includes("mid") && n.includes("term")) return "MT Exam";
  if (n.includes("final")) return "Final Exam";
  if (n.includes("unit") && n.includes("test")) return "Unit Test";
  if (n.includes("quarter")) return "Quarterly";
  if (n.includes("half") && n.includes("yearly")) return "Half Yearly";
  if (n.includes("annual")) return "Annual Exam";
  if (n.includes("pre") && n.includes("board")) return "Pre-Board";
  return name;
}

/* ─── Detailed Feedback Modal ───────────────────────────────────────────── */
function FeedbackModal({ grade, gradeDetails, iconDetails, onClose }) {
  const pct = ((parseFloat(grade.marks_obtained) / parseFloat(grade.max_marks)) * 100).toFixed(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconDetails.bg}`}>
              <span className="material-symbols-outlined">{iconDetails.icon}</span>
            </div>
            <div>
              <h2 className="text-sm font-bold font-headline text-on-surface">{grade.subject_name}</h2>
              <p className="text-xs text-on-surface-variant">{shortenExamName(grade.exam_name)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-surface-container-low rounded-xl py-3">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Marks</p>
              <p className="text-lg font-bold text-on-surface mt-1">
                {grade.marks_obtained}<span className="text-xs text-on-surface-variant">/{grade.max_marks}</span>
              </p>
            </div>
            <div className="bg-surface-container-low rounded-xl py-3">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Percentage</p>
              <p className="text-lg font-bold text-primary mt-1">{pct}%</p>
            </div>
            <div className="bg-surface-container-low rounded-xl py-3">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Grade</p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md font-bold text-xs uppercase tracking-widest ${gradeDetails.color}`}>
                {gradeDetails.letter}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Teacher Remarks</p>
            <p className="text-sm text-on-surface italic leading-relaxed bg-surface-container-low/60 rounded-xl p-4">
              &quot;{grade.remarks || "No remarks provided for this assessment."}&quot;
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GradeCard() {
  const { dashboard, academic, profile, loading } = useStudent();
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedExam, setSelectedExam] = useState("all");
  const [downloading, setDownloading] = useState(false);
  const [feedbackGrade, setFeedbackGrade] = useState(null);

  if (loading) return <GradeCardSkeleton />;

  const grades = dashboard?.grades?.results || [];
  const exams = dashboard?.exams?.results || [];
  // De-duplicate by name — backend's /academics/subjects/ can return multiple rows
  // for the same subject (e.g. one per section), which would otherwise show
  // "English", "English" twice in the filter dropdown.
  const rawSubjects = academic?.subs || [];
  const subjects = Array.from(
    new Map(rawSubjects.map((s) => [s.name, s])).values()
  );

  // ── Calculate overall percentage directly from marks ──
  let overallPercentage = 0;
  if (grades.length > 0) {
    const totalMarks = grades.reduce((sum, g) => sum + parseFloat(g.marks_obtained), 0);
    const totalMax   = grades.reduce((sum, g) => sum + parseFloat(g.max_marks), 0);
    overallPercentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;
  }

  const pastExams = exams
    .filter((e) => new Date(e.end_date) < new Date())
    .sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
  const latestExam = pastExams.length > 0 ? pastExams[0] : null;

  const getGradeDetails = (obtained, max) => {
    const pct = (obtained / max) * 100;
    if (pct >= 90) return { letter: "A+", color: "bg-green-100 text-green-700" };
    if (pct >= 80) return { letter: "A",  color: "bg-blue-100 text-blue-700" };
    if (pct >= 70) return { letter: "B+", color: "bg-yellow-100 text-yellow-700" };
    if (pct >= 60) return { letter: "B",  color: "bg-orange-100 text-orange-700" };
    return               { letter: "C",  color: "bg-red-100 text-red-700" };
  };

  const getSubjectIcon = (name) => {
    const n = name?.toLowerCase();
    if (n?.includes("math"))                        return { icon: "calculate",     bg: "bg-blue-50 text-blue-600" };
    if (n?.includes("phys"))                        return { icon: "rocket_launch", bg: "bg-purple-50 text-purple-600" };
    if (n?.includes("comp") || n?.includes("code")) return { icon: "code",          bg: "bg-orange-50 text-orange-600" };
    if (n?.includes("eng")  || n?.includes("lit"))  return { icon: "history_edu",   bg: "bg-indigo-50 text-indigo-600" };
    return                                                 { icon: "menu_book",      bg: "bg-slate-100 text-slate-600" };
  };

  const filteredGrades = grades.filter((grade) => {
    const matchesSubject = selectedSubject === "all" || grade.subject_name === selectedSubject;
    const matchesExam    = selectedExam    === "all" || grade.exam    === selectedExam;
    return matchesSubject && matchesExam;
  });

  // ── Download PDF Report ──
  const downloadReportCard = () => {
    setDownloading(true);
    const printWindow = window.open('', '_blank');
    const studentName   = `${profile?.first_name || 'Student'} ${profile?.last_name || ''}`;
    const enrollmentNo  = profile?.enrollment_number || 'N/A';
    const className     = academic?.current_class?.name || 'N/A';
    const section       = academic?.current_section?.name || 'N/A';

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
            <div class="info-item"><span class="info-label">Roll Number:</span><span class="info-value">${academic?.roll_number || 'N/A'}</span></div>
            <div class="info-item"><span class="info-label">Issue Date:</span><span class="info-value">${new Date().toLocaleDateString()}</span></div>
          </div>
          <div class="summary">
            <div class="summary-card">
              <h4>Overall Percentage</h4>
              <div class="value">${overallPercentage}%</div>
              <div class="sub">${filteredGrades.length} subjects evaluated</div>
            </div>
            <div class="summary-card" style="background:linear-gradient(135deg,#10b981,#059669);">
              <h4>Subjects Passed</h4>
              <div class="value">${filteredGrades.filter(g => parseFloat(g.marks_obtained) >= parseFloat(g.max_marks) * 0.4).length}</div>
              <div class="sub">Out of ${filteredGrades.length}</div>
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
              ${filteredGrades.map(grade => {
                const pct = ((parseFloat(grade.marks_obtained) / parseFloat(grade.max_marks)) * 100).toFixed(1);
                const gradeDetails = getGradeDetails(parseFloat(grade.marks_obtained), parseFloat(grade.max_marks));
                const gradeClass = gradeDetails.letter === 'A+' ? 'grade-Aplus'
                  : gradeDetails.letter === 'A'  ? 'grade-A'
                  : gradeDetails.letter === 'B+' ? 'grade-Bplus'
                  : gradeDetails.letter === 'B'  ? 'grade-B' : 'grade-C';
                return `<tr>
                  <td><strong>${grade.subject_name}</strong></td>
                  <td>${grade.exam_name}</td>
                  <td>${grade.marks_obtained}</td>
                  <td>${grade.max_marks}</td>
                  <td><strong>${pct}%</strong></td>
                  <td><span class="grade-badge ${gradeClass}">${gradeDetails.letter}</span></td>
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

  // ── Download CSV ──
  const downloadCSVReport = () => {
    const headers = ['Subject', 'Exam Type', 'Marks Obtained', 'Max Marks', 'Percentage', 'Grade', 'Remarks'];
    const rows = filteredGrades.map(grade => {
      const pct = ((parseFloat(grade.marks_obtained) / parseFloat(grade.max_marks)) * 100).toFixed(1);
      const gradeDetails = getGradeDetails(parseFloat(grade.marks_obtained), parseFloat(grade.max_marks));
      return [grade.subject_name, grade.exam_name, grade.marks_obtained, grade.max_marks, `${pct}%`, gradeDetails.letter, grade.remarks || 'No remarks'];
    });
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Report_Card_${profile?.first_name || 'Student'}_${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="Grades & Report Card">
      <section className="p-8">
        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 primary-gradient rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-lg font-headline font-semibold opacity-90">Academic Performance Summary</h3>
                {/* ── PERCENTAGE instead of GPA ── */}
                <p className="text-5xl font-headline font-extrabold mt-2 tracking-tight">{overallPercentage}%</p>
                <p className="text-sm opacity-75 mt-1">Overall Percentage</p>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={downloadCSVReport}
                  className="bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-md text-sm font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">table_chart</span>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div>
              <span className="text-xs font-bold text-secondary tracking-widest uppercase">Term Progress</span>
              <h4 className="text-2xl font-headline font-bold text-on-surface mt-2">{latestExam ? shortenExamName(latestExam.name) : "No Exams Yet"}</h4>
              <p className="text-sm text-on-surface-variant">Completed on {latestExam ? new Date(latestExam.end_date).toLocaleDateString() : "--"}</p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: latestExam ? "100%" : "0%" }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs font-semibold text-on-surface-variant">Completion</span>
                <span className="text-xs font-bold text-secondary">{latestExam ? "100%" : "0%"}</span>
              </div>
            </div>
            <div className="mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: `'FILL' 1` }}>auto_awesome</span>
                AI Insight: Excelling in STEM
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-headline font-bold text-on-surface">Subject-wise Breakdown</h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-48 bg-surface-container-low border-none rounded-md text-sm py-2 px-4 focus:ring-2 focus:ring-surface-tint"
              >
                <option value="all">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                     {sub.name}
                  </option>
                ))}
              </select>

              <select
                 value={selectedExam}
                 onChange={(e) => setSelectedExam(e.target.value)}
                 className="w-full sm:w-48 bg-surface-container-low border-none rounded-md text-sm py-2 px-4 focus:ring-2 focus:ring-surface-container-lowest"
              >
                <option value="all">All Exams</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {shortenExamName(exam.name)}
                  </option>
                ))}
              </select>

              <button
                className="h-10 sm:w-10 w-full flex items-center justify-center rounded-md bg-surface-container-low hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                   filter_list
                </span>
              </button>

            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low/50">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Exam Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Marks Obtained</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Teacher Remarks</th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredGrades.map((grade) => {
                  const gradeDetails = getGradeDetails(parseFloat(grade.marks_obtained), parseFloat(grade.max_marks));
                  const iconDetails  = getSubjectIcon(grade.subject_name);
                  const pct = ((parseFloat(grade.marks_obtained) / parseFloat(grade.max_marks)) * 100).toFixed(1);
                  return (
                    <tr key={grade.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconDetails.bg}`}>
                            <span className="material-symbols-outlined">{iconDetails.icon}</span>
                          </div>
                          <span className="font-bold text-on-surface">{grade.subject_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-on-surface-variant font-medium">{shortenExamName(grade.exam_name)}</td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-bold text-on-surface">{grade.marks_obtained} / {grade.max_marks}</span>
                      </td>
                      {/* ── PERCENTAGE column ── */}
                      <td className="px-6 py-6">
                        <span className="text-sm font-bold text-primary">{pct}%</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-md font-bold text-xs uppercase tracking-widest ${gradeDetails.color}`}>
                          {gradeDetails.letter}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-on-surface-variant italic leading-relaxed max-w-xs">
                        &quot;{grade.remarks || "No remarks provided."}&quot;
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button
                          onClick={() => setFeedbackGrade({ grade, gradeDetails, iconDetails })}
                          className="text-blue-700 hover:text-blue-900 font-semibold text-sm hover:underline transition-all"
                        >
                          View detailed feedback
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredGrades.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-on-surface-variant">
                      No grades found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-surface-container-low/20 border-t border-surface-container flex justify-between items-center rounded-b-xl">
            <p className="text-xs font-medium text-on-surface-variant italic">
              Showing {filteredGrades.length} subjects graded.
            </p>
            <button
              onClick={downloadReportCard}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              {downloading ? 'Preparing PDF...' : 'Download PDF Report'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Detailed Feedback Modal ── */}
      {feedbackGrade && (
        <FeedbackModal
          grade={feedbackGrade.grade}
          gradeDetails={feedbackGrade.gradeDetails}
          iconDetails={feedbackGrade.iconDetails}
          onClose={() => setFeedbackGrade(null)}
        />
      )}
    </MainLayout>
  );
}