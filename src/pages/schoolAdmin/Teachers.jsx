import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

export default function Teachers() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchTeachers(currentPage, debouncedSearch, statusFilter);
  }, [currentPage, debouncedSearch, statusFilter]);

  const fetchTeachers = async (page = 1, search = "", status = "ALL") => {
    setLoading(true);
    setError(null);

    try {
      // Assuming your schoolAdminApi.getTeachers takes (page, search, status)
      const data = await schoolAdminApi.getTeachers(page, search, status);
      
      if (data.results) {
        setTeachers(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setTeachers(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch Teachers Error:", err);
      setError(err.message || "Failed to fetch teacher directory.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "TR";
  };

  return (
    <SchoolLayout title="Teachers">
      <div className="pt-6 px-8 max-w-7xl mx-auto pb-12">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Faculty Directory</h2>
            <p className="text-[#6b7280] mt-1 text-sm">Manage and oversee all teaching staff across departments.</p>
          </div>
          <button
            onClick={() => navigate("/school-admin/teachers/create")}
            className="flex items-center gap-2 px-5 py-2.5 rounded text-sm bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span> Add Teacher
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>}

        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
          
          {/* FILTER BAR */}
          <div className="p-4 flex flex-wrap gap-3 justify-between bg-[#f8f9ff] border-b border-gray-100 items-center">
            <div className="flex gap-3 items-center flex-1">
              {/* Search */}
              <div className="relative w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, or EMP ID..."
                  className="w-full bg-white pl-9 pr-3 py-2 rounded border border-gray-200 text-sm outline-none focus:border-[#0058be] transition-colors"
                />
              </div>

              {/* Status Filter */}
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="bg-white border border-gray-200 text-sm rounded px-3 py-2 outline-none focus:border-[#0058be] text-slate-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="ARCHIVED">Archived Only</option>
              </select>
            </div>

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {totalCount} Records Found
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-xs text-[#727785] uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Faculty Profile</th>
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Qualification</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-500 text-sm">Loading faculty profiles...</td></tr>
                ) : teachers.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-500 text-sm">No teachers match your filters.</td></tr>
                ) : (
                  teachers.map((t) => {
                    const fName = t.first_name || t.user?.first_name || "";
                    const lName = t.last_name || t.user?.last_name || "";
                    const displayName = (fName || lName) ? `${fName} ${lName}`.trim() : (t.user?.email || "Pending Setup");
                    const emailAddr = t.email || t.user?.email || "No Email Provided";

                    return (
                      // Clickable row for Step 3 Details Page
                      <tr 
                        key={t.id} 
                        onClick={() => navigate(`/school-admin/teachers/${t.id}`)}
                        className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {t.profile_picture ? (
                              <img src={t.profile_picture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-xs border border-blue-100">
                                {getInitials(fName, lName, emailAddr)}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-[#0058be] transition-colors">{displayName}</p>
                              <p className="text-[10px] text-[#6b7280] font-mono mt-0.5">{emailAddr}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-800 font-mono font-bold">{t.employee_id || "N/A"}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{t.phone_number || "No phone"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-[#e9ddff] text-[#6b38d4] border border-[#d6beff]">
                            {t.qualification || "Unspecified"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {!t.is_archived ? (
                            <span className="text-[10px] uppercase font-bold bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Archived</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-[#6b7280] font-medium">Showing page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-7 h-7 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 rounded text-gray-500 transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                <span className="w-7 h-7 flex items-center justify-center bg-[#0058be] text-white rounded text-xs font-bold shadow-sm">{currentPage}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-7 h-7 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 rounded text-gray-500 transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}