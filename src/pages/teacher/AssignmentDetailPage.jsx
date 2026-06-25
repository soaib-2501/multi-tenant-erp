import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { getAssignment, getSubmissionsByAssignment, gradeSubmission, getSectionEnrollments } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";

const normalizeSubmissions = (submissionsData) => {
  if (Array.isArray(submissionsData)) return submissionsData;
  if (submissionsData?.submissions) return submissionsData.submissions;
  if (submissionsData?.results) return submissionsData.results;
  return [];
};

const buildStudentsWithStatus = (studentsList, submissionsList) => {
  const submissionMap = {};
  submissionsList.forEach(sub => {
    const enrollmentNumber = sub.enrollment_number || sub.student_enrollment_no;
    if (enrollmentNumber) {
      submissionMap[enrollmentNumber] = sub;
    }
  });

  return studentsList.map(enrollment => {
    const enrollmentNumber = enrollment.student_enrollment_no || enrollment.enrollment_number;
    const studentId = enrollment.student?.id || enrollment.student_id || enrollment.id || enrollmentNumber;
    const submission = submissionMap[enrollmentNumber];
    const firstName = enrollment.student?.user?.first_name || "";
    const lastName = enrollment.student?.user?.last_name || "";
    const studentName = enrollment.student_name || `${firstName} ${lastName}`.trim() || 'Unknown';
    const status = submission
      ? submission.status || (submission.grade !== null && submission.grade !== undefined ? 'Graded' : 'Submitted')
      : 'Not Submitted';

    return {
      id: studentId,
      name: studentName,
      roll_number: enrollmentNumber || enrollment.roll_number,
      submission: submission,
      status,
      grade: submission?.grade,
      submitted_at: submission?.submitted_at,
      file: submission?.file || submission?.view_url,
      submission_id: submission?.id
    };
  });
};

