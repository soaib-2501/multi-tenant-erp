import React, { useMemo, useState, useEffect } from 'react';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { useNavigate } from "react-router-dom";
import { getAssignments, getSubmissionsByAssignment } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";

const LIST_STATE_KEY = "teacher_assignments_list_state";

const getInitialListState = () => {
  try {
    const saved = sessionStorage.getItem(LIST_STATE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}

  return {
    searchTerm: "",
    activeFilter: "all",
    sortBy: "due_date",
    sortDirection: "asc",
  };
};

const normalizeAssignments = (data) => data?.results || data || [];

const getSubmissionPayload = async (assignmentId) => {
  try {
    return await getSubmissionsByAssignment(assignmentId);
  } catch (err) {
    console.warn("Could not load submission summary for assignment:", assignmentId, err);
    return null;
  }
};

const getSubmissionCount = (assignment, submissionsData) => {
  if (typeof submissionsData?.summary?.total_submissions === "number") {
    return submissionsData.summary.total_submissions;
  }
  if (Array.isArray(submissionsData?.submissions)) {
    return submissionsData.submissions.length;
  }
  return assignment.submission_count || 0;
};

const fetchAssignmentsWithSubmissionStatus = async () => {
  const data = await getAssignments();
  const assignments = normalizeAssignments(data);

  const submissionsByAssignment = await Promise.all(
    assignments.map((assignment) => getSubmissionPayload(assignment.id)),
  );

  return assignments.map((assignment, index) => {
    const submissionsData = submissionsByAssignment[index];
    const submissionCount = getSubmissionCount(assignment, submissionsData);
    const gradedCount = submissionsData?.summary?.graded || 0;
    const pendingCount = submissionsData?.summary?.pending ?? Math.max(submissionCount - gradedCount, 0);

    return {
      ...assignment,
      submission_count: submissionCount,
      graded_count: gradedCount,
      pending_count: pendingCount,
    };
  });
};

export default function AssignmentListPage() {
  const navigate = useNavigate();

  const initialListState = getInitialListState();
  const [searchTerm, setSearchTerm] = useState(initialListState.searchTerm);
  const [activeFilter, setActiveFilter] = useState(initialListState.activeFilter);
  const [sortBy, setSortBy] = useState(initialListState.sortBy);
  const [sortDirection, setSortDirection] = useState(initialListState.sortDirection);

  const {
    data: assignments = [],
    loading,
    revalidating,
    error,
  } = useStaleData(
    "teacher:assignments:list:with-submissions",
    fetchAssignmentsWithSubmissionStatus,
    { ttl: 120_000 },
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(
        LIST_STATE_KEY,
        JSON.stringify({ searchTerm, activeFilter, sortBy, sortDirection }),
      );
    } catch {}
  }, [searchTerm, activeFilter, sortBy, sortDirection]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const searchedAssignments = useMemo(() => {
    if (!assignments || !Array.isArray(assignments)) return [];
    const normalizedSearch = searchTerm.toLowerCase();
    return assignments.filter(item =>
      item.title?.toLowerCase().includes(normalizedSearch) ||
      item.subject_name?.toLowerCase().includes(normalizedSearch) ||
      item.section_name?.toLowerCase().includes(normalizedSearch)
    );
  }, [assignments, searchTerm]);

  const upcomingAssignments = useMemo(
    () => searchedAssignments.filter(a => new Date(a.due_date) >= new Date()),
    [searchedAssignments],
  );

  const pastAssignments = useMemo(
    () => searchedAssignments.filter(a => new Date(a.due_date) < new Date()),
    [searchedAssignments],
  );

  const filteredAssignments = useMemo(() => {
    const now = new Date();
    const byFilter = searchedAssignments.filter((assignment) => {
      const dueDate = new Date(assignment.due_date);
      if (activeFilter === "upcoming") return dueDate >= now;
      if (activeFilter === "past") return dueDate < now;
      return true;
    });

    return [...byFilter].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "section") {
        comparison = (a.section_name || "").localeCompare(b.section_name || "");
      } else {
        comparison = new Date(a.due_date || 0) - new Date(b.due_date || 0);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [activeFilter, searchedAssignments, sortBy, sortDirection]);

  const filterButtonClass = (filter) =>
    activeFilter === filter
      ? "px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-[#0058be] dark:text-blue-400 border-b-2 border-[#0058be] dark:border-blue-400 whitespace-nowrap"
      : "px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap";

  return (
    <MainLayout title="Assignments">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-3 md:gap-4">
        <div>
          <nav className="flex text-xs text-slate-500 dark:text-slate-400 mb-2 gap-2 items-center font-medium">
            <span className="hover:text-[#0058be] dark:hover:text-blue-400 cursor-pointer" onClick={() => navigate("/teacher")}>Dashboard</span>
            <span className="material-symbols-outlined text-2xs">chevron_right</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Assignments</span>
          </nav>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-slate-800 dark:text-slate-100 tracking-tight">Assignments</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">Manage homework and assignments for your classes.</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={() => navigate("/teacher/submissions/pending")}
            className="px-3 py-2 md:px-6 md:py-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 rounded-md font-semibold text-xs md:text-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all flex items-center gap-1 md:gap-2"
          >
            <span className="material-symbols-outlined text-base md:text-lg">pending_actions</span>
            <span className="hidden sm:inline">Pending Grading</span>
            <span className="sm:hidden">Pending</span>
          </button>
          <button
            onClick={() => navigate("/teacher/assignments/create")}
            className="px-3 py-2 md:px-6 md:py-3 bg-gradient-to-r from-[#0058be] to-[#2170e4] dark:from-blue-600 dark:to-blue-500 text-white rounded-md font-semibold text-xs md:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-1 md:gap-2"
          >
            <span className="material-symbols-outlined text-base md:text-lg">add</span>
            <span className="hidden sm:inline">Create Assignment</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800 shadow-sm flex items-center gap-2">
           <span className="material-symbols-outlined">error</span>
           <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Main Data Canvas */}
      <div className="bg-white dark:bg-slate-800 rounded-lg md:rounded-xl shadow-sm overflow-hidden mb-12 border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row border-b border-gray-100 dark:border-slate-700 px-3 md:px-6 overflow-x-auto bg-[#f8f9ff] dark:bg-slate-800/50 md:justify-between md:items-center">
          <div className="flex overflow-x-auto">
            <button className={filterButtonClass("all")} onClick={() => setActiveFilter("all")}>All ({searchedAssignments.length})</button>
            <button className={filterButtonClass("upcoming")} onClick={() => setActiveFilter("upcoming")}>Upcoming ({upcomingAssignments.length})</button>
            <button className={filterButtonClass("past")} onClick={() => setActiveFilter("past")}>Past ({pastAssignments.length})</button>
          </div>
          <div className="flex items-center gap-2 md:gap-3 py-2 md:py-3">
            <select
              className="px-2 py-1.5 md:px-3 md:py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-xs md:text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-[#0058be]/40 dark:focus:border-blue-400"
              value={`${sortBy}:${sortDirection}`}
              onChange={(e) => {
                const [nextSortBy, nextSortDirection] = e.target.value.split(":");
                setSortBy(nextSortBy);
                setSortDirection(nextSortDirection);
              }}
            >
              <option value="due_date:asc">Due Date ↑</option>
              <option value="due_date:desc">Due Date ↓</option>
              <option value="section:asc">Section A-Z</option>
              <option value="section:desc">Section Z-A</option>
            </select>
            <div className="relative flex-1 md:flex-none">
              <span className="material-symbols-outlined absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm">search</span>
              <input 
                className="w-full md:w-auto pl-7 md:pl-9 pr-3 md:pr-4 py-1.5 md:py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-xs md:text-sm text-slate-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none focus:border-[#0058be]/40 dark:focus:border-blue-400" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        {revalidating && (
          <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/30 text-[#0058be] dark:text-blue-400 text-xs font-semibold border-b border-blue-100 dark:border-blue-800">
            Refreshing assignments...
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest">Assignment Title</th>
                <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest hidden sm:table-cell">Subject</th>
                <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest hidden lg:table-cell">Section</th>
                <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest">Due Date</th>
                <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest text-center hidden md:table-cell">Submissions</th>
                <th className="px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider md:tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-500 dark:text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-3xl text-[#0058be] dark:text-blue-400 mb-3">progress_activity</span>
                    <p>Loading assignments database...</p>
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-500 dark:text-slate-400">
                    <div className="w-16 h-16 bg-[#eff4ff] dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                       <span className="material-symbols-outlined text-[#0058be] dark:text-blue-400 text-3xl">assignment</span>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">No assignments found.</p>
                    <p className="text-sm mt-1">Create an assignment to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map(item => {
                  const isPast = new Date(item.due_date) < new Date();
                  return (
                    <tr key={item.id} className="hover:bg-[#fcfdff] dark:hover:bg-slate-700/50 transition-colors group cursor-pointer" onClick={() => navigate(`/teacher/assignments/${item.id}`)}>
                      <td className="px-3 py-3 md:px-6 md:py-5">
                        <div className="flex items-center">
                          <div className={`w-7 h-7 md:w-10 md:h-10 rounded-lg flex items-center justify-center mr-2 md:mr-4 border ${isPast ? 'bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-600' : 'bg-blue-50 dark:bg-blue-900/30 text-[#0058be] dark:text-blue-400 border-blue-100 dark:border-blue-800'}`}>
                            <span className="material-symbols-outlined text-base md:text-xl">assignment</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm">{item.title}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-slate-400 mt-0.5 hidden sm:block">{item.description?.substring(0, 50)}{item.description?.length > 50 ? '...' : ''}</p>
                            <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 sm:hidden">{item.subject_name || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-5 hidden sm:table-cell">
                        <span className="text-[10px] md:text-2xs uppercase tracking-wider font-bold text-[#6b38d4] dark:text-purple-300 bg-[#e9ddff] dark:bg-purple-900/30 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full inline-block border border-[#d6beff] dark:border-purple-800">
                          {item.subject_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-5 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 hidden lg:table-cell">
                        {item.section_name || "N/A"}
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-5">
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(item.due_date)}</span>
                          {isPast ? (
                            <span className="text-[10px] md:text-xs text-red-500 dark:text-red-400 font-semibold mt-0.5">Past Due</span>
                          ) : (
                            <span className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">Active</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-5 text-center hidden md:table-cell">
                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-blue-50 dark:bg-blue-900/30 text-[#0058be] dark:text-blue-400 text-[10px] md:text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">
                          {item.submission_count || 0} submitted
                        </span>
                        {item.pending_count > 0 && (
                          <span className="block text-[10px] md:text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                            {item.pending_count} pending grading
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-5 text-right">
                        <div className="flex items-center justify-end space-x-1 md:space-x-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 md:p-2 text-[#0058be] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate(`/teacher/assignments/${item.id}`); }}
                          >
                            <span className="material-symbols-outlined text-lg md:text-xl">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </MainLayout>
  );
}
