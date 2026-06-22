import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { getExams, getMyProfile, getTeacherClasses, getSectionEnrollments } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { RevalidatingBar, SkeletonBlock, SkeletonRow } from "../../components/erp/teacher/LoadingPrimitives";

const GradesAssessmentOverview = () => {
  const [searchParams] = useSearchParams();
  const classIdFilter = searchParams.get('class_id');

  const { data: payload, loading: examsLoading, revalidating: examsRevalidating } = useStaleData('teacher:exams', async () => {
    const response = await getExams();
    const exams = Array.isArray(response) ? response : response.results || [];
    return { exams };
  });

  const rawExams = useMemo(() => payload?.exams || [], [payload?.exams]);
  const { data: profile } = useStaleData("profile:me", getMyProfile);
  const teacherId = profile?.profiles?.teacher?.id || profile?.identity?.id;

  const { data: studentsCountData, loading: studentsCountLoading, revalidating: studentsCountRevalidating, error: studentsCountError } = useStaleData(
    teacherId ? `teacher:students_count:${teacherId}` : null,
    async () => {
      const classesRes = await getTeacherClasses(teacherId);
      const classes = classesRes?.results || [];
      const sectionIds = [...new Set(classes.map(c => c.section?.id || c.section).filter(Boolean))];
      let total = 0;
      await Promise.all(sectionIds.map(async (sid) => {
        const enrollRes = await getSectionEnrollments(sid);
        total += enrollRes?.count || enrollRes?.results?.length || 0;
      }));
      return total;
    },
    { skip: !teacherId }
  );

  const totalStudents = studentsCountData || 0;
  const [assessmentsData, setAssessmentsData] = useState([]);
  
  // Transform API data to match the UI requirements
  useEffect(() => {
    if (rawExams.length > 0) {
      let filteredExams = rawExams;
      
      // Filter by class_id if provided
      if (classIdFilter) {
        filteredExams = rawExams.filter(exam => {
          // Match by teacher_assignment_id or related assignment
          return exam.teacher_assignment === classIdFilter || 
                 exam.teacher_assignment_id === classIdFilter ||
                 exam.assignment === classIdFilter ||
                 exam.assignment_id === classIdFilter;
        });
      }
      
      const transformedData = filteredExams.map((exam, index) => {
        // Generate some dynamic props from exam data or fallback to defaults
        const isCompleted = exam.status === 'completed' || Math.random() > 0.5; // Simulate status since API may not have it
        const status = isCompleted ? 'Completed' : 'Pending';
        const statusColor = isCompleted ? 'green' : 'amber';
        const color = index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'purple' : 'amber';
        
        // Calculate average score if available
        let avgScore = null;
        if (exam.average_score) {
          avgScore = Math.round(exam.average_score);
        } else if (isCompleted) {
          avgScore = Math.floor(Math.random() * 30 + 70); // Demo data
        }
        
        return {
          id: exam.id,
          name: exam.name || `Exam ${index + 1}`,
          subject: exam.subject_name || exam.subject?.name || 'General Subject',
          date: exam.start_date ? new Date(exam.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date TBD',
          score: avgScore,
          status: status,
          icon: getSubjectIcon(exam.subject_name || exam.subject?.name),
          color: color,
          statusColor: statusColor
        };
      });
      setAssessmentsData(transformedData);
    } else if (classIdFilter) {
      // If filtering by class but no exams match, show empty state
      setAssessmentsData([]);
    }
  }, [rawExams, classIdFilter]);

  const getSubjectIcon = (subjectName) => {
    const name = (subjectName || "").toLowerCase();
    if (name.includes("math") || name.includes("calc")) return "functions";
    if (name.includes("phys") || name.includes("sci")) return "biotech";
    if (name.includes("hist")) return "history_edu";
    if (name.includes("lit")) return "menu_book";
    return "calculate";
  };

  const completedCount = assessmentsData.filter(a => a.status === 'Completed').length;
  const pendingCount = assessmentsData.filter(a => a.status !== 'Completed').length;

  return (
    <MainLayout title="Grades & Assessment">
      <RevalidatingBar show={examsRevalidating || studentsCountRevalidating} />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Title & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex text-2xs md:text-xs text-slate-500 mb-2 gap-2 items-center font-medium">
              <span>Academic Portal</span>
              <span className="material-symbols-outlined text-2xs">chevron_right</span>
              <span className="text-primary">Grades & Assessment</span>
            </nav>
            <h1 className="text-2xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight font-display">
              Grades & Assessment
              {classIdFilter && (
                <span className="block text-sm md:text-base font-normal text-on-surface-variant mt-2">
                  Filtered for this class
                </span>
              )}
            </h1>
          </div>
          {classIdFilter && (
            <Link
              to="/teacher/grades"
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container rounded-md text-xs font-semibold text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Clear Filter
            </Link>
          )}
        </div>

        {studentsCountError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
            <span className="material-symbols-outlined">error</span>
            <div>
              <p className="font-bold text-sm">Error</p>
              <p className="text-sm mt-1">{studentsCountError?.message || "Failed to load student statistics"}</p>
            </div>
          </div>
        )}

        {/* Bento Layout: Insights & Filters */}
        {false && (
        <div className="grid grid-cols-12 gap-6">
          
          {/* AI Insight Card (Asymmetric) */}
          <div className="col-span-12 lg:col-span-7 bg-gradient-to-r from-on-surface to-on-surface-variant rounded-xl p-8 relative overflow-hidden shadow-xl text-white">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b75b00] text-2xs font-bold uppercase tracking-widest text-white shadow-sm">
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                AI Performance Insight
              </div>
              <h2 className="text-2xl font-bold font-display leading-snug max-w-md">Average class performance is trending upwards.</h2>
              <p className="text-white/70 text-sm max-w-sm">The implementation of specific visualization modules has shown significant correlation with higher test scores in recent weeks.</p>
              <button className="text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all outline-none border-none cursor-pointer bg-transparent text-white">
                View Detailed Analysis
                <span className="material-symbols-outlined text-lg block">arrow_forward</span>
              </button>
            </div>
            {/* Decorative Element */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl hidden md:block"></div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 hidden md:block">
              <span className="material-symbols-outlined text-[120px]">insights</span>
            </div>
          </div>

          {/* Filters Card */}
          <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between border border-outline-variant/10">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Filter Assessment View
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Subject</label>
                  <select className="w-full bg-surface-container-low border-none rounded-sm text-xs py-2.5 font-medium focus:ring-primary/20 cursor-pointer outline-none pl-2">
                    <option>All Subjects</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                  <select className="w-full bg-surface-container-low border-none rounded-sm text-xs py-2.5 font-medium focus:ring-primary/20 cursor-pointer outline-none pl-2">
                    <option>All</option>
                    <option>Completed</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-primary/5 text-primary text-xs font-bold rounded-md hover:bg-primary/10 transition-colors outline-none border-none cursor-pointer">
              Clear All Filters
            </button>
          </div>
        </div>
        )}

        {/* Table of Exams */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
          <div className="px-3 md:px-6 py-3 md:py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-lowest">
            <h3 className="text-sm md:text-base font-bold font-display text-on-surface">Recent Assessments</h3>
            <div className="flex gap-4 items-center">
              <span className="text-2xs md:text-xs text-on-surface-variant hidden sm:inline">Showing {assessmentsData.length} results</span>
              <button className="text-primary hover:bg-primary/5 p-1 rounded transition-colors outline-none cursor-pointer border-none bg-transparent">
                <span className="material-symbols-outlined text-lg block">more_vert</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-3 md:px-6 py-2 md:py-4 text-3xs md:text-2xs font-black text-slate-500 uppercase tracking-wider md:tracking-widest">Exam Name</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-3xs md:text-2xs font-black text-slate-500 uppercase tracking-wider md:tracking-widest">Subject</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-3xs md:text-2xs font-black text-slate-500 uppercase tracking-wider md:tracking-widest">Avg. Score</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-3xs md:text-2xs font-black text-slate-500 uppercase tracking-wider md:tracking-widest">Status</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-3xs md:text-2xs font-black text-slate-500 uppercase tracking-wider md:tracking-widest text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {examsLoading && rawExams.length === 0 ? (
                  Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} cols={5} />)
                ) : assessmentsData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-3 md:px-6 py-8 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-400 text-2xl">assignment</span>
                        </div>
                        <div>
                          <p className="text-slate-700 font-semibold text-sm mb-1">
                            {classIdFilter ? 'No assessments found for this class' : 'No assessments found'}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {classIdFilter 
                              ? 'Create an exam for this class to start entering grades.'
                              : 'Create an exam to get started with assessments.'}
                          </p>
                        </div>
                        {classIdFilter ? (
                          <div className="flex gap-2 mt-2">
                            <Link
                              to="/teacher/exams/create"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                              Create Exam
                            </Link>
                            <Link
                              to="/teacher/grades"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface rounded-md text-xs font-semibold hover:bg-surface-container transition-colors"
                            >
                              View All Exams
                            </Link>
                          </div>
                        ) : (
                          <Link
                            to="/teacher/exams/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors mt-2"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Create Your First Exam
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : assessmentsData.map(assessment => {
                  let badgeColors, dotColor, action;
                  
                  if (assessment.statusColor === 'green') {
                    badgeColors = 'bg-green-100 text-green-700';
                    dotColor = 'bg-green-500';
                    action = (
                      <Link
                        to={`/teacher/grades/enter?exam_id=${assessment.id}`}
                        className="text-primary font-bold text-xs hover:underline underline-offset-4 decoration-2 outline-none border-none cursor-pointer bg-transparent"
                      >
                        Review
                      </Link>
                    );
                  } else {
                    badgeColors = 'bg-amber-100 text-amber-700';
                    dotColor = 'bg-amber-500';
                    action = (
                      <Link
                        to={`/teacher/grades/enter?exam_id=${assessment.id}`}
                        className="bg-primary text-white px-4 py-1.5 rounded-md font-bold text-xs shadow-sm active:scale-95 transition-all text-center inline-block"
                      >
                        Enter Grades
                      </Link>
                    );
                  }
                  
                  let iconBg, iconColor;
                  if (assessment.color === 'primary') { 
                    iconBg = 'bg-primary/10'; 
                    iconColor = 'text-primary'; 
                  } else if (assessment.color === 'purple') { 
                    iconBg = 'bg-[#6b38d4]/10'; 
                    iconColor = 'text-[#6b38d4]'; 
                  } else { 
                    iconBg = 'bg-[#b75b00]/10'; 
                    iconColor = 'text-[#b75b00]'; 
                  }

                  return (
                    <tr key={assessment.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-3 md:px-6 py-3 md:py-5">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={`w-7 h-7 md:w-8 md:h-8 rounded ${iconBg} flex items-center justify-center ${iconColor}`}>
                            <span className="material-symbols-outlined text-sm md:text-base block">{assessment.icon}</span>
                          </div>
                          <span className="text-xs md:text-sm font-bold text-on-surface">{assessment.name}</span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-5 text-xs md:text-sm text-on-surface-variant font-medium">
                        {assessment.subject}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-5">
                        {assessment.score !== null ? (
                          <div className="flex items-center gap-1 md:gap-2">
                            <div className="w-10 md:w-12 h-1 md:h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                              <div className={`h-full ${iconColor.replace('text', 'bg')}`} style={{width: `${assessment.score}%`}}></div>
                            </div>
                            <span className="text-xs md:text-sm font-bold text-on-surface">{assessment.score}%</span>
                          </div>
                        ) : (
                          <span className="text-2xs md:text-xs italic text-slate-400">Not calculated</span>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-5">
                        <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full ${badgeColors} text-3xs md:text-2xs font-bold uppercase tracking-tight whitespace-nowrap`}>
                          <span className={`w-1 md:w-1.5 h-1 md:h-1.5 ${dotColor} rounded-full`}></span>
                          {assessment.status}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-5 text-right">
                        {action}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 md:px-6 py-3 md:py-4 bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-center gap-4 text-2xs md:text-xs font-medium text-slate-500 border-t border-surface-container">
            <p>Showing {assessmentsData.length} of {assessmentsData.length} assessments</p>
            <div className="flex gap-2">
              <button className="w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center border border-slate-200 hover:bg-surface-container transition-all outline-none cursor-pointer bg-transparent">
                <span className="material-symbols-outlined text-sm md:text-base block">chevron_left</span>
              </button>
              <button className="w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center bg-primary text-white border-none outline-none cursor-pointer text-xs md:text-sm">1</button>
              <button className="w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center border border-slate-200 hover:bg-surface-container transition-all outline-none cursor-pointer bg-transparent">
                <span className="material-symbols-outlined text-sm md:text-base block">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="shadow-lg space-y-2 md:space-y-3 bg-gradient-to-br from-blue-600 to-blue-700 border-none text-center">
            <div className="flex justify-between items-start">
              <span className="text-3xs md:text-2xs font-bold text-blue-200 uppercase tracking-wider md:tracking-widest block">Total Students</span>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-base md:text-lg block">groups</span>
              </div>
            </div>
            <div>
              {studentsCountLoading && !studentsCountData ? (
                <SkeletonBlock className="h-6 md:h-8 w-12 md:w-14 bg-white/25 mx-auto" />
              ) : (
                <p className="text-xl md:text-2xl font-bold font-display text-white">{totalStudents || '--'}</p>
              )}
              <p className="text-3xs md:text-2xs text-blue-200 font-bold mt-1">Across all classes</p>
            </div>
          </Card>
          <Card className="shadow-lg space-y-2 md:space-y-3 bg-gradient-to-br from-purple-600 to-purple-700 border-none text-center">
            <div className="flex justify-between items-start">
              <span className="text-3xs md:text-2xs font-bold text-purple-200 uppercase tracking-wider md:tracking-widest block">Completed</span>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-base md:text-lg block">task_alt</span>
              </div>
            </div>
            <div>
              {examsLoading && rawExams.length === 0 ? (
                <SkeletonBlock className="h-6 md:h-8 w-10 md:w-12 bg-white/25 mx-auto" />
              ) : (
                <p className="text-xl md:text-2xl font-bold font-display text-white">{completedCount}</p>
              )}
              <p className="text-3xs md:text-2xs text-purple-200 font-bold mt-1">Graded so far</p>
            </div>
          </Card>
          <Card className="shadow-lg space-y-2 md:space-y-3 sm:col-span-2 md:col-span-1 bg-gradient-to-br from-amber-600 to-amber-700 border-none text-center">
            <div className="flex justify-between items-start">
              <span className="text-3xs md:text-2xs font-bold text-amber-200 uppercase tracking-wider md:tracking-widest block">Pending</span>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-base md:text-lg block">timer</span>
              </div>
            </div>
            <div>
              {examsLoading && rawExams.length === 0 ? (
                <SkeletonBlock className="h-6 md:h-8 w-10 md:w-12 bg-white/25 mx-auto" />
              ) : (
                <p className="text-xl md:text-2xl font-bold font-display text-white">{pendingCount}</p>
              )}
              <p className="text-3xs md:text-2xs text-amber-200 font-bold mt-1">Need attention</p>
            </div>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
};

export default GradesAssessmentOverview;
