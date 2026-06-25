import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { getPendingSubmissions, gradeSubmission } from "../../services/api";

export default function PendingSubmissionsPage() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradingId, setGradingId] = useState(null);
  const [gradeValue, setGradeValue] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingSubmissions();
      // Handle both array and paginated responses
      const submissionsList = data.submissions || data.results || data || [];
      setSubmissions(submissionsList);
    } catch (err) {
      console.error("Fetch Pending Submissions Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (submissionId) => {
    try {
      await gradeSubmission(submissionId, {
        grade: parseFloat(gradeValue),
        remarks: remarks
      });
      
      // Refresh submissions
      await fetchPendingSubmissions();
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

  const filteredSubmissions = submissions.filter(sub =>
    sub.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.assignment_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Pending Submissions">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <nav className="flex text-xs text-slate-500 dark:text-slate-400 mb-2 gap-2 items-center font-medium">
            <span className="hover:text-[#0058be] dark:hover:text-blue-400 cursor-pointer" onClick={() => navigate("/teacher")}>Dashboard</span>
            <span className="material-symbols-outlined text-2xs">chevron_right</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Pending Submissions</span>
          </nav>
          <h2 className="text-3xl font-extrabold font-display text-slate-800 dark:text-slate-100 tracking-tight">Pending Grading</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and grade student submissions awaiting your feedback.</p>
        </div>
        <button
          onClick={() => navigate("/teacher/assignments")}
          className="px-6 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md font-semibold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Assignments
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800 shadow-sm flex items-center gap-2">
           <span className="material-symbols-outlined">error</span>
           <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-6 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Pending</span>
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-3xl">pending_actions</span>
          </div>
          <p className="text-4xl font-display font-extrabold text-amber-900 dark:text-amber-100">{submissions.length}</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Submissions awaiting review</p>
        </div>
      </div>

      {/* Main Data Canvas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden mb-12 border border-gray-100 dark:border-slate-700">
        <div className="flex border-b border-gray-100 dark:border-slate-700 px-6 overflow-x-auto bg-[#f8f9ff] dark:bg-slate-800/50 justify-between items-center">
          <div className="flex">
            <button className="px-6 py-4 text-sm font-bold text-[#0058be] dark:text-blue-400 border-b-2 border-[#0058be] dark:border-blue-400 whitespace-nowrap">
              All Pending ({filteredSubmissions.length})
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm">search</span>
            <input 
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-sm text-slate-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none focus:border-[#0058be]/40 dark:focus:border-blue-400" 
              placeholder="Search submissions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Assignment</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Submitted At</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest text-center">Grade</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-gray-500 dark:text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-3xl text-[#0058be] dark:text-blue-400 mb-3">progress_activity</span>
                    <p>Loading pending submissions...</p>
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-gray-500 dark:text-slate-400">
                    <div className="w-16 h-16 bg-[#eff4ff] dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                       <span className="material-symbols-outlined text-[#0058be] dark:text-blue-400 text-3xl">check_circle</span>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">All caught up!</p>
                    <p className="text-sm mt-1">No pending submissions to grade.</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => {
                  const isGrading = gradingId === sub.id;
                  
                  return (
                    <tr key={sub.id} className="hover:bg-[#fcfdff] dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#0058be] dark:text-blue-400 font-bold text-xs border border-blue-100 dark:border-blue-800">
                            {sub.student_name?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{sub.student_name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{sub.assignment_title || "N/A"}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sub.subject_name} • {sub.section_name}</p>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(sub.submitted_at)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {isGrading ? (
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border border-[#0058be] dark:border-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-sm font-bold text-center outline-none"
                            value={gradeValue}
                            onChange={(e) => setGradeValue(e.target.value)}
                            placeholder="0-100"
                            min="0"
                            max="100"
                          />
                        ) : (
                          <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-2xs font-bold uppercase rounded-full border border-amber-200 dark:border-amber-800">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {isGrading ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="text"
                              className="w-32 px-2 py-1 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs outline-none"
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="Remarks (optional)"
                            />
                            <button
                              onClick={() => handleGradeSubmit(sub.id)}
                              className="px-3 py-1 bg-[#0058be] dark:bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 dark:hover:bg-blue-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setGradingId(null);
                                setGradeValue("");
                                setRemarks("");
                              }}
                              className="px-3 py-1 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 text-xs font-bold rounded hover:bg-gray-300 dark:hover:bg-slate-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            {(sub.view_url || sub.file) && (
                              <a
                                href={sub.view_url || sub.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-[#0058be] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">visibility</span>
                              </a>
                            )}
                            <button 
                              className="p-2 text-[#0058be] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                              onClick={() => {
                                setGradingId(sub.id);
                                setGradeValue("");
                                setRemarks("");
                              }}
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
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
      </div>
    </MainLayout>
  );
}
