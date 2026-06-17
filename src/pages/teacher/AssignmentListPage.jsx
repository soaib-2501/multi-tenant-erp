import React, { useState, useEffect } from 'react';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { useNavigate } from "react-router-dom";

export default function ExamListPage() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${baseUrl}v1/operations/exams/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
           setExams([]);
           return;
        }
        throw new Error("Failed to fetch exams.");
      }

      const data = await response.json();
      setExams(data.results || data);

    } catch (err) {
      console.error("Fetch Exams Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <MainLayout title="Exams">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <nav className="flex text-xs text-slate-500 mb-2 gap-2 items-center font-medium">
            <span className="hover:text-[#0058be] cursor-pointer" onClick={() => navigate("/teacher")}>Dashboard</span>
            <span className="material-symbols-outlined text-2xs">chevron_right</span>
            <span className="font-semibold text-slate-800">Exams</span>
          </nav>
          <h2 className="text-3xl font-extrabold font-display text-slate-800 tracking-tight">Examinations</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and track major academic assessments and term exams.</p>
        </div>
        <button
          onClick={() => navigate("/teacher/exams/create")}
          className="px-6 py-3 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded-md font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Exam
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 shadow-sm flex items-center gap-2">
           <span className="material-symbols-outlined">error</span>
           <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Main Data Canvas */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12 border border-gray-100">
        <div className="flex border-b border-gray-100 px-6 overflow-x-auto bg-[#f8f9ff] justify-between items-center">
          <div className="flex">
            <button className="px-6 py-4 text-sm font-bold text-[#0058be] border-b-2 border-[#0058be] whitespace-nowrap">All Exams</button>
            <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-slate-800 transition-colors whitespace-nowrap">Drafts</button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-[#0058be]/40" placeholder="Search exams..." />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Exam Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Academic Year</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Start Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">End Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-500">
                    <span className="material-symbols-outlined animate-spin text-3xl text-[#0058be] mb-3">progress_activity</span>
                    <p>Loading exams database...</p>
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-500">
                    <div className="w-16 h-16 bg-[#eff4ff] rounded-full flex items-center justify-center mx-auto mb-3">
                       <span className="material-symbols-outlined text-[#0058be] text-3xl">assignment</span>
                    </div>
                    <p className="font-semibold text-slate-700">No exams configured.</p>
                    <p className="text-sm mt-1">Create an exam to begin evaluating students.</p>
                  </td>
                </tr>
              ) : (
                exams.map(item => (
                  <tr key={item.id} className="hover:bg-[#fcfdff] transition-colors group cursor-pointer" onClick={() => navigate(`/teacher/exams/${item.id}`)}>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0058be] mr-4 border border-blue-100">
                          <span className="material-symbols-outlined">quiz</span>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-2xs uppercase tracking-wider font-bold text-[#6b38d4] bg-[#e9ddff] px-2.5 py-1 rounded-full inline-block border border-[#d6beff]">
                        {item.academic_year_name || "General Year"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                      {formatDate(item.start_date)}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                      {formatDate(item.end_date)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {item.is_published ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-2xs font-bold uppercase rounded-full border border-green-200">Published</span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-2xs font-bold uppercase rounded-full border border-gray-200">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 text-[#0058be] hover:bg-blue-50 rounded-md transition-colors"
                          onClick={(e) => { e.stopPropagation(); navigate(`/teacher/exams/${item.id}`); }}
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </MainLayout>
  );
}