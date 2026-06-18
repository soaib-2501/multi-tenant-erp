import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from "../../context/ThemeContext";

const PAGE_SIZE_OPTIONS = [10, 25];

export default function Parents() {
  const navigate = useNavigate();

  const [allParents, setAllParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, pageSize]);

  useEffect(() => {
    fetchAllParents(debouncedSearch);
  }, [debouncedSearch]);

  const fetchAllParents = async (search) => {
    setLoading(true); setError(null);
    try {
      let page = 1;
      let results = [];
      let hasNext = true;
      while (hasNext) {
        const data = await schoolAdminApi.getParents(page, search);
        results = [...results, ...(data.results || data || [])];
        hasNext = Boolean(data.next);
        page += 1;
      }
      setAllParents(results);
    } catch (err) {
      console.error("Fetch Parents Error:", err);
      setError(err.message || "Failed to fetch parent directory.");
    } finally {
      setLoading(false);
    }
  };

  const totalCount = allParents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const parents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allParents.slice(start, start + pageSize);
  }, [allParents, currentPage, pageSize]);

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalCount);

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "PR";
  };

  const getColorClass = (index) => {
    const colors = ["bg-secondary/20 text-secondary", "bg-primary/20 text-primary", "bg-tertiary/20 text-tertiary", "bg-surface-container-high text-on-surface-variant"];
    return colors[index % colors.length];
  };

  return (
    <SchoolLayout title="Parents">
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl pb-12">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Guardian Directory</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">Manage emergency contacts and parental access for students.</p>
          </div>
          <button
            onClick={() => navigate("/school-admin/parents/create")}
            className="bg-primary text-white px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors font-body"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Parent
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-md border border-error/20 text-sm font-body">{error}</div>
        )}

        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden border border-outline-variant/10">

          {/* FILTER BAR */}
          <div className="p-4 flex flex-wrap gap-3 justify-between bg-surface-container-high/50 border-b border-outline-variant/10 items-center">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guardians..."
                  className="w-full bg-surface-container-low pl-9 pr-3 py-2 rounded-md border border-outline-variant/20 text-sm outline-none focus:border-primary transition-colors font-body text-on-surface placeholder:text-outline"
                />
              </div>
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
                  <th className="px-6 py-4 font-headline font-bold">Parent Details</th>
                  <th className="px-6 py-4 font-headline font-bold">Contact Info</th>
                  <th className="px-6 py-4 font-headline font-bold">Occupation</th>
                  <th className="px-6 py-4 font-headline font-bold">Emergency Contact</th>
                  <th className="px-6 py-4 font-headline font-bold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant font-body">Loading guardian profiles...</td></tr>
                ) : parents.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant font-body">No parents found.</td></tr>
                ) : (
                  parents.map((p, i) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/school-admin/parents/${p.id}`)}
                      className="hover:bg-surface-container-high/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.profile_picture ? (
                            <img src={p.profile_picture} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-outline-variant/20" />
                          ) : (
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border border-outline-variant/20 ${getColorClass(i)}`}>
                              {getInitials(p.first_name, p.last_name, p.email)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-on-surface group-hover:text-primary transition-colors font-body">
                              {p.first_name || p.last_name ? `${p.first_name} ${p.last_name}` : "Pending Name"}
                            </p>
                            <p className="text-[10px] text-outline font-mono mt-0.5">{p.email || "No email provided"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-on-surface-variant text-xs font-semibold">{p.phone_number || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-on-surface-variant font-body">{p.occupation || "Unspecified"}</p>
                      </td>
                      <td className="px-6 py-4">
                        {p.emergency_contact_number ? (
                          <span className="px-2.5 py-1 bg-error/10 text-error rounded-full text-[10px] font-bold flex items-center gap-1 w-max border border-error/20">
                            <span className="material-symbols-outlined text-[13px]">emergency</span>{p.emergency_contact_number}
                          </span>
                        ) : (
                          <span className="text-xs text-outline italic font-body">Not setup</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
                      </td>
                    </tr>
                  ))
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
                <span className="ml-2">Showing {rangeStart}-{rangeEnd} of {totalCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors font-body">Previous</button>
                <span className="text-xs font-semibold text-on-surface-variant font-body">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors font-body">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}