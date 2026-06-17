import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import { useTheme } from "../../context/ThemeContext";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    enrollment_number: "",
    phone_number: "",
    is_archived: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getStudentById(id);

        setFormData({
          first_name: data.first_name || data.user?.first_name || "",
          last_name: data.last_name || data.user?.last_name || "",
          email: data.email || data.user?.email || "",
          enrollment_number: data.enrollment_number || "",
          phone_number: data.phone_number || "",
          is_archived: !!data.is_archived,
        });
      } catch (err) {
        console.error("Error loading student:", err);
        setError("Failed to load student profile.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        enrollment_number: formData.enrollment_number,
        phone_number: formData.phone_number,
        is_archived: formData.is_archived,
      };

      await schoolAdminApi.updateStudent(id, payload);
      navigate("/school-admin/students");
    } catch (err) {
      console.error("Error updating student:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to update student profile. Check console for details."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SchoolLayout title="Edit Student">
        <div className="p-8 flex justify-center items-center h-64 text-primary">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Edit Student">
      <form 
        onSubmit={handleSubmit} 
        className="p-4 md:p-8 max-w-2xl mx-auto bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 mt-8"
      >
        <h1 className="text-2xl font-headline font-bold text-on-surface mb-1">Edit Profile</h1>
        <p className="text-sm text-on-surface-variant mb-6 font-body">
          Update the details below. Changes are saved to the student's profile record.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error rounded-md border border-error/20 flex items-center gap-2 text-sm font-body">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-2xs font-headline font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              First Name
            </label>
            <input
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full p-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline"
              placeholder="First Name"
            />
          </div>

          <div>
            <label className="block text-2xs font-headline font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Last Name
            </label>
            <input
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full p-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline"
              placeholder="Last Name"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-2xs font-headline font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Enrollment Number
            </label>
            <input
              value={formData.enrollment_number}
              onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
              className="w-full p-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline"
              placeholder="e.g. STU-2024-001"
            />
          </div>

          <div>
            <label className="block text-2xs font-headline font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full p-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-2xs font-headline font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            value={formData.email}
            disabled
            className="w-full p-2.5 border border-outline-variant/10 rounded-lg bg-surface-container-low/50 text-on-surface/60 outline-none cursor-not-allowed font-body"
          />
          <p className="text-xs text-outline mt-1 font-body">
            Email is the account login ID and can't be changed from this form.
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-2xs font-headline font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Status
          </label>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_archived: false })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors font-body
                ${!formData.is_archived
                  ? "bg-success/20 text-success border-success/30"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Active
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_archived: true })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors font-body
                ${formData.is_archived
                  ? "bg-outline/10 text-outline border-outline/30"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high"
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              Archived
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center gap-2 font-body"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => navigate(-1)}
            className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60 font-body"
          >
            Cancel
          </button>
        </div>
      </form>
    </SchoolLayout>
  );
}