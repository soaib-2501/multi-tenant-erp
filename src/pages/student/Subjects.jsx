import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import { getSectionById } from "../../services/studentAPIs";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function SubjectsSkeleton() {
  return (
    <MainLayout title="My Subjects">
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <Skeleton className="w-40 h-8" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-36 h-10 rounded-md" />
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-6 py-4 grid grid-cols-4 gap-4">
            <Skeleton className="w-28 h-3" />
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-20 h-3" />
          </div>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="px-6 py-5 grid grid-cols-4 gap-4 border-t border-gray-50 items-center">
              <div className="space-y-2">
                <Skeleton className="w-36 h-4" />
                <Skeleton className="w-16 h-3" />
              </div>
              <Skeleton className="w-10 h-4" />
              <div className="space-y-1">
                <Skeleton className="w-full h-2 rounded-full" />
                <Skeleton className="w-8 h-3" />
              </div>
              <Skeleton className="w-14 h-6 rounded-full" />
            </div>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-200 animate-pulse rounded-lg min-h-[240px]" />
          <div className="bg-white rounded-lg border-l-4 border-gray-200 p-6 space-y-4">
            <Skeleton className="w-40 h-3" />
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-32 h-3" />
                  <Skeleton className="w-20 h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Returns bar color + status label based on percentage
function getPerformanceMeta(percentage) {
  if (percentage === 0) return { barColor: "bg-gray-300",   label: "No data",      labelColor: "bg-gray-100   text-gray-500"   };
  if (percentage >= 80)  return { barColor: "bg-green-500", label: "Excellent",    labelColor: "bg-green-100  text-green-700"  };
  if (percentage >= 65)  return { barColor: "bg-blue-500",  label: "Good",         labelColor: "bg-blue-100   text-blue-700"   };
  if (percentage >= 50)  return { barColor: "bg-yellow-400",label: "Average",      labelColor: "bg-yellow-100 text-yellow-700" };
  return                        { barColor: "bg-red-400",   label: "Needs work",   labelColor: "bg-red-100    text-red-700"    };
}

export default function Subjects() {
  const { academic, dashboard, enrollment, loading } = useStudent();
  const [classLevelId, setClassLevelId] = useState(null);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        if (!enrollment?.section) return;
        const sectionData = await getSectionById(enrollment.section);
        setClassLevelId(sectionData.class_level);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSection();
  }, [enrollment]);

  if (loading) return <SubjectsSkeleton />;

  const subjects = (academic?.subs || []).filter(
    (subject) => subject.class_levels?.includes(classLevelId)
  );
  const grades = dashboard?.grades?.results || [];
  const academicYears = academic?.years || [];

  return (
    <MainLayout title="The Academic Architect">
      <div className="px-8 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
              My Subjects
            </h2>
            <p className="text-on-surface-variant mt-1 font-medium">
              Manage your academic curriculum and performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-surface-container-lowest border-none rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus:ring-primary">
              {academicYears.map((data) => (
                <option key={data.id}>{data.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Subject Name</th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Marks</th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">
                  Performance
                  <span className="ml-1 text-[9px] normal-case font-medium text-outline/60 tracking-normal">
                    (% of max marks)
                  </span>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm text-on-surface-variant">
                    No subjects found for your class.
                  </td>
                </tr>
              )}
              {subjects.map((subject) => {
                const gradeInfo   = grades.find(g => g.subject === subject.id);
                const percentage  = gradeInfo
                  ? Math.round((gradeInfo.marks_obtained / gradeInfo.max_marks) * 100)
                  : 0;
                const { barColor, label, labelColor } = getPerformanceMeta(percentage);

                return (
                  <tr key={subject.id} className="hover:bg-surface-container-low/30 transition-colors">
                    {/* Subject name */}
                    <td className="px-6 py-5">
                      <p className="font-bold text-on-surface">{subject.name}</p>
                      <p className="text-xs text-outline mt-0.5">{subject.code}</p>
                    </td>

                    {/* Marks */}
                    <td className="px-6 py-5 font-bold text-on-surface">
                      {gradeInfo
                        ? <span>{gradeInfo.marks_obtained}<span className="text-outline font-normal text-xs"> / {gradeInfo.max_marks}</span></span>
                        : <span className="text-outline font-normal text-sm">N/A</span>
                      }
                    </td>

                    {/* Performance bar with % label */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-surface-container-high rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-on-surface-variant w-8 flex-shrink-0">
                          {gradeInfo ? `${percentage}%` : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${labelColor}`}>
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-primary-container text-on-primary-container p-8 rounded-lg relative overflow-hidden flex flex-col justify-between min-h-[240px]">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-4xl mb-4">auto_awesome</span>
              <h3 className="text-2xl font-headline font-extrabold leading-tight">
                Your semester performance is <br />up by 12% from last year.
              </h3>
              <p className="mt-2 text-primary-fixed opacity-90 text-sm max-w-md">
                Great job! You&apos;re showing significant improvement in STEM subjects. Your current GPA projection is 3.85.
              </p>
            </div>
            <div className="relative z-10 mt-6">
              <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-md text-sm font-bold hover:bg-white/30 transition-all">
                View Detailed Analysis
              </button>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-surface-container-low p-6 rounded-lg border-l-4 border-tertiary">
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-widest mb-4">Upcoming Subject Tasks</h4>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="bg-white w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-tertiary shadow-sm">
                  <span className="material-symbols-outlined text-xl">lab_profile</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Physics Lab Report</p>
                  <p className="text-[10px] text-outline">Due in 2 days</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-white w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-secondary shadow-sm">
                  <span className="material-symbols-outlined text-xl">history_edu</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Chem Quiz 4 Prep</p>
                  <p className="text-[10px] text-outline">Due tomorrow</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}