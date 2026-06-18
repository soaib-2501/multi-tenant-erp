import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import api from "../../services/axiosClient";

const labelClass = "text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block";
const viewFieldClass = "text-sm font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100";
const editFieldClass = "w-full text-sm font-bold text-slate-800 bg-white border border-[#6b38d4]/30 focus:ring-2 focus:ring-[#6b38d4]/10 outline-none px-4 py-2 rounded-md";

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="w-1 h-5 bg-[#6b38d4] rounded-full"></span>
        <span className="material-symbols-outlined text-[18px] text-gray-400">{icon}</span>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function Field({ label, viewValue, isEditing, children, colSpan = false }) {
  return (
    <div className={colSpan ? "md:col-span-2" : ""}>
      <p className={labelClass}>{label}</p>
      {isEditing ? children : <p className={viewFieldClass}>{viewValue || "N/A"}</p>}
    </div>
  );
}

export default function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "",
    employee_id: "", qualification: "",
    joining_date: "", phone_number: "",
    is_archived: false,
  });

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const data = await schoolAdminApi.getTeacherById(id);

      // user field is a UUID string — fetch it separately to get is_active
      const userId = typeof data.user === "object" ? data.user?.id : data.user;
      setUserId(userId);
      let isArchived = !!data.is_archived;
      if (userId) {
        try {
          const userRes = await api.get(`users/${userId}/`);
          isArchived = userRes.data.is_active === false;
        } catch (_) { /* fallback to profile value */ }
      }

      setTeacher(data);
      setFormData({
        first_name:    data.first_name    || "",
        last_name:     data.last_name     || "",
        email:         data.email         || "",
        employee_id:   data.employee_id   || "",
        qualification: data.qualification || "",
        joining_date:  data.joining_date  || "",
        phone_number:  data.phone_number  || "",
        is_archived:   isArchived,
      });
    } catch (err) {
      setError("Failed to load faculty details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeacher(); }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. PATCH teacher profile fields (is_archived not in serializer — skip it)
      await schoolAdminApi.updateTeacher(id, {
        first_name:    formData.first_name,
        last_name:     formData.last_name,
        email:         formData.email,
        employee_id:   formData.employee_id,
        qualification: formData.qualification || null,
        phone_number:  formData.phone_number  || null,
        joining_date:  formData.joining_date  || null,
      });

      // 2. PATCH user is_active directly — this is where Django stores active/archived status
      if (userId) {
        await api.patch(`users/${userId}/`, {
          is_active: !formData.is_archived,
        });
      }

      await fetchTeacher();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update:", err);
      if (err.response?.data) {
        alert("Failed to save: " + JSON.stringify(err.response.data));
      } else {
        alert("Failed to save changes. Please check your connection.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <SchoolLayout title="Teacher Details">
      <div className="flex justify-center items-center h-[50vh] text-[#6b38d4]">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
    </SchoolLayout>
  );

  if (error || !teacher) return (
    <SchoolLayout title="Teacher Details">
      <div className="p-6 text-red-500">{error || "Teacher not found."}</div>
    </SchoolLayout>
  );

  const fName = teacher.first_name || teacher.user?.first_name || "";
  const lName = teacher.last_name  || teacher.user?.last_name  || "";
  const displayName = `${fName} ${lName}`.trim() || teacher.user?.email || "Unknown";
  const emailAddr   = teacher.email || teacher.user?.email || "No Email";
  const initials    = fName && lName ? `${fName[0]}${lName[0]}`.toUpperCase() : "TR";

  return (
    <SchoolLayout title="Teacher Details">
      <div className="max-w-4xl px-4 md:px-8 py-6 space-y-6">

        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/school-admin/teachers")}
            className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Directory
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#f4ebff] text-[#6b38d4] text-sm font-bold rounded-md hover:bg-[#ead9ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setIsEditing(false); fetchTeacher(); }}
                className="px-4 py-2 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#6b38d4] text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-70"
              >
                {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Identity Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#f4ebff] text-[#6b38d4] flex items-center justify-center font-bold text-xl border border-[#e9ddff]">
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

            {/* Status badge / toggle */}
            <div className="shrink-0">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, is_archived: false }))}
                    style={!formData.is_archived
                      ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontWeight: 700 }
                      : { background: "#f9fafb", color: "#9ca3af", border: "1px solid #e5e7eb" }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: !formData.is_archived ? "#16a34a" : "#d1d5db", display: "inline-block" }}></span>
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, is_archived: true }))}
                    style={formData.is_archived
                      ? { background: "#f3f4f6", color: "#4b5563", border: "1px solid #d1d5db", fontWeight: 700 }
                      : { background: "#f9fafb", color: "#9ca3af", border: "1px solid #e5e7eb" }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                    Archived
                  </button>
                </div>
              ) : (
                (teacher.is_archived || teacher.user?.is_active === false)
                  ? <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm">Archived Profile</span>
                  : <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span> Active
                    </span>
              )}
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <SectionCard title="Professional Details" icon="school">
          <Field label="Employee ID" viewValue={teacher.employee_id} isEditing={isEditing}>
            <input value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} className={editFieldClass} placeholder="e.g. EMP-2024" />
          </Field>
          <Field label="Email Address" viewValue={emailAddr} isEditing={isEditing}>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={editFieldClass} placeholder="email@example.com" />
          </Field>
          <Field label="Qualification" viewValue={teacher.qualification || "Unspecified"} isEditing={isEditing}>
            <input value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} className={editFieldClass} placeholder="e.g. PhD, M.Sc" />
          </Field>
          <Field label="Joining Date" viewValue={teacher.joining_date} isEditing={isEditing}>
            <input type="date" value={formData.joining_date} onChange={e => setFormData({ ...formData, joining_date: e.target.value })} className={editFieldClass} />
          </Field>
          <Field label="Phone Number" viewValue={teacher.phone_number} isEditing={isEditing}>
            <input value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} className={editFieldClass} placeholder="+91 98765 43210" />
          </Field>
        </SectionCard>

      </div>
    </SchoolLayout>
  );
}