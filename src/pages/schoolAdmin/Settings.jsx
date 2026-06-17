import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../services/axiosClient";

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    schoolName: "",
    email: "",
    phone: "",
    country: "India",
    address: "",
    grading: "4.0 GPA",
    attendance: true,
    academicYear: "",
  });
  const [originalForm, setOriginalForm] = useState(null);
  const [toast, setToast] = useState(null);

  const dk = darkMode;

  // Force a full re-render when darkMode changes
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [darkMode]);

  // Fetch current settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/school-admin/settings/");
        const data = response.data;
        const newForm = {
          schoolName: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          country: data.country || "India",
          address: data.address || "",
          grading: data.grading_scale || "4.0 GPA",
          attendance: data.attendance_tracking_enabled ?? true,
          academicYear: data.default_academic_year || "",
        };
        setForm(newForm);
        setOriginalForm(newForm);
      } catch (error) {
        console.error("Failed to load settings:", error);
        showToast("Could not load school configuration.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleAttendance = () => setForm({ ...form, attendance: !form.attendance });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const discard = () => {
    if (originalForm) {
      setForm({ ...originalForm });
      showToast("Changes discarded", "info");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: form.schoolName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        address: form.address,
        grading_scale: form.grading,
        attendance_tracking_enabled: form.attendance,
        default_academic_year: form.academicYear,
      };
      const response = await apiClient.put("/school-admin/settings/", payload);
      const updatedData = response.data;
      const updatedForm = {
        schoolName: updatedData.name || "",
        email: updatedData.email || "",
        phone: updatedData.phone || "",
        country: updatedData.country || "India",
        address: updatedData.address || "",
        grading: updatedData.grading_scale || "4.0 GPA",
        attendance: updatedData.attendance_tracking_enabled ?? true,
        academicYear: updatedData.default_academic_year || "",
      };
      setForm(updatedForm);
      setOriginalForm(updatedForm);
      showToast("Configuration updated successfully!", "success");
    } catch (error) {
      console.error("Save error:", error);
      showToast("Failed to save settings. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <SchoolLayout title="School Configuration" key={`layout-${renderKey}`}>
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="School Configuration" key={`layout-${renderKey}`}>
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500" key={`content-${darkMode}`}>

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl font-bold text-sm flex items-center gap-3 transition-all
            ${toast.type === "success" ? "bg-success text-white" : toast.type === "error" ? "bg-error text-white" : "bg-surface-container-high text-on-surface"}`}>
            <span className="material-symbols-outlined text-base">
              {toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info"}
            </span>
            {toast.msg}
          </div>
        )}

        <div className="mb-10">
          <h1 className={`text-3xl font-headline font-black mb-2 ${dk ? "text-on-surface" : "text-on-surface"}`}>
            School Configuration
          </h1>
          <p className={dk ? "text-on-surface-variant" : "text-on-surface-variant"}>
            Manage your institution's identity and academic parameters.
          </p>
        </div>

        <form onSubmit={save} className="space-y-14" key={`form-${renderKey}`}>

          {/* SCHOOL PROFILE */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <h3 className={`text-xl font-headline font-bold mb-2 ${dk ? "text-on-surface" : "text-on-surface"}`}>
                School Profile
              </h3>
              <p className={`text-sm leading-relaxed ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                Public identity details for your reports and communication.
              </p>
            </div>
            <div className={`lg:col-span-2 p-8 rounded-xl shadow-sm border ${dk ? "bg-surface-container-lowest border-outline-variant/20" : "bg-surface-container-lowest border-outline-variant/10"}`}>
              <div className="flex gap-8 items-start mb-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-xl bg-surface-container-high/50 flex items-center justify-center border-2 border-dashed border-primary/30">
                    <span className="material-symbols-outlined text-4xl text-primary/50">school</span>
                  </div>
                  <button type="button" className="absolute -bottom-2 -right-2 w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
                <div>
                  <p className={`font-headline font-bold ${dk ? "text-on-surface" : "text-on-surface"}`}>Institution Logo</p>
                  <p className={`text-sm mb-4 ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>Recommended: 400x400px. PNG/SVG.</p>
                  <button type="button" className="px-5 py-2 bg-primary/10 text-primary font-bold text-sm rounded-md hover:bg-primary/20 transition-colors">
                    Upload New Logo
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { key: "schoolName", label: "School Name" },
                  { key: "email", label: "Email" },
                  { key: "phone", label: "Phone" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={`text-2xs font-headline font-black tracking-widest uppercase mb-2 block ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                      {label}
                    </label>
                    <input
                      name={key}
                      value={form[key]}
                      onChange={change}
                      className={`w-full border px-4 py-3 rounded-lg outline-none focus:border-primary transition-all font-body
                        ${dk ? "bg-surface-container-low border-outline-variant/20 text-on-surface placeholder:text-outline" : "bg-surface-container-low border-outline-variant/10 text-on-surface placeholder:text-outline"}`}
                    />
                  </div>
                ))}
                <div>
                  <label className={`text-2xs font-headline font-black tracking-widest uppercase mb-2 block ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                    Country
                  </label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={change}
                    className={`w-full border px-4 py-3 rounded-lg outline-none cursor-pointer font-body
                      ${dk ? "bg-surface-container-low border-outline-variant/20 text-on-surface" : "bg-surface-container-low border-outline-variant/10 text-on-surface"}`}
                  >
                    <option>India</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={`text-2xs font-headline font-black tracking-widest uppercase mb-2 block ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                    Street Address
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={change}
                    className={`w-full border px-4 py-3 rounded-lg outline-none focus:border-primary transition-all font-body
                      ${dk ? "bg-surface-container-low border-outline-variant/20 text-on-surface placeholder:text-outline" : "bg-surface-container-low border-outline-variant/10 text-on-surface placeholder:text-outline"}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* APPEARANCE – Dark Mode only, no language toggle */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <h3 className={`text-xl font-headline font-bold mb-2 ${dk ? "text-on-surface" : "text-on-surface"}`}>
                Appearance
              </h3>
              <p className={`text-sm leading-relaxed ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                Customize the look of your portal.
              </p>
            </div>
            <div className={`lg:col-span-2 p-8 rounded-xl shadow-sm border space-y-8 ${dk ? "bg-surface-container-lowest border-outline-variant/20" : "bg-surface-container-lowest border-outline-variant/10"}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`font-headline font-bold ${dk ? "text-on-surface" : "text-on-surface"}`}>Dark Mode</p>
                  <p className={`text-xs ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                    Switch between light and dark interface.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${dk ? "bg-primary" : "bg-surface-container-high"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${dk ? "translate-x-7" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ACADEMIC PREFERENCES */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <h3 className={`text-xl font-headline font-bold mb-2 ${dk ? "text-on-surface" : "text-on-surface"}`}>
                Academic Preferences
              </h3>
              <p className={`text-sm ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                Define operational logic for grading and reporting cycles.
              </p>
            </div>
            <div className={`lg:col-span-2 p-8 rounded-xl shadow-sm border space-y-8 ${dk ? "bg-surface-container-lowest border-outline-variant/20" : "bg-surface-container-lowest border-outline-variant/10"}`}>
              <div className="flex justify-between items-center pb-6 border-b last:border-0 last:pb-0">
                <div>
                  <p className={`font-headline font-bold ${dk ? "text-on-surface" : "text-on-surface"}`}>Grading Scale System</p>
                  <p className={`text-xs ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                    Choose how performance is evaluated.
                  </p>
                </div>
                <select
                  name="grading"
                  value={form.grading}
                  onChange={change}
                  className={`border px-4 py-2 rounded-lg text-sm font-bold font-body
                    ${dk ? "bg-surface-container-low border-outline-variant/20 text-on-surface" : "bg-surface-container-low border-outline-variant/10 text-on-surface"}`}
                >
                  <option>4.0 GPA Scale</option>
                  <option>Percentage (0-100)</option>
                </select>
              </div>
              <div className="flex justify-between items-center pb-6 border-b last:border-0 last:pb-0">
                <div>
                  <p className={`font-headline font-bold ${dk ? "text-on-surface" : "text-on-surface"}`}>Attendance Tracking</p>
                  <p className={`text-xs ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                    Automated alerts for absences.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleAttendance}
                  className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${form.attendance ? "bg-primary" : "bg-surface-container-high"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${form.attendance ? "translate-x-7" : "translate-x-0"}`}
                  />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`font-headline font-bold ${dk ? "text-on-surface" : "text-on-surface"}`}>Default Academic Year</p>
                  <p className={`text-xs ${dk ? "text-on-surface-variant" : "text-on-surface-variant"}`}>
                    Active period for registrations.
                  </p>
                </div>
                <select
                  name="academicYear"
                  value={form.academicYear}
                  onChange={change}
                  className={`border px-4 py-2 rounded-lg text-sm font-bold font-body
                    ${dk ? "bg-surface-container-low border-outline-variant/20 text-on-surface" : "bg-surface-container-low border-outline-variant/10 text-on-surface"}`}
                >
                  <option>2023-2024</option>
                  <option>2024-2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-end gap-4 pt-8 border-t ${dk ? "border-outline-variant/20" : "border-outline-variant/10"}`}>
            <button
              type="button"
              onClick={discard}
              className={`px-6 py-3 font-headline font-bold text-sm rounded-lg border transition-all
                ${dk ? "border-outline-variant/20 text-on-surface hover:bg-surface-container-high" : "border-outline-variant/10 text-on-surface hover:bg-surface-container-high"}`}
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-primary text-white font-headline font-bold text-sm rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}