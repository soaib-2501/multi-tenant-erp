import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

export default function CreateRole() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [allPermissionsCount, setAllPermissionsCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch all global permissions directly via Axios
        const permRes = await api.get(`accounts/permissions/`);
        const permissionsData = permRes.data;
        
        setAllPermissionsCount(permissionsData.length);

        const grouped = permissionsData.reduce((acc, perm) => {
          const mod = perm.module || "General Systems";
          if (!acc[mod]) acc[mod] = [];
          acc[mod].push(perm);
          return acc;
        }, {});

        setGroupedPermissions(grouped);

        if (isEditMode) {
          const roleRes = await api.get(`accounts/roles/${id}/`);
          const data = roleRes.data;
          setName(data.name || "");
          setDescription(data.description || "");
          setSelectedPermissions(data.permissions || []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load RBAC permissions or role details.");
      } finally {
        setInitialLoad(false);
      }
    };
    initData();
  }, [id, isEditMode]);

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId) 
        : [...prev, permId]
    );
  };

  const handleModuleToggle = (moduleName, isSelectingAll) => {
    const modulePermIds = groupedPermissions[moduleName].map(p => p.id);
    if (isSelectingAll) {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...modulePermIds])));
    } else {
      setSelectedPermissions(prev => prev.filter(id => !modulePermIds.includes(id)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { name, description, permissions: selectedPermissions };

      if (isEditMode) {
        await api.patch(`accounts/roles/${id}/`, payload);
      } else {
        await api.post(`accounts/roles/`, payload);
      }

      alert(`Role ${isEditMode ? "updated" : "created"} successfully!`);
      navigate("/school-admin/roles");
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        setError(Object.entries(data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`).join(" | "));
      } else {
        setError(err.message || "Failed to deploy role.");
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this role? Users assigned to it will lose these permissions.")) return;
    setLoading(true);
    try {
      await api.delete(`accounts/roles/${id}/`);
      alert("Role deleted successfully.");
      navigate("/school-admin/roles");
    } catch (err) {
      setError(err.message || "Failed to delete role.");
      setLoading(false);
    }
  };

  const getModuleAesthetics = (moduleName) => {
    const name = moduleName.toLowerCase();
    if (name.includes("user")) return { icon: "group", color: "#0058be" };
    if (name.includes("academic") || name.includes("class")) return { icon: "school", color: "#6b38d4" };
    if (name.includes("attend")) return { icon: "fact_check", color: "#924700" };
    if (name.includes("grade") || name.includes("exam")) return { icon: "grade", color: "#ba1a1a" };
    if (name.includes("finance") || name.includes("fee")) return { icon: "account_balance", color: "#0f9d58" };
    return { icon: "settings", color: "#475569" };
  };

  if (initialLoad) {
    return (
      <SchoolLayout title="Roles & Permissions">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-[#0058be] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading RBAC Definitions...
          </div>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Roles & Permissions">
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isEditMode ? "Edit Role Configuration" : "Create New Role"}
            </h1>
            <p className="text-[#6b7280] mt-1 text-sm max-w-xl">
              Define administrative access and feature scope for institutional staff.
            </p>
          </div>
          <button onClick={() => navigate("/school-admin/roles")} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 border border-gray-200 text-[#0058be] font-semibold rounded shadow-sm">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Directory
          </button>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm font-medium flex gap-2"><span className="material-symbols-outlined text-[20px]">error</span>{error}</div>}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <form id="roleForm" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-base font-bold mb-5 flex gap-2 items-center text-slate-800">
                  <span className="w-1.5 h-6 bg-[#0058be] rounded-full"></span> Role Identity
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#6b7280] uppercase block mb-1.5">Role Name <span className="text-red-500">*</span></label>
                    <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Senior Department Head" className="w-full bg-[#f8f9ff] text-sm px-3 py-2.5 rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#6b7280] uppercase block mb-1.5">Description</label>
                    <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe responsibilities..." className="w-full bg-[#f8f9ff] text-sm px-3 py-2.5 rounded outline-none focus:ring-2 focus:ring-[#0058be]/20 resize-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-base font-bold mb-5 flex gap-2 items-center text-slate-800 border-b border-gray-100 pb-3">
                  <span className="w-1.5 h-6 bg-[#6b38d4] rounded-full"></span> Access Control Matrix
                </h2>

                {Object.keys(groupedPermissions).length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-sm">No permissions found.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
                      const aes = getModuleAesthetics(moduleName);
                      const modulePermIds = perms.map(p => p.id);
                      const selectedCount = modulePermIds.filter(id => selectedPermissions.includes(id)).length;
                      const allSelected = selectedCount === modulePermIds.length && modulePermIds.length > 0;

                      return (
                        <div key={moduleName} className="border border-slate-200 rounded overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2.5 flex justify-between items-center border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]" style={{ color: aes.color }}>{aes.icon}</span>
                              <h3 className="font-bold text-sm text-slate-800">{moduleName}</h3>
                              <span className="text-[10px] px-1.5 py-0.5 bg-white text-slate-500 rounded border border-slate-200 font-bold">
                                {selectedCount} / {modulePermIds.length}
                              </span>
                            </div>
                            <button type="button" onClick={() => handleModuleToggle(moduleName, !allSelected)} className="text-[11px] font-bold text-[#0058be] hover:underline">
                              {allSelected ? "Deselect All" : "Select All"}
                            </button>
                          </div>
                          
                          <div className="p-3 grid md:grid-cols-2 gap-2">
                            {perms.map(p => (
                              <label key={p.id} className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-colors border ${selectedPermissions.includes(p.id) ? "bg-blue-50/50 border-[#0058be]/20" : "border-transparent hover:bg-slate-100"}`}>
                                <div className="mt-0.5">
                                  <input type="checkbox" checked={selectedPermissions.includes(p.id)} onChange={() => togglePermission(p.id)} className="w-3.5 h-3.5 rounded text-[#0058be]" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800 leading-none mb-1">{p.name}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">coden: {p.codename}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT Panel (Action Summary Only) */}
          <div className="lg:sticky lg:top-6 self-start">
            <div className="bg-[#f8f9ff] p-6 rounded-lg border border-blue-100 shadow-sm">
              <h4 className="font-bold mb-4 text-slate-800 text-sm">Deployment Summary</h4>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span>Scope</span>
                  <span className="font-bold text-[11px] bg-white px-1.5 py-0.5 rounded border border-gray-200 uppercase">Tenant Isolated</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span>Permissions</span>
                  <span className="font-bold text-[#0058be]">{selectedPermissions.length} <span className="font-normal text-slate-500 text-xs">/ {allPermissionsCount}</span></span>
                </div>

                <div className="pt-3 space-y-2">
                  <button type="submit" form="roleForm" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded font-bold shadow hover:shadow-md transition-all disabled:opacity-70 text-sm">
                    {loading ? "Syncing..." : (isEditMode ? "Update Role" : "Deploy Role")}
                  </button>

                  {isEditMode && (
                     <button type="button" onClick={handleDelete} disabled={loading} className="w-full py-2 bg-white border border-red-200 text-red-600 rounded font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 text-sm">
                       <span className="material-symbols-outlined text-[16px]">delete_forever</span> Delete Role
                     </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </SchoolLayout>
  );
}