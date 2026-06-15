import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

export default function CreateAcademicYear() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAcademicYearDetails = async () => {
      try {
        const response = await api.get(`academics/academic-years/${id}/`);
        const data = response.data;
        setName(data.name || "");
        setStartDate(data.start_date || "");
        setEndDate(data.end_date || "");
        setIsActive(data.is_active ?? true);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load academic year details.");
      } finally {
        setInitialLoad(false);
      }
    };

    if (isEditMode) fetchAcademicYearDetails();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (new Date(startDate) >= new Date(endDate)) {
      setError("End Date must be strictly after the Start Date.");
      setLoading(false);
      return;
    }

    try {
      const payload = { name, start_date: startDate, end_date: endDate, is_active: isActive };
      if (isEditMode) {
        await api.patch(`academics/academic-years/${id}/`, payload);
      } else {
        await api.post(`academics/academic-years/`, payload);
      }
      alert(`Academic Year ${isEditMode ? "updated" : "created"} successfully!`);
      navigate("/school-admin/academic-years");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(Object.entries(err.response.data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`).join(" | "));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <SchoolLayout title="Academic Years">
        <div className="flex items-center justify-center min-h-[50vh] text-[#0058be] font-semibold gap-2">
          Loading data...
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Academic Years">
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-slate-800">{isEditMode ? "Edit Academic Year" : "Create Academic Year"}</h1>
          </div>
          <button onClick={() => navigate("/school-admin/academic-years")} className="flex items-center gap-2 px-4 py-2 text-[#0058be] font-semibold hover:bg-[#eff4ff] rounded-md transition-colors border border-blue-100 text-sm">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Go Back
          </button>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm font-medium flex gap-2"><span className="material-symbols-outlined text-[20px]">error</span>{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 block mb-1.5">Year Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2024-2025" className="w-full bg-[#eff4ff] px-3 py-2.5 rounded outline-none focus:ring-2 focus:ring-[#0058be]/30 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 block mb-1.5">Start Date</label>
                <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#eff4ff] px-3 py-2.5 rounded outline-none focus:ring-2 focus:ring-[#0058be]/30 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 block mb-1.5">End Date</label>
                <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#eff4ff] px-3 py-2.5 rounded outline-none focus:ring-2 focus:ring-[#0058be]/30 text-sm" />
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-[#eff4ff] rounded-md">
              <div><h4 className="font-semibold text-sm">Year Status</h4></div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsActive(!isActive)} className={`w-10 h-5 rounded-full p-1 transition-colors ${isActive ? "bg-[#0058be]" : "bg-gray-300"}`}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isActive ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => navigate("/school-admin/academic-years")} className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-50 rounded-md text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 text-white font-bold rounded-md bg-gradient-to-r from-[#0058be] to-[#2170e4] hover:shadow-lg transition-all disabled:opacity-70 text-sm">
                {loading ? "Saving..." : (isEditMode ? "Update Year" : "Save Year")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SchoolLayout>
  );
}