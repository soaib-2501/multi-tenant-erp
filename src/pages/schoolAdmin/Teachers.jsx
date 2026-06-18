import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from "../../context/ThemeContext";

export default function Teachers() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

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
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Faculty Directory</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">Manage and oversee all teaching staff across departments.</p>
          </div>
          <button
            onClick={() => navigate("/school-admin/teachers/create")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm bg-primary text-white font-semibold shadow-sm hover:bg-primary/90 transition-all font-body"
          >
            <span className="material-symbols-outlined text-lg">person_add</span> Add Teacher
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-md border border-error/20 text-sm font-body">
            {error}
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm border border-outline-variant/10">
          
          {/* FILTER BAR */}
          <div className="p-4 flex flex-wrap gap-3 justify-between bg-surface-container-high/50 border-b border-outline-variant/10 items-center">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              {/* Search */}
              <div className="relative w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, or EMP ID..."
                  className="w-full bg-surface-container-low pl-9 pr-3 py-2 rounded-md border border-outline-variant/20 text-sm outline-none focus:border-primary transition-colors font-body text-on-surface placeholder:text-outline"
                />
              </div>

              {/* Status Filter */}
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="bg-surface-container-low border border-outline-variant/20 text-sm rounded-md px-3 py-2 outline-none focus:border-primary text-on-surface font-body"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="ARCHIVED">Archived Only</option>
              </select>
            </div>

            <div className="text-xs font-bold text-outline uppercase tracking-wider font-body">
              {totalCount} Records Found
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50 text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 font-headline font-bold">Faculty Profile</th>
                  <th className="px-6 py-4 font-headline font-bold">Employee ID</th>
                  <th className="px-6 py-4 font-headline font-bold">Qualification</th>
                  <th className="px-6 py-4 font-headline font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-8 text-on-surface-variant font-body">Loading faculty profiles...</td></tr>
                ) : teachers.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-on-surface-variant font-body">No teachers match your filters.</td></tr>
                ) : (
                  teachers.map((t) => {
                    const fName = t.first_name || t.user?.first_name || "";
                    const lName = t.last_name || t.user?.last_name || "";
                    const displayName = (fName || lName) ? `${fName} ${lName}`.trim() : (t.user?.email || "Pending Setup");
                    const emailAddr = t.email || t.user?.email || "No Email Provided";

                    return (
                      <tr 
                        key={t.id} 
                        onClick={() => navigate(`/school-admin/teachers/${t.id}`)}
                        className="hover:bg-surface-container-high/30 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {t.profile_picture ? (
                              <img src={t.profile_picture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-outline-variant/20" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs border border-outline-variant/20">
                                {getInitials(fName, lName, emailAddr)}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-on-surface group-hover:text-primary transition-colors font-body">{displayName}</p>
                              <p className="text-2xs text-outline font-mono mt-0.5">{emailAddr}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-on-surface font-mono font-bold">{t.employee_id || "N/A"}</p>
                          <p className="text-2xs text-outline mt-0.5">{t.phone_number || "No phone"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded text-2xs font-bold uppercase bg-secondary/10 text-secondary border border-secondary/20 font-body">
                            {t.qualification || "Unspecified"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {!t.is_archived ? (
                            <span className="text-2xs uppercase font-bold bg-success/20 text-success dark:bg-success/30 px-2 py-0.5 rounded-full">Active</span>
                          ) : (
                            <span className="text-2xs uppercase font-bold bg-outline-variant/20 text-outline px-2 py-0.5 rounded-full">Archived</span>
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
            <div className="flex justify-between items-center p-4 border-t border-outline-variant/10 bg-surface-container-low/50">
              <p className="text-xs text-on-surface-variant font-medium font-body">Showing page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="w-7 h-7 flex items-center justify-center border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-high rounded text-outline transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <span className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded text-xs font-bold shadow-sm">{currentPage}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages} 
                  className="w-7 h-7 flex items-center justify-center border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-high rounded text-outline transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}