export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

console.log("[API SERVICE] Initialized with base URL:", API_BASE_URL);

/**
 * Generic API fetch wrapper with error handling
 */
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`[API] ${options.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      ...options,
      headers,
    });

    console.log(
      `[API RESPONSE] Status: ${response.status} ${response.statusText}`,
    );
    console.log(
      `[API RESPONSE] Content-Type: ${response.headers.get("content-type")}`,
    );

    if (response.status === 204) {
      console.log("[API SUCCESS] 204 No Content");
      return null;
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(
        "[API ERROR] Response is not JSON:",
        text.substring(0, 300),
      );
      throw new Error(
        `API returned ${contentType} instead of JSON.\n` +
          `Status: ${response.status}\n` +
          `URL: ${url}\n` +
          `This usually means:\n` +
          `1. The endpoint doesn't exist\n` +
          `2. The API is not running\n` +
          `3. The base URL is incorrect (currently: ${API_BASE_URL})`,
      );
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.error(
          "[API ERROR] Unauthorized. Token might be expired. Redirecting to login.",
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }

      const errorData = await response.json();
      console.error("[API ERROR] Response error:", errorData);
      throw new Error(
        `API Error ${response.status}: ${errorData.detail || errorData.message || response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("[API SUCCESS] Response data:", data);
    return data;
  } catch (error) {
    console.error("[API EXCEPTION]", error.message);
    throw error;
  }
};

/**
 * Helper to fetch all pages of a paginated API response
 */
export const fetchAllPages = async (initialEndpoint) => {
  const response = await apiCall(initialEndpoint);
  if (response && response.results && response.next) {
    let allResults = [...response.results];
    let nextUrl = response.next;

    while (nextUrl) {
      const urlObj = new URL(nextUrl);
      const nextPath = urlObj.pathname + urlObj.search;
      const nextResponse = await apiCall(nextPath);
      if (nextResponse && nextResponse.results) {
        allResults = [...allResults, ...nextResponse.results];
        nextUrl = nextResponse.next;
      } else {
        break;
      }
    }
    return { ...response, results: allResults };
  }
  return response;
};

/**
 * Get the logged-in user's profile
 * GET /api/v1/profiles/me/
 *
 * Returns:
 * {
 *   "identity": { id, email, first_name, last_name, school_id },
 *   "roles": [],
 *   "is_superuser": false,
 *   "profiles": {
 *     "student": { exists, id },
 *     "teacher": { exists, id },
 *     "parent": { exists, id }
 *   }
 * }
 */
export const getMyProfile = () => apiCall("/api/v1/profiles/me/");

/**
 * Get teacher's assigned classes
 * GET /api/v1/academics/teacher-assignments/?teacher=<id>&status=current
 */
export const getTeacherClasses = (teacherId, status = "current") =>
  apiCall(
    `/api/v1/academics/teacher-assignments/?teacher=${teacherId}&status=${status}`,
  );

/**
 * Get a specific teacher assignment by ID
 * GET /api/v1/academics/teacher-assignments/<id>/
 */
export const getTeacherAssignment = (id) =>
  apiCall(`/api/v1/academics/teacher-assignments/${id}/`);

/**
 * Get current teacher's assignments — resolves teacher from JWT, no teacherId needed.
 * GET /api/v1/academics/teacher-assignments/me/
 *
 * Returns: { count, results: [{ id, academic_year, class_level, section, subject, is_class_teacher, student_count }] }
 * All nested fields are objects: e.g. section: { id, name }, not raw IDs.
 */
export const getMyTeacherAssignments = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiCall(`/api/v1/academics/teacher-assignments/me/${qs ? '?' + qs : ''}`);
};

/**
 * Get students enrolled in a section
 * GET /api/v1/academics/enrollments/?section=<id>&academic_year=<id>
 */
export const getSectionEnrollments = (sectionId, academicYearId) => {
  let endpoint = "/api/v1/academics/teacher-assignments/my-students/";
  const params = [];

  if (sectionId) params.push(`section=${sectionId}`);
  if (academicYearId) params.push(`academic_year=${academicYearId}`);

  if (params.length > 0) {
    endpoint += `?${params.join("&")}`;
  }

  return fetchAllPages(endpoint);
};

/**
 * Get individual student profile details
 * GET /api/v1/profiles/students/<id>/
 */
export const getStudentProfile = (studentId) =>
  apiCall(`/api/v1/profiles/students/${studentId}/`);

/**
 * Get individual teacher profile details
 * GET /api/v1/profiles/teachers/<id>/
 */
export const getTeacherProfile = (teacherId) =>
  apiCall(`/api/v1/profiles/teachers/${teacherId}/`);

/**
 * Bulk record attendance
 * POST /api/v1/operations/attendance/bulk-record/
 */
export const bulkRecordAttendance = (payload) =>
  apiCall("/api/v1/operations/attendance/bulk-record/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/**
 * Get attendance records
 * GET /api/v1/operations/attendance/
 */
export const getAttendanceRecords = (sectionId, academicYearId, date) => {
  let endpoint = "/api/v1/operations/attendance/";
  const params = [];

  if (sectionId) params.push(`section=${sectionId}`);
  if (academicYearId) params.push(`academic_year=${academicYearId}`);
  if (date) params.push(`date=${date}`);

  params.push("page_size=1000"); // Ensure we get all records

  if (params.length > 0) {
    endpoint += `?${params.join("&")}`;
  }

  return fetchAllPages(endpoint);
};

/**
 * Get grades
 * GET /api/v1/operations/grades/
 */
export const getGrades = (subjectId, examId) => {
  let endpoint = "/api/v1/operations/grades/";
  const params = new URLSearchParams();
  if (subjectId) params.append("subject", subjectId);
  if (examId) params.append("exam", examId);

  const query = params.toString();
  if (query) {
    endpoint += `?${query}`;
  }
  return fetchAllPages(endpoint);
};

/**
 * Update grade
 * PATCH /api/v1/operations/grades/{id}/
 */
export const updateGrade = (id, data) =>
  apiCall(`/api/v1/operations/grades/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

/**
 * Bulk submit grades
 * POST /api/v1/operations/grades/bulk-submit/
 */
export const bulkSubmitGrades = (data) =>
  apiCall("/api/v1/operations/grades/bulk-submit/", {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Get all exams
 * GET /api/v1/operations/exams/
 */
export const getExams = () => fetchAllPages("/api/v1/operations/exams/");

/**
 * Get a specific exam by ID
 * GET /api/v1/operations/exams/<id>/
 */
export const getExam = (id) => apiCall(`/api/v1/operations/exams/${id}/`);

/**
 * Generic AI API caller – no hardcoded fallback
 */
const callAiApi = async (endpoint, payload) => {
  const AI_API_BASE_URL = process.env.REACT_APP_AI_API_URL; // Removed hardcoded fallback
  const url = `${AI_API_BASE_URL}${endpoint}`;

  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `AI service returned non-JSON response: ${text.substring(0, 300)}`,
      );
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
      const errData = await res.json().catch(() => null);

      let errorMessage =
        res.statusText || `Request failed with status ${res.status}`;

      if (errData) {
        if (Array.isArray(errData)) {
          errorMessage = errData
            .map((i) => (typeof i === "string" ? i : JSON.stringify(i)))
            .join("; ");
        } else if (typeof errData === "object") {
          if (errData.detail) {
            errorMessage = errData.detail;
          } else {
            const parts = [];
            for (const [k, v] of Object.entries(errData)) {
              if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
              else parts.push(`${k}: ${String(v)}`);
            }
            if (parts.length > 0) errorMessage = parts.join(" | ");
          }
        } else if (typeof errData === "string") {
          errorMessage = errData;
        }
      }

      const e = new Error(errorMessage);
      e.details = errData;

      try {
        const isMissingBodyFields =
          Array.isArray(errData?.detail) &&
          errData.detail.some((it) => it?.type === "missing");
        if (res.status === 422 && isMissingBodyFields) {
          console.warn(
            `[AI API] Received 422 missing-body-fields for ${endpoint}. Retrying with query params.`,
          );
          const qs = new URLSearchParams();
          for (const [k, v] of Object.entries(payload || {})) {
            if (v !== undefined && v !== null) qs.append(k, String(v));
          }
          const altUrl = `${AI_API_BASE_URL}${endpoint}?${qs.toString()}`;
          const altRes = await fetch(altUrl, { method: "POST", headers });
          const altContentType = altRes.headers.get("content-type") || "";
          if (!altRes.ok) {
            const altErr = await altRes.json().catch(() => null);
            const altMsg =
              altErr?.detail || altErr?.message || altRes.statusText;
            const altE = new Error(`Retry with query params failed: ${altMsg}`);
            altE.details = altErr;
            throw altE;
          }
          if (!altContentType.includes("application/json")) {
            const text = await altRes.text();
            throw new Error(
              `AI service retry returned non-JSON response: ${text.substring(0, 300)}`,
            );
          }
          const altData = await altRes.json();
          return altData;
        }
      } catch (retryErr) {
        console.error("[AI API] Retry attempt failed", retryErr);
      }

      throw e;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    if (err && err.details) {
      console.error(`[AI API ERROR] ${endpoint}`, err.message, err.details);
    } else {
      console.error(`[AI API ERROR] ${endpoint}`, err);
    }
    throw err;
  }
};

/**
 * Generate a lesson plan using AI endpoint
 * POST /api/v1/generate_lesson_plan/
 */
export const generateLessonPlan = (payload) =>
  callAiApi("/api/v1/generate_lesson_plan", payload);

export const generateWorksheet = (payload) =>
  callAiApi("/api/v1/generate_worksheet", payload);
export const generateQuiz = (payload) =>
  callAiApi("/api/v1/generate_quiz", payload);
export const generateQuestionPaper = (payload) =>
  callAiApi("/api/v1/generate_question_paper", payload);
export const generateStudyNotes = (payload) =>
  callAiApi("/api/v1/generate_study_notes", payload);
export const generatePresentationOutline = (payload) =>
  callAiApi("/api/v1/generate_presentation_outline", payload);
export const generateRubric = (payload) =>
  callAiApi("/api/v1/generate_rubric", payload);

// --- Saved AI Content APIs ---

export const getSavedAIContent = (params = {}) => {
  let endpoint = "/api/v1/academics/saved-ai-content/";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.append(key, value);
  }
  const qStr = query.toString();
  if (qStr) endpoint += `?${qStr}`;
  
  // Don't fetch all pages if limit is specified - respect pagination
  if (params.limit !== undefined) {
    return apiCall(endpoint);
  }
  
  return fetchAllPages(endpoint);
};

