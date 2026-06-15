import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosClient"; // Explicitly using your Axios client

export default function CreateSection() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [selectedClassLevel, setSelectedClassLevel] = useState("");
  const [classLevels, setClassLevels] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassLevels = async () => {
      try {
        const response = await api.get(`/academics/class-levels/`);
        setClassLevels(response.data.results || response.data);
      } catch (err) {
        console.error("Failed to fetch class levels:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchClassLevels();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedClassLevel) {
      setError("Please select a parent Class Level.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name,
        class_level: selectedClassLevel
      };

      await api.post(`/academics/sections/`, payload);

      alert("Section created successfully!");
      navigate("/school-admin");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to create Section.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Create Section">
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          
          <div className="mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0f9d58] text-[24px]">groups</span>
              Define New Section
            </h3>
            <p className="text-sm text-[#6b7280] mt-1">
              Establish a specific classroom division linked to a primary Class Level.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] ml-1">Parent Class Level</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">school</span>
                <select
                  required
                  value={selectedClassLevel}
                  onChange={e => setSelectedClassLevel(e.target.value)}
                  className="w-full bg-[#eff4ff] pl-10 pr-4 py-2.5 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all appearance-none font-medium text-slate-700"
                >
                  <option value="">Select Base Class Level...</option>
                  {initialLoading ? (
                    <option disabled>Loading data...</option>
                  ) : (
                    classLevels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name} (Numeric Sort: {lvl.numeric_order})
                      </option>
                    ))
                  )}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] ml-1">Section Identifier</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Section A, Batch Alpha, Honors"
                className="w-full bg-[#eff4ff] text-sm rounded px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all"
              />
              <p className="text-[11px] text-gray-500 ml-1 mt-0.5">
                Combined together, this will read as "[Class Level] - [Section]" in the frontend.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={loading}
                onClick={() => navigate("/school-admin")}
                className="px-5 py-2 text-sm rounded text-gray-600 font-semibold hover:bg-[#eff4ff] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-[#0f9d58] to-[#0b8043] text-white text-sm rounded font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                )}
                Create Section
              </button>
            </div>
          </form>
        </div>
      </div>
    </SchoolLayout>
  );
}