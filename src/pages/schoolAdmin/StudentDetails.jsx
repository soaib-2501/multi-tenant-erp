import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import api from "../../services/axiosClient";

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

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "",
    enrollment_number: "", date_of_birth: "",
    phone_number: "", blood_group: "", address: "",
    is_archived: false,
  });

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [studentData, enrollmentRes, yearsRes, classRes] = await Promise.all([
        schoolAdminApi.getStudentById(id),
        api.get(`academics/enrollments/?student=${id}`),
        schoolAdminApi.getAcademicYears(),
        schoolAdminApi.getClassLevels(),
      ]);

      setStudent(studentData);
      setFormData({
        first_name: studentData.first_name || "",
        last_name: studentData.last_name || "",
        email: studentData.email || studentData.user?.email || "",
        enrollment_number: studentData.enrollment_number || "",
        date_of_birth: studentData.date_of_birth || "",
        phone_number: studentData.phone_number || "",
        blood_group: studentData.blood_group || "",
        address: studentData.address || "",
        is_archived: !!studentData.is_archived,
      });

      const years = yearsRes?.results ?? yearsRes ?? [];
      const classes = classRes?.results ?? classRes ?? [];
      setAcademicYears(Array.isArray(years) ? years : []);
      setClassLevels(Array.isArray(classes) ? classes : []);

      const results = enrollmentRes.data?.results || enrollmentRes.data || [];
      if (results.length > 0) {
        const enr = results[0];
        setEnrollment(enr);
        setEnrollmentId(enr.id);
        setSelectedYear(String(enr.academic_year || ""));
        setSelectedClass(String(enr.class_level || ""));
        setSelectedSection(String(enr.section || ""));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load student details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id, location.state?.refresh]);

  // Reload sections when class changes in edit mode
  useEffect(() => {
    if (!selectedClass) { setSections([]); return; }
    api.get(`academics/sections/?class_level=${selectedClass}`)
      .then(res => setSections(res.data?.results || res.data || []))
      .catch(() => setSections([]));
  }, [selectedClass]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. PATCH student profile (serializer writes user fields too)
      await schoolAdminApi.updateStudent(id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        enrollment_number: formData.enrollment_number,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth || null,
        blood_group: formData.blood_group || null,
        address: formData.address || null,
        is_archived: formData.is_archived,
      });

      // 2. PATCH or POST enrollment
      if (selectedClass && selectedYear) {
        const enrollmentPayload = {
          student: id,
          academic_year: selectedYear,
          class_level: selectedClass,
          section: selectedSection || null,
        };
        if (enrollmentId) {
          await api.patch(`academics/enrollments/${enrollmentId}/`, enrollmentPayload);
        } else {
          await api.post(`academics/enrollments/`, enrollmentPayload);
        }
      }

      // 3. Re-fetch to sync UI
      await fetchAll();
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        alert("Failed to save: " + Object.entries(data).map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" | "));
      } else {
        alert("Failed to save changes. Please check your connection.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <SchoolLayout title="Student Details">
      <div className="flex justify-center items-center h-[50vh] text-blue-600">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
    </SchoolLayout>
  );

  if (error || !student) return (
    <SchoolLayout title="Student Details">
      <div className="p-6 text-red-500">{error || "Student not found."}</div>
    </SchoolLayout>
  );

  const fName = student.first_name || student.user?.first_name || "";
  const lName = student.last_name || student.user?.last_name || "";
  const displayName = `${fName} ${lName}`.trim() || student.user?.email || "Unknown Student";
  const emailAddr = student.email || student.user?.email || "No Email";
  const initials = fName && lName ? `${fName[0]}${lName[0]}`.toUpperCase() : "ST";

  // Lookup display names for view mode
  const yearName = academicYears.find(y => String(y.id) === String(selectedYear))?.name || "N/A";
  const className = classLevels.find(c => String(c.id) === String(selectedClass))?.name || "N/A";
  const sectionName = sections.find(s => String(s.id) === String(selectedSection))?.name
    || (enrollment?.section_name) || (selectedSection ? `Section ${selectedSection}` : "N/A");

  return (
    <SchoolLayout title="Student Details">
      <div className="max-w-4xl px-4 md:px-8 py-6 space-y-6">

        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/school-admin/students")}
            className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Directory
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#eff4ff] text-[#0058be] text-sm font-bold rounded-md hover:bg-[#dce9ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setIsEditing(false); fetchAll(); }}
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

        {/* Identity Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-4">
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

            {/* Status badge / toggle */}
            <div className="shrink-0">
              {isEditing ? (
                <div className="flex gap-2">
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
                student.is_archived
                  ? <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm">Archived Profile</span>
                  : <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span> Active
                    </span>
              )}
            </div>
          </div>
        </div>

        {/* Academic Profile */}
        <SectionCard title="Academic Profile" icon="assignment_ind">
          <Field label="Enrollment Number" viewValue={student.enrollment_number} isEditing={isEditing}>
            <input value={formData.enrollment_number} onChange={e => setFormData({ ...formData, enrollment_number: e.target.value })} className={editFieldClass} placeholder="e.g. STU-2024-001" />
          </Field>
          <Field label="Date of Birth" viewValue={student.date_of_birth} isEditing={isEditing}>
            <input type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} className={editFieldClass} />
          </Field>
          <Field label="Phone Number" viewValue={student.phone_number} isEditing={isEditing}>
            <input value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} className={editFieldClass} placeholder="+91 98765 43210" />
          </Field>
          <Field label="Blood Group" viewValue={student.blood_group} isEditing={isEditing}>
            <select value={formData.blood_group} onChange={e => setFormData({ ...formData, blood_group: e.target.value })} className={editFieldClass}>
              <option value="">Select Group</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Residential Address" viewValue={student.address} isEditing={isEditing}>
              <textarea rows="2" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={`${editFieldClass} resize-none`} placeholder="Street, City, State" />
            </Field>
          </div>
        </SectionCard>

        {/* Class Enrollment */}
        <SectionCard title="Class Enrollment" icon="school">
          <Field label="Academic Year" viewValue={yearName} isEditing={isEditing}>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className={editFieldClass}>
              <option value="">Select Year</option>
              {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </Field>
          <Field label="Class Level" viewValue={className} isEditing={isEditing}>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className={editFieldClass}>
              <option value="">Select Class</option>
              {classLevels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Section" viewValue={sectionName} isEditing={isEditing}>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className={editFieldClass} disabled={!selectedClass}>
              <option value="">{selectedClass ? (sections.length ? "Select Section" : "No sections") : "Pick class first"}</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        </SectionCard>

      </div>
    </SchoolLayout>
  );
}