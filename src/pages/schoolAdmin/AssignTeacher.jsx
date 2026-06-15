import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosClient";

export default function AssignTeacher() {
  const navigate = useNavigate();

  // Dropdown Data
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Form State
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetching all required foreign keys using Axios
        const [teacherRes, yearRes, classRes, sectionRes, subjectRes] = await Promise.all([
          api.get(`profiles/teachers/`),
          api.get(`academics/academic-years/`),
          api.get(`academics/class-levels/`),
          api.get(`academics/sections/`),
          api.get(`academics/subjects/`),
        ]);

        setTeachers(teacherRes.data.results || teacherRes.data || []);
        setAcademicYears(yearRes.data.results || yearRes.data || []);
        setClassLevels(classRes.data.results || classRes.data || []);
        setSections(sectionRes.data.results || sectionRes.data || []);
        setSubjects(subjectRes.data.results || subjectRes.data || []);
      } catch (err) {
        console.error("Error fetching FK dropdowns:", err);
        setError("Failed to load dropdown data from the server.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        is_class_teacher: isClassTeacher,
        teacher: selectedTeacher,
        academic_year: selectedYear,
        class_level: selectedClass,
        section: selectedSection,
        subject: selectedSubject
      };

      await api.post(`academics/teacher-assignments/`, payload);

      alert("Teacher assigned successfully!");
      navigate("/school-admin/teacher-assignment");

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        setError(Object.entries(data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`).join(" | "));
      } else {
        setError(err.message || "Failed to assign teacher.");
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTeacher(""); setSelectedYear(""); setSelectedClass(""); 
    setSelectedSection(""); setSelectedSubject(""); setIsClassTeacher(false);
    setError(null);
  };

  return (
    <SchoolLayout title="Teacher Assignment">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-slate-800 tracking-tight">Assign Teacher to Class</h1>
            <p className="text-[#6b7280] text-sm max-w-xl">Allocate faculty members to specific subjects, grade levels, and sections.</p>
          </div>
          <button onClick={() => navigate("/school-admin/teacher-assignment")} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-[#0058be] text-sm rounded font-semibold hover:bg-gray-50 shadow-sm transition-all">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Directory
          </button>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-700 rounded border border-red-200 flex gap-2 shadow-sm items-center"><span className="material-symbols-outlined text-[20px]">error</span><p className="text-sm font-medium">{error}</p></div>}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-5 text-slate-800 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-[#0058be] text-[20px]">engineering</span> Configuration Matrix
          </h2>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Select Educator</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">person_search</span>
                <select required value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#f8f9ff] rounded outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent font-medium text-slate-700 appearance-none">
                  <option value="">Select Teacher Profile...</option>
                  {initialLoading ? <option disabled>Loading data...</option> : teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.first_name || t.last_name ? `${t.first_name} ${t.last_name}` : t.email} {t.employee_id ? `(EMP: ${t.employee_id})` : ''}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Academic Year</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">calendar_month</span>
                  <select required value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#f8f9ff] rounded outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent font-medium text-slate-700 appearance-none">
                    <option value="">Select Academic Cycle...</option>
                    {initialLoading ? <option disabled>Loading...</option> : academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Subject Selection</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">menu_book</span>
                  <select required value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#f8f9ff] rounded outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent font-medium text-slate-700 appearance-none">
                    <option value="">Choose Subject/Course...</option>
                    {initialLoading ? <option disabled>Loading...</option> : subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Class Level</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">school</span>
                  <select required value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#f8f9ff] rounded outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent font-medium text-slate-700 appearance-none">
                    <option value="">Select Grade/Class...</option>
                    {initialLoading ? <option disabled>Loading...</option> : classLevels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-1.5">Section / Batch</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">groups</span>
                  <select required value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full pl-9 pr-8 py-2.5 text-sm bg-[#f8f9ff] rounded outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent font-medium text-slate-700 appearance-none">
                    <option value="">Select Section...</option>
                    {initialLoading ? <option disabled>Loading...</option> : sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <label className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded cursor-pointer hover:bg-orange-100/50 transition-colors">
                <div>
                  <span className="font-bold text-sm text-[#924700]">Assign as Class Teacher</span>
                  <p className="text-[11px] text-orange-800/80 mt-0.5">Designate this teacher as the primary academic advisor.</p>
                </div>
                <input type="checkbox" checked={isClassTeacher} onChange={() => setIsClassTeacher(!isClassTeacher)} className="w-4 h-4 rounded text-[#924700] focus:ring-[#924700]" />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={resetForm} disabled={loading} className="px-5 py-2 text-sm text-[#6b7280] font-semibold hover:bg-gray-50 rounded">Clear Form</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white text-sm font-bold rounded shadow-md flex items-center gap-1.5">
                {loading ? "Processing..." : "Confirm Assignment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SchoolLayout>
  );
}