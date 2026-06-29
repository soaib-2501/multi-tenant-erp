import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getStudentProfile,
  getStudentDashboardData,
  getStudentEnrollment,
  getStudentParents,
  getAcademicYear,
  getAssignments,
  getSubmissions,
  getAttendanceRecords,
} from "../services/studentAPIs";
console.log("API BASE:", process.env.REACT_APP_API_BASE_URL);
const StudentContext = createContext();

// Labels used only for debug logging — must match the order of Promise.allSettled calls below.
const LOAD_LABELS = [
  "profile",
  "dashboard",      // → { dashboardRaw, attendanceSummary, grades, reportCard }
  "enrollment",
  "parents",
  "academic",       // → { years, subs }
  "assignments",
  "submissions",
  "attendanceRecords",
];

export const StudentProvider = ({ children }) => {
  const [contextData, setContextData] = useState({
    // Student's own profile from /profiles/students/me/
    profile: null,

    // Combined dashboard payload — shape:
    // {
    //   dashboardRaw:      object | null   (raw /profiles/students/dashboard/ response)
    //   attendanceSummary: object | null   ({ total_days, present, absent, late, half_day, attendance_percentage })
    //   grades:            { results: [] } (from /operations/grades/me/)
    //   reportCard:        object | null   ({ overall_percentage, exams: [...] })
    // }
    dashboard: null,

    // Current enrollment from /academics/enrollments/me/
    // Fields include: class_level_name, section, academic_year, etc.
    enrollment: null,

    parents: [],

    // { years: AcademicYear[], subs: Subject[], classLevel, section, academicYear }
    // (classLevel/section/academicYear come bundled with the subjects
    // response itself — see getStudentSubjects in studentAPIs.js)
    academic: { years: [], subs: [] },

    assignments: [],
    submissions: [],

    // Array of daily attendance records from /operations/attendance/me/
    // Each record: { date, status, ... }
    attendanceRecords: [],
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const refreshSubmissions = async () => {
    const subs = await getSubmissions();
    setContextData((prev) => ({ ...prev, submissions: subs }));
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const results = await Promise.allSettled([
        getStudentProfile(),          // 0 — profile
        getStudentDashboardData(),    // 1 — dashboard bundle
        getStudentEnrollment(),       // 2 — enrollment
        getStudentParents(),          // 3 — parents
        getAcademicYear(),            // 4 — academic years + subjects
        getAssignments(),             // 5 — assignments
        getSubmissions(),             // 6 — submissions
        getAttendanceRecords(),       // 7 — attendance records (last 30 days)
      ]);

      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`Failed to load "${LOAD_LABELS[i]}":`, r.reason);
        }
      });

      const [
        profileResult,
        dashboardResult,
        enrollmentResult,
        parentsResult,
        academicResult,
        assignmentsResult,
        submissionsResult,
        attendanceRecordsResult,
      ] = results;

      const profile     = profileResult.status     === "fulfilled" ? profileResult.value     : null;
      const dashboard   = dashboardResult.status   === "fulfilled" ? dashboardResult.value   : null;
      const enrollment  = enrollmentResult.status  === "fulfilled" ? enrollmentResult.value  : null;
      const parents     = parentsResult.status     === "fulfilled" ? parentsResult.value     : [];
      const academic    = academicResult.status    === "fulfilled" ? academicResult.value    : { years: [], subs: [] };
      const assignments = assignmentsResult.status === "fulfilled" ? assignmentsResult.value : [];
      const submissions = submissionsResult.status === "fulfilled" ? submissionsResult.value : [];
      const attendanceRecords =
        attendanceRecordsResult.status === "fulfilled" ? attendanceRecordsResult.value : [];

      setContextData({
        profile,
        dashboard,
        enrollment,
        parents,
        academic,
        assignments,
        submissions,
        attendanceRecords,
      });

      if (!profile) {
        setLoadError(
          "We couldn't load your profile right now. Please try again, or contact support if this keeps happening.",
        );
      }
    } catch (err) {
      console.error("Failed to load global student data", err);
      setLoadError(err.message || "Something went wrong loading your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <StudentContext.Provider
      value={{
        ...contextData,
        loading,
        error: loadError,
        reload: loadAllData,
        refreshSubmissions,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);