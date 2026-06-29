import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ParentProvider } from '../context/ParentProvider';
import { SchoolAdminProvider } from '../context/SchoolAdminProvider';

/* COMMON */
import Landing from "../pages/Landing";
import Login from "../pages/Login";

/* GLOBAL ADMIN */
import GlobalDashboard from "../pages/globalAdmin/GlobalDashboard";
import Schools from "../pages/globalAdmin/Schools";
import GlobalNotifications from "../pages/globalAdmin/Notifications";
import AddSchool from "../pages/globalAdmin/AddSchool";
import AddDomain from "../pages/globalAdmin/AddDomain";
import Domains from "../pages/globalAdmin/Domains";
import Subscriptions from "../pages/globalAdmin/Subscriptions";
import CreatePlan from "../pages/globalAdmin/CreatePlan";
import AIConfiguration from "../pages/globalAdmin/AIConfiguration";
import PaymentInfrastructure from "../pages/globalAdmin/PaymentInfrastructure";
import EmailConfiguration from "../pages/globalAdmin/EmailConfiguration";
import SecurityAccess from "../pages/globalAdmin/SecurityAccess";
import GlobalSettings from "../pages/globalAdmin/Settings";

/* SCHOOL ADMIN */
import SchoolDashboard from "../pages/schoolAdmin/Dashboard";
import AcademicYears from "../pages/schoolAdmin/AcademicYears";
import CreateAcademicYear from "../pages/schoolAdmin/CreateAcademicYear";
import RolesPermissions from "../pages/schoolAdmin/RolesPermissions";
import CreateRole from "../pages/schoolAdmin/CreateRole";
import Students from "../pages/schoolAdmin/Students";
import AddStudent from "../pages/schoolAdmin/AddStudent";
import Teachers from "../pages/schoolAdmin/Teachers";
import AddTeacher from "../pages/schoolAdmin/AddTeacher";
import Parents from "../pages/schoolAdmin/Parents";
import AddParent from "../pages/schoolAdmin/AddParent";
import ParentStudentMapping from "../pages/schoolAdmin/ParentStudentMapping";
import AddMapping from "../pages/schoolAdmin/AddMapping";
import TeacherAssignment from "../pages/schoolAdmin/TeacherAssignment";
import AssignTeacher from "../pages/schoolAdmin/AssignTeacher";
import SchoolSettings from "../pages/schoolAdmin/Settings";
import GuardianDetails from "../pages/schoolAdmin/GuardianDetails";
import StudentDetails from "../pages/schoolAdmin/StudentDetails";
import EditStudent from "../pages/schoolAdmin/EditStudent";
import TeacherDetails from "../pages/schoolAdmin/TeacherDetails";
import MappingDetail from "../pages/schoolAdmin/MappingDetail";
import EditTeacherAssignment from "../pages/schoolAdmin/EditTeacherAssignment";
import ClassLevels from "../pages/schoolAdmin/ClassLevels"; // Adjust the folder path if yours is slightly different!
import CreateClassSection from "../pages/schoolAdmin/CreateClassSection";
import CreateSubject from '../pages/schoolAdmin/CreateSubject';
import CreateSection from '../pages/schoolAdmin/CreateSection';
import SchoolAdminNotifications from "../pages/schoolAdmin/Notifications";

/* ================= STUDENT ================= */
import StudentDashboard from "../pages/student/Dashboard";
import Notifications from "../pages/student/Notifications";
import Assignments from "../pages/student/Assignments";
import Attendance from "../pages/student/Attendance";
import FeesPayments from "../pages/student/FeesPayments";
import HelpDesk from "../pages/student/HelpDesk";
import LearningMaterialsHub from "../pages/student/LearningMaterialsHub";
import LearningMaterialDetailView from "../pages/student/LearningMaterialDetailView";
import PracticeQuizHub from "../pages/student/PracticeQuizHub";
import ActiveQuiz from "../pages/student/ActiveQuiz";
import QuizResult from "../pages/student/QuizResult";
import Profile from "../pages/student/Profile";
import Subjects from "../pages/student/Subjects";
import Settings from "../pages/student/Settings";
import Recommendations from "../pages/student/Recommendations";
import AiTutor from "../pages/student/AiTutor";
import GradesCard from "../pages/student/GradesCard";

import { StudentProvider } from '../context/StudentProvider';
import Grievance from "../pages/student/Grievance";
import Circulars from "../pages/student/Circulars";

