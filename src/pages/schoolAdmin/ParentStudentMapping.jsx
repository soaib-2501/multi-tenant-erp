import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

export default function ParentStudentMapping() {
  const navigate = useNavigate();

  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchMappings(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const fetchMappings = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);

    try {
      const data = await schoolAdminApi.getParentStudentMappings(page, search);
      
      if (data.results) {
        setMappings(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setMappings(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch Mappings Error:", err);
      setError(err.message || "Failed to fetch relationship mappings.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "PR";
    const parts = name.split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = ["bg-[#d8e2ff] text-[#0058be]", "bg-[#ffdcc6] text-[#924700]", "bg-[#e9ddff] text-[#6b38d4]"];
    return colors[index % colors.length];
  };

  return (
    <SchoolLayout title="Parent-Student Mapping">
      <div className="max-w-6xl mx-auto px-8 pt-6 pb-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Relationship Management</h2>
            <p className="text-[#6b7280] mt-2 max-w-2xl">Configure and manage the legal and academic connections between students and their guardians.</p>
          </div>
          <button onClick={() => navigate("/school-admin/mapping/create")} className="px-6 py-3 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded-md font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <span className="material-symbols-outlined">add</span> Add Mapping
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="md:col-span-2 bg-white p-6 rounded-xl flex justify-between shadow-sm border border-gray-100">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280]">Total Mappings</p>
              <h3 className="text-4xl font-bold text-[#0058be] mt-1">{totalCount}</h3>
            </div>
            <div className="w-24 h-24 rounded-full bg-[#eff4ff] flex items-center justify-center border border-blue-50">
              <span className="material-symbols-outlined text-[#0058be] text-4xl">hub</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 flex justify-between items-center bg-[#f8f9ff] border-b border-gray-100">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">search</span>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search connections..." className="w-full bg-white pl-10 pr-4 py-2.5 rounded-md outline-none border border-gray-200 focus:border-[#0058be]/30 transition-all shadow-sm" />
            </div>
            <div className="text-sm text-[#6b7280] font-medium flex items-center">
              Showing {mappings.length} of {totalCount} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-xs uppercase text-[#6b7280] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Guardian Info</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Student Info</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Relationship</th>
                  <th className="px-6 py-4 font-semibold text-center">Permissions</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-500">Loading relationship mappings...</td></tr>
                ) : mappings.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-500">No parent-student mappings found.</td></tr>
                ) : (
                  mappings.map((m, i) => (
                    <tr key={m.id} className="hover:bg-[#fcfdff] transition-colors cursor-pointer group" onClick={() => navigate(`/school-admin/mapping/${m.id}`)}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${getColorClass(i)}`}>{getInitials(m.parent_name)}</div>
                          <div>
                            <p className="font-semibold text-gray-900">{m.parent_name || "Unknown Parent"}</p>
                            {m.is_primary_contact && <span className="text-[10px] uppercase font-bold text-[#0058be] bg-blue-50 px-1.5 py-0.5 rounded">Primary Contact</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <span className="material-symbols-outlined text-slate-500 text-[16px]">school</span>
                          </div>
                          <span className="font-medium text-slate-800">{m.student_name || "Unknown Student"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#e9ddff] text-[#6b38d4] border border-[#d6beff]">{m.relationship || "Guardian"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <span title="Academics Access" className={`material-symbols-outlined text-[18px] ${m.can_view_academics ? 'text-green-600' : 'text-gray-300'}`}>menu_book</span>
                          <span title="Fee Payment Access" className={`material-symbols-outlined text-[18px] ${m.can_pay_fees ? 'text-blue-600' : 'text-gray-300'}`}>payments</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-semibold flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-max border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Verified Sync
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-[#6b7280] font-medium">Showing page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 rounded text-gray-500 transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                <span className="w-8 h-8 flex items-center justify-center bg-[#0058be] text-white rounded text-sm font-bold shadow-sm">{currentPage}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 rounded text-gray-500 transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}