export const getSavedAIContentById = (id) =>
  apiCall(`/api/v1/academics/saved-ai-content/${id}/`);

export const saveAIContent = (payload) =>
  apiCall("/api/v1/academics/saved-ai-content/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateSavedAIContent = (id, payload) =>
  apiCall(`/api/v1/academics/saved-ai-content/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteSavedAIContent = (id) =>
  apiCall(`/api/v1/academics/saved-ai-content/${id}/`, {
    method: "DELETE",
  });

// --- Assignment APIs ---

/**
 * Get all assignments
 * GET /api/v1/operations/assignments/
 * Query params: section, subject, teacher
 */
export const getAssignments = (params = {}) => {
  let endpoint = "/api/v1/operations/assignments/";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.append(key, value);
  }
  const qStr = query.toString();
  if (qStr) endpoint += `?${qStr}`;
  return fetchAllPages(endpoint);
};

/**
 * Get a specific assignment by ID
 * GET /api/v1/operations/assignments/<id>/
 */
export const getAssignment = (id) =>
  apiCall(`/api/v1/operations/assignments/${id}/`);

/**
 * Create a new assignment
 * POST /api/v1/operations/assignments/
 */
export const createAssignment = (payload) =>
  apiCall("/api/v1/operations/assignments/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/**
 * Update an assignment
 * PATCH /api/v1/operations/assignments/<id>/
 */
export const updateAssignment = (id, payload) =>
  apiCall(`/api/v1/operations/assignments/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

/**
 * Delete an assignment
 * DELETE /api/v1/operations/assignments/<id>/
 */
export const deleteAssignment = (id) =>
  apiCall(`/api/v1/operations/assignments/${id}/`, {
    method: "DELETE",
  });

// --- Submission APIs ---

/**
 * Get all submissions
 * GET /api/v1/operations/submissions/
 * Query params: page, search
 */
export const getSubmissions = (params = {}) => {
  let endpoint = "/api/v1/operations/submissions/";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.append(key, value);
  }
  const qStr = query.toString();
  if (qStr) endpoint += `?${qStr}`;
  
  // Don't fetch all pages if page is specified - respect pagination
  if (params.page !== undefined) {
    return apiCall(endpoint);
  }
  
  return fetchAllPages(endpoint);
};

/**
 * Get a specific submission by ID
 * GET /api/v1/operations/submissions/<id>/
 */
export const getSubmission = (id) =>
  apiCall(`/api/v1/operations/submissions/${id}/`);

/**
 * Get all submissions for a specific assignment
 * GET /api/v1/operations/submissions/assignment/<assignment_id>/
 * Returns: { assignment: {}, summary: {}, submissions: [] }
 */
export const getSubmissionsByAssignment = (assignmentId, params = {}) => {
  let endpoint = `/api/v1/operations/submissions/assignment/${assignmentId}/`;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.append(key, value);
  }
  const qStr = query.toString();
  if (qStr) endpoint += `?${qStr}`;
  
  // This endpoint returns a structured object, not paginated results
  return apiCall(endpoint);
};

