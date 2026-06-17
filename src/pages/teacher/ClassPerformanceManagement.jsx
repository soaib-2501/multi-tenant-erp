import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { getTeacherAssignment, getSectionEnrollments, getAttendanceRecords, getGrades } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { RevalidatingBar, SkeletonRow } from "../../components/erp/teacher/LoadingPrimitives";
import { useTheme } from "../../context/ThemeContext";

const ClassPerformanceManagement = () => {
  const { id } = useParams();
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [activeTab, setActiveTab] = useState('Students');
  const { darkMode } = useTheme();

  const {
    data: payload,
    loading,
    revalidating,
    error,
  } = useStaleData(
    `performance:class:${id}`,
    async () => {
      const assignmentData = await getTeacherAssignment(id);

      const sectionId = typeof assignmentData.section === 'object'
        ? assignmentData.section?.id
        : assignmentData.section || assignmentData.section_id;
      const academicYearId = typeof assignmentData.academic_year === 'object'
        ? assignmentData.academic_year?.id
        : assignmentData.academic_year || assignmentData.academic_year_id;
      const subjectId = typeof assignmentData.subject === 'object'
        ? assignmentData.subject?.id
        : assignmentData.subject || assignmentData.subject_id;

      let students = [];
      let attendanceMap = {};
      let gradesMap = {};

      if (sectionId) {
        const [enrollmentsData, attendanceData, gradesData] = await Promise.all([
          getSectionEnrollments(sectionId, academicYearId),
          getAttendanceRecords(sectionId, academicYearId),
          subjectId ? getGrades(subjectId) : Promise.resolve({ results: [] })
        ]);

        students = Array.isArray(enrollmentsData)
          ? enrollmentsData
          : enrollmentsData.results || [];

        const records = Array.isArray(attendanceData)
          ? attendanceData
          : attendanceData.results || [];

        records.forEach(record => {
          const sId = record.student_id || record.student;
          if (!attendanceMap[sId]) attendanceMap[sId] = { present: 0, total: 0 };
          attendanceMap[sId].total += 1;
          if (record.status === 'Present' || record.status === 'Late') {
            attendanceMap[sId].present += 1;
          }
        });

        const grades = Array.isArray(gradesData)
          ? gradesData
          : gradesData.results || [];
          
        grades.forEach(grade => {
          const sId = grade.student_id || grade.student;
          // Only map the latest or highest? We can just keep the most recent or highest.
          // Or just store the grade value
          if (!gradesMap[sId] || parseFloat(grade.marks_obtained) > parseFloat(gradesMap[sId].marks_obtained)) {
            gradesMap[sId] = grade;
          }
        });
      }

      return { assignment: assignmentData, students, attendanceMap, gradesMap };
    },
    { skip: !id }
  );

  const assignment = payload?.assignment ?? null;
  const students = payload?.students ?? [];
  const attendanceMap = payload?.attendanceMap ?? {};
  const gradesMap = payload?.gradesMap ?? {};

  // Analytics Calculations
  let totalAttendanceRecords = 0;
  let totalPresent = 0;
  
  // Only calculate based on the students actually in this class
  students.forEach(student => {
    const sId = student.student?.id || student.student || student.student_id;
    const att = attendanceMap[sId];
    if (att) {
      totalAttendanceRecords += att.total;
      totalPresent += att.present;
    }
  });

  const avgAttendance = totalAttendanceRecords > 0 
    ? ((totalPresent / totalAttendanceRecords) * 100).toFixed(1) 
    : 0;

  let totalMarks = 0;

  students.forEach(student => {
    const sId = student.student?.id || student.student || student.student_id;
    const grade = gradesMap[sId];
    if (grade) {
      totalMarks += parseFloat(grade.marks_obtained || 0);
    }
  });

  const avgPerformance = students.length > 0
    ? (totalMarks / students.length).toFixed(1)
    : 0;

  if (error && !payload) {
    return (
      <MainLayout title="Teacher Portal">
        <div className="p-6 bg-red-50 text-red-900 rounded-lg border border-red-200">
          <p className="font-semibold">Error loading class data:</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </MainLayout>
    );
  }

  const subjectName = assignment?.subject_name || 'Subject';
  const levelClean = assignment?.class_level_name?.replace('Grade ', '') || '';
  const className = `${subjectName} ${levelClean}-${assignment?.section_name || ''}`;
  const totalStudents = students.length;

  return (
    <MainLayout title="Teacher Portal">
      <RevalidatingBar show={revalidating} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-outline-variant/10 pb-4">
        <div>
          {loading && !payload ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-8 w-64 bg-slate-100 rounded" />
              <div className="h-5 w-32 bg-slate-100 rounded-full" />
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold font-display text-on-surface tracking-tight">{className}</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 mt-2">
                Active Semester — {assignment?.academic_year_name}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Bento Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Overview Card */}
          <div
            className="lg:col-span-2 bg-surface-container-lowest rounded-lg p-8 relative overflow-hidden group"
            style={{ boxShadow: '0px 12px 32px rgba(11,28,48,0.04)' }}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-4">
                {loading && !payload ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-7 w-48 bg-slate-100 rounded" />
                    <div className="h-4 w-80 bg-slate-100 rounded" />
                  </div>
                ) : (
                  <>
                    <h2 className="font-display text-3xl font-bold text-on-surface mb-2">{subjectName}</h2>
                    <p className="text-on-surface-variant max-w-xl leading-relaxed">
                      Class performance and analytics for {className} section.
                    </p>
                  </>
                )}
              </div>
              <div className="mt-auto flex flex-wrap gap-3">
                <button className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-md font-semibold transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">description</span>
                  Course Syllabus
                </button>
                <button className="bg-surface-container-high text-primary px-6 py-3 rounded-md font-semibold hover:bg-surface-variant transition-all">
                  Learning Materials
                </button>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute right-8 top-8 opacity-10 hidden md:block">
              <span className="material-symbols-outlined text-9xl">functions</span>
            </div>
          </div>

          {/* Quick Actions & AI Insight */}
          <div className="space-y-6">
            <Card className="p-6 border border-outline-variant/10 shadow-sm">
              <h3 className="font-display font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">bolt</span> Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  to={`/teacher/attendance/mark/${id}`}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-surface-container-low transition-colors text-sm font-semibold text-slate-700 border border-transparent hover:border-outline-variant/20"
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">how_to_reg</span>
                    Mark Attendance
                  </span>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Link>
                {/* <Link
                  to="/assignments/create"
                  className="flex items-center justify-between p-3 rounded-md hover:bg-surface-container-low transition-colors text-sm font-semibold text-slate-700 border border-transparent hover:border-outline-variant/20"
                >
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">add_task</span>
                    Create Assignment
                  </span>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Link>
                <button className="flex items-center justify-between p-3 rounded-md hover:bg-surface-container-low transition-colors text-sm font-semibold text-slate-700 border border-transparent hover:border-outline-variant/20 outline-none w-full">
                  <span className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">insights</span>
                    View Analytics
                  </span>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </button> */}
              </div>
            </Card>

            {/* <div className="bg-orange-50 rounded-lg p-6 relative overflow-hidden border border-amber-900/10">
              <div className="flex gap-4 items-start relative z-10">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#924700] shrink-0 shadow-sm">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-[#b75b00] mb-1">AI Insight</h4>
                  <p className="text-sm text-[#723600] leading-snug">
                    3 students dropped 10% in attendance over the last 14 days. This may impact final grades.
                  </p>
                  <button className="mt-4 bg-[#723600] text-white text-xs font-bold py-2 px-4 rounded-md uppercase tracking-wider hover:opacity-90">
                    Generate Outreach
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Total Students',
              value: loading && !payload ? '—' : totalStudents,
              sub: 'Capacity: 35',
              subColor: 'text-slate-300',
              bg: 'from-blue-600 to-blue-700',
            },
            {
              label: 'Avg Performance',
              value: loading && !payload ? '—' : `${avgPerformance}%`,
              sub: '+2.1',
              subColor: 'text-green-300',
              subIcon: 'trending_up',
              bg: 'from-green-600 to-green-700',
            },
            {
              label: 'Attendance Rate',
              value: loading && !payload ? '—' : `${avgAttendance}%`,
              bar: true,
              barWidth: `${avgAttendance}%`,
              bg: 'from-purple-600 to-purple-700',
            },
            // {
            //   label: 'Submissions',
            //   value: '28/32',
            //   sub: '4 Pending',
            //   subColor: 'text-red-600',
            //   subBg: 'bg-red-50',
            // },
          ].map((stat, i) => (
            <Card key={i} className={`p-6 border transition-all duration-300 ${
              darkMode 
                ? `border-transparent shadow-lg bg-gradient-to-br ${stat.bg} text-white` 
                : 'bg-surface-container-lowest border-outline-variant/10 shadow-sm text-on-surface'
            }`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-white/70' : 'text-on-surface-variant'}`}>{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className={`text-3xl font-display font-extrabold ${darkMode ? 'text-white' : 'text-on-surface'}`}>{stat.value}</p>
                {stat.subIcon && (
                  <span className={`flex items-center text-xs font-bold mb-1 ${darkMode ? stat.subColor : 'text-green-600'}`}>
                    <span className="material-symbols-outlined text-sm">{stat.subIcon}</span>
                    {stat.sub}
                  </span>
                )}
                {stat.sub && !stat.subIcon && (
                  <span className={`text-xs font-semibold mb-1 ${
                    darkMode 
                      ? `${stat.subColor} ${stat.subBg ?? ''} ${stat.subBg ? 'px-2 py-0.5 rounded-full' : ''}` 
                      : 'text-on-surface-variant'
                  }`}>
                    {stat.sub}
                  </span>
                )}
                {stat.bar && (
                  <div className={`w-16 h-1.5 rounded-full mb-3 overflow-hidden ml-2 ${darkMode ? 'bg-white/20' : 'bg-surface-container-low'}`}>
                    <div className={`h-full ${darkMode ? 'bg-white' : 'bg-primary'}`} style={{ width: stat.barWidth }} />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </section>

        {/* Main Tabs + Table */}
        <section className="space-y-6">
          <div className="flex items-center gap-8 border-b border-outline-variant/20 overflow-x-auto pb-1">
            {['Students', 'Attendance', 'Grades'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 font-display font-bold transition-all whitespace-nowrap outline-none ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            {/* Student Table */}
            <Card className="xl:col-span-2 p-0 overflow-hidden border border-outline-variant/10 shadow-sm" shadow="sm">
              <div className="p-6 flex justify-between items-center border-b border-surface-container-low">
                <h3 className="font-display font-bold text-on-surface">Class Roster</h3>
                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:opacity-80">
                  <span className="material-symbols-outlined text-sm">filter_list</span> Filter
                </button>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-surface-container-lowest outline outline-1 outline-surface-container-low/50">
                    <tr className="bg-surface-container-low/50">
                      {activeTab === 'Students' && ['Student', 'Roll No.', 'Status'].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest ${h === 'Roll No.' ? 'hidden sm:table-cell' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                      {activeTab === 'Attendance' && ['Student', 'Present', 'Total Classes', 'Attendance Rate', 'Status', ''].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest ${h === 'Present' || h === 'Total Classes' ? 'hidden sm:table-cell' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                      {activeTab === 'Grades' && ['Student', 'Grade', 'Class Average', 'Comparison', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest ${h === 'Class Average' ? 'hidden sm:table-cell' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low/50">
                    {loading && !payload
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={activeTab === 'Attendance' ? 6 : activeTab === 'Grades' ? 5 : 4} />)
                      : (showAllStudents ? students : students.slice(0, 5)).map((student) => {
                          const sId = student.student?.id || student.student || student.student_id;
                          const att = attendanceMap[sId];
                          const attPercentage = att && att.total > 0
                            ? Math.round((att.present / att.total) * 100)
                            : null;
                          const grade = gradesMap[sId];

                          return (
                            <tr key={student.id} className="hover:bg-surface-container-low/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                                    {student.student_name?.charAt(0)}
                                  </div>
                                  <span className="font-semibold text-on-surface">{student.student_name}</span>
                                </div>
                              </td>
                              {activeTab === 'Students' && (
                                <>
                                  <td className="px-6 py-4 font-mono text-sm text-on-surface-variant hidden sm:table-cell">
                                    {student.student_enrollment_no || `Roll ${student.roll_number}`}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300">
                                      Enrolled
                                    </span>
                                  </td>
                                </>
                              )}
                              {activeTab === 'Attendance' && (
                                <>
                                  <td className="px-6 py-4 text-sm text-on-surface hidden sm:table-cell">
                                    {att ? `${att.present} Days` : '0 Days'}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-on-surface hidden sm:table-cell">
                                    {att ? `${att.total} Days` : '0 Days'}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                      <span className="text-sm font-semibold text-on-surface">
                                        {attPercentage !== null ? `${attPercentage}%` : 'N/A'}
                                      </span>
                                      {attPercentage !== null && (
                                        <div className="w-12 h-1 bg-surface-container rounded-full overflow-hidden shrink-0 hidden sm:block">
                                          <div
                                            className={`h-full ${attPercentage >= 85 ? 'bg-green-500' : attPercentage >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
                                            style={{ width: `${attPercentage}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {attPercentage !== null ? (
                                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                                        attPercentage >= 85 ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300' :
                                        attPercentage >= 60 ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300' :
                                        'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                                      }`}>
                                        {attPercentage >= 85 ? 'Good' : attPercentage >= 60 ? 'Warning' : 'Critical'}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-on-surface-variant">N/A</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <Link
                                      to={`/teacher/attendance/mark/${id}`}
                                      className="text-primary hover:underline text-xs font-bold uppercase tracking-wider transition-colors outline-none"
                                    >
                                      Update
                                    </Link>
                                  </td>
                                </>
                              )}
                              {activeTab === 'Grades' && (
                                <>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${grade ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container text-on-surface border border-outline-variant/10'}`}>
                                      {grade ? `${parseFloat(grade.marks_obtained).toFixed(1)} / ${parseFloat(grade.max_marks).toFixed(1)}` : 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-on-surface hidden sm:table-cell">
                                    {avgPerformance ? `${avgPerformance} / 100` : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4">
                                    {grade ? (
                                      (() => {
                                        const score = parseFloat(grade.marks_obtained);
                                        const avg = parseFloat(avgPerformance);
                                        if (score > avg) {
                                          return (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300">
                                              Above Average
                                            </span>
                                          );
                                        } else if (score < avg) {
                                          return (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                                              Below Average
                                            </span>
                                          );
                                        } else {
                                          return (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface">
                                              Average
                                            </span>
                                          );
                                        }
                                      })()
                                    ) : (
                                      <span className="text-xs text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    {grade ? (
                                      <Link
                                        to={`/teacher/grades/enter?exam_id=${grade.exam || grade.exam_id}`}
                                        className="text-primary hover:underline text-xs font-bold uppercase tracking-wider transition-colors outline-none"
                                      >
                                        Update
                                      </Link>
                                    ) : (
                                      <Link
                                        to="/teacher/grades"
                                        className="text-primary hover:underline text-xs font-bold uppercase tracking-wider transition-colors outline-none"
                                      >
                                        Update
                                      </Link>
                                    )}
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>

              {totalStudents > 5 && (
                <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
                  <button 
                    onClick={() => setShowAllStudents(!showAllStudents)}
                    className="text-xs font-bold text-primary uppercase tracking-widest hover:underline transition-all outline-none"
                  >
                    {showAllStudents ? 'Show Less' : `View All ${totalStudents} Students`}
                  </button>
                </div>
              )}
            </Card>

            {/* Side Panels */}
            <div className="space-y-6">
              {/* <Card className="p-6 border border-outline-variant/10 shadow-sm">
                <h3 className="font-display font-bold text-on-surface mb-6">Recent Submissions</h3>
                <div className="space-y-5">
                  {[
                    { icon: 'file_present', color: 'blue', title: 'Vector Calculus Quiz', sub: '8 new submissions since yesterday', bar: '87%' },
                    { icon: 'draw', color: 'purple', title: 'Euclidean Proofs Workshop', sub: 'Completed 32/32', tag: 'All Graded' },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4 items-start">
                      <div className={`w-10 h-10 rounded-md bg-${item.color}-50 flex items-center justify-center shrink-0`}>
                        <span className={`material-symbols-outlined text-${item.color}-600`}>{item.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.sub}</p>
                        {item.bar && (
                          <div className="mt-2 w-full h-1 bg-slate-100 rounded-full">
                            <div className="bg-primary h-full rounded-full" style={{ width: item.bar }} />
                          </div>
                        )}
                        {item.tag && (
                          <span className="mt-2 inline-flex items-center gap-1 text-2xs font-bold text-green-600 uppercase">
                            {item.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest outline-none">
                  Open Gradebook
                </button>
              </Card> */}

              <div className="bg-primary rounded-lg p-6 text-white overflow-hidden relative group">
                <h3 className="font-display font-bold text-lg mb-4 relative z-10">Curriculum Progress</h3>
                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-4xl font-display font-extrabold">64%</span>
                    <span className="text-xs font-semibold opacity-80 pb-1">Topic 8 of 12</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[64%]" />
                  </div>
                  <p className="mt-4 text-xs font-medium leading-relaxed opacity-90">
                    Current: Introduction to Derivatives and the Power Rule. Next: Chain Rule Applications.
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform hidden md:block">
                  <span className="material-symbols-outlined text-[120px]">architecture</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ClassPerformanceManagement;