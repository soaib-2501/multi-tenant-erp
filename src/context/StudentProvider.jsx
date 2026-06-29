import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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

const StudentContext = createContext();

const LOAD_LABELS = [
  "profile",
  "dashboard",
  "enrollment",
  "parents",
  "academic",
  "assignments",
  "submissions",
  "attendanceRecords",
];

export const StudentProvider = ({ children }) => {
  const [contextData, setContextData] = useState({
    profile: null,
    dashboard: null,
    enrollment: null,
    parents: [],
    academic: { years: [], subs: [] },
    assignments: [],
    submissions: [],
    attendanceRecords: [],
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ✅ FIX 1: useCallback so this function reference is stable across renders
  const refreshSubmissions = useCallback(async () => {
    const subs = await getSubmissions();
    setContextData((prev) => ({ ...prev, submissions: subs }));
  }, []); // no deps needed — setContextData is stable

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const results = await Promise.allSettled([
        getStudentProfile(),
        getStudentDashboardData(),
        getStudentEnrollment(),
        getStudentParents(),
        getAcademicYear(),
        getAssignments(),
        getSubmissions(),
        getAttendanceRecords(),
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

      const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
      const dashboard = dashboardResult.status === "fulfilled" ? dashboardResult.value : null;
      const enrollment = enrollmentResult.status === "fulfilled" ? enrollmentResult.value : null;
      const parents = parentsResult.status === "fulfilled" ? parentsResult.value : [];
      const academic = academicResult.status === "fulfilled" ? academicResult.value : { years: [], subs: [] };
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

  // ✅ FIX 2: useMemo so the context value object is only recreated
  // when the actual data changes — not on every render cycle.
  // This stops Sidebar and other consumers from re-rendering unnecessarily,
  // which was causing the repeated profile-picture fetches.
  const contextValue = useMemo(() => ({
    ...contextData,
    loading,
    error: loadError,
    reload: loadAllData,
    refreshSubmissions,
  }), [contextData, loading, loadError, loadAllData, refreshSubmissions]);

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);