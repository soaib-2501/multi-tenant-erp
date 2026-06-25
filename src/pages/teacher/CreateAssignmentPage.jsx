import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { getMyTeacherAssignments, getMyProfile, createAssignment } from "../../services/api";

export default function CreateAssignmentPage() {
  const navigate = useNavigate();

  // Context Data
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // UI State
  const [loadingContext, setLoadingContext] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeacherContext();
  }, []);

  const fetchTeacherContext = async () => {
    setLoadingContext(true);
    try {
      // Get teacher profile ID
      const profile = await getMyProfile();
      if (profile.profiles?.teacher?.id) {
        setTeacherId(profile.profiles.teacher.id);
      } else {
        throw new Error("Teacher profile not found.");
      }

      // Get teacher assignments for sections and subjects
      const data = await getMyTeacherAssignments();
      const assignments = data.results || data || [];
      
      // Extract unique sections and subjects from teacher assignments
      const uniqueSections = [];
      const uniqueSubjects = [];
      const sectionIds = new Set();
      const subjectIds = new Set();

      assignments.forEach(assignment => {
        if (assignment.section && !sectionIds.has(assignment.section.id)) {
          sectionIds.add(assignment.section.id);
          uniqueSections.push({
            id: assignment.section.id,
            name: assignment.section.name,
            class_level: assignment.class_level?.name || ""
          });
        }
        
        if (assignment.subject && !subjectIds.has(assignment.subject.id)) {
          subjectIds.add(assignment.subject.id);
          uniqueSubjects.push({
            id: assignment.subject.id,
            name: assignment.subject.name
          });
        }
      });

      setSections(uniqueSections);
      setSubjects(uniqueSubjects);
    } catch (err) {
      console.error("Fetch Context Error:", err);
      setError("Failed to load teacher assignments.");
    } finally {
      setLoadingContext(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!selectedSection || !selectedSubject) {
      setError("Please select both a section and a subject.");
      window.scrollTo(0, 0);
      return;
    }

    if (!teacherId) {
      setError("Teacher profile not found. Please try refreshing the page.");
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        due_date: dueDate,
        section: selectedSection,
        subject: selectedSubject,
        teacher: teacherId
      };

      await createAssignment(payload);
      alert("Assignment created successfully!");
      navigate("/teacher/assignments");
    } catch (err) {
      console.error(err);
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout title="Teacher Portal">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            to="/teacher/assignments"
            className="flex items-center gap-2 text-[#0058be] font-semibold text-sm mb-4 hover:-translate-x-1 transition-transform w-max"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Assignments
          </Link>
          <h2 className="text-3xl font-bold font-display text-slate-800 tracking-tight">Create Assignment</h2>
          <p className="text-gray-500 text-sm mt-1">Assign homework or tasks to your students.</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => navigate("/teacher/assignments")}
            className="px-5 py-2.5 bg-white border border-gray-200 text-slate-700 font-semibold rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={submitting}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-bold rounded-md text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-lg">save</span>
            )}
            Create Assignment
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
           <span className="material-symbols-outlined">error</span>
           <div>
             <p className="font-bold text-sm">Creation Failed</p>
             <p className="text-sm mt-1">{error}</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8 mb-16">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-display font-bold mb-6 flex items-center text-slate-800">
              <span className="material-symbols-outlined mr-2 text-[#0058be]">assignment</span>
              Assignment Details
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Assignment Title *</label>
                <input 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-transparent rounded-md p-3.5 text-sm focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none" 
                  placeholder="e.g., Chapter 5 Homework - Algebra" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description *</label>
                <textarea 
                  required
                  rows="4"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-transparent rounded-md p-3.5 text-sm focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none resize-none" 
                  placeholder="Describe the assignment, requirements, and any special instructions..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Section *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">group</span>
                    <select 
                      required
                      value={selectedSection}
                      onChange={e => setSelectedSection(e.target.value)}
                      className="w-full bg-[#f8f9ff] border border-transparent rounded-md py-3.5 pl-10 pr-4 text-sm font-medium focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 outline-none transition-all appearance-none text-slate-700"
                    >
                      <option value="">Select Section...</option>
                      {loadingContext ? (
                        <option disabled>Loading...</option>
                      ) : (
                        sections.map(section => (
                          <option key={section.id} value={section.id}>
                            {section.class_level} - {section.name}
                          </option>
                        ))
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Subject *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">menu_book</span>
                    <select 
                      required
                      value={selectedSubject}
                      onChange={e => setSelectedSubject(e.target.value)}
                      className="w-full bg-[#f8f9ff] border border-transparent rounded-md py-3.5 pl-10 pr-4 text-sm font-medium focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 outline-none transition-all appearance-none text-slate-700"
                    >
                      <option value="">Select Subject...</option>
                      {loadingContext ? (
                        <option disabled>Loading...</option>
                      ) : (
                        subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))
                      )}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Due Date *</label>
                <input 
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-transparent rounded-md p-3.5 text-sm font-medium focus:border-[#0058be]/40 focus:ring-2 focus:ring-[#0058be]/10 transition-all outline-none text-slate-700" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-[#0b1c30] to-[#1e3450] p-8 rounded-xl text-white shadow-lg relative overflow-hidden">
             <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5">assignment</span>
             <h4 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-2 text-blue-200">
               <span className="material-symbols-outlined">info</span>
               About Assignments
             </h4>
             <p className="text-sm text-slate-300 leading-relaxed relative z-10 mb-6">
               Assignments are tasks given to students in a specific section. Students submit their work, and you can grade each submission individually.
             </p>
             <div className="relative z-10 bg-white/10 p-4 rounded-lg">
               <p className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-2">Quick Tips</p>
               <ul className="text-sm text-slate-300 space-y-2">
                 <li className="flex items-start gap-2">
                   <span className="material-symbols-outlined text-blue-300 text-base mt-0.5">check_circle</span>
                   <span>Be clear about requirements</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="material-symbols-outlined text-blue-300 text-base mt-0.5">check_circle</span>
                   <span>Set realistic due dates</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="material-symbols-outlined text-blue-300 text-base mt-0.5">check_circle</span>
                   <span>Students will submit their work online</span>
                 </li>
               </ul>
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
