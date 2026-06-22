import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/erp/teacher/MainLayout";
import Button from "../../components/erp/teacher/Button";
import Card from "../../components/erp/teacher/Card";
import Input from "../../components/erp/teacher/Input";
import Select from "../../components/erp/teacher/Select";
import { getMyProfile, getTeacherClasses, getSectionEnrollments, getGrades } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { RevalidatingBar, SkeletonCard } from "../../components/erp/teacher/LoadingPrimitives";
import { useTheme } from "../../context/ThemeContext";

const FILTER_STATE_KEY = 'teacher:classes:filters';
const DEBUG_PREFIX = '[MyClassesHub]';

const getId = (value) => (typeof value === 'object' ? value?.id : value);

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getClassLevelLabel = (classLevelName) => {
  const raw = String(classLevelName || '').trim();
  const numberMatch = raw.match(/\d+/);
  if (numberMatch) return numberMatch[0];
  return raw.replace(/^(grade|class|standard|std)\s*/i, '').trim() || 'Class';
};

const getInitialFilters = () => {
  try {
    const saved = sessionStorage.getItem(FILTER_STATE_KEY);
    if (saved) {
      return {
        search: '',
        subject: 'all',
        classLevel: 'all',
        ...JSON.parse(saved),
      };
    }
  } catch {}

  return { search: '', subject: 'all', classLevel: 'all' };
};

const getCachedProfile = () => {
  try {
    const cachedProfile = localStorage.getItem('user_data');
    return cachedProfile ? JSON.parse(cachedProfile) : null;
  } catch {
    return null;
  }
};

const MetricSkeleton = () => (
  <div className="h-6 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
);

