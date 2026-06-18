import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";
import { useTheme } from "../../context/ThemeContext";

export default function AcademicYears() {
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await api.get(`academics/academic-years/`);
        setYears(response.data.results || response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchYears();
  }, []);

  return (
    <SchoolLayout title="Academic Years">
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl pb-12">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Academic Years</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">Manage institutional academic year periods and their status.</p>
          </div>
          <button
            onClick={() => navigate("/school-admin/academic-years/create")}
            className="bg-primary text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors font-body flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Year
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden border border-outline-variant/10">

          {/* FILTER BAR */}
          <div className="p-4 flex flex-wrap gap-3 justify-between bg-surface-container-high/50 border-b border-outline-variant/10 items-center">
            <div className="flex flex-wrap gap-3 items-center flex-1" />
            <div className="text-xs font-bold text-outline uppercase tracking-wider font-body">
              {years.length} Records Found
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50 text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 font-headline font-bold">Name</th>
                  <th className="px-6 py-4 font-headline font-bold">Start Date</th>
                  <th className="px-6 py-4 font-headline font-bold">End Date</th>
                  <th className="px-6 py-4 font-headline font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant font-body">Loading...</td></tr>
                ) : years.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant font-body">No academic years found.</td></tr>
                ) : (
                  years.map((y) => (
                    <tr
                      key={y.id}
                      onClick={() => navigate(`/school-admin/academic-years/edit/${y.id}`)}
                      className="hover:bg-surface-container-high/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-on-surface group-hover:text-primary transition-colors font-body">{y.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-on-surface-variant text-xs font-semibold">{y.start_date}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-on-surface-variant text-xs font-semibold">{y.end_date}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {y.is_active ? (
                          <span className="text-[10px] uppercase font-bold bg-success/20 text-success dark:bg-success/30 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold bg-outline-variant/20 text-outline px-2 py-0.5 rounded-full">
                            Archived
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}