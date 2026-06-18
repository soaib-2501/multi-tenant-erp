import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";
import { useTheme } from "../../context/ThemeContext";

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
        setError(
          Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ")
        );
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
        <div className="flex items-center justify-center min-h-[50vh] text-primary font-semibold gap-2 font-body">
          Loading data...
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Academic Years">
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface mb-0.5">
              {isEditMode ? "Edit Academic Year" : "Create Academic Year"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/school-admin/academic-years")}
            className="flex items-center gap-2 px-4 py-2 text-primary font-semibold hover:bg-primary/10 rounded-md transition-colors border border-primary/20 text-sm font-body"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Go Back
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-6 md:p-8 shadow-sm border border-outline-variant/10">
          {error && (
            <div className="mb-6 p-3 bg-error/10 text-error rounded-md border border-error/20 text-sm font-medium flex gap-2 font-body">
              <span className="material-symbols-outlined text-xl">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5 font-body">
                Year Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 2024-2025"
                className="w-full bg-surface-container-low px-3 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/50 text-sm font-body text-on-surface placeholder:text-on-surface-variant"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5 font-body">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/50 text-sm font-body text-on-surface"
                />
              </div>
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5 font-body">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/50 text-sm font-body text-on-surface"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-surface-container-high/30 rounded-md border border-outline-variant/10">
              <h4 className="font-semibold text-sm text-on-surface font-headline">Year Status</h4>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-10 h-5 rounded-full p-1 transition-colors ${isActive ? "bg-primary" : "bg-surface-container-high"}`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full transition-transform ${isActive ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                <span className="text-xs font-bold text-on-surface-variant font-body">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={() => navigate("/school-admin/academic-years")}
                className="px-5 py-2 text-on-surface-variant font-semibold hover:bg-surface-container-high rounded-md text-sm transition font-body"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-white font-bold rounded-md bg-primary hover:bg-primary/90 transition-all disabled:opacity-70 text-sm font-body"
              >
                {loading ? "Saving..." : isEditMode ? "Update Year" : "Save Year"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SchoolLayout>
  );
}