const MyClassesHub = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(getInitialFilters);

  const {
    data: classesPayload,
    loading,
    revalidating,
    error,
  } = useStaleData('teacher:classes', async () => {
    const startedAt = performance.now();
    console.groupCollapsed(`${DEBUG_PREFIX} loading teacher classes`);

    let profileData = getCachedProfile();
    let teacherId = profileData?.profiles?.teacher?.id;

    console.log('cached profile lookup', {
      found: Boolean(profileData),
      teacherId,
      time: `${Math.round(performance.now() - startedAt)}ms`,
    });

    if (!teacherId) {
      const profileStartedAt = performance.now();
      profileData = await getMyProfile();
      teacherId = profileData.profiles?.teacher?.id;
      console.log('profile fetched in', `${Math.round(performance.now() - profileStartedAt)}ms`, profileData);
    } else {
      console.log('profile API skipped because teacher id was available in localStorage');
    }

    console.log('profile resolved in', `${Math.round(performance.now() - startedAt)}ms`, profileData);
    if (!teacherId) throw new Error('You are not assigned a teacher profile.');

    const classesStartedAt = performance.now();
    const classesData = await getTeacherClasses(teacherId);
    const classesArray = Array.isArray(classesData) ? classesData : classesData.results || [];
    console.log('teacher classes fetched in', `${Math.round(performance.now() - classesStartedAt)}ms`, {
      teacherId,
      rawPayload: classesData,
      count: classesArray.length,
      classes: classesArray,
    });
    console.log('class payload total time', `${Math.round(performance.now() - startedAt)}ms`);
    console.groupEnd();

    return { profile: profileData, classes: classesArray };
  });

  const classes = useMemo(() => classesPayload?.classes ?? [], [classesPayload]);
  const metricsKey = useMemo(
    () => classes.map((cls) => cls.id).filter(Boolean).sort().join(','),
    [classes],
  );

  const {
    data: metricsPayload,
    loading: metricsLoading,
    revalidating: metricsRevalidating,
  } = useStaleData(`teacher:classes:metrics:${metricsKey || 'empty'}`, async () => {
    const metricsStartedAt = performance.now();
    console.groupCollapsed(`${DEBUG_PREFIX} loading class metrics`);
    console.log('metric input classes', {
      count: classes.length,
      metricsKey,
      classes: classes.map((cls) => ({
        id: cls.id,
        subject: cls.subject_name,
        classLevel: cls.class_level_name,
        section: cls.section_name || cls.section?.name,
        sectionId: getId(cls.section) || cls.section_id,
        subjectId: getId(cls.subject) || cls.subject_id,
      })),
    });

    const gradesRequestsBySubject = new Map();
    classes.forEach((cls) => {
      const subjectId = getId(cls.subject) || cls.subject_id;
      if (subjectId && !gradesRequestsBySubject.has(subjectId)) {
        gradesRequestsBySubject.set(subjectId, getGrades(subjectId));
      }
    });
    console.log('shared grade requests', {
      uniqueSubjects: gradesRequestsBySubject.size,
      classCount: classes.length,
    });

    const classMetrics = await Promise.all(
      classes.map(async (cls) => {
        const classMetricStartedAt = performance.now();
        const sectionId = getId(cls.section) || cls.section_id;
        const academicYearId = getId(cls.academic_year) || cls.academic_year_id;
        const subjectId = getId(cls.subject) || cls.subject_id;

        if (!sectionId) {
          console.warn('skipping metrics because section id is missing', cls);
          return { sectionId: null, count: 0, avgPerformance: 'N/A' };
        }

        try {
          const enrollmentsStartedAt = performance.now();
          const [enrollmentsData, gradesData] = await Promise.all([
            getSectionEnrollments(sectionId, academicYearId),
            subjectId ? gradesRequestsBySubject.get(subjectId) : Promise.resolve({ results: [] }),
          ]);

          const students = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData.results || [];
          const grades = Array.isArray(gradesData) ? gradesData : gradesData.results || [];
          const fetchedAt = performance.now();
          const gradesMap = {};

          grades.forEach((grade) => {
            const studentId = grade.student_id || grade.student;
            const currentMarks = parseFloat(grade.marks_obtained || 0);
            const previousMarks = parseFloat(gradesMap[studentId]?.marks_obtained || 0);

            if (!gradesMap[studentId] || currentMarks > previousMarks) {
              gradesMap[studentId] = grade;
            }
          });

          const totalMarks = students.reduce((sum, student) => {
            const studentId = student.student?.id || student.student || student.student_id;
            const grade = gradesMap[studentId];
            return sum + (grade ? parseFloat(grade.marks_obtained || 0) : 0);
          }, 0);

          const avgPerformance = students.length > 0
            ? (totalMarks / students.length).toFixed(1)
            : 'N/A';

          console.log('class metrics calculated', {
            assignmentId: cls.id,
            subject: cls.subject_name,
            classLevel: cls.class_level_name,
            section: cls.section_name || cls.section?.name,
            sectionId,
            academicYearId,
            subjectId,
            students: students.length,
            grades: grades.length,
            avgPerformance,
            fetchTime: `${Math.round(fetchedAt - enrollmentsStartedAt)}ms`,
            totalTime: `${Math.round(performance.now() - classMetricStartedAt)}ms`,
          });

          return { sectionId, count: students.length, avgPerformance };
        } catch (metricError) {
          console.error('class metrics failed', {
            assignmentId: cls.id,
            subject: cls.subject_name,
            classLevel: cls.class_level_name,
            section: cls.section_name || cls.section?.name,
            sectionId,
            subjectId,
            error: metricError,
            totalTime: `${Math.round(performance.now() - classMetricStartedAt)}ms`,
          });
          return { sectionId, count: 0, avgPerformance: 'N/A' };
        }
      }),
    );

    const studentsMap = {};
    const performanceMap = {};

    classMetrics.forEach(({ sectionId, count, avgPerformance }) => {
      if (sectionId) {
        studentsMap[sectionId] = count;
        performanceMap[sectionId] = avgPerformance;
      }
    });

    console.log('all metrics finished in', `${Math.round(performance.now() - metricsStartedAt)}ms`, {
      studentsMap,
      performanceMap,
    });
    console.groupEnd();

    return { studentsMap, performanceMap };
  }, { skip: loading || classes.length === 0, ttl: 5 * 60_000, deps: metricsKey });

  const studentsMap = metricsPayload?.studentsMap ?? {};
  const performanceMap = metricsPayload?.performanceMap ?? {};
  const showMetricSkeletons = (metricsLoading || metricsRevalidating) && !metricsPayload;

  useEffect(() => {
    try {
      sessionStorage.setItem(FILTER_STATE_KEY, JSON.stringify(filters));
    } catch {}
  }, [filters]);

  const subjectOptions = useMemo(() => {
    const seen = new Set();
    const options = [{ label: 'All Subjects', value: 'all' }];

    classes.forEach((cls) => {
      const subjectName = String(cls.subject_name || cls.subject?.name || 'Subject').trim();
      const subjectId = String(getId(cls.subject) || cls.subject_id || subjectName).trim();
      if (!subjectId || seen.has(subjectId)) return;

      seen.add(subjectId);
      options.push({ label: subjectName, value: subjectId });
    });

    return options;
  }, [classes]);

  const classOptions = useMemo(() => {
    const seen = new Set();
    const options = [{ label: 'All Classes', value: 'all' }];

    classes.forEach((cls) => {
      const classLabel = getClassLevelLabel(cls.class_level_name || cls.class_level?.name);
      const classValue = normalizeText(classLabel);
      if (!classValue || seen.has(classValue)) return;

      seen.add(classValue);
      options.push({ label: classLabel, value: classValue });
    });

    return options;
  }, [classes]);

  const filteredClasses = useMemo(() => {
    const startedAt = performance.now();
    const query = normalizeText(filters.search);

    const results = classes.filter((cls) => {
      const subjectName = String(cls.subject_name || cls.subject?.name || '').trim();
      const subjectId = String(getId(cls.subject) || cls.subject_id || subjectName).trim();
      const classLabel = getClassLevelLabel(cls.class_level_name || cls.class_level?.name);
      const searchable = [
        subjectName,
        classLabel,
        cls.class_level_name,
        cls.academic_year_name,
      ].map(normalizeText);

      const matchesSubject = filters.subject === 'all' || subjectId === filters.subject;
      const matchesClass = filters.classLevel === 'all' || normalizeText(classLabel) === filters.classLevel;
      const matchesSearch = !query || searchable.some((value) => value.includes(query));

      return matchesSubject && matchesClass && matchesSearch;
    });

    console.log(`${DEBUG_PREFIX} filtered classes`, {
      filters,
      sourceCount: classes.length,
      resultCount: results.length,
      time: `${Math.round((performance.now() - startedAt) * 100) / 100}ms`,
      results: results.map((cls) => ({
        id: cls.id,
        subject: cls.subject_name,
        classLevel: cls.class_level_name,
        section: cls.section_name || cls.section?.name,
      })),
    });

    return results;
  }, [classes, filters]);

  useEffect(() => {
    console.log(`${DEBUG_PREFIX} render state`, {
      loading,
      revalidating,
      metricsLoading,
      metricsRevalidating,
      hasClassesPayload: Boolean(classesPayload),
      classesCount: classes.length,
      filteredClassesCount: filteredClasses.length,
      hasMetricsPayload: Boolean(metricsPayload),
      showMetricSkeletons,
    });
  }, [
    loading,
    revalidating,
    metricsLoading,
    metricsRevalidating,
    classesPayload,
    classes.length,
    filteredClasses.length,
    metricsPayload,
    showMetricSkeletons,
  ]);

  useEffect(() => {
    if (!loading && classes.length > 0) {
      const insightClass = classes[0];
      console.log(`${DEBUG_PREFIX} AI insight card source`, {
        note: 'This card is currently hardcoded UI copy. No AI insight API request is being made here.',
        selectedClass: {
          id: insightClass?.id,
          subject: insightClass?.subject_name,
          classLevel: insightClass?.class_level_name,
          section: insightClass?.section_name || insightClass?.section?.name,
        },
        displayedInsight: 'Based on historical trends, the upcoming module typically sees a 12% drop in student engagement. We recommend adjusting the lesson plan.',
      });
    }
  }, [loading, classes]);

  const handleFilterChange = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleReset = () => {
    setFilters({ search: '', subject: 'all', classLevel: 'all' });
  };

  const getSubjectAesthetics = (subjectName) => {
    const name = (subjectName || "").toLowerCase();
    if (name.includes("math") || name.includes("calc")) return { icon: "functions", colorClass: "text-[#0058be]", bgClass: "bg-[#0058be]/10", borderClass: "border-[#0058be]/20" };
    if (name.includes("phys") || name.includes("bio") || name.includes("chem") || name.includes("sci")) return { icon: "biotech", colorClass: "text-[#6b38d4]", bgClass: "bg-[#6b38d4]/10", borderClass: "border-[#6b38d4]/20" };
    if (name.includes("hist") || name.includes("geo")) return { icon: "history_edu", colorClass: "text-[#924700]", bgClass: "bg-[#924700]/10", borderClass: "border-[#924700]/20" };
    if (name.includes("lit") || name.includes("eng")) return { icon: "menu_book", colorClass: "text-[#0f9d58]", bgClass: "bg-[#0f9d58]/10", borderClass: "border-[#0f9d58]/20" };
    if (name.includes("comp") || name.includes("tech")) return { icon: "computer", colorClass: "text-[#ba1a1a]", bgClass: "bg-[#ba1a1a]/10", borderClass: "border-[#ba1a1a]/20" };
    return { icon: "school", colorClass: "text-[#0058be]", bgClass: "bg-[#0058be]/10", borderClass: "border-[#0058be]/20" };
  };

  if (error && !classesPayload) {
    return (
      <MainLayout title="My Classes">
        <div className="p-6 bg-red-50 text-red-900 rounded-lg border border-red-200">
          <p className="font-semibold">Error loading data:</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Teaching Schedule">
      <RevalidatingBar show={revalidating || metricsRevalidating} />

      <section className={`mb-6 flex flex-col lg:flex-row gap-4 items-end justify-between p-4 md:p-5 rounded-xl shadow-sm border transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' 
          : 'bg-surface-container-low border-outline-variant/10'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:w-3/4">
          <Input
            label="Search Directory"
            icon="search"
            placeholder="Search by class or subject..."
            value={filters.search}
            onChange={handleFilterChange('search')}
            dark={darkMode}
          />
          <Select
            label="Subject Filter"
            options={subjectOptions}
            value={filters.subject}
            onChange={handleFilterChange('subject')}
            dark={darkMode}
          />
          <Select
            label="Class Filter"
            options={classOptions}
            value={filters.classLevel}
            onChange={handleFilterChange('classLevel')}
            dark={darkMode}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <Button
            variant="secondary"
            className={`w-full lg:w-auto justify-center border font-bold transition-colors text-xs ${
              darkMode 
                ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600' 
                : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-200'
            }`}
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => {
            const sectionId = getId(cls.section) || cls.section_id;
            const studentCount = studentsMap[sectionId] ?? 0;
            const avgPerformance = performanceMap[sectionId] ?? 'N/A';
            const subjectName = cls.subject_name || 'Subject';
            const levelClean = getClassLevelLabel(cls.class_level_name);
            const sectionName = cls.section_name || cls.section?.name;
            const className = `${subjectName} ${levelClean}${sectionName ? `-${sectionName}` : ''}`;
            const description = cls.is_class_teacher
              ? `Class Teacher - ${cls.academic_year_name}`
              : `${cls.academic_year_name}`;
            const aes = getSubjectAesthetics(subjectName);

            return (
              <Card key={cls.id} hoverable className={`border shadow-sm hover:shadow-lg transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-surface-container-lowest border-outline-variant/10'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`${aes.bgClass} p-2 rounded-lg shadow-sm`}>
                    <span className={`material-symbols-outlined ${aes.colorClass} text-xl md:text-2xl`}>{aes.icon}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className={`px-2 py-0.5 rounded-full text-3xs font-bold tracking-wider uppercase border ${aes.borderClass} ${aes.colorClass} bg-white dark:bg-slate-800 shadow-sm`}>
                      Active
                    </div>
                    {cls.is_class_teacher && (
                      <span className={`text-3xs font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${darkMode ? 'text-amber-400 bg-amber-900/30 border-amber-600/30' : 'text-blue-700 bg-blue-50 border-blue-200'}`}>
                        <span className="material-symbols-outlined text-[10px]">star</span>
                        Class Teacher
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-5">
                  <h2 className={`font-display text-base md:text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-on-surface'}`}>{className}</h2>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-on-surface-variant'} text-xs font-medium`}>{description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className={`p-3 rounded-md border transition-colors ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-surface-container/50 border-outline-variant/20'}`}>
                    <p className={`text-3xs uppercase font-bold tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>Students</p>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-primary dark:text-blue-400">groups</span>
                      {showMetricSkeletons ? (
                        <MetricSkeleton />
                      ) : (
                        <span className={`text-base font-bold font-display ${darkMode ? 'text-white' : 'text-on-surface'}`}>{studentCount}</span>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-md border transition-colors ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-surface-container/50 border-outline-variant/20'}`}>
                    <p className={`text-3xs uppercase font-bold tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>Avg. Performance</p>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-primary dark:text-white">horizontal_rule</span>
                      {showMetricSkeletons ? (
                        <MetricSkeleton />
                      ) : (
                        <span className={`text-base font-bold font-display ${darkMode ? 'text-white' : 'text-on-surface'}`}>
                          {avgPerformance !== 'N/A' ? `${avgPerformance}%` : 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/teacher/classes/${cls.id}/performance`)}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all duration-200 shadow-sm"
                >
                  View Class Details
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-6 bg-white rounded-xl border border-dashed border-gray-300 text-center shadow-sm">
            <div className="w-12 h-12 bg-[#eff4ff] rounded-full flex items-center justify-center text-[#0058be] mb-3 shadow-sm">
              <span className="material-symbols-outlined text-2xl">event_busy</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2">
              {classes.length > 0 ? 'No Matching Classes' : 'No Classes Assigned'}
            </h3>
            <p className="text-gray-500 max-w-sm text-xs md:text-sm mb-4">
              {classes.length > 0
                ? 'Try adjusting the subject, class, or search filters.'
                : 'You currently have no active teacher assignments in the database for this academic year.'}
            </p>
            {classes.length > 0 ? (
              <button
                onClick={handleReset}
                className="bg-white border border-gray-200 text-slate-700 font-semibold px-6 py-2 text-xs rounded-md hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
                Reset Filters
              </button>
            ) : (
              <button className="bg-white border border-gray-200 text-slate-700 font-semibold px-6 py-2 text-xs rounded-md hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">mail</span>
                Contact Administrator
              </button>
            )}
          </div>
        )}
      </div>

      {!loading && classes.length > 0 && (
        <div className="mt-6">
          <Card className="bg-gradient-to-br from-[#0b1c30] to-[#1e3450] text-white border-transparent" hoverable>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/10 p-2 rounded-lg border border-white/20">
                <span className="material-symbols-outlined text-blue-300 text-xl md:text-2xl">psychology</span>
              </div>
              <div className="bg-purple-500/20 px-2 py-0.5 rounded-full text-3xs font-bold text-purple-200 tracking-wider uppercase flex items-center gap-1 border border-purple-400/30">
                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI Insight Generated
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-base md:text-lg font-bold mb-1">
                {classes[0]?.subject_name} ({getClassLevelLabel(classes[0]?.class_level_name)}
                {classes[0]?.section_name || classes[0]?.section?.name ? `-${classes[0]?.section_name || classes[0]?.section?.name}` : ''})
              </h2>
              <p className="text-blue-200 text-xs font-medium">Predictive Engagement Model</p>
            </div>

            <div className="mb-5 p-3 bg-black/20 rounded-lg border border-white/10 flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-400 shrink-0 text-base">warning</span>
              <p className="text-xs text-slate-200 leading-relaxed">
                Based on historical trends, the upcoming module typically sees a <strong className="text-amber-400">12% drop in student engagement</strong>. We recommend adjusting the lesson plan.
              </p>
            </div>

            <button
              onClick={() => navigate("/teacher/analytics")}
              className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-white text-[#0b1c30] text-xs font-bold rounded-md hover:bg-gray-100 transition-all duration-200 shadow-sm"
            >
              Review AI Recommendations
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};

export default MyClassesHub;