/* TEACHER PAGES */
import MyClassesHub from "../pages/teacher/MyClassesHub";
import AssignmentListPage from "../pages/teacher/AssignmentListPage";
import AssignmentDetailPage from "../pages/teacher/AssignmentDetailPage";
import CreateAssignmentPage from "../pages/teacher/CreateAssignmentPage";
import EditAssignmentPage from "../pages/teacher/EditAssignmentPage";
import PendingSubmissionsPage from "../pages/teacher/PendingSubmissionsPage";
import AttendanceOverview from "../pages/teacher/AttendanceOverview";
import MarkAttendance from "../pages/teacher/MarkAttendance";
import ClassPerformanceManagement from "../pages/teacher/ClassPerformanceManagement";
import Dashboard from "../pages/teacher/Dashboard";
import CreateExamPage from "../pages/teacher/CreateExamPage";
import ExamsListPage from "../pages/teacher/ExamsListPage";
import TeacherNotificationsHub from "../pages/teacher/TeacherNotificationsHub";
import EnterStudentGrades from "../pages/teacher/EnterStudentGrades";
import GradesAssessmentOverview from "../pages/teacher/GradesAssessmentOverview";
import ContentAIToolsDashboard from "../pages/teacher/ContentAIToolsDashboard";
import AIToolWorkspaceLessonPlan from "../pages/teacher/AIToolWorkspaceLessonPlan";
import AIToolWorkspaceWorksheet from "../pages/teacher/AIToolWorkspaceWorksheet";
import AIToolWorkspaceQuiz from "../pages/teacher/AIToolWorkspaceQuiz";
import AIToolWorkspaceQuestionPaper from "../pages/teacher/AIToolWorkspaceQuestionPaper";
import AIToolWorkspaceStudyNotes from "../pages/teacher/AIToolWorkspaceStudyNotes";
import AIToolWorkspacePresentationOutline from "../pages/teacher/AIToolWorkspacePresentationOutline";
import AIToolWorkspaceRubric from "../pages/teacher/AIToolWorkspaceRubric";
import AIToolHistory from "../pages/teacher/AIToolHistory";
import StudentAnalyticsOverview from "../pages/teacher/StudentAnalyticsOverview";
import DetailedStudentAnalytics from "../pages/teacher/DetailedStudentAnalytics";
import TeacherProfileManagement from "../pages/teacher/TeacherProfileManagement";
import TeacherSystemSettings from "../pages/teacher/TeacherSystemSettings";

/* PARENT PAGES */
import ParentDashboard from "../pages/parent/ParentDashboard";
import ChildOverview from "../pages/parent/ChildOverview";
import AttendanceTracker from "../pages/parent/AttendanceTracker";
import AssignmentsOverview from "../pages/parent/AssignmentsOverview";
import GradesAssessmentHub from "../pages/parent/GradesAssessmentHub";
import NotificationsHub from "../pages/parent/NotificationsHub";
import AllInsightsRecommendations from "../pages/parent/AllInsightsRecommendations";
import ParentPortalSettings from "../pages/parent/ParentPortalSettings";

/* Redirect logged-in users to their dashboard when visiting "/" */
function RootRedirect() {
  const token = localStorage.getItem('access_token');
  if (!token) return <Landing />;

  try {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    let mainRole = '';
    if (userData.roles && userData.roles.length > 0) {
      mainRole = userData.roles[0];
    } else if (userData.profiles?.teacher?.exists) {
      mainRole = 'Teacher';
    } else if (userData.profiles?.student?.exists) {
      mainRole = 'Student';
    } else if (userData.profiles?.parent?.exists) {
      mainRole = 'Parent';
    } else if (userData.is_superuser) {
      mainRole = 'Global Admin';
    }

    const lowerRole = mainRole.toLowerCase();
    if (lowerRole.includes('global')) return <Navigate to="/global-admin" replace />;
    if (lowerRole.includes('school')) return <Navigate to="/school-admin" replace />;
    if (lowerRole.includes('teacher')) return <Navigate to="/teacher/dashboard" replace />;
    if (lowerRole.includes('student')) return <Navigate to="/student" replace />;
    if (lowerRole.includes('parent')) return <Navigate to="/parent" replace />;

    return <Navigate to="/student" replace />;
  } catch {
    return <Landing />;
  }
}

