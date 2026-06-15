import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

export default function Parents() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
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
    fetchParents(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const fetchParents = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);

    try {
      const data = await schoolAdminApi.getParents(page, search);
      
      if (data.results) {
        setParents(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setParents(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch Parents Error:", err);
      setError(err.message || "Failed to fetch parent directory.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "PR";
  };

  const getColorClass = (index) => {
    const colors = ["bg-[#e9ddff] text-[#6b38d4]", "bg-[#d8e2ff] text-[#0058be]", "bg-[#ffdcc6] text-[#924700]", "bg-[#eff4ff] text-[#2170e4]"];
    return colors[index % colors.length];
  };

  return (
    <SchoolLayout title="Parents">
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-12">
        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-8 bg-white border-l-4 border-[#0058be] p-6 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Guardian Directory</h3>
              <p className="text-sm text-[#6b7280] mt-1">Manage emergency contacts and parental access for students.</p>
            </div>
            <button onClick={() => navigate("/school-admin/parents/create")} className="flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
              <span className="material-symbols-outlined">add</span> Add Parent
            </button>
          </div>
          <div className="lg:col-span-4 bg-[#eff4ff] rounded-xl p-6 flex items-center gap-4 shadow-sm border border-blue-50">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#0058be] shadow-sm">
              <span className="material-symbols-outlined text-[28px]">family_history</span>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-[#0058be]">Total Profiles</p>
              <p className="text-3xl font-bold">{totalCount}</p>
            </div>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 flex justify-between items-center bg-[#f8f9ff] border-b border-gray-100">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search guardians..." className="w-full bg-white pl-9 pr-4 py-2.5 rounded-md text-sm border border-gray-200 focus:border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none transition-all shadow-sm" />
            </div>
            <div className="flex items-center gap-4 text-xs text-[#6b7280] font-medium">
              Showing {parents.length} of {totalCount} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-xs uppercase text-[#6b7280] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Parent Details</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Occupation</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Emergency Contact</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-500">Loading guardian profiles...</td></tr>
                ) : parents.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-500">No parents found.</td></tr>
                ) : (
                  parents.map((p, i) => (
                    <tr key={p.id} className="hover:bg-[#fcfdff] transition-colors cursor-pointer" onClick={() => navigate(`/school-admin/parents/${p.id}`)}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {p.profile_picture ? (
                            <img src={p.profile_picture} alt="Profile" className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-sm" />
                          ) : (
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getColorClass(i)}`}>{getInitials(p.first_name, p.last_name, p.email)}</div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{p.first_name || p.last_name ? `${p.first_name} ${p.last_name}` : "Pending Name"}</p>
                            <p className="text-xs text-[#6b7280] mt-0.5">{p.email || "No email provided"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#475569] font-medium">{p.phone_number || "N/A"}</td>
                      <td className="px-6 py-5 text-sm text-[#475569]">{p.occupation || "Unspecified"}</td>
                      <td className="px-6 py-5">
                        {p.emergency_contact_number ? (
                          <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1 w-max border border-red-100">
                            <span className="material-symbols-outlined text-[14px]">emergency</span>{p.emergency_contact_number}
                          </span>
                        ) : <span className="text-xs text-gray-400 italic">Not setup</span>}
                      </td>
                      <td className="px-6 py-5 text-right"><span className="material-symbols-outlined text-[#c2c6d6] group-hover:text-[#0058be] transition-colors">chevron_right</span></td>
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