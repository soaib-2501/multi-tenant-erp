import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { getTeacherAssignment, getSectionEnrollments, bulkRecordAttendance, getAttendanceRecords, getMyProfile, getTeacherClasses } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { RevalidatingBar, SkeletonBlock, SkeletonRow } from "../../components/erp/teacher/LoadingPrimitives";
import { useTheme } from "../../context/ThemeContext";

/**
 * MarkAttendance
 *
 * Two-phase loading strategy:
 *  Phase 1 (cached / SWR): assignment + student roster — stable, rarely changes
 *  Phase 2 (always fresh):  attendance records for selected date — must be fresh
 *
 * Changing the date ONLY re-fetches attendance, never the roster.
 */
const MarkAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceOverlay, setAttendanceOverlay] = useState({}); // { [studentId]: { status, remark } }
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const dateDebounceRef = useRef(null);

  // ── Load available classes for filters ─────────────────────────────────────
  const { data: profile } = useStaleData("profile:me", getMyProfile);
  const teacherId = profile?.profiles?.teacher?.id || profile?.identity?.id;

  const { data: assignmentsData, loading: classesLoading } = useStaleData(
    `teacher:classes:${teacherId}`,
    () => getTeacherClasses(teacherId),
    { skip: !teacherId }
  );
  
  const allClasses = assignmentsData?.results || [];

  // Auto-select first class if no id in URL but classes are loaded
  useEffect(() => {
    if (!id && allClasses.length > 0) {
      navigate(`/teacher/attendance/mark/${allClasses[0].id}`, { replace: true });
    }
  }, [id, allClasses, navigate]);

  // ── Identify Current Class ────────────────────────────────────────────────
  const currentClass = allClasses.find(c => String(c.id) === String(id)) || null;
  const assignment = currentClass; // For component backwards compatibility
  const sectionId = assignment ? (typeof assignment.section === 'object' ? assignment.section?.id : assignment.section || assignment.section_id) : null;
  const academicYearId = assignment ? (typeof assignment.academic_year === 'object' ? assignment.academic_year?.id : assignment.academic_year || assignment.academic_year_id) : null;

  // ── Phase 1: cached roster ────────────────────────────────────────────────
  const {
    data: rosterPayloadRaw,
    loading: rosterLoadingRaw,
    revalidating,
    error: rosterError,
  } = useStaleData(
    `attendance:roster:section:${sectionId}`,
    async () => {
      let students = [];
      if (sectionId) {
        const enrollmentsData = await getSectionEnrollments(sectionId, academicYearId);
        const arr = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData.results || [];
        students = arr.map(enr => ({
          id: enr.id,
          student_id: enr.student?.id || enr.student || enr.student_id,
          name: enr.student_name,
          initials: enr.student_name?.charAt(0).toUpperCase() ?? '?',
          roll: enr.student_enrollment_no || `Roll ${enr.roll_number || 'N/A'}`,
          email: enr.email,
          enrollment_number: enr.student_enrollment_no,
          first_name: enr.first_name,
          last_name: enr.last_name
        }));
      }
      return { students, sectionId };
    },
    { skip: !sectionId || !academicYearId }
  );

  // Guard against stale data leakage from previous sections
  const isCurrentRoster = rosterPayloadRaw?.sectionId === sectionId;
  const students = isCurrentRoster ? (rosterPayloadRaw?.students ?? []) : [];
  const rosterLoading = classesLoading || rosterLoadingRaw || (sectionId && !isCurrentRoster);

  // ── Phase 2: date-specific attendance (always fresh, debounced) ───────────
  const fetchAttendanceForDate = useCallback(async (date, targetSectionId, targetAcademicYearId) => {
    if (!targetSectionId || !targetAcademicYearId) return;
    setAttendanceLoading(true);
    try {
      const attendanceData = await getAttendanceRecords(targetSectionId, targetAcademicYearId, date);
      const records = Array.isArray(attendanceData) ? attendanceData : attendanceData.results || [];
      const overlay = {};
      records.forEach(r => {
        const sId = r.student_id || r.student;
        overlay[sId] = { status: r.status, remark: r.remarks || '' };
      });
      setAttendanceOverlay(overlay);
      setError(null);
    } catch (err) {
      console.warn('[ATTENDANCE] Could not fetch records for date:', date, err.message);
      setError("Failed to load attendance records for this date.");
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  // Fetch attendance whenever date or sectionId changes — debounced 300ms
  useEffect(() => {
    if (!sectionId || !academicYearId) return;
    setAttendanceOverlay({}); // Clear old attendance instantly
    clearTimeout(dateDebounceRef.current);
    dateDebounceRef.current = setTimeout(() => {
      fetchAttendanceForDate(attendanceDate, sectionId, academicYearId);
    }, 300);
    return () => clearTimeout(dateDebounceRef.current);
  }, [attendanceDate, sectionId, academicYearId, fetchAttendanceForDate]);

  // ── Derived student list with attendance merged ───────────────────────────
  const studentsWithAttendance = students.map(s => ({
    ...s,
    status: attendanceOverlay[s.student_id]?.status || 'Present',
    remark: attendanceOverlay[s.student_id]?.remark || '',
  }));

  const updateStatus = (studentEnrollmentId, newStatus) => {
    // Find the student_id from enrollment id
    const student = students.find(s => s.id === studentEnrollmentId);
    if (!student) return;
    setAttendanceOverlay(prev => ({
      ...prev,
      [student.student_id]: {
        ...prev[student.student_id],
        status: newStatus,
        remark: prev[student.student_id]?.remark || '',
      }
    }));
  };

  const updateRemark = (studentId, newRemark) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    setAttendanceOverlay(prev => ({
      ...prev,
      [student.student_id]: {
        ...prev[student.student_id],
        status: prev[student.student_id]?.status || 'Present',
        remark: newRemark,
      }
    }));
  };

  const markAllPresent = () => {
    const overlay = {};
    students.forEach(s => {
      overlay[s.student_id] = { status: 'Present', remark: attendanceOverlay[s.student_id]?.remark || '' };
    });
    setAttendanceOverlay(overlay);
  };

  const handleRemarkClick = (student) => {
    const newRemark = window.prompt(`Enter remark for ${student.name}:`, student.remark);
    if (newRemark !== null) {
      setAttendanceOverlay(prev => ({
        ...prev,
        [student.student_id]: {
          ...prev[student.student_id],
          status: prev[student.student_id]?.status || 'Present',
          remark: newRemark,
        }
      }));
    }
  };

  const handleSubmitAttendance = async () => {
    if (!assignment || students.length === 0) {
      setError("No class selected or roster is empty.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      
      const classLevelId = assignment.class_level_id || assignment.class_level;

      const payload = {
        date: attendanceDate,
        academic_year_id: academicYearId,
        class_level_id: classLevelId,
        section_id: sectionId,
        records: studentsWithAttendance.map(s => ({
          student_id: s.student_id,
          status: s.status,
          remarks: s.remark,
        }))
      };

      await bulkRecordAttendance(payload);
      setSuccessMsg("Attendance submitted successfully!");
      
      setTimeout(() => {
        navigate("/teacher/attendance");
      }, 2000);
    } catch (err) {
      setError('Failed to submit attendance: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Error state ───────────────────────────────────────────────────────────
  if (rosterError && !rosterPayloadRaw) {
    return (
      <MainLayout title="Teacher Portal">
        <div className="p-6 bg-red-50 text-red-900 rounded-lg border border-red-200">
          <p className="font-semibold">Error loading class data:</p>
          <p className="text-sm">{rosterError.message}</p>
        </div>
      </MainLayout>
    );
  }

  // ── Counts ────────────────────────────────────────────────────────────────
  const presentCount = studentsWithAttendance.filter(s => s.status === 'Present').length;
  const absentCount = studentsWithAttendance.filter(s => s.status === 'Absent').length;
  const lateCount = studentsWithAttendance.filter(s => s.status === 'Late').length;
  const successRate = studentsWithAttendance.length > 0
    ? Math.round((presentCount / studentsWithAttendance.length) * 100)
    : 0;

  const subjectName = assignment?.subject_name || 'Subject';
  const levelClean = assignment?.class_level_name?.replace('Grade ', '') || '';
  const classNameStr = `${subjectName} ${levelClean}-${assignment?.section_name || ''}`;

  return (
    <MainLayout title="Teacher Portal">
      <RevalidatingBar show={revalidating || attendanceLoading} />

      <Link
        to="/teacher/attendance"
        className="flex items-center gap-2 text-primary font-semibold text-sm mb-4 hover:-translate-x-1 transition-transform w-max"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Attendance Hub
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-display text-on-surface tracking-tight">Mark Attendance</h2>
          <p className="text-on-surface-variant font-medium">
            {rosterLoading ? 'Loading class...' : classNameStr}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={markAllPresent}
            disabled={rosterLoading}
            className="px-5 py-2.5 rounded-xl bg-surface-container-high text-primary font-bold text-sm transition-all hover:bg-surface-container-highest active:scale-95 disabled:opacity-40"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSubmitAttendance}
            disabled={isSubmitting || rosterLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Attendance'}
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
          <span className="material-symbols-outlined">error</span>
          <div>
            <p className="font-bold text-sm">Action Required</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-8 p-4 bg-green-50 text-green-800 rounded-md border border-green-200 flex gap-3 shadow-sm">
          <span className="material-symbols-outlined">check_circle</span>
          <div>
            <p className="font-bold text-sm">Success!</p>
            <p className="text-sm mt-1">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

        {/* Left: Summary + Filters */}
        <div className="col-span-1 lg:col-span-4 space-y-8">
          {/* Summary Card */}
          <div className={`rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-700 to-blue-800 text-white shadow-2xl' 
              : 'bg-surface-container-lowest border border-outline-variant/10 text-on-surface shadow-sm'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl ${darkMode ? 'bg-white/10' : 'bg-primary/5'}`} />
            <div className="relative z-10">
              <h3 className={`font-semibold mb-6 flex items-center gap-2 ${darkMode ? 'text-blue-100' : 'text-primary'}`}>
                <span className="material-symbols-outlined">analytics</span>
                Live Overview
              </h3>
              <div className="flex justify-between items-end mb-8">
                <div>
                  {rosterLoading ? (
                    <SkeletonBlock className={`h-14 w-20 ${darkMode ? 'bg-white/25' : ''}`} />
                  ) : (
                    <p className="text-5xl font-extrabold font-display">{studentsWithAttendance.length}</p>
                  )}
                  <p className={`text-sm mt-1 ${darkMode ? 'text-white/70' : 'text-on-surface-variant'}`}>Total Students</p>
                </div>
                <div className="text-right">
                  {rosterLoading ? (
                    <SkeletonBlock className={`h-8 w-14 ml-auto ${darkMode ? 'bg-white/25' : ''}`} />
                  ) : (
                    <p className="text-2xl font-bold">{successRate}%</p>
                  )}
                  <p className={`text-sm mt-1 ${darkMode ? 'text-blue-200' : 'text-primary'}`}>Presence</p>
                </div>
              </div>
              <div className={`grid grid-cols-3 gap-4 pt-6 border-t ${darkMode ? 'border-white/10' : 'border-outline-variant/10'}`}>
                <div>
                  {rosterLoading ? <SkeletonBlock className={`h-7 w-8 ${darkMode ? 'bg-white/25' : ''}`} /> : <p className="text-xl font-bold">{presentCount}</p>}
                  <p className={`text-2xs uppercase tracking-wider ${darkMode ? 'text-blue-200' : 'text-on-surface-variant'}`}>Present</p>
                </div>
                <div>
                  {rosterLoading ? <SkeletonBlock className={`h-7 w-8 ${darkMode ? 'bg-white/25' : ''}`} /> : <p className={`text-xl font-bold ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{absentCount}</p>}
                  <p className={`text-2xs uppercase tracking-wider ${darkMode ? 'text-red-200/70' : 'text-red-600/80'}`}>Absent</p>
                </div>
                <div>
                  {rosterLoading ? <SkeletonBlock className={`h-7 w-8 ${darkMode ? 'bg-white/25' : ''}`} /> : <p className={`text-xl font-bold ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>{lateCount}</p>}
                  <p className={`text-2xs uppercase tracking-wider ${darkMode ? 'text-orange-200/70' : 'text-orange-600/80'}`}>Late</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Card */}
          <Card className="rounded-2xl p-8 border border-outline-variant/10 shadow-sm bg-surface-container-lowest">
            <h4 className="text-on-surface font-bold mb-6 flex items-center">
              <span className="material-symbols-outlined mr-2 text-primary">database</span>
              Model Context (Required)
            </h4>
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Class Name</label>
                <select 
                  value={id || ''}
                  onChange={(e) => navigate(`/teacher/attendance/mark/${e.target.value}`)}
                  className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  disabled={isSubmitting || classesLoading}
                >
                  {allClasses.length > 0 ? allClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.subject_name} ({cls.class_level_name} - {cls.section_name})
                    </option>
                  )) : (
                    <option value={id}>{classNameStr || 'Loading…'}</option>
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date of Record</label>
                <div className="relative">
                  <input
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full bg-surface-container-low border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface"
                    type="date"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Academic Year</label>
                <div className="relative">
                  <input
                    value={assignment?.academic_year_name || ''}
                    disabled
                    className="w-full bg-surface-container-low border-transparent text-on-surface-variant rounded-xl px-4 py-3 text-sm font-medium opacity-70 cursor-not-allowed"
                    placeholder="Select class first"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* AI Insight */}
          <div className="bg-amber-500/10 rounded-3xl p-6 relative overflow-hidden border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-700 dark:bg-amber-800 text-white p-2 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
              </div>
              <div className="relative z-10">
                <h5 className="text-amber-900 dark:text-amber-300 font-bold text-sm">Attendance Insight</h5>
                <p className="text-amber-800 dark:text-amber-200 text-xs mt-1 leading-relaxed">
                  Students with recurring absences may benefit from a personalized check-in. Consider reaching out to their guardians.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Student Roster */}
        <div className="col-span-1 lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/10">
            {/* Table Header */}
            <div className="px-8 py-6 bg-surface-container-low flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-bold text-on-surface">Student Roster</h3>
                {attendanceLoading && (
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" title="Refreshing attendance…" />
                )}
              </div>
              <div className="flex items-center space-x-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                <span>Status Key:</span>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1" /> P</span>
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1" /> A</span>
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1" /> L</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left text-on-surface-variant border-b border-outline-variant/10 bg-surface-container-lowest">
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest">Student Identity</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest">Enrollment No.</th>
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-center">Record Status</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/50">
                  {rosterLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
                    : studentsWithAttendance.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-surface-container-low transition-colors group"
                        style={{ opacity: attendanceLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {student.initials}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-on-surface">{student.name}</p>
                              <p className="text-xs text-on-surface-variant">{student.email}</p>
                            </div>
                          </div>
                         </td>
                        <td className="px-4 py-5 text-sm font-medium text-on-surface-variant">{student.roll}</td>
                        <td className="px-4 py-5">
                          <div className="flex items-center justify-center space-x-2">
                            {['Present', 'Absent', 'Late'].map((status) => {
                              const colors = {
                                Present: { active: 'bg-green-500 text-white shadow-md shadow-green-500/20', idle: 'bg-surface-container-high text-on-surface-variant hover:bg-green-50' },
                                Absent: { active: 'bg-red-500 text-white shadow-md shadow-red-500/20', idle: 'bg-surface-container-high text-on-surface-variant hover:bg-red-50' },
                                Late: { active: 'bg-orange-500 text-white shadow-md shadow-orange-500/20', idle: 'bg-surface-container-high text-on-surface-variant hover:bg-orange-50' },
                              };
                              const isActive = student.status === status;
                              return (
                                <button
                                  key={status}
                                  onClick={() => updateStatus(student.id, status)}
                                  className={`w-12 py-2 rounded-lg font-bold text-xs transition-all ${isActive ? colors[status].active : colors[status].idle}`}
                                >
                                  {status[0]}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-8 py-5 flex justify-end">
                          {student.remark ? (
                            <button
                              onClick={() => handleRemarkClick(student)} 
                              className="text-2xs bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded-md font-bold uppercase tracking-tighter inline-block text-left max-w-[120px] truncate"
                              title={student.remark}
                            >
                              {student.remark}
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleRemarkClick(student)}
                              className="p-2 rounded-lg text-outline hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined">add_comment</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-surface-container-lowest border-t border-outline-variant/10 flex justify-between items-center text-sm font-medium text-on-surface-variant">
              <span>Showing {studentsWithAttendance.length} students</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MarkAttendance;