const fetchAssignmentDetailPayload = async (assignmentId) => {
  const [assignmentData, submissionsData] = await Promise.all([
    getAssignment(assignmentId),
    getSubmissionsByAssignment(assignmentId)
  ]);

  const submissionsList = normalizeSubmissions(submissionsData);
  let studentsWithStatus = [];

  if (assignmentData.section) {
    const studentsData = await getSectionEnrollments(assignmentData.section, null);
    const studentsList = studentsData.results || studentsData || [];
    studentsWithStatus = buildStudentsWithStatus(studentsList, submissionsList);
  }

  return {
    assignment: assignmentData,
    submissions: submissionsList,
    students: studentsWithStatus,
  };
};

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [gradingId, setGradingId] = useState(null);
  const [gradeValue, setGradeValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showSubmittedAt, setShowSubmittedAt] = useState(true);
  const [showStatus, setShowStatus] = useState(true);

  const {
    data: detailData,
    loading,
    revalidating,
    error,
    revalidate,
  } = useStaleData(
    `teacher:assignment-detail:${id}`,
    () => fetchAssignmentDetailPayload(id),
    { ttl: 120_000, skip: !id },
  );

  const assignment = detailData?.assignment;
  const students = detailData?.students || [];

  const handleGradeSubmit = async (submissionId) => {
    if (!submissionId) {
      alert("No submission to grade");
      return;
    }
    
    try {
      await gradeSubmission(submissionId, {
        grade: parseFloat(gradeValue),
        remarks: remarks
      });
      
      // Refresh assignment details
      await revalidate();
      setGradingId(null);
      setGradeValue("");
      setRemarks("");
    } catch (err) {
      alert("Failed to submit grade: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    const nameMatch = student.name?.toLowerCase().includes(term);
    const rollMatch = String(student.roll_number ?? "").toLowerCase().includes(term);
    return nameMatch || rollMatch;
  });

  const gradedCount = students.filter(s => s.status === 'Graded').length;
  const submittedCount = students.filter(s => s.status === 'Submitted' || s.status === 'Graded').length;
  const avgGrade = gradedCount > 0 
    ? students.reduce((acc, s) => acc + (parseFloat(s.grade) || 0), 0) / gradedCount 
    : 0;

  if (loading) {
    return (
      <MainLayout title="Assignment Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-[#0058be] dark:text-blue-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="font-semibold tracking-wide">Loading Assignment Details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !assignment) {
    return (
      <MainLayout title="Assignment Details">
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-100 dark:border-red-800 text-center">
          <span className="material-symbols-outlined text-5xl text-red-500 dark:text-red-400 mb-4">error_outline</span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Details Unavailable</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{error?.message || "Could not locate this assignment."}</p>
          <button onClick={() => navigate("/teacher/assignments")} className="px-6 py-2.5 bg-[#0058be] dark:bg-blue-600 text-white font-bold rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-500">
            Return to Assignments
          </button>
        </div>
      </MainLayout>
    );
  }

  const isPastDue = new Date(assignment.due_date) < new Date();

  return (
    <MainLayout title="Assignments">
      {/* Back Navigation & Page Title */}
      {revalidating && (
        <div className="mb-3 md:mb-4 px-3 md:px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-[#0058be] dark:text-blue-400 text-xs font-semibold rounded-md border border-blue-100 dark:border-blue-800">
          Refreshing assignment details...
        </div>
      )}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <Link className="inline-flex items-center text-[#0058be] dark:text-blue-400 font-medium text-xs md:text-sm hover:-translate-x-1 transition-transform mb-2" to="/teacher/assignments">
            <span className="material-symbols-outlined text-base md:text-lg mr-1">arrow_back</span>
            Back to Assignments
          </Link>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Assignment Details</h2>
        </div>
        <div className="flex gap-2 md:gap-2.5">
          <button 
            onClick={() => navigate(`/teacher/assignments/${id}/edit`)}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-md text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base md:text-lg">edit</span>
            <span>Edit</span>
          </button>
          <button className="px-3 py-1.5 md:px-4 md:py-2 bg-[#0058be] dark:bg-blue-600 text-white font-semibold rounded-md text-xs md:text-sm hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base md:text-lg">download</span>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Top Section: Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Assignment Summary Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg md:rounded-xl p-4 md:p-6 relative overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-[#0058be]/5 dark:bg-blue-400/5 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 mb-4">
            <div className="flex-1">
              <span className="inline-block px-2 py-0.5 md:px-2.5 md:py-1 bg-purple-100 dark:bg-purple-900/30 text-[#6b38d4] dark:text-purple-300 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full mb-2 border border-purple-200 dark:border-purple-800">
                {assignment.subject_name || "Subject"}
              </span>
              <h3 className="font-display text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{assignment.title || "Untitled Assignment"}</h3>
              
              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs">
                {isPastDue ? (
                  <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full"></span> Past Due
                  </span>
                ) : (
                  <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"></span> Active
                  </span>
                )}
                <span className="text-gray-300 dark:text-slate-600">•</span>
                <span className="font-semibold text-gray-600 dark:text-slate-400">{assignment.section_name}</span>
                <span className="text-gray-300 dark:text-slate-600">•</span>
                <span className="font-semibold text-gray-600 dark:text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">event</span>
                  Due: {formatDate(assignment.due_date)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Description Section */}
          <div className="bg-[#f8f9ff] dark:bg-slate-700/50 p-3 md:p-4 rounded-lg border border-blue-50 dark:border-slate-600">
            <h4 className="text-[10px] md:text-2xs font-bold text-[#0058be] dark:text-blue-400 uppercase tracking-widest mb-1.5">Description</h4>
            <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
              {assignment.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Submissions Summary Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg md:rounded-xl p-5 md:p-6 flex flex-col justify-between shadow-sm border border-gray-100 dark:border-slate-700">
          <h4 className="font-display text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 md:mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be] dark:text-blue-400">analytics</span>
            Grading Status
          </h4>
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-end justify-between bg-[#f8f9ff] dark:bg-slate-700/50 p-3 md:p-4 rounded-lg">
              <div>
                <p className="text-3xl md:text-4xl font-display font-extrabold text-[#0058be] dark:text-blue-400">{submittedCount}<span className="text-xs md:text-sm font-bold text-gray-400 dark:text-slate-500 ml-1">/ {students.length}</span></p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mt-1">Submitted</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-gray-200 dark:text-slate-600 md:hidden" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                  <circle 
                    className="text-[#0058be] dark:text-blue-400 md:hidden" 
                    cx="24" 
                    cy="24" 
                    fill="transparent" 
                    r="20" 
                    stroke="currentColor" 
                    strokeDasharray="125" 
                    strokeDashoffset={125 - (125 * submittedCount / (students.length || 1))} 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  ></circle>
                  <circle className="text-gray-200 dark:text-slate-600 hidden md:block" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="5"></circle>
                  <circle 
                    className="text-[#0058be] dark:text-blue-400 hidden md:block" 
                    cx="28" 
                    cy="28" 
                    fill="transparent" 
                    r="24" 
                    stroke="currentColor" 
                    strokeDasharray="150" 
                    strokeDashoffset={150 - (150 * submittedCount / (students.length || 1))} 
                    strokeWidth="5" 
                    strokeLinecap="round"
                  ></circle>
                </svg>
              </div>
            </div>
            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-white dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
              <div className="flex items-center justify-between text-[10px] md:text-xs">
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Graded</span>
                <span className="text-green-600 dark:text-green-400 font-bold">{gradedCount}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] md:text-xs mt-1.5 md:mt-2">
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Pending</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{submittedCount - gradedCount}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] md:text-xs mt-1.5 md:mt-2">
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Not Submitted</span>
                <span className="text-red-600 dark:text-red-400 font-bold">{students.length - submittedCount}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Average Grade</span>
              <span className="text-xs md:text-sm font-bold text-[#0058be] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{avgGrade.toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-[#0058be] dark:bg-blue-400 h-full rounded-full" style={{ width: `${(avgGrade / 100) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Submissions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg md:rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="px-3 md:px-6 py-3 md:py-5 border-b border-gray-100 dark:border-slate-700 bg-[#f8f9ff] dark:bg-slate-800/50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 md:gap-4">
            <h4 className="font-display text-base md:text-lg font-bold text-slate-800 dark:text-slate-100">Student Submissions</h4>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative flex-1 sm:flex-none">
                <span className="material-symbols-outlined absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm">search</span>
                <input 
                  className="w-full sm:w-auto pl-7 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-xs md:text-sm text-slate-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#0058be]/40 dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0058be]/10 dark:focus:ring-blue-400/10 sm:w-48 outline-none transition-all shadow-sm" 
                  placeholder="Search name or roll no." 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Column Visibility Toggles — desktop only, inline with header */}
              <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-gray-200 dark:border-slate-600">
                <button
                  onClick={() => setShowSubmittedAt(!showSubmittedAt)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all whitespace-nowrap ${
                    showSubmittedAt 
                      ? 'bg-[#0058be] dark:bg-blue-600 text-white border-[#0058be] dark:border-blue-600' 
                      : 'bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  Submitted At
                </button>
                <button
                  onClick={() => setShowStatus(!showStatus)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all whitespace-nowrap ${
                    showStatus 
                      ? 'bg-[#0058be] dark:bg-blue-600 text-white border-[#0058be] dark:border-blue-600' 
                      : 'bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  Status
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-2xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest sticky left-0 bg-white dark:bg-slate-800 z-10">Student Name</th>
                {showSubmittedAt && (
                  <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-2xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest">Submitted At</th>
                )}
                {showStatus && (
                  <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-2xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest">Status</th>
                )}
                <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-2xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest text-center">Grade</th>
                <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-2xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3 + (showSubmittedAt ? 1 : 0) + (showStatus ? 1 : 0)} className="text-center py-16 text-gray-500 dark:text-slate-400">
                    <div className="w-16 h-16 bg-[#eff4ff] dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                       <span className="material-symbols-outlined text-[#0058be] dark:text-blue-400 text-3xl">group</span>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">No students found.</p>
                    <p className="text-sm mt-1">Check if students are enrolled in this section.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isGrading = gradingId === student.id;
                  const hasSubmission = student.status !== 'Not Submitted';
                  const isGraded = student.status === 'Graded';
                  
                  return (
                    <tr key={student.id} className="hover:bg-[#f8f9ff] dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-3 py-2 md:px-6 md:py-4 sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-[#f8f9ff] dark:group-hover:bg-slate-700/50 z-10">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#0058be] dark:text-blue-400 font-bold text-xs border border-blue-100 dark:border-blue-800">
                            {student.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 block">{student.name || "Unknown"}</span>
                            {student.roll_number && (
                              <span className="text-[10px] md:text-xs text-gray-500 dark:text-slate-400">Roll: {student.roll_number}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      {showSubmittedAt && (
                        <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-medium text-gray-500 dark:text-slate-400">
                          {student.submitted_at ? formatDate(student.submitted_at) : "—"}
                        </td>
                      )}
                      {showStatus && (
                        <td className="px-3 py-2 md:px-6 md:py-4">
                          <span className={`px-2 py-0.5 md:px-2.5 md:py-1 border border-current/20 text-[10px] md:text-2xs uppercase tracking-wider font-black rounded-full ${
                            isGraded ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                            hasSubmission ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 
                            'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-2 md:px-6 md:py-4 text-center">
                        {isGrading ? (
                          <input
                            type="number"
                            className="w-16 md:w-20 px-1 md:px-2 py-1 border border-[#0058be] dark:border-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs md:text-sm font-bold text-center outline-none"
                            value={gradeValue}
                            onChange={(e) => setGradeValue(e.target.value)}
                            placeholder="0-100"
                            min="0"
                            max="100"
                          />
                        ) : student.grade !== null && student.grade !== undefined ? (
                          <><span className="text-xs md:text-sm font-black text-[#0058be] dark:text-blue-400">{student.grade}</span><span className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-slate-500">/100</span></>
                        ) : (
                          <span className="text-xs md:text-sm font-bold text-gray-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 text-right">
                        {!hasSubmission ? (
                          <span className="text-[10px] md:text-xs text-gray-400 dark:text-slate-500 italic">No submission</span>
                        ) : isGrading ? (
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                            <input
                              type="text"
                              className="w-20 md:w-32 px-1 md:px-2 py-0.5 md:py-1 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-[10px] md:text-xs outline-none"
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="Remarks"
                            />
                            <button
                              onClick={() => handleGradeSubmit(student.submission_id)}
                              className="px-2 py-1 md:px-3 bg-[#0058be] dark:bg-blue-600 text-white text-[10px] md:text-xs font-bold rounded hover:bg-blue-700 dark:hover:bg-blue-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setGradingId(null);
                                setGradeValue("");
                                setRemarks("");
                              }}
                              className="px-2 py-1 md:px-3 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 text-[10px] md:text-xs font-bold rounded hover:bg-gray-300 dark:hover:bg-slate-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1 md:space-x-2">
                            {student.file && (
                              <a
                                href={student.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 md:p-2 text-[#0058be] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                title="View submission file"
                              >
                                <span className="material-symbols-outlined text-lg md:text-xl">visibility</span>
                              </a>
                            )}
                            <button 
                              className="p-1 md:p-2 text-[#0058be] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors disabled:opacity-50"
                              onClick={() => {
                                setGradingId(student.id);
                                setGradeValue(student.grade || "");
                                setRemarks("");
                              }}
                              disabled={!hasSubmission}
                              title={hasSubmission ? "Grade submission" : "No submission to grade"}
                            >
                              <span className="material-symbols-outlined text-lg md:text-xl">edit</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list — replaces table below sm breakpoint */}
        <div className="sm:hidden divide-y divide-gray-50 dark:divide-slate-700">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-500 dark:text-slate-400">
              <div className="w-14 h-14 bg-[#eff4ff] dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[#0058be] dark:text-blue-400 text-2xl">group</span>
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">No students found.</p>
              <p className="text-xs mt-1">Check if students are enrolled in this section.</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isGrading = gradingId === student.id;
              const hasSubmission = student.status !== 'Not Submitted';
              const isGraded = student.status === 'Graded';

              return (
                <div key={student.id} className="p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#0058be] dark:text-blue-400 font-bold text-xs border border-blue-100 dark:border-blue-800">
                        {student.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{student.name || "Unknown"}</p>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400">
                          {student.roll_number ? `Roll: ${student.roll_number}` : ""}
                          {student.submitted_at ? `${student.roll_number ? " · " : ""}${formatDate(student.submitted_at)}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 text-[10px] uppercase tracking-wider font-black rounded-full ${
                      isGraded ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      hasSubmission ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                    }`}>
                      {student.status}
                    </span>
                  </div>

                  {isGrading ? (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 px-2 py-1.5 border border-[#0058be] dark:border-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-sm font-bold text-center outline-none"
                        value={gradeValue}
                        onChange={(e) => setGradeValue(e.target.value)}
                        placeholder="0-100"
                        min="0"
                        max="100"
                      />
                      <input
                        type="text"
                        className="flex-1 px-2 py-1.5 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs outline-none"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Remarks"
                      />
                      <button
                        onClick={() => handleGradeSubmit(student.submission_id)}
                        className="px-3 py-1.5 bg-[#0058be] dark:bg-blue-600 text-white text-xs font-bold rounded shrink-0 hover:bg-blue-700 dark:hover:bg-blue-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setGradingId(null);
                          setGradeValue("");
                          setRemarks("");
                        }}
                        className="px-2.5 py-1.5 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 text-xs font-bold rounded shrink-0 hover:bg-gray-300 dark:hover:bg-slate-500"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {student.grade !== null && student.grade !== undefined ? (
                          <span className="text-sm font-black text-[#0058be] dark:text-blue-400">
                            {student.grade}<span className="text-xs font-bold text-gray-400 dark:text-slate-500">/100</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">No grade yet</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {student.file && (
                          <a
                            href={student.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#0058be] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
                            title="View submission file"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </a>
                        )}
                        {hasSubmission && (
                          <button
                            className="p-1.5 text-[#0058be] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
                            onClick={() => {
                              setGradingId(student.id);
                              setGradeValue(student.grade || "");
                              setRemarks("");
                            }}
                            title="Grade submission"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        )}
                        {!hasSubmission && (
                          <span className="text-[11px] text-gray-400 dark:text-slate-500 italic">No submission</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}