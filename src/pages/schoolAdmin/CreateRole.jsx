import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";
import { useTheme } from "../../context/ThemeContext";

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
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const handleModuleToggle = (moduleName, isSelectingAll) => {
    const modulePermIds = groupedPermissions[moduleName].map((p) => p.id);
    if (isSelectingAll) {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...modulePermIds])));
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => !modulePermIds.includes(id)));
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
        setError(
          Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ")
        );
      } else {
        setError(err.message || "Failed to deploy role.");
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this role? Users assigned to it will lose these permissions."
      )
    )
      return;
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
    if (name.includes("user")) return { icon: "group", color: "var(--color-primary)" };
    if (name.includes("academic") || name.includes("class"))
      return { icon: "school", color: "var(--color-secondary)" };
    if (name.includes("attend")) return { icon: "fact_check", color: "var(--color-tertiary)" };
    if (name.includes("grade") || name.includes("exam"))
      return { icon: "grade", color: "var(--color-error)" };
    if (name.includes("finance") || name.includes("fee"))
      return { icon: "account_balance", color: "var(--color-success)" };
    return { icon: "settings", color: "var(--color-outline)" };
  };

  if (initialLoad) {
    return (
      <SchoolLayout title="Roles & Permissions">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-primary font-semibold flex items-center gap-2 font-body">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading RBAC Definitions...
          </div>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Roles & Permissions">
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface">
              {isEditMode ? "Edit Role Configuration" : "Create New Role"}
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5 max-w-xl font-body">
              Define administrative access and feature scope for institutional staff.
            </p>
          </div>
          <button
            onClick={() => navigate("/school-admin/roles")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/10 text-primary font-semibold rounded-md shadow-sm transition font-body"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Directory
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error/10 text-error rounded-md border border-error/20 text-sm font-medium flex gap-2 font-body">
            <span className="material-symbols-outlined text-xl">error</span>
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <form id="roleForm" onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
                <h2 className="text-base font-headline font-bold mb-5 flex gap-2 items-center text-on-surface">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span> Role Identity
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5 font-body">
                      Role Name <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Senior Department Head"
                      className="w-full bg-surface-container-low text-sm px-3 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/50 text-on-surface placeholder:text-on-surface-variant font-body"
                    />
                  </div>
                  <div>
                    <label className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5 font-body">
                      Description
                    </label>
                    <textarea
                      rows="2"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe responsibilities..."
                      className="w-full bg-surface-container-low text-sm px-3 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-primary/30 border border-transparent focus:border-primary/50 text-on-surface placeholder:text-on-surface-variant resize-none font-body"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
                <h2 className="text-base font-headline font-bold mb-5 flex gap-2 items-center text-on-surface border-b border-outline-variant/10 pb-3">
                  <span className="w-1.5 h-6 bg-secondary rounded-full"></span> Access Control Matrix
                </h2>

                {Object.keys(groupedPermissions).length === 0 ? (
                  <p className="text-center text-on-surface-variant py-4 text-sm font-body">
                    No permissions found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
                      const aes = getModuleAesthetics(moduleName);
                      const modulePermIds = perms.map((p) => p.id);
                      const selectedCount = modulePermIds.filter((id) =>
                        selectedPermissions.includes(id)
                      ).length;
                      const allSelected =
                        selectedCount === modulePermIds.length && modulePermIds.length > 0;

                      return (
                        <div
                          key={moduleName}
                          className="border border-outline-variant/10 rounded-md overflow-hidden"
                        >
                          <div className="bg-surface-container-high/50 px-4 py-2.5 flex flex-wrap justify-between items-center gap-2 border-b border-outline-variant/10">
                            <div className="flex items-center gap-2">
                              <span
                                className="material-symbols-outlined text-lg"
                                style={{ color: aes.color }}
                              >
                                {aes.icon}
                              </span>
                              <h3 className="font-bold text-sm text-on-surface font-headline">
                                {moduleName}
                              </h3>
                              <span className="text-2xs px-1.5 py-0.5 bg-surface-container-lowest text-on-surface-variant rounded border border-outline-variant/10 font-bold font-body">
                                {selectedCount} / {modulePermIds.length}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleModuleToggle(moduleName, !allSelected)}
                              className="text-xs font-bold text-primary hover:underline font-body"
                            >
                              {allSelected ? "Deselect All" : "Select All"}
                            </button>
                          </div>

                          <div className="p-3 grid md:grid-cols-2 gap-2">
                            {perms.map((p) => (
                              <label
                                key={p.id}
                                className={`flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors border ${
                                  selectedPermissions.includes(p.id)
                                    ? "bg-primary/5 border-primary/20"
                                    : "border-transparent hover:bg-surface-container-high"
                                }`}
                              >
                                <div className="mt-0.5">
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(p.id)}
                                    onChange={() => togglePermission(p.id)}
                                    className="w-3.5 h-3.5 rounded text-primary focus:ring-primary/30 border-outline-variant/20"
                                  />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-on-surface leading-none mb-0.5 font-body">
                                    {p.name}
                                  </p>
                                  <p className="text-2xs text-on-surface-variant font-mono font-body">
                                    coden: {p.codename}
                                  </p>
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
            <div className="bg-surface-container-high/50 p-6 rounded-lg border border-primary/10 shadow-sm">
              <h4 className="font-headline font-bold mb-4 text-on-surface text-sm">
                Deployment Summary
              </h4>
              <div className="space-y-3 text-sm text-on-surface-variant font-body">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                  <span>Scope</span>
                  <span className="font-bold text-xs bg-surface-container-lowest px-1.5 py-0.5 rounded border border-outline-variant/10 uppercase font-body">
                    Tenant Isolated
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                  <span>Permissions</span>
                  <span className="font-bold text-primary font-body">
                    {selectedPermissions.length}{" "}
                    <span className="font-normal text-on-surface-variant text-xs">
                      / {allPermissionsCount}
                    </span>
                  </span>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    type="submit"
                    form="roleForm"
                    disabled={loading}
                    className="w-full py-2.5 bg-primary text-white rounded-md font-bold shadow hover:bg-primary/90 transition-all disabled:opacity-70 text-sm font-body"
                  >
                    {loading ? "Syncing..." : isEditMode ? "Update Role" : "Deploy Role"}
                  </button>

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="w-full py-2 bg-surface-container-lowest border border-error/20 text-error rounded-md font-bold hover:bg-error/10 transition-colors flex items-center justify-center gap-1.5 text-sm font-body"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete_forever
                      </span>
                      Delete Role
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