import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import api from "../../services/axiosClient";

const inputClass = "w-full p-2.5 bg-surface-container-low border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline text-sm";
const labelClass = "block text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-wider mb-1.5";

function FormField({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function SectionCard({ title, color = "bg-primary", icon, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-2">
        <span className={`w-1 h-5 ${color} rounded-full`}></span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{icon}</span>
        <h2 className="text-sm font-headline font-bold text-on-surface">{title}</h2>
      </div>
      <div className="p-5 grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function EditStudent() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation(); // ← needed to pass refresh state back

  const [formData, setFormData] = useState({
    first_name:        "",
    last_name:         "",
    email:             "",
    enrollment_number: "",
    phone_number:      "",
    date_of_birth:     "",
    blood_group:       "",
    address:           "",
    is_archived:       false,
  });

  const [enrollmentId,    setEnrollmentId]    = useState(null);
  const [selectedYear,    setSelectedYear]    = useState("");
  const [selectedClass,   setSelectedClass]   = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels,   setClassLevels]   = useState([]);
  const [sections,      setSections]      = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [studentData, enrollmentRes, yearsRes, classRes] = await Promise.all([
          schoolAdminApi.getStudentById(id),
          api.get(`academics/enrollments/?student=${id}`),
          api.get(`academics/academic-years/`),
          api.get(`academics/class-levels/`),
        ]);

        setFormData({
          first_name:        studentData.first_name        || "",
          last_name:         studentData.last_name         || "",
          email:             studentData.email             || "",
          enrollment_number: studentData.enrollment_number || "",
          phone_number:      studentData.phone_number      || "",
          date_of_birth:     studentData.date_of_birth     || "",
          blood_group:       studentData.blood_group       || "",
          address:           studentData.address           || "",
          is_archived:       !!studentData.is_archived,
        });

        setAcademicYears(yearsRes.data?.results || yearsRes.data || []);
        setClassLevels(classRes.data?.results   || classRes.data || []);

        const results = enrollmentRes.data?.results || enrollmentRes.data || [];
        if (results.length > 0) {
          const enr = results[0];
          setEnrollmentId(enr.id);
          setSelectedYear(enr.academic_year  || "");
          setSelectedClass(enr.class_level   || "");
          setSelectedSection(enr.section     || "");
        }

      } catch (err) {
        console.error("Load error:", err);
        setError("Failed to load student data.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [id]);

  // Reload sections whenever class changes
  useEffect(() => {
    if (!selectedClass) { setSections([]); return; }
    api.get(`academics/sections/?class_level=${selectedClass}`)
      .then(res => setSections(res.data?.results || res.data || []))
      .catch(() => setSections([]));
  }, [selectedClass]);

  const set = (field) => (e) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 1. PATCH profile — serializer's update() writes user fields too
      await schoolAdminApi.updateStudent(id, {
        first_name:        formData.first_name,
        last_name:         formData.last_name,
        email:             formData.email,
        enrollment_number: formData.enrollment_number,
        phone_number:      formData.phone_number,
        date_of_birth:     formData.date_of_birth || null,
        blood_group:       formData.blood_group   || null,
        address:           formData.address       || null,
        is_archived:       formData.is_archived,
      });

      // 2. PATCH or POST enrollment
      if (selectedClass && selectedYear) {
        const enrollmentPayload = {
          student:       id,
          academic_year: selectedYear,
          class_level:   selectedClass,
          section:       selectedSection || null,
        };
        if (enrollmentId) {
          await api.patch(`academics/enrollments/${enrollmentId}/`, enrollmentPayload);
        } else {
          await api.post(`academics/enrollments/`, enrollmentPayload);
        }
      }

      // 3. Navigate back to detail page with refresh signal
      navigate(`/school-admin/students/${id}`, { state: { refresh: Date.now() } });

    } catch (err) {
      console.error("Save error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setError(
          Object.entries(data)
            .map(([f, msgs]) => `${f}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
            .join(" | ")
        );
      } else {
        setError("Failed to save changes. Check console.");
      }
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SchoolLayout title="Edit Student">
        <div className="flex justify-center items-center min-h-[50vh] text-primary">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Edit Student">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface">Edit Student Profile</h1>
            <p className="text-sm text-on-surface-variant mt-1 font-body">
              All changes are saved immediately to the student record.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/20 text-primary font-semibold rounded-md font-body transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
          </button>
        </div>

        {error && (
          <div className="p-3 bg-error/10 text-error rounded-md border border-error/20 text-sm flex gap-2 font-body">
            <span className="material-symbols-outlined text-[20px]">error</span>{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Core Identity */}
          <SectionCard title="Core Identity" color="bg-primary" icon="badge">
            <FormField label="First Name">
              <input value={formData.first_name} onChange={set("first_name")} className={inputClass} placeholder="First Name" />
            </FormField>
            <FormField label="Last Name">
              <input value={formData.last_name} onChange={set("last_name")} className={inputClass} placeholder="Last Name" />
            </FormField>
            <FormField label="Email Address">
              <input
                type="email"
                value={formData.email}
                onChange={set("email")}
                className={inputClass}
                placeholder="email@example.com"
              />
              <p className="text-[10px] text-outline mt-1 font-body">Changing email updates the login credential.</p>
            </FormField>
            <FormField label="Status">
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, is_archived: false }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors font-body ${
                    !formData.is_archived
                      ? "bg-success/20 text-success border-success/30"
                      : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-success"></span> Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, is_archived: true }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors font-body ${
                    formData.is_archived
                      ? "bg-outline/10 text-outline border-outline/30"
                      : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">inventory_2</span> Archived
                </button>
              </div>
            </FormField>
          </SectionCard>

          {/* Academic Profile */}
          <SectionCard title="Academic Profile" color="bg-secondary" icon="assignment_ind">
            <FormField label="Enrollment Number">
              <input value={formData.enrollment_number} onChange={set("enrollment_number")} className={inputClass} placeholder="e.g. STU-2024-001" />
            </FormField>
            <FormField label="Phone Number">
              <input value={formData.phone_number} onChange={set("phone_number")} className={inputClass} placeholder="+91 98765 43210" />
            </FormField>
            <FormField label="Date of Birth">
              <input type="date" value={formData.date_of_birth} onChange={set("date_of_birth")} className={inputClass} />
            </FormField>
            <FormField label="Blood Group">
              <select value={formData.blood_group} onChange={set("blood_group")} className={inputClass}>
                <option value="">Select Group</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Residential Address">
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={set("address")}
                  className={`${inputClass} resize-none`}
                  placeholder="Street, City, State"
                />
              </FormField>
            </div>
          </SectionCard>

          {/* Class Enrollment */}
          <SectionCard title="Class Enrollment" color="bg-tertiary" icon="school">
            <FormField label="Academic Year">
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className={inputClass}>
                <option value="">Select Year</option>
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Class Level">
              <select
                value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }}
                className={inputClass}
              >
                <option value="">Select Class</option>
                {classLevels.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Section">
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className={inputClass}
                disabled={!selectedClass}
              >
                <option value="">
                  {selectedClass ? (sections.length ? "Select Section" : "No sections") : "Pick class first"}
                </option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </FormField>
          </SectionCard>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-sm text-on-surface-variant font-semibold hover:bg-surface-container-high rounded-md transition-colors disabled:opacity-50 font-body"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-md shadow hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-70 font-body"
            >
              {saving ? (
                <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Saving...</>
              ) : (
                <><span className="material-symbols-outlined text-[16px]">save</span> Save Changes</>
              )}
            </button>
          </div>

        </form>
      </div>
    </SchoolLayout>
  );
}