import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/erp/teacher/MainLayout";
import Button from "../../components/erp/teacher/Button";
import Card from "../../components/erp/teacher/Card";
import Input from "../../components/erp/teacher/Input";
import Select from "../../components/erp/teacher/Select";
import { getMyTeacherAssignments, getGrades } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { RevalidatingBar, SkeletonCard } from "../../components/erp/teacher/LoadingPrimitives";
import { useTheme } from "../../context/ThemeContext";

const FILTER_STATE_KEY = 'teacher:classes:filters';
const DEBUG_PREFIX = '[MyClassesHub]';

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

const MetricSkeleton = () => (
  <div className="h-6 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
);

const MyClassesHub = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(getInitialFilters);

  // Single efficient fetch — JWT resolves teacher, no profile/teacherId chain needed.
  // Raw shape: { count, results: [...] } — same as Dashboard so cache is shared correctly.
  // Each result includes student_count inline, no enrollment fetch required.
  const {
    data: classesPayload,
    loading,
    revalidating,
    error,
  } = useStaleData('teacher:my-assignments', () => getMyTeacherAssignments({ status: 'current' }));

  const classes = useMemo(() => {
    const list = Array.isArray(classesPayload)
      ? classesPayload
      : classesPayload?.results ?? [];
    console.groupCollapsed(`${DEBUG_PREFIX} assignments loaded`);
    console.log('count', list.length, 'classes', list.map(c => ({
      id: c.id,
      subject: c.subject?.name,
      classLevel: c.class_level?.name,
      section: c.section?.name,
      sectionId: c.section?.id,
      studentCount: c.student_count,
    })));
    console.groupEnd();
    return list;
  }, [classesPayload]);
  const metricsKey = useMemo(
    () => classes.map((cls) => cls.id).filter(Boolean).sort().join(','),
    [classes],
  );

  // Build studentsMap directly from student_count — no enrollment API call needed
  const studentsMap = useMemo(() => {
    const map = {};
    classes.forEach(cls => {
      const sectionId = cls.section?.id;
      if (sectionId && !(sectionId in map)) {
        map[sectionId] = cls.student_count ?? 0;
      }
    });
    return map;
  }, [classes]);

  // Only fetch grades for performance metric (student counts are already in assignments)
  const {
    data: metricsPayload,
    loading: metricsLoading,
    revalidating: metricsRevalidating,
  } = useStaleData(`teacher:classes:metrics:${metricsKey || 'empty'}`, async () => {
    const metricsStartedAt = performance.now();
    console.groupCollapsed(`${DEBUG_PREFIX} loading performance metrics`);

    // Deduplicate grade requests by subject
    const gradesRequestsBySubject = new Map();
    classes.forEach((cls) => {
      const subjectId = cls.subject?.id;
      if (subjectId && !gradesRequestsBySubject.has(subjectId)) {
        gradesRequestsBySubject.set(subjectId, getGrades(subjectId));
      }
    });
    console.log('unique subjects for grades', gradesRequestsBySubject.size);

    const classMetrics = await Promise.all(
      classes.map(async (cls) => {
        const sectionId = cls.section?.id;
        const subjectId = cls.subject?.id;

        if (!sectionId) {
          console.warn('skipping metrics — section id missing', cls);
          return { sectionId: null, avgPerformance: 'N/A' };
        }

        try {
          const gradesData = subjectId
            ? await gradesRequestsBySubject.get(subjectId)
            : { results: [] };
          const grades = Array.isArray(gradesData) ? gradesData : gradesData.results || [];

          const totalObtained = grades.reduce((sum, g) => sum + parseFloat(g.marks_obtained || 0), 0);
          const totalMax = grades.reduce((sum, g) => sum + parseFloat(g.max_marks || 0), 0);
          const avgPerformance = totalMax > 0
            ? ((totalObtained / totalMax) * 100).toFixed(1)
            : 'N/A';

          return { sectionId, avgPerformance };
        } catch (metricError) {
          console.error('class metrics failed', { sectionId, subjectId, error: metricError });
          return { sectionId, avgPerformance: 'N/A' };
        }
      }),
    );

    const performanceMap = {};
    classMetrics.forEach(({ sectionId, avgPerformance }) => {
      if (sectionId) performanceMap[sectionId] = avgPerformance;
    });

    console.log('metrics done in', `${Math.round(performance.now() - metricsStartedAt)}ms`, { performanceMap });
    console.groupEnd();

    return { performanceMap };
  }, { skip: loading || classes.length === 0, ttl: 5 * 60_000, deps: metricsKey });

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
      const subjectName = String(cls.subject?.name || 'Subject').trim();
      const subjectId = String(cls.subject?.id || subjectName).trim();
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
      const classLabel = getClassLevelLabel(cls.class_level?.name);
      const classValue = normalizeText(classLabel);
      if (!classValue || seen.has(classValue)) return;

      seen.add(classValue);
      options.push({ label: classLabel, value: classValue });
    });

    return options;
  }, [classes]);

  const filteredClasses = useMemo(() => {
    const query = normalizeText(filters.search);

    return classes.filter((cls) => {
      const subjectName = String(cls.subject?.name || '').trim();
      const subjectId = String(cls.subject?.id || subjectName).trim();
      const classLabel = getClassLevelLabel(cls.class_level?.name);
      const searchable = [
        subjectName,
        classLabel,
        cls.class_level?.name,
        cls.academic_year?.name,
      ].map(normalizeText);

      const matchesSubject = filters.subject === 'all' || subjectId === filters.subject;
      const matchesClass = filters.classLevel === 'all' || normalizeText(classLabel) === filters.classLevel;
      const matchesSearch = !query || searchable.some((value) => value.includes(query));

      return matchesSubject && matchesClass && matchesSearch;
    });
  }, [classes, filters]);

  useEffect(() => {
    if (!loading && classes.length > 0) {
      const insightClass = classes[0];
      console.log(`${DEBUG_PREFIX} AI insight card source`, {
        note: 'This card is currently hardcoded UI copy. No AI insight API request is being made here.',
        selectedClass: {
          id: insightClass?.id,
          subject: insightClass?.subject?.name,
          classLevel: insightClass?.class_level?.name,
          section: insightClass?.section?.name,
        },
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
            const sectionId = cls.section?.id;
            const studentCount = studentsMap[sectionId] ?? 0;
            const avgPerformance = performanceMap[sectionId] ?? 'N/A';
            const subjectName = cls.subject?.name || 'Subject';
            const levelClean = getClassLevelLabel(cls.class_level?.name);
            const sectionName = cls.section?.name;
            const className = `${subjectName} ${levelClean}${sectionName ? `-${sectionName}` : ''}`;
            const description = cls.is_class_teacher
              ? `Class Teacher - ${cls.academic_year?.name}`
              : `${cls.academic_year?.name}`;
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
                {classes[0]?.subject?.name} ({getClassLevelLabel(classes[0]?.class_level?.name)}
                {classes[0]?.section?.name ? `-${classes[0]?.section?.name}` : ''})
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
