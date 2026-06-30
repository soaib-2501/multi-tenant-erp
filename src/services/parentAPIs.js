import api from "./axiosClient";

const isNotFoundError = (error) => error?.response?.status === 404;
const isForbiddenError = (error) => error?.response?.status === 403;

/* ---------- Parent's own profile ---------- */

export const getParentProfile = async () => {
  const response = await api.get(`/profiles/parents/me/`);
  return response.data;
};

/* ---------- Children list / active child / switching ---------- */

// Lightweight list of all children mapped to this parent
export const getParentChildren = async () => {
  const response = await api.get(`/profiles/parents/me/children/`);
  return response.data.children || [];
};

// Server-tracked "active child" pointer
export const getActiveChild = async () => {
  const response = await api.get(`/profiles/parents/me/children/active/`);
  return response.data.active_child || null;
};

// Switch the server-tracked active child (kept in sync in the background)
export const switchActiveChild = async (childId) => {
  const response = await api.post(`/profiles/parents/me/children/switch/`, {
    child_id: childId,
  });
  return response.data;
};

/* ---------- Dashboard ---------- */

// ONE call -> parent info + every child + each child's full dashboard bundle.
// This is the main data source for the Parent Dashboard page.
export const getParentFullDashboard = async () => {
  const response = await api.get(`/profiles/parents/dashboard/`);
  return response.data;
};

// Single child detail (extra profile fields: DOB, blood group, picture)
// + the same dashboard bundle, scoped to just this one child.
export const getChildDetail = async (childId) => {
  const response = await api.get(`/profiles/parents/me/children/${childId}/`);
  return response.data;
};

/* ---------- Attendance ---------- */

// summary + day-wise records for one child.
// Optional filters: { month, year } OR { startDate, endDate }
export const getChildAttendance = async (childId, filters = {}) => {
  const { month, year, startDate, endDate } = filters;
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (year) params.append("year", year);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  const qs = params.toString();
  const response = await api.get(
    `/profiles/parents/me/children/${childId}/attendance/${qs ? `?${qs}` : ""}`
  );
  return response.data;
};

/* ---------- Grades ---------- */

// Exam-wise / subject-wise grade report for one child (NOT permission-gated).
export const getChildGrades = async (childId) => {
  const response = await api.get(`/profiles/parents/me/children/${childId}/grades/`);
  return response.data;
};

/* ---------- Timetable ---------- */

// Day-wise timetable for one child (based on their class/section assignment).
export const getChildTimetable = async (childId) => {
  const response = await api.get(`/profiles/parents/me/children/${childId}/timetable/`);
  return response.data;
};

/* ---------- Assignments & submissions ---------- */
/* NOTE: these need can_view_academics = true on the parent-student mapping,
   otherwise the API returns 403. We catch that and return a flag instead of
   throwing, so the UI can show "ask school to enable access" instead of
   crashing. Wired up properly on the Assignments page (next round). */

export const getChildAssignments = async (childId) => {
  try {
    const response = await api.get(`/profiles/parents/me/children/${childId}/assignments/`);
    return response.data;
  } catch (error) {
    if (isForbiddenError(error)) return { unauthorized: true, results: [], count: 0 };
    if (isNotFoundError(error)) return { results: [], count: 0 };
    throw error;
  }
};

export const getChildSubmissions = async (childId) => {
  try {
    const response = await api.get(`/profiles/parents/me/children/${childId}/submissions/`);
    return response.data;
  } catch (error) {
    if (isForbiddenError(error)) return { unauthorized: true, results: [], count: 0 };
    if (isNotFoundError(error)) return { results: [], count: 0 };
    throw error;
  }
};

/* ---------- Parent-student mapping (permissions) ---------- */

export const getParentStudentMappings = async () => {
  const response = await api.get(`/profiles/parent-student-mappings/`);
  return response.data.results || [];
};

export const updateParentStudentMapping = async (mappingId, payload) => {
  const response = await api.patch(
    `/profiles/parent-student-mappings/${mappingId}/`,
    payload
  );
  return response.data;
};

/* ---------- Circulars ---------- */
/* Read-only for parents — admin handles create/update/delete.
   Backend filters to is_published=True + target_audience in [Parent, All]
   for non-admin roles, same as the student-side endpoint. */

export const getParentCirculars = async () => {
  try {
    const response = await api.get(`/school-admin/circulars/`);
    return response.data.results || response.data || [];
  } catch (error) {
    if (isNotFoundError(error) || isForbiddenError(error)) return [];
    throw error;
  }
};