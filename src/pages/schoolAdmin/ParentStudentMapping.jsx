import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from "../../context/ThemeContext";

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
    const colors = [
      "bg-primary/20 text-primary",
      "bg-tertiary/20 text-tertiary",
      "bg-secondary/20 text-secondary"
    ];
    return colors[index % colors.length];
  };

  return (
    <SchoolLayout title="Parent-Student Mapping">
      <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-6xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-headline font-extrabold text-on-surface">Relationship Management</h2>
            <p className="text-sm text-on-surface-variant mt-2 max-w-2xl font-body">Configure and manage the legal and academic connections between students and their guardians.</p>
          </div>
          <button 
            onClick={() => navigate("/school-admin/mapping/create")} 
            className="px-6 py-3 bg-primary text-white rounded-md font-semibold flex items-center gap-2 shadow-lg hover:bg-primary/90 transition-all font-body"
          >
            <span className="material-symbols-outlined">add</span> Add Mapping
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error rounded-md border border-error/20 font-body">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl flex justify-between shadow-sm border border-outline-variant/10">
            <div>
              <p className="text-sm font-headline font-bold uppercase tracking-wider text-on-surface-variant">Total Mappings</p>
              <h3 className="text-4xl font-headline font-bold text-primary mt-1">{totalCount}</h3>
            </div>
            <div className="w-24 h-24 rounded-full bg-surface-container-high/50 flex items-center justify-center border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-4xl">hub</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-high/50 border-b border-outline-variant/10">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
              <input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search connections..." 
                className="w-full bg-surface-container-low pl-10 pr-4 py-2.5 rounded-md outline-none border border-outline-variant/20 focus:border-primary/30 transition-all shadow-sm font-body text-on-surface placeholder:text-outline" 
              />
            </div>
            <div className="text-sm text-on-surface-variant font-medium font-body flex items-center">
              Showing {mappings.length} of {totalCount} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/50 text-xs uppercase text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 font-headline font-bold tracking-wider">Guardian Info</th>
                  <th className="px-6 py-4 font-headline font-bold tracking-wider">Student Info</th>
                  <th className="px-6 py-4 font-headline font-bold tracking-wider">Relationship</th>
                  <th className="px-6 py-4 font-headline font-bold text-center">Permissions</th>
                  <th className="px-6 py-4 font-headline font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-12 text-on-surface-variant font-body">Loading relationship mappings...</td></tr>
                ) : mappings.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-on-surface-variant font-body">No parent-student mappings found.</td></tr>
                ) : (
                  mappings.map((m, i) => (
                    <tr 
                      key={m.id} 
                      className="hover:bg-surface-container-high/30 transition-colors cursor-pointer group" 
                      onClick={() => navigate(`/school-admin/mapping/${m.id}`)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${getColorClass(i)}`}>
                            {getInitials(m.parent_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface font-body">{m.parent_name || "Unknown Parent"}</p>
                            {m.is_primary_contact && (
                              <span className="text-2xs uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Primary Contact</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/10">
                            <span className="material-symbols-outlined text-outline text-[16px]">school</span>
                          </div>
                          <span className="font-medium text-on-surface font-body">{m.student_name || "Unknown Student"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-body">
                          {m.relationship || "Guardian"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <span 
                            title="Academics Access" 
                            className={`material-symbols-outlined text-lg ${m.can_view_academics ? 'text-success' : 'text-outline/40'}`}
                          >
                            menu_book
                          </span>
                          <span 
                            title="Fee Payment Access" 
                            className={`material-symbols-outlined text-lg ${m.can_pay_fees ? 'text-primary' : 'text-outline/40'}`}
                          >
                            payments
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-semibold flex items-center gap-1.5 text-success bg-success/10 px-2.5 py-1 rounded-full w-max border border-success/20 font-body">
                          <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Verified Sync
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-outline-variant/10 bg-surface-container-low/50">
              <p className="text-xs text-on-surface-variant font-medium font-body">Showing page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="w-8 h-8 flex items-center justify-center border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-high rounded text-outline transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <span className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded text-sm font-bold shadow-sm">{currentPage}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages} 
                  className="w-8 h-8 flex items-center justify-center border border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-high rounded text-outline transition-colors disabled:opacity-50"
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