/**
 * Get all pending (ungraded) submissions across teacher's assignments
 * GET /api/v1/operations/submissions/pending/
 * Query params: assignment_id (optional)
 */
export const getPendingSubmissions = (params = {}) => {
  let endpoint = "/api/v1/operations/submissions/pending/";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.append(key, value);
  }
  const qStr = query.toString();
  if (qStr) endpoint += `?${qStr}`;
  return fetchAllPages(endpoint);
};

/**
 * Create a new submission
 * POST /api/v1/operations/submissions/
 */
export const createSubmission = (payload) =>
  apiCall("/api/v1/operations/submissions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/**
 * Delete a submission
 * DELETE /api/v1/operations/submissions/<id>/
 */
export const deleteSubmission = (id) =>
  apiCall(`/api/v1/operations/submissions/${id}/`, {
    method: "DELETE",
  });

/**
 * Confirm a submission after file upload to R2
 * POST /api/v1/operations/submissions/confirm/
 * Body: { file, grade, status, assignment, student }
 */
export const confirmSubmission = (payload) =>
  apiCall("/api/v1/operations/submissions/confirm/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/**
 * Grade a submission
 * PATCH /api/v1/operations/submissions/<id>/grade/
 * Body: { grade, remarks }
 */
export const gradeSubmission = (id, payload) =>
  apiCall(`/api/v1/operations/submissions/${id}/grade/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

/**
 * Request upload URL for submission file
 * POST /api/v1/operations/submissions/request-upload/
 * Body: { assignment_id, file_name, content_type }
 */
export const requestSubmissionUpload = (payload) =>
  apiCall("/api/v1/operations/submissions/request-upload/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  
