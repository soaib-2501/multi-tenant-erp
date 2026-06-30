import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { schoolAdminApi } from "../services/schoolAdminApi";
import apiClient from "../services/axiosClient";

const SchoolAdminContext = createContext();

const LOAD_LABELS = [
  "classLevels", "sections", "academicYears", "subjects", 
  "teachers", "stats", "trends", "notifications", "settings"
];

export const toList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
};

export const SchoolAdminProvider = ({ children }) => {
  // --- Academic State ---
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // --- Statistics State ---
  const [studentsCount, setStudentsCount] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [enrollmentTrends, setEnrollmentTrends] = useState([]);

  // --- Utility / UI State ---
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);
  const [sectionsByClass, setSectionsByClass] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Derived Selectors ---
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const notificationPreviewList = useMemo(
    () => notifications.slice(0, 4),
    [notifications]
  );

  // --- Isolated Refresh Actions ---
  const refreshAcademics = useCallback(async () => {
    const [classRes, sectionRes, yearRes, subjectRes] = await Promise.allSettled([
      schoolAdminApi.getClassLevels(),
      schoolAdminApi.getSections(),
      schoolAdminApi.getAcademicYears(),
      schoolAdminApi.getSubjects(),
    ]);

    if (classRes.status === "fulfilled") setClassLevels(toList(classRes.value));
    if (sectionRes.status === "fulfilled") setSections(toList(sectionRes.value));
    if (yearRes.status === "fulfilled") setAcademicYears(toList(yearRes.value));
    if (subjectRes.status === "fulfilled") setSubjects(toList(subjectRes.value));

    setSectionsByClass({});
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const statsRes = await schoolAdminApi.getDashboardStats();
      if (statsRes?.total_students != null) setStudentsCount(statsRes.total_students);
      if (statsRes?.active_students != null) setActiveStudents(statsRes.active_students);
      if (statsRes?.total_teachers != null) setTeachersCount(statsRes.total_teachers);
    } catch {
      try {
        // Fallback for fragmented platforms
        const [studentsRes, teachersRes] = await Promise.all([
          apiClient.get("/school-admin/students/"),
          apiClient.get("/school-admin/teachers/"),
        ]);
        const totalStu = studentsRes.data?.count ?? studentsRes.data?.results?.length ?? (Array.isArray(studentsRes.data) ? studentsRes.data.length : 0);
        setStudentsCount(totalStu);

        try {
          const activeRes = await apiClient.get("/school-admin/students/?is_archived=false&page_size=1");
          setActiveStudents(activeRes.data?.count ?? activeRes.data?.results?.length ?? totalStu);
        } catch {
          const stuArr = toList(studentsRes.data);
          const activeFallback = stuArr.filter(s => s.is_archived === false || s.status === "ACTIVE" || s.is_active === true).length;
          setActiveStudents(activeFallback || totalStu);
        }

        setTeachersCount(teachersRes.data?.count ?? teachersRes.data?.results?.length ?? (Array.isArray(teachersRes.data) ? teachersRes.data.length : 0));
      } catch (err) {
        console.error("Failed to refresh school admin stats:", err);
      }
    }
  }, []);

  const refreshTrends = useCallback(async () => {
    try {
      const trendsRes = await schoolAdminApi.getEnrollmentTrends();
      const arr = trendsRes?.results ?? trendsRes?.data ?? trendsRes;
      setEnrollmentTrends(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error("Failed to refresh enrollment trends:", err);
      setEnrollmentTrends([]);
    }
  }, []);

  const refreshTeachers = useCallback(async () => {
    try {
      const data = await schoolAdminApi.getTeachers();
      setTeachers(toList(data));
    } catch (err) {
      console.error("Failed to refresh teachers:", err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await schoolAdminApi.getNotifications();
      setNotifications(toList(response));
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await schoolAdminApi.getSettings();
      setSettings(data);
      return data;
    } catch (err) {
      console.error("Failed to refresh settings:", err);
      throw err;
    }
  }, []);

  // FIXED: Removed 'sectionsByClass' dependency to eliminate UI-freezing infinite render loop.
  const fetchSectionsByClass = useCallback(
    async (classId) => {
      if (!classId) return [];
      
      let localCache;
      setSectionsByClass(prev => {
        localCache = prev[classId];
        return prev;
      });
      if (localCache) return localCache;

      const cachedFromList = sections.filter(
        (s) => String(s.class_level) === String(classId) || String(s.class_level?.id) === String(classId)
      );
      
      if (cachedFromList.length > 0) {
        setSectionsByClass((prev) => ({ ...prev, [classId]: cachedFromList }));
        return cachedFromList;
      }

      const data = await schoolAdminApi.getSectionsByClass(classId);
      const list = toList(data);
      setSectionsByClass((prev) => ({ ...prev, [classId]: list }));
      return list;
    },
    [sections]
  );

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const updateSettings = useCallback(async (payload) => {
    const updated = await schoolAdminApi.updateSettings(payload);
    setSettings(updated);
    return updated;
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        schoolAdminApi.getClassLevels(),
        schoolAdminApi.getSections(),
        schoolAdminApi.getAcademicYears(),
        schoolAdminApi.getSubjects(),
        schoolAdminApi.getTeachers(),
        schoolAdminApi.getDashboardStats(),
        schoolAdminApi.getEnrollmentTrends(),
        schoolAdminApi.getNotifications(),
        schoolAdminApi.getSettings(),
      ]);

      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`Failed to load "${LOAD_LABELS[i]}":`, r.reason);
        }
      });

      const [
        classResult, sectionResult, yearResult, subjectResult,
        teacherResult, statsResult, trendsResult, notificationsResult, settingsResult
      ] = results;
      
      setClassLevels(classResult.status === "fulfilled" ? toList(classResult.value) : []);
      setSections(sectionResult.status === "fulfilled" ? toList(sectionResult.value) : []);
      setAcademicYears(yearResult.status === "fulfilled" ? toList(yearResult.value) : []);
      setSubjects(subjectResult.status === "fulfilled" ? toList(subjectResult.value) : []);
      setTeachers(teacherResult.status === "fulfilled" ? toList(teacherResult.value) : []);

      if (statsResult.status === "fulfilled" && statsResult.value) {
        const stats = statsResult.value;
        if (stats.total_students != null) setStudentsCount(stats.total_students);
        if (stats.active_students != null) setActiveStudents(stats.active_students);
        if (stats.total_teachers != null) setTeachersCount(stats.total_teachers);
      } else {
        await refreshStats();
      }

      if (trendsResult.status === "fulfilled") {
        const arr = trendsResult.value?.results ?? trendsResult.value?.data ?? trendsResult.value;
        setEnrollmentTrends(Array.isArray(arr) ? arr : []);
      }

      const rawNotifications = notificationsResult.status === "fulfilled" ? notificationsResult.value : null;
      const parsedNotifications = rawNotifications?.notifications ?? toList(rawNotifications);

      setNotifications(parsedNotifications);
      setSettings(settingsResult.status === "fulfilled" ? settingsResult.value : null);
      setSectionsByClass({});
    } catch (err) {
      console.error("Failed to load school admin context", err);
      setError(err.message || "Something went wrong loading school admin data.");
    } finally {
      setLoading(false);
    }
  }, [refreshStats]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Context bundle
  const contextValue = useMemo(() => ({
    classLevels, sections, academicYears, subjects, teachers,
    studentsCount, activeStudents, teachersCount, enrollmentTrends,
    notifications, notificationPreviewList, unreadCount, settings,
    loading, error,
    reload: loadAllData,
    refreshAcademics, refreshStats, refreshTrends, refreshTeachers,
    refreshNotifications, refreshSettings, fetchSectionsByClass,
    markNotificationRead, markAllNotificationsRead, updateSettings
  }), [
    classLevels, sections, academicYears, subjects, teachers,
    studentsCount, activeStudents, teachersCount, enrollmentTrends,
    notifications, notificationPreviewList, unreadCount, settings,
    loading, error, loadAllData, refreshAcademics, refreshStats, 
    refreshTrends, refreshTeachers, refreshNotifications, refreshSettings, 
    fetchSectionsByClass, markNotificationRead, markAllNotificationsRead, updateSettings
  ]);

  return (
    <SchoolAdminContext.Provider value={contextValue}>
      {children}
    </SchoolAdminContext.Provider>
  );
};

export const useSchoolAdmin = () => useContext(SchoolAdminContext);