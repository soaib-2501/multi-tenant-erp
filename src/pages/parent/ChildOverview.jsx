import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import { useParent } from "../../context/ParentProvider";

// Maps subject name keywords → { bg color, icon }
const SubjectIcon = ({ name = "" }) => {
  const n = name.toLowerCase();

  // Science / Biology / Physics / Chemistry
  if (n.includes("science") || n.includes("biology") || n.includes("physics") || n.includes("chemistry")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
        </svg>
      </div>
    );
  }

  // Hindi / Sanskrit / Urdu / language with translation icon
  if (n.includes("hindi") || n.includes("sanskrit") || n.includes("urdu")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
        </svg>
      </div>
    );
  }

  // Mathematics / Math / Algebra / Geometry
  if (n.includes("math") || n.includes("algebra") || n.includes("geometry") || n.includes("calculus")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18M12 3v18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>
        </svg>
      </div>
    );
  }

  // Social Studies / SST / History / Geography / Civics
  if (n.includes("social") || n.includes("sst") || n.includes("history") || n.includes("geography") || n.includes("civics")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
        </svg>
      </div>
    );
  }

  // English / Literature / Writing
  if (n.includes("english") || n.includes("literature") || n.includes("writing")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
        </svg>
      </div>
    );
  }

  // Computer / IT / Technology
  if (n.includes("computer") || n.includes("it") || n.includes("technology") || n.includes("coding")) {
    return (
      <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      </div>
    );
  }

  // Default fallback — generic book icon
  return (
    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    </div>
  );
};

