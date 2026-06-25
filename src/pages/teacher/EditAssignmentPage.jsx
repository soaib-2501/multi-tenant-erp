import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { getAssignment, updateAssignment, getMyTeacherAssignments, getMyProfile } from "../../services/api";

export default function EditAssignmentPage() {
  const { id } = useParams();
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
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeacherContext();
    fetchAssignment();
  }, [id]);

  const fetchTeacherContext = async () => {
    setLoadingContext(true);
    try {
      const profile = await getMyProfile();
      if (profile.profiles?.teacher?.id) {
        setTeacherId(profile.profiles.teacher.id);
      }

      const data = await getMyTeacherAssignments();
      const assignments = data.results || data || [];
      
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

  const fetchAssignment = async () => {
    setLoadingAssignment(true);
    try {
      const data = await getAssignment(id);
      setTitle(data.title || "");
      setDescription(data.description || "");
      
      // Convert due_date to datetime-local format
      if (data.due_date) {
        const date = new Date(data.due_date);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDueDate(localDateTime);
      }
      
      setSelectedSection(data.section || "");
      setSelectedSubject(data.subject || "");
    } catch (err) {
      console.error("Fetch Assignment Error:", err);
      setError("Failed to load assignment details.");
    } finally {
      setLoadingAssignment(false);
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

      await updateAssignment(id, payload);
      alert("Assignment updated successfully!");
      navigate(`/teacher/assignments/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAssignment) {
    return (
      <MainLayout title="Edit Assignment">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-[#0058be] dark:text-blue-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="font-semibold tracking-wide">Loading Assignment...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Teacher Portal">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 md:gap-4">
        <div>
          <Link
            to={`/teacher/assignments/${id}`}
            className="flex items-center gap-1.5 text-[#0058be] dark:text-blue-400 font-semibold text-xs md:text-sm mb-3 md:mb-4 hover:-translate-x-1 transition-transform w-max"
          >
            <span className="material-symbols-outlined text-base md:text-lg">arrow_back</span>
            Back to Assignment Details
          </Link>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-slate-800 dark:text-slate-100 tracking-tight">Edit Assignment</h2>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">Update assignment details and requirements.</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button 
            type="button"
            onClick={() => navigate(`/teacher/assignments/${id}`)}
            className="px-3 py-2 md:px-5 md:py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-md text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={submitting}
            className="px-4 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] dark:from-blue-600 dark:to-blue-500 text-white font-bold rounded-md text-xs md:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 md:gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="material-symbols-outlined animate-spin text-base md:text-lg">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base md:text-lg">save</span>
            )}
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 md:mb-8 p-3 md:p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800 flex gap-2 md:gap-3 shadow-sm">
           <span className="material-symbols-outlined text-lg md:text-xl">error</span>
           <div>
             <p className="font-bold text-xs md:text-sm">Update Failed</p>
             <p className="text-xs md:text-sm mt-1">{error}</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
        <div className="col-span-12 lg:col-span-8 space-y-6 md:space-y-8">
          <div className="bg-white dark:bg-slate-800 p-5 md:p-6 lg:p-8 rounded-lg md:rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-lg md:text-xl font-display font-bold mb-4 md:mb-6 flex items-center text-slate-800 dark:text-slate-100">
              <span className="material-symbols-outlined mr-2 text-[#0058be] dark:text-blue-400 text-xl md:text-2xl">assignment</span>
              Assignment Details
            </h3>
            
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Assignment Title *</label>
                <input 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#f8f9ff] dark:bg-slate-700/50 border border-transparent dark:border-slate-600 rounded-md p-2.5 md:p-3.5 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#0058be]/40 dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0058be]/10 dark:focus:ring-blue-400/10 transition-all outline-none" 
                  placeholder="e.g., Chapter 5 Homework - Algebra" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Description *</label>
                <textarea 
                  required
                  rows="4"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#f8f9ff] dark:bg-slate-700/50 border border-transparent dark:border-slate-600 rounded-md p-2.5 md:p-3.5 text-xs md:text-sm text-slate-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#0058be]/40 dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0058be]/10 dark:focus:ring-blue-400/10 transition-all outline-none resize-none" 
                  placeholder="Describe the assignment, requirements, and any special instructions..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Section *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-base md:text-lg">group</span>
                    <select 
                      required
                      value={selectedSection}
                      onChange={e => setSelectedSection(e.target.value)}
                      className="w-full bg-[#f8f9ff] dark:bg-slate-700/50 border border-transparent dark:border-slate-600 rounded-md py-2.5 md:py-3.5 pl-9 md:pl-10 pr-3 md:pr-4 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#0058be]/40 dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0058be]/10 dark:focus:ring-blue-400/10 outline-none transition-all appearance-none"
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
                    <span className="material-symbols-outlined absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none text-base md:text-lg">expand_more</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Subject *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-base md:text-lg">menu_book</span>
                    <select 
                      required
                      value={selectedSubject}
                      onChange={e => setSelectedSubject(e.target.value)}
                      className="w-full bg-[#f8f9ff] dark:bg-slate-700/50 border border-transparent dark:border-slate-600 rounded-md py-2.5 md:py-3.5 pl-9 md:pl-10 pr-3 md:pr-4 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#0058be]/40 dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0058be]/10 dark:focus:ring-blue-400/10 outline-none transition-all appearance-none"
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
                    <span className="material-symbols-outlined absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none text-base md:text-lg">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Due Date *</label>
                <input 
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-[#f8f9ff] dark:bg-slate-700/50 border border-transparent dark:border-slate-600 rounded-md p-2.5 md:p-3.5 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#0058be]/40 dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0058be]/10 dark:focus:ring-blue-400/10 transition-all outline-none" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6 md:space-y-8">
          <div className="bg-gradient-to-br from-[#0b1c30] to-[#1e3450] p-5 md:p-6 lg:p-8 rounded-lg md:rounded-xl text-white shadow-lg relative overflow-hidden">
             <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl md:text-9xl text-white/5">edit</span>
             <h4 className="text-base md:text-lg lg:text-xl font-bold mb-3 md:mb-4 relative z-10 flex items-center gap-2 text-blue-200">
               <span className="material-symbols-outlined text-lg md:text-xl">info</span>
               Editing Assignment
             </h4>
             <p className="text-xs md:text-sm text-slate-300 leading-relaxed relative z-10 mb-3 md:mb-4">
               Update the assignment details. Note that changes will affect all students in the selected section.
             </p>
             <div className="relative z-10 bg-amber-500/20 border border-amber-400/30 p-3 md:p-4 rounded-lg">
               <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-amber-200 mb-1.5 md:mb-2">Warning</p>
               <p className="text-xs md:text-sm text-amber-100">
                 Changing the due date or requirements may affect student submissions that are already in progress.
               </p>
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
