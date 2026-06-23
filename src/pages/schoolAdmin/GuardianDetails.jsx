import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

// ─────────────────────────────────────────────
// Skeleton Loader (shimmer)
// ─────────────────────────────────────────────
function Skeleton({ className = "", style = {} }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background: "linear-gradient(90deg, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 25%, color-mix(in srgb, var(--color-outline-variant) 28%, var(--color-surface-container-lowest)) 50%, color-mix(in srgb, var(--color-outline-variant) 16%, var(--color-surface-container-lowest)) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease infinite",
        ...style,
      }}
    />
  );
}

// ─────────────────────────────────────────────
// Helpers (mirrors StudentDetails)
// ─────────────────────────────────────────────
const labelClass = "text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block";
const viewFieldClass = "text-sm font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100";
const editFieldClass = "w-full text-sm font-bold text-slate-800 bg-white border border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none px-4 py-2 rounded-md";

function SectionCard({ title, icon, borderColor = "border-blue-400", children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className={`w-1 h-5 ${borderColor} rounded-full`} style={{ background: "currentColor" }}></span>
        <span className="material-symbols-outlined text-[18px] text-gray-400">{icon}</span>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function Field({ label, viewValue, isEditing, children }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      {isEditing ? children : <p className={viewFieldClass}>{viewValue || "N/A"}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function GuardianDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parent, setParent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    occupation: "",
    emergency_contact_number: "",
    is_archived: false,
  });

  // ── Toast helper ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch parent ──
  const fetchParent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`profiles/parents/${id}/`);
      const data = response.data;
      setParent(data);

      // IMPORTANT: parent.user is a UUID string, NOT an object.
      const uid = typeof data.user === "object" ? data.user?.id : data.user;
      setUserId(uid);

      // Determine archived status – from the profile or fallback to user.is_active
      let isArchived = !!data.is_archived;
      if (uid && !data.is_archived) {
        try {
          const userRes = await api.get(`users/${uid}/`);
          isArchived = userRes.data.is_active === false;
        } catch (_) { /* ignore */ }
      }

      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || data.user?.email || "",
        phone_number: data.phone_number || "",
        occupation: data.occupation || "",
        emergency_contact_number: data.emergency_contact_number || "",
        is_archived: isArchived,
      });
    } catch (err) {
      setError("Failed to load guardian details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParent();
  }, [id]);

  // ── Save handler ──
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update parent profile fields including is_archived
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        occupation: formData.occupation,
        emergency_contact_number: formData.emergency_contact_number,
        is_archived: formData.is_archived,
      };
      await api.patch(`profiles/parents/${id}/`, payload);

      // 2. If we have the user ID, sync the user's is_active and name/email
      if (userId) {
        await api.patch(`users/${userId}/`, {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_active: !formData.is_archived,
        });
      }

      await fetchParent();
      setIsEditing(false);
      showToast("Guardian updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      const msg = err.response?.data
        ? Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ")
        : "Failed to save changes.";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete handler ──
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`profiles/parents/${id}/`);
      showToast("Guardian deleted successfully!", "success");
      setTimeout(() => navigate("/school-admin/parents"), 1000);
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete guardian. Please try again.", "error");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading state (mirrors StudentDetails layout exactly) ──
  if (loading) {
    return (
      <SchoolLayout title="Guardian Details">
        <div className="px-4 md:px-8 pt-4 pb-12">
          <div className="flex flex-col gap-6">
            {/* Top bar skeleton */}
            <div className="flex justify-between items-center">
              <Skeleton style={{ width: 140, height: 20 }} />
              <div className="flex gap-3">
                <Skeleton style={{ width: 80, height: 36, borderRadius: 8 }} />
                <Skeleton style={{ width: 80, height: 36, borderRadius: 8 }} />
              </div>
            </div>
            {/* Identity card skeleton */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-5">
                <Skeleton style={{ width: 64, height: 64, borderRadius: 16 }} />
                <div className="flex-1">
                  <Skeleton style={{ width: 200, height: 24 }} />
                  <Skeleton style={{ width: 150, height: 14, marginTop: 4 }} />
                </div>
                <Skeleton style={{ width: 100, height: 36, borderRadius: 8 }} />
              </div>
            </div>
            {/* Profile skeleton */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="py-3 border-b border-gray-100 last:border-0">
                  <Skeleton style={{ width: 120, height: 12 }} />
                  <Skeleton style={{ width: 160, height: 16, marginTop: 4 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SchoolLayout>
    );
  }

  if (error || !parent) {
    return (
      <SchoolLayout title="Guardian Details">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
            <p className="text-gray-500">{error || "Guardian not found."}</p>
            <button
              onClick={() => navigate("/school-admin/parents")}
              className="mt-4 px-4 py-2 bg-[#0058be] text-white rounded-lg text-sm font-bold"
            >
              Back
            </button>
          </div>
        </div>
      </SchoolLayout>
    );
  }

  // ── Render ──
  const displayName = `${formData.first_name} ${formData.last_name}`.trim() || parent.email || "Unknown Guardian";
  const emailAddr = parent.email || parent.user?.email || "No Email";
  const isArchived = formData.is_archived || false;

  const fName = parent.first_name || "";
  const lName = parent.last_name || "";
  const initials = fName && lName ? `${fName[0]}${lName[0]}`.toUpperCase() : "GU";

  return (
    <SchoolLayout title="Guardian Details">
      <div className="px-4 md:px-8 pt-4 pb-12 space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all duration-300 ${toast.type === "success"
            ? "bg-green-600 text-white"
            : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-800"
            }`}>
            <span className="material-symbols-outlined text-base">
              {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
            </span>
            {toast.msg}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Guardian</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-900">{displayName}</span>?
                All associated data and mappings will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Guardian"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={() => navigate("/school-admin/parents")}
            className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
          </button>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-md hover:bg-red-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#eff4ff] text-[#0058be] text-sm font-bold rounded-md hover:bg-[#dce9ff] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span> Edit Profile
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditing(false); fetchParent(); }}
                  className="px-4 py-2 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-70"
                >
                  {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Identity Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className={`${isEditing ? "flex-col" : "flex items-center justify-between md:gap-4"}`}>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#e5eeff] text-[#0058be] flex items-center justify-center font-bold text-xl border border-blue-100">
                {initials}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={formData.first_name}
                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="First Name"
                        className={editFieldClass}
                      />
                      <input
                        value={formData.last_name}
                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Last Name"
                        className={editFieldClass}
                      />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email Address"
                      className={`${editFieldClass} font-mono text-xs`}
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                    <p className="text-xs text-gray-400 font-mono mt-1">{emailAddr}</p>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {isEditing ? (
                <div className="flex gap-2 mt-2 ml-[84px]">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, is_archived: false }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${!formData.is_archived ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, is_archived: true }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${formData.is_archived ? "bg-gray-100 text-gray-600 border-gray-300" : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">inventory_2</span> Archived
                  </button>
                </div>
              ) : (
                isArchived
                  ? <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm">Archived</span>
                  : <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Active
                  </span>
              )}
            </div>
          </div>
        </div>

        {/* Guardian Profile */}
        <SectionCard title="Guardian Profile" icon="assignment_ind">
          <Field label="Phone Number" viewValue={parent.phone_number} isEditing={isEditing}>
            <input
              value={formData.phone_number}
              onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
              className={editFieldClass}
              placeholder="+91 98765 43210"
            />
          </Field>

          <Field label="Occupation" viewValue={parent.occupation} isEditing={isEditing}>
            <input
              value={formData.occupation}
              onChange={e => setFormData({ ...formData, occupation: e.target.value })}
              className={editFieldClass}
              placeholder="e.g. Software Engineer"
            />
          </Field>

          <Field label="Emergency Contact" viewValue={parent.emergency_contact_number} isEditing={isEditing}>
            <input
              value={formData.emergency_contact_number}
              onChange={e => setFormData({ ...formData, emergency_contact_number: e.target.value })}
              className={editFieldClass}
              placeholder="+91 98765 43210"
            />
          </Field>
        </SectionCard>

      </div>
    </SchoolLayout>
  );
}