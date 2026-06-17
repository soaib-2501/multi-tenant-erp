import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";

export default function ExamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mocking grades/submissions for the UX
  const [submissions] = useState([
    { id: 1, name: 'Aaron Anderson', initials: 'AA', roll: '10A01', status: 'Graded', statusClass: 'bg-green-100 text-green-700', marks: '88', color: 'blue' },
    { id: 2, name: 'Bella Barnes', initials: 'BB', roll: '10A05', status: 'Graded', statusClass: 'bg-green-100 text-green-700', marks: '92', color: 'purple' },
    { id: 3, name: 'Caleb Carter', initials: 'CC', roll: '10A12', status: 'Pending', statusClass: 'bg-amber-100 text-amber-700', marks: '—', color: 'slate' },
  ]);

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${baseUrl}v1/operations/exams/${id}/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("Exam not found.");
          throw new Error("Failed to fetch exam details.");
        }

        const data = await response.json();
        setExam(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <MainLayout title="Exam Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-[#0058be]">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="font-semibold tracking-wide">Loading Exam Profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !exam) {
    return (
      <MainLayout title="Exam Details">
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-red-100 text-center">
          <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error_outline</span>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Details Unavailable</h2>
          <p className="text-gray-500 mb-6">{error || "Could not locate this exam."}</p>
          <button onClick={() => navigate("/teacher/exams")} className="px-6 py-2.5 bg-[#0058be] text-white font-bold rounded-md shadow-sm">
            Return to Directory
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Exams">
      {/* Back Navigation & Page Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link className="inline-flex items-center text-[#0058be] font-medium text-sm hover:-translate-x-1 transition-transform mb-2" to="/teacher/exams">
            <span className="material-symbols-outlined text-lg mr-1">arrow_back</span>
            Back to Exams
          </Link>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-800">Exam Details</h2>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-slate-700 font-semibold rounded-md text-sm hover:bg-gray-50 transition-colors shadow-sm">Edit Configuration</button>
          <button className="px-5 py-2.5 bg-[#0058be] text-white font-semibold rounded-md text-sm hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Results
          </button>
        </div>
      </div>

      {/* Top Section: Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Exam Summary Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-8 relative overflow-hidden shadow-sm border border-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0058be]/5 rounded-full -mr-16 -mt-16"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-purple-100 text-[#6b38d4] text-xs font-bold uppercase tracking-wider rounded-full mb-3 border border-purple-200">
                {exam.academic_year_name || "Academic Year"}
              </span>
              <h3 className="font-display text-2xl font-bold text-slate-800 mb-1">{exam.name || "Untitled Exam"}</h3>
              <div className="flex gap-3 mt-2">
                {exam.is_published ? (
                  <span className="text-xs font-bold text-green-700 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Published</span>
                ) : (
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Draft</span>
                )}
              </div>
            </div>
            <div className="text-right bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
              <p className="text-2xs text-[#0058be] font-bold uppercase tracking-wider mb-1">Timeframe</p>
              <p className="font-display font-bold text-slate-800 text-sm">
                {formatDate(exam.start_date)} <br />to {formatDate(exam.end_date)}
              </p>
            </div>
          </div>
          <div className="mb-6 bg-[#f8f9ff] p-5 rounded-lg border border-blue-50">
            <h4 className="text-2xs font-bold text-[#0058be] uppercase tracking-widest mb-2">System Mapping</h4>
            <p className="text-slate-700 text-sm leading-relaxed mb-3 font-medium">
              This exam serves as a top-level container. When teachers enter grades via the "Enter New Grades" module, they will associate their subject and student records directly to this Exam ID.
            </p>
          </div>
        </div>

        {/* Submissions Summary Card */}
        <div className="bg-white rounded-xl p-8 flex flex-col justify-between shadow-sm border border-gray-100">
          <h4 className="font-display text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be]">analytics</span>
            Grading Status
          </h4>
          <div className="space-y-6">
            <div className="flex items-end justify-between bg-[#f8f9ff] p-4 rounded-lg">
              <div>
                <p className="text-4xl font-display font-extrabold text-[#0058be]">2<span className="text-sm font-bold text-gray-400 ml-1">/ 3</span></p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Scores Logged</p>
              </div>
              <div className="w-14 h-14 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-gray-200" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="5"></circle>
                  <circle className="text-[#0058be]" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeDasharray="150" strokeDashoffset="50" strokeWidth="5" strokeLinecap="round"></circle>
                </svg>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Average Grade</span>
              <span className="text-sm font-bold text-[#0058be] bg-blue-50 px-2 py-0.5 rounded">90%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#0058be] h-full w-[90%] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: AI Insights */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[#fff4ed] to-white rounded-xl border border-orange-100 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="bg-[#924700] p-3 rounded-xl shadow-md shadow-[#924700]/20">
          <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <div className="flex-1">
          <h4 className="font-display font-bold text-[#924700] mb-1">AI Aggregate Insight</h4>
          <p className="text-[#924700]/80 text-sm leading-relaxed">
            Overall performance in this examination block is pacing higher than the previous semester's benchmarks.
          </p>
        </div>
      </div>

      {/* Bottom Section: Mock Submissions Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-100 gap-4 bg-[#f8f9ff]">
          <h4 className="font-display text-lg font-bold text-slate-800">Individual Records</h4>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 sm:w-64 outline-none transition-all shadow-sm" placeholder="Search student..." type="text" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-2xs font-black text-gray-500 uppercase tracking-widest">Student Name</th>
                <th className="px-6 py-4 text-2xs font-black text-gray-500 uppercase tracking-widest">Roll No.</th>
                <th className="px-6 py-4 text-2xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-2xs font-black text-gray-500 uppercase tracking-widest text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#f8f9ff] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0058be] font-bold text-xs border border-blue-100`}>{sub.initials}</div>
                      <span className="text-sm font-bold text-slate-800">{sub.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500 font-mono">{sub.roll}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 ${sub.statusClass} border border-current/20 text-2xs uppercase tracking-wider font-black rounded-full`}>{sub.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {sub.marks === '—' ? (
                      <span className="text-sm font-bold text-gray-300">—</span>
                    ) : (
                      <><span className="text-sm font-black text-[#0058be]">{sub.marks}</span><span className="text-xs font-bold text-gray-400">/100</span></>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}