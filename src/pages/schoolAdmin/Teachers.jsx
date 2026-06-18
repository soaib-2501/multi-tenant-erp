import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from "../../context/ThemeContext";

const PAGE_SIZE_OPTIONS = [10, 25];

export default function Teachers() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, pageSize]);

  useEffect(() => {
    fetchAllTeachers(debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  const fetchAllTeachers = async (search, status) => {
    setLoading(true); setError(null);
    try {
      let page = 1;
      let results = [];
      let hasNext = true;
      while (hasNext) {
        const data = await schoolAdminApi.getTeachers(page, search, status);
        results = [...results, ...(data.results || data || [])];
        hasNext = Boolean(data.next);
        page += 1;
      }
      setAllTeachers(results);
    } catch (err) {
      console.error("Fetch Teachers Error:", err);
      setError(err.message || "Failed to fetch teacher directory.");
    } finally {
      setLoading(false);
    }
  };

  const totalCount = allTeachers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const teachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allTeachers.slice(start, start + pageSize);
  }, [allTeachers, currentPage, pageSize]);

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalCount);

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "TR";
  };

  return (
    <SchoolLayout title="Teachers">
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl pb-12">

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

        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden border border-outline-variant/10">

          {/* FILTER BAR */}
          <div className="p-4 flex flex-wrap gap-3 justify-between bg-surface-container-high/50 border-b border-outline-variant/10 items-center">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              {/* Search */}
              <div className="relative w-64">
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
                  <th className="px-6 py-4 font-headline font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant font-body">Loading faculty profiles...</td></tr>
                ) : teachers.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant font-body">No teachers match your filters.</td></tr>
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
                              <img src={t.profile_picture} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-outline-variant/20" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs border border-outline-variant/20">
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
                          <p className="font-mono text-on-surface-variant text-xs font-semibold">{t.employee_id || "N/A"}</p>
                          <p className="text-[10px] text-outline mt-0.5">{t.phone_number || "No phone"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded text-2xs font-bold uppercase bg-secondary/10 text-secondary border border-secondary/20 font-body">
                            {t.qualification || "Unspecified"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
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

          {/* PAGINATION BAR */}
          {!loading && totalCount > 0 && (
            <div className="p-4 flex flex-wrap gap-4 justify-between items-center border-t border-outline-variant/10 bg-surface-container-high/30">
              <div className="flex items-center gap-2 text-xs font-body text-on-surface-variant">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-surface-container-low border border-outline-variant/20 text-xs rounded-md px-2 py-1.5 outline-none focus:border-primary text-on-surface font-body"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="ml-2">
                  Showing {rangeStart}-{rangeEnd} of {totalCount}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors font-body"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-on-surface-variant font-body">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors font-body"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}