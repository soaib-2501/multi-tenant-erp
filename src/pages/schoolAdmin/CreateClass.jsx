import React, { useState } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosClient"; // Explicitly using your Axios client

export default function CreateClass() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [numericOrder, setNumericOrder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name,
        numeric_order: parseInt(numericOrder, 10)
      };

      await api.post(`/academics/class-levels/`, payload);

      alert("Class Level created successfully!");
      navigate("/school-admin");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to create Class Level.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Create Class Level">
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          
          <div className="mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0058be] text-[24px]">meeting_room</span>
              Define Class Level
            </h3>
            <p className="text-sm text-[#6b7280] mt-1">
              Establish a base academic grade (e.g. "Grade 10"). You will map specific sections to this later.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-2xs font-bold uppercase tracking-wider text-[#6b7280] ml-1">Class Level Name</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Grade 10"
                className="w-full bg-[#eff4ff] text-sm rounded px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-bold uppercase tracking-wider text-[#6b7280] ml-1">Numeric Sort Order</label>
              <input
                type="number"
                required
                value={numericOrder}
                onChange={e => setNumericOrder(e.target.value)}
                placeholder="e.g., 10"
                className="w-full bg-[#eff4ff] text-sm rounded px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all"
              />
              <p className="text-xs text-gray-500 ml-1 mt-0.5">
                Used to accurately sort classes logically (Grade 9 comes before Grade 10) instead of alphabetically.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={loading}
                onClick={() => navigate("/school-admin")}
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
                Save Class Level
              </button>
            </div>
          </form>
        </div>
      </div>
    </SchoolLayout>
  );
}