const ChildOverview = () => {
  const navigate = useNavigate();

  const {
    mapping,
    profile,
    dashboard,
    attendanceRecords,
    grades,
    loading,
  } = useParent();

  // ─── Derived data (no fetch, no token) ───────────────────────────────────────

  const childData = useMemo(() => {
    if (!profile && !mapping) return null;

    // Name: prefer mapping.student_name, fall back to profile fields
    const name =
      mapping?.student_name ||
      `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
      "Student";

    // Roll / enrollment number
    const rollNumber = profile?.enrollment_number || "N/A";

    // Grade label from enrollment or attendance record class level name
    const grade =
      profile?.class_level_name ||
      profile?.section_name ||
      dashboard?.class_level_name ||
      "Grade Unknown";

    // Profile picture
    const profilePicUrl =
      profile?.profile_picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;

    // ── Attendance ──────────────────────────────────────────────────────────────
    // Prefer pre-aggregated dashboard value; fall back to computing from records
    let attendancePercentage = 0;
    if (dashboard?.attendance?.percentage != null) {
      attendancePercentage = Math.round(dashboard.attendance.percentage);
    } else if (attendanceRecords.length > 0) {
      const presentCount = attendanceRecords.filter(
        (r) => r.status === "Present"
      ).length;
      attendancePercentage = Math.round(
        (presentCount / attendanceRecords.length) * 100
      );
    }

    // ── Class teacher ──────────────────────────────────────────────────────────
    const teacherName =
      dashboard?.class_teacher_name ||
      profile?.class_teacher_name ||
      "Not Assigned";

    // ── Grades / subjects ──────────────────────────────────────────────────────
    const gradesList = Array.isArray(grades) ? grades : [];

    const numericScores = gradesList
      .map((g) => {
        const obtained = parseFloat(g.marks_obtained);
        const max = parseFloat(g.max_marks) || 100;
        return (obtained / max) * 100;
      })
      .filter((n) => !isNaN(n));

    const avgScoreNum =
      numericScores.length > 0
        ? Math.round(
            numericScores.reduce((a, b) => a + b, 0) / numericScores.length
          )
        : 0;

    // Matches GradesAssessmentHub.getOverallGrade — keeps both pages in sync
    const avgGradeLetter =
      numericScores.length === 0
        ? "N/A"
        : avgScoreNum >= 90
        ? "A+"
        : avgScoreNum >= 80
        ? "A"
        : avgScoreNum >= 70
        ? "B+"
        : avgScoreNum >= 60
        ? "B"
        : "C";

    const subjects = gradesList.map((gradeItem, index) => {
      const obtained = parseFloat(gradeItem.marks_obtained) || 0;
      const max = parseFloat(gradeItem.max_marks) || 100;
      const scoreNum = Math.round((obtained / max) * 100);

      // trend: "up" | "flat" | "down"
      const trend =
        scoreNum >= 80 ? "up" : scoreNum < 70 ? "down" : "flat";

      return {
        id: gradeItem.id || index,
        name: gradeItem.subject_name || "Unknown Subject",
        score: scoreNum,
        level:
          scoreNum >= 80
            ? "Excellent"
            : scoreNum >= 70
            ? "Good"
            : "Needs Improvement",
        levelColor:
          scoreNum >= 80
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : scoreNum >= 70
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "bg-red-50 text-red-500 border border-red-200",
        trend,
      };
    });

    return {
      name,
      rollNumber,
      grade,
      profilePicUrl,
      stats: {
        totalSubjects: gradesList.length,
        avgGrade: avgGradeLetter,
        attendance: attendancePercentage,
      },
      teacherRemark:
        "Consistently demonstrates a strong grasp of the material.",
      teacherName,
      subjects,
    };
  }, [profile, mapping, dashboard, attendanceRecords, grades]);

  // ─── Loading state ────────────────────────────────────────────────────────────

  if (loading || !childData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  // ─── UI ───────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-blue-800">Child Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Tracking {childData.name}'s academic progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Student profile card ─────────────────────────────────────────── */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-7 flex flex-col items-center text-center border border-slate-200/70 shadow-sm">
            <img
              alt={childData.name}
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-slate-50"
              src={childData.profilePicUrl}
            />
            <span className="mt-3 inline-block bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold">
              {childData.grade}
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {childData.name}
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Roll #{childData.rollNumber}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2.5 w-full">
              <button
                onClick={() => navigate("/parent/grades")}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
              >
                <span className="material-symbols-outlined text-base">badge</span>
                Report Card
              </button>
              <button
                onClick={() => navigate("/parent/attendance")}
                className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 transition"
              >
                <span className="material-symbols-outlined text-base">
                  event_available
                </span>
                Attendance
              </button>
            </div>
          </div>

          {/* ── Academic summary ─────────────────────────────────────────────── */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Total subjects */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <p className="text-sm font-medium text-slate-500">Total Subjects</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {childData.stats.totalSubjects}
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                Consistent
              </p>
            </div>

            {/* Average grade */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <p className="text-sm font-medium text-slate-500">Avg Grade</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {childData.stats.avgGrade}
              </h3>
              <p className="text-xs text-slate-400 mt-2">Top 15% of class</p>
            </div>

            {/* Attendance */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <p className="text-sm font-medium text-slate-500">Attendance</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {childData.stats.attendance}%
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                Excellent
              </p>
            </div>

            {/* Teacher remark */}
            <div className="sm:col-span-3 bg-white rounded-2xl p-7 border border-slate-200/70 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Teacher remark
              </h4>
              <p className="text-lg font-medium text-slate-800 leading-relaxed italic">
                "{childData.teacherRemark}"
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold">
                  {childData.teacherName?.charAt(0) || "T"}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {childData.teacherName}
                  </p>
                  <p className="text-xs text-slate-400">Class Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Subject-wise performance table ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="px-8 py-5 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">
              Subject-wise Performance
            </h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1.5">
              Download Report
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-t border-slate-100">
                  <th className="px-8 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-8 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">Average Score</th>
                  <th className="px-8 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">Performance Level</th>
                  <th className="px-8 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">Trend</th>
                </tr>
              </thead>
              <tbody>
                {childData.subjects.map((subject) => (
                  <tr key={subject.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">

                    {/* Subject name + icon */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <SubjectIcon name={subject.name} />
                        <span className="font-semibold text-slate-800 text-sm">{subject.name}</span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-8 py-5">
                      <span className="text-blue-600 font-bold text-sm">{subject.score}%</span>
                    </td>

                    {/* Performance pill */}
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${subject.levelColor}`}>
                        {subject.level}
                      </span>
                    </td>

                    {/* Trend SVG arrow — matches Grades page exactly */}
                    <td className="px-8 py-5">
                      {subject.trend === "up" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                        </svg>
                      )}
                      {subject.trend === "down" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
                        </svg>
                      )}
                      {subject.trend === "flat" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>
                        </svg>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </DashboardLayout>
  );
};

export default ChildOverview;
