import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";

export default function CreateExamPage() {
  const navigate = useNavigate();

  // Context Data Fetched
  const [academicYears, setAcademicYears] = useState([]);
  
  // Form State
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");

  // UI State
  const [loadingContext, setLoadingContext] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Academic Years for the strict foreign key
  useEffect(() => {
    const fetchContexts = async () => {
      setLoadingContext(true);
      try {
        const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${baseUrl}v1/academics/academic-years/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAcademicYears(data.results || data);
        }
      } catch (err) {
        console.error("Fetch Context Error:", err);
        setError("Failed to load academic years.");
      } finally {
        setLoadingContext(false);
      }
    };
    fetchContexts();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedYear) {
      setError("Please link this exam to an Academic Year context.");
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      const payload = {
        name,
        start_date: startDate,
        end_date: endDate,
        is_published: isPublished,
        academic_year: selectedYear
      };

      const response = await fetch(`${baseUrl}v1/operations/exams/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = "Failed to create exam.";
        if (typeof data === "object") {
          errorMsg = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ");
        }
        throw new Error(errorMsg);
      }

      alert("Exam configured successfully!");
      navigate("/teacher/exams");

    } catch (err) {
      console.error(err);
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout title="Teacher Portal">
      {/* Breadcrumb & Title Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            to="/teacher/exams"
            className="flex items-center gap-2 text-[#0058be] font-semibold text-sm mb-4 hover:-translate-x-1 transition-transform w-max"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Exams
          </Link>
          <h2 className="text-3xl font-bold font-display text-slate-800 tracking-tight">Configure Exam</h2>
          <p className="text-gray-500 text-sm mt-1">Schedule and define major assessments tied to an academic year.</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => navigate("/teacher/exams")}
            className="px-5 py-2.5 bg-white border border-gray-200 text-slate-700 font-semibold rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-bold rounded-md text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-lg">publish</span>
            )}
            Save Configuration
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
           <span className="material-symbols-outlined">error</span>
           <div>
             <p className="font-bold text-sm">Creation Failed</p>
             <p className="text-sm mt-1">{error}</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8 mb-16">
        
        {/* Left Column: Exam Details */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Section 1: Core Logistics */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-display font-bold mb-6 flex items-center text-slate-800">
              <span className="material-symbols-outlined mr-2 text-[#0058be]">database</span>
              Exam Context
            </h3>
            
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Academic Year Association</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">calendar_month</span>
                <select 
                  required
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-transparent rounded-md py-3.5 pl-10 pr-4 text-sm font-medium focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 outline-none transition-all appearance-none text-slate-700"
                >
                  <option value="">Select Academic Year...</option>
                  {loadingContext ? (
                    <option disabled>Loading data...</option>
                  ) : (
                    academicYears.map(ay => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name}
                      </option>
                    ))
                  )}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-xl font-display font-bold mb-6 flex items-center text-slate-800">
                <span className="material-symbols-outlined mr-2 text-[#0058be]">quiz</span>
                Exam Definition
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Exam Name</label>
                  <input 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#f8f9ff] border border-transparent rounded-md p-3.5 text-sm focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none" 
                    placeholder="e.g., Midterm Examination 2026" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Start Date</label>
                    <input 
                      type="date"
                      required
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-[#f8f9ff] border border-transparent rounded-md p-3.5 text-sm font-medium focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none text-slate-700" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">End Date</label>
                    <input 
                      type="date"
                      required
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-[#f8f9ff] border border-transparent rounded-md p-3.5 text-sm font-medium focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none text-slate-700" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mt-6">
              <label className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-md cursor-pointer hover:bg-blue-100/50 transition-colors">
                <div>
                  <span className="font-bold text-[#0058be]">Publish Exam</span>
                  <p className="text-xs text-blue-800/70 mt-0.5">Make this exam visible to assigned faculties and students.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={isPublished} 
                  onChange={() => setIsPublished(!isPublished)}
                  className="w-5 h-5 rounded text-[#0058be] focus:ring-[#0058be]" 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Information Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-[#0b1c30] to-[#1e3450] p-8 rounded-xl text-white shadow-lg relative overflow-hidden">
             <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5">schema</span>
             <h4 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-2 text-blue-200">
               <span className="material-symbols-outlined">architecture</span>
               Data Architecture
             </h4>
             <p className="text-sm text-slate-300 leading-relaxed relative z-10 mb-6">
               Unlike a class assignment, an <strong className="text-white">Exam</strong> acts as an umbrella entity linked solely to the Academic Year. Grades are then bound to this single exam ID across multiple subjects and classes.
             </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}