function SchoolAdminOutlet() {
  return (
    <SchoolAdminProvider>
      <Outlet />
    </SchoolAdminProvider>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* COMMON */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* ================= GLOBAL ADMIN ================= */}
        <Route path="/global-admin" element={<GlobalDashboard />} />
        <Route path="/global-admin/notifications" element={<GlobalNotifications />} />
        <Route path="/global-admin/settings" element={<GlobalSettings />} />
        <Route path="/global-admin/schools" element={<Schools />} />
        <Route path="/global-admin/add-school" element={<AddSchool />} />
        <Route path="/global-admin/domains" element={<Domains />} />
        <Route path="/global-admin/add-domain" element={<AddDomain />} />
        <Route path="/global-admin/subscriptions" element={<Subscriptions />} />
        <Route path="/global-admin/create-plan" element={<CreatePlan />} />
        <Route path="/global-admin/ai-config" element={<AIConfiguration />} />
        <Route path="/global-admin/payment" element={<PaymentInfrastructure />} />
        <Route path="/global-admin/email" element={<EmailConfiguration />} />
        <Route path="/global-admin/security" element={<SecurityAccess />} />

        {/* ================= SCHOOL ADMIN ================= */}
        <Route path="/school-admin" element={<SchoolAdminOutlet />}>
          <Route index element={<SchoolDashboard />} />
          <Route path="settings" element={<SchoolSettings />} />
          <Route path="academic-years" element={<AcademicYears />} />
          <Route path="academic-years/create" element={<CreateAcademicYear />} />
          <Route path="academic-years/edit/:id" element={<CreateAcademicYear />} />
          <Route path="roles" element={<RolesPermissions />} />
          <Route path="roles/create" element={<CreateRole />} />
          <Route path="roles/edit/:id" element={<CreateRole />} />
          <Route path="students" element={<Students />} />
          <Route path="students/add" element={<AddStudent />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="teachers/create" element={<AddTeacher />} />
          <Route path="parents" element={<Parents />} />
          <Route path="parents/create" element={<AddParent />} />
          <Route path="mapping" element={<ParentStudentMapping />} />
          <Route path="mapping/create" element={<AddMapping />} />
          <Route path="teacher-assignment" element={<TeacherAssignment />} />
          <Route path="teacher-assignment/create" element={<AssignTeacher />} />
          <Route path="parents/:id" element={<GuardianDetails />} />
          <Route path="students/:id" element={<StudentDetails />} />
          <Route path="students/edit/:id" element={<EditStudent />} />
          <Route path="teachers/:id" element={<TeacherDetails />} />
          <Route path="mapping/:id" element={<MappingDetail />} />
          <Route path="teacher-assignment/edit/:id" element={<EditTeacherAssignment />} />
          <Route path="manage-classes" element={<CreateClassSection />} />
          <Route path="notifications" element={<SchoolAdminNotifications />} />
          <Route path="create-subject" element={<CreateSubject />} />
          <Route path="create-section" element={<CreateSection />} />
          <Route path="class-levels" element={<ClassLevels />} />
        </Route>

        {/* ================= STUDENT ================= */}
        <Route path="/students" element={<Navigate to="/student" replace />} />
        <Route
          path="/student"
          element={
            <StudentProvider>
              <StudentDashboard />
            </StudentProvider>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <StudentProvider>
              <Notifications />
            </StudentProvider>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <StudentProvider>
              <Assignments />
            </StudentProvider>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <StudentProvider>
              <Attendance />
            </StudentProvider>
          }
        />
        <Route
          path="/student/fees"
          element={
            <StudentProvider>
              <FeesPayments />
            </StudentProvider>
          }
        />
        <Route
          path="/student/help"
          element={
            <StudentProvider>
              <HelpDesk />
            </StudentProvider>
          }
        />
        <Route
          path="/student/materials"
          element={
            <StudentProvider>
              <LearningMaterialsHub />
            </StudentProvider>
          }
        />
        <Route
          path="/student/materials/view"
          element={
            <StudentProvider>
              <LearningMaterialDetailView />
            </StudentProvider>
          }
        />
        <Route
          path="/student/quiz"
          element={
            <StudentProvider>
              <PracticeQuizHub />
            </StudentProvider>
          }
        />
        <Route
          path="/student/quiz/active"
          element={
            <StudentProvider>
              <ActiveQuiz />
            </StudentProvider>
          }
        />
        <Route
          path="/student/quiz/result"
          element={
            <StudentProvider>
              <QuizResult />
            </StudentProvider>
          }
        />
        <Route
          path="/student/profile"
          element={
            <StudentProvider>
              <Profile />
            </StudentProvider>
          }
        />
        <Route
          path="/student/subjects"
          element={
            <StudentProvider>
              <Subjects />
            </StudentProvider>
          }
        />
        <Route
          path="/student/settings"
          element={
            <StudentProvider>
              <Settings />
            </StudentProvider>
          }
        />
        <Route
          path="/student/recommendations"
          element={
            <StudentProvider>
              <Recommendations />
            </StudentProvider>
          }
        />
        <Route
          path="/student/ai-tutor"
          element={
            <StudentProvider>
              <AiTutor />
            </StudentProvider>
          }
        />
        <Route
          path="/student/grades"
          element={
            <StudentProvider>
              <GradesCard />
            </StudentProvider>
          }
        />
        <Route
          path="/student/grievance"
          element={
            <StudentProvider>
              <Grievance />
            </StudentProvider>
          }
        />
        <Route
          path="/student/circulars"
          element={
            <StudentProvider>
              <Circulars />
            </StudentProvider>
          }
        />

        {/* ================= TEACHER ================= */}
        <Route path="/teacher" element={<Navigate to="/teacher/dashboard" />} />
        <Route path="/teacher/dashboard" element={<Dashboard />} />
        <Route path="/teacher/classes" element={<MyClassesHub />} />
        <Route path="/teacher/classes/:id/performance" element={<ClassPerformanceManagement />} />
        <Route path="/teacher/assignments" element={<AssignmentListPage />} />
        <Route path="/teacher/assignments/create" element={<CreateAssignmentPage />} />
        <Route path="/teacher/assignments/:id" element={<AssignmentDetailPage />} />
        <Route path="/teacher/assignments/:id/edit" element={<EditAssignmentPage />} />
        <Route path="/teacher/submissions/pending" element={<PendingSubmissionsPage />} />
        <Route path="/teacher/attendance" element={<AttendanceOverview />} />
        <Route path="/teacher/attendance/mark/:id?" element={<MarkAttendance />} />
        <Route path="/teacher/exams" element={<ExamsListPage />} />
        <Route path="/teacher/exams/create" element={<CreateExamPage />} />
        <Route path="/teacher/grades" element={<GradesAssessmentOverview />} />
        <Route path="/teacher/grades/enter" element={<EnterStudentGrades />} />
        <Route path="/teacher/ai-tools" element={<ContentAIToolsDashboard />} />
        <Route path="/teacher/ai-tools/lesson-plan" element={<AIToolWorkspaceLessonPlan />} />
        <Route path="/teacher/ai-tools/worksheet" element={<AIToolWorkspaceWorksheet />} />
        <Route path="/teacher/ai-tools/quiz" element={<AIToolWorkspaceQuiz />} />
        <Route path="/teacher/ai-tools/question-paper" element={<AIToolWorkspaceQuestionPaper />} />
        <Route path="/teacher/ai-tools/study-notes" element={<AIToolWorkspaceStudyNotes />} />
        <Route path="/teacher/ai-tools/presentation-outline" element={<AIToolWorkspacePresentationOutline />} />
        <Route path="/teacher/ai-tools/rubric" element={<AIToolWorkspaceRubric />} />
        <Route path="/teacher/ai-tools/history" element={<AIToolHistory />} />
        <Route path="/teacher/analytics" element={<StudentAnalyticsOverview />} />
        <Route path="/teacher/analytics/student/:id" element={<DetailedStudentAnalytics />} />
        <Route path="/teacher/profile" element={<TeacherProfileManagement />} />
        <Route path="/teacher/settings" element={<TeacherSystemSettings />} />
        <Route path="/teacher/notifications" element={<TeacherNotificationsHub />} />

        {/* ================= PARENT ================= */}
        {/* ================= PARENT ================= */}
        <Route path="/parent" element={<ParentProvider><ParentDashboard /></ParentProvider>} />
        <Route path="/parent/child-overview" element={<ParentProvider><ChildOverview /></ParentProvider>} />
        <Route path="/parent/attendance" element={<ParentProvider><AttendanceTracker /></ParentProvider>} />
        <Route path="/parent/assignments" element={<ParentProvider><AssignmentsOverview /></ParentProvider>} />
        <Route path="/parent/grades" element={<ParentProvider><GradesAssessmentHub /></ParentProvider>} />
        <Route path="/parent/ai-insights" element={<ParentProvider><AllInsightsRecommendations /></ParentProvider>} />
        <Route path="/parent/notifications" element={<ParentProvider><NotificationsHub /></ParentProvider>} />
        <Route path="/parent/settings" element={<ParentProvider><ParentPortalSettings /></ParentProvider>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;