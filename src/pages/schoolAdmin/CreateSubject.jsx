import React, { useState } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosClient";

export default function CreateSubject() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name,
        code: code // Optional: e.g., "MATH101"
      };

      await api.post(`academics/subjects/`, payload);

      alert("Subject created successfully!");
      // Navigate back to dashboard or a subjects list page
      navigate("/school-admin");

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
          setError("Server crashed (500 Internal Error). Check Django terminal.");
        } else {
          setError(Object.entries(data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`).join(" | "));
        }
      } else {
        setError(err.message || "Failed to create Subject.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Create Subject">
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <span className="material-symbols-outlined text-[#0058be] text-[24px]">menu_book</span>
                Define New Subject
              </h3>
              <p className="text-sm text-[#6b7280] mt-1">
                Add a new academic subject to the institutional curriculum.
              </p>
            </div>
            <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 border border-gray-200 text-[#0058be] font-semibold rounded shadow-sm">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Go Back
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 font-medium flex gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>{error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] ml-1">Subject Name</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Advanced Mathematics"
                className="w-full bg-[#eff4ff] text-sm rounded px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] ml-1">Subject Code (Optional)</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g., MATH-401"
                className="w-full bg-[#eff4ff] text-sm rounded px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all"
              />
              <p className="text-[11px] text-gray-500 ml-1 mt-0.5">
                A short identifier used for reporting and timetable generation.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={loading}
                onClick={() => navigate(-1)}
                className="px-5 py-2 rounded text-sm text-gray-600 font-semibold hover:bg-[#eff4ff] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white text-sm rounded font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">save</span>
                )}
                Save Subject
              </button>
            </div>
          </form>
        </div>
      </div>
    </SchoolLayout>
  );
}