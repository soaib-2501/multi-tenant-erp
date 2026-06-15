import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import api from "../../services/axiosClient";

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classLevels, setClassLevels] = useState([]); // For the filter dropdown
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("");

  useEffect(() => {
    // Fetch classes for the dropdown on mount
    api.get(`academics/class-levels/`).then(res => setClassLevels(res.data.results || res.data || []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, classFilter]);

  useEffect(() => { 
    fetchStudents(currentPage, debouncedSearch, statusFilter, classFilter); 
  }, [currentPage, debouncedSearch, statusFilter, classFilter]);

  const fetchStudents = async (page, search, status, classId) => {
    setLoading(true); setError(null);
    try {
      const data = await schoolAdminApi.getStudents(page, search, status, classId);
      setStudents(data.results || data);
      setTotalCount(data.count !== undefined ? data.count : data.length);
      setTotalPages(Math.ceil((data.count || data.length || 1) / 10));
    } catch (err) { setError("Failed to fetch student directory."); } finally { setLoading(false); }
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "ST";
  };

  return (
    <SchoolLayout title="Student Directory">
      <div className="pt-6 px-8 max-w-7xl mx-auto pb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold">Institution Students</h2>
            <p className="text-[#6b7280] text-sm mt-1">Manage profiles, track enrollment, and view records.</p>
          </div>
          <button onClick={() => navigate("/school-admin/students/add")} className="bg-[#0058be] text-white px-5 py-2.5 rounded font-semibold text-sm flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">person_add</span> Register Student
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          
          {/* THE NEW FILTER BAR */}
          <div className="p-4 flex flex-wrap gap-3 justify-between bg-[#f8f9ff] border-b border-gray-100 items-center">
            <div className="flex gap-3 items-center flex-1">
              {/* Search */}
              <div className="relative w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name, email, ID..." className="w-full bg-white pl-9 pr-3 py-2 rounded border border-gray-200 text-sm outline-none focus:border-[#0058be]" />
              </div>
              
              {/* Status Filter */}
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-gray-200 text-sm rounded px-3 py-2 outline-none focus:border-[#0058be] text-slate-600">
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="ARCHIVED">Archived Only</option>
              </select>

              {/* Class Filter */}
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="bg-white border border-gray-200 text-sm rounded px-3 py-2 outline-none focus:border-[#0058be] text-slate-600">
                <option value="">All Classes</option>
                {classLevels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {totalCount} Records Found
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-xs text-[#727785] uppercase border-b border-gray-100">
                <tr><th className="px-6 py-4">Student Details</th><th>Enrollment No.</th><th>Contact Info</th><th className="text-center">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {loading ? <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td></tr> : 
                 students.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-gray-500">No students match your filters.</td></tr> :
                 students.map((s) => {
                    const fName = s.first_name || s.user?.first_name || "";
                    const lName = s.last_name || s.user?.last_name || "";
                    const emailAddr = s.email || s.user?.email || "No Email";
                    return (
                      // Added onClick to route to Details page (Task 3!)
                      <tr key={s.id} onClick={() => navigate(`/school-admin/students/${s.id}`)} className="hover:bg-blue-50/30 cursor-pointer transition-colors group">
                        <td className="px-6 py-4 flex gap-3 items-center">
                          <div className="w-9 h-9 rounded-full bg-[#eff4ff] text-[#0058be] flex items-center justify-center font-bold text-xs border border-blue-100">{getInitials(fName, lName, emailAddr)}</div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-[#0058be] transition-colors">{fName || lName ? `${fName} ${lName}` : emailAddr}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{emailAddr}</p>
                          </div>
                        </td>
                        <td className="font-mono text-gray-600 text-xs font-semibold">{s.enrollment_number || "N/A"}</td>
                        <td className="text-gray-600 text-xs">{s.phone_number || "N/A"}</td>
                        <td className="text-center">
                          {!s.is_archived ? (
                            <span className="text-[10px] uppercase font-bold bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Archived</span>
                          )}
                        </td>
                      </tr>
                    )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}