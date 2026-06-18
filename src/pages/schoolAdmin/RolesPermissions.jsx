import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from "../../context/ThemeContext";

const PAGE_SIZE_OPTIONS = [10, 25];

export default function RolesPermissions() {
  const navigate = useNavigate();

  const [allRoles, setAllRoles] = useState([]);
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
    fetchAllRoles(debouncedSearch);
  }, [debouncedSearch]);

  const fetchAllRoles = async (search) => {
    setLoading(true); setError(null);
    try {
      let page = 1;
      let results = [];
      let hasNext = true;
      while (hasNext) {
        const data = await schoolAdminApi.getRoles(page, search);
        results = [...results, ...(data.results || data || [])];
        hasNext = Boolean(data.next);
        page += 1;
      }
      setAllRoles(results);
    } catch (err) {
      console.error("Fetch Roles Error:", err);
      setError(err.message || "Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  const totalCount = allRoles.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const roles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allRoles.slice(start, start + pageSize);
  }, [allRoles, currentPage, pageSize]);

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalCount);

  const getRoleAesthetics = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin")) return { icon: "admin_panel_settings", bg: "bg-primary/10", text: "text-primary" };
    if (name.includes("teacher")) return { icon: "school", bg: "bg-secondary/10", text: "text-secondary" };
    if (name.includes("finance") || name.includes("account")) return { icon: "account_balance", bg: "bg-success/10", text: "text-success" };
    if (name.includes("lib")) return { icon: "menu_book", bg: "bg-tertiary/10", text: "text-tertiary" };
    return { icon: "verified_user", bg: "bg-outline/10", text: "text-outline" };
  };

  return (
    <SchoolLayout title="Roles & Permissions">
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl pb-12">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">Roles & Permissions</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body">Manage access control and permission sets across the institution.</p>
          </div>
          <button
            onClick={() => navigate("/school-admin/roles/create")}
            className="bg-primary text-white px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors font-body"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Role
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
                  placeholder="Search roles..."
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
                  <th className="px-6 py-4 font-headline font-bold">Role Name</th>
                  <th className="px-6 py-4 font-headline font-bold text-center">Permissions</th>
                  <th className="px-6 py-4 font-headline font-bold">Description</th>
                  <th className="px-6 py-4 font-headline font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant font-body">Loading roles...</td></tr>
                ) : roles.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant font-body">No roles found.</td></tr>
                ) : (
                  roles.map((r) => {
                    const aes = getRoleAesthetics(r.name);
                    return (
                      <tr key={r.id} className="hover:bg-surface-container-high/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-md flex items-center justify-center ${aes.bg}`}>
                              <span className={`material-symbols-outlined text-[18px] ${aes.text}`}>{aes.icon}</span>
                            </div>
                            <p className="font-semibold text-on-surface group-hover:text-primary transition-colors font-body">{r.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-body">
                            {r.permissions?.length || 0} assigned
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-on-surface-variant font-body truncate max-w-xs">{r.description || "No description provided."}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/school-admin/roles/edit/${r.id}`)}
                            className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors font-body"
                          >
                            Edit Details
                          </button>
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
                <span className="ml-2">Showing {rangeStart}-{rangeEnd} of {totalCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors font-body"
                >Previous</button>
                <span className="text-xs font-semibold text-on-surface-variant font-body">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border border-outline-variant/20 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors font-body"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}