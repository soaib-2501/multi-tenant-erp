import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';

export default function CreateClassSection() {
  const navigate = useNavigate();

  // Global UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Smart Form State
  const [targetGrade, setTargetGrade] = useState("1");
  const [targetSection, setTargetSection] = useState("A");
  
  // Background tracking for existing records
  const [liveClasses, setLiveClasses] = useState([]);

  // Generators for 1-12 and A-Z
  const gradeLevels = Array.from({ length: 12 }, (_, i) => i + 1);
  const sectionAlphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  // Fetch live classes silently on mount to know what already exists
  const fetchClassLevels = async () => {
    try {
      const data = await schoolAdminApi.getClassLevels();
      setLiveClasses(data?.results || data || []);
    } catch (err) {
      console.error("Failed to sync live class schema:", err);
    }
  };

  useEffect(() => {
    fetchClassLevels();
  }, []);

  // Unified Smart Submit Handler
  const handleSmartDeploy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    let classIdToUse = null;
    let wasClassJustCreated = false;

    // STEP 1: RESOLVE THE CLASS LEVEL (Check if exists, or Create it)
    try {
      // Safest matching method: match by numeric order to avoid string mismatches
      const existingClass = liveClasses.find(c => parseInt(c.numeric_order, 10) === parseInt(targetGrade, 10));

      if (existingClass) {
        classIdToUse = existingClass.id;
      } else {
        // Class doesn't exist yet, auto-provision it
        const classPayload = {
          name: `Grade ${targetGrade}`,
          numeric_order: parseInt(targetGrade, 10),
          status: "Active"
        };
        const newClass = await schoolAdminApi.createClassLevel(classPayload);
        classIdToUse = newClass.id;
        wasClassJustCreated = true;
      }
    } catch (err) {
      console.error("Class Resolution Error:", err);
      setError("System failed to verify or construct the base Class Level. Please check server connection.");
      setLoading(false);
      return; // Stop execution if class fails
    }

    // STEP 2: DEPLOY THE SECTION TO THE RESOLVED CLASS
    try {
      const sectionPayload = {
        name: `Section ${targetSection}`,
        class_level: classIdToUse
      };

      await schoolAdminApi.createSection(sectionPayload);

      // Success Sequence
      if (wasClassJustCreated) {
        setSuccess(`Success! Automatically provisioned "Grade ${targetGrade}" and deployed "Section ${targetSection}" into it.`);
      } else {
        setSuccess(`Success! Deployed "Section ${targetSection}" into the existing "Grade ${targetGrade}".`);
      }

      fetchClassLevels(); // Refresh background state

      // Auto-increment section letter for rapid entry (A -> B -> C)
      if (targetSection !== "Z") {
        setTargetSection(String.fromCharCode(targetSection.charCodeAt(0) + 1));
      }

    } catch (err) {
      console.error("Section Deployment Error:", err);
      const errorData = err.response?.data;
      let errorMsg = `Grade ${targetGrade} is ready, but failed to create Section ${targetSection}. It may already exist.`;
      
      if (errorData && typeof errorData === "object") {
        errorMsg = Object.entries(errorData)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`)
          .join(" | ");
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Manage Classes & Sections">
      <div className="px-8 py-10 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Academic Structure Deployment</h2>
          <p className="text-[#6b7280] mt-1 font-medium">
            Select a Grade and Section. The system will automatically provision missing layers in the database.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 font-semibold text-sm rounded-lg border border-red-200 flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-lg border border-emerald-200 flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {success}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDE FORM AREA */}
          <div className="flex-1">
            <div className="bg-white rounded-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.02)] border border-gray-100">
              
              <div className="mb-8 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                  <span className="material-symbols-outlined text-[#0058be]">account_tree</span>
                  Smart Provisioning Matrix
                </h3>
              </div>

              <form onSubmit={handleSmartDeploy} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Grade Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280] ml-1">Target Grade Level</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">school</span>
                      <select
                        required
                        value={targetGrade}
                        onChange={e => setTargetGrade(e.target.value)}
                        className="w-full bg-[#f4f7fc] pl-12 pr-4 py-3.5 rounded-md outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all appearance-none font-bold text-slate-700 cursor-pointer shadow-sm"
                      >
                        {gradeLevels.map((g) => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Section Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6b7280] ml-1">Target Section</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">tag</span>
                      <select
                        required
                        value={targetSection}
                        onChange={e => setTargetSection(e.target.value)}
                        className="w-full bg-[#f4f7fc] pl-12 pr-4 py-3.5 rounded-md outline-none focus:ring-2 focus:ring-[#0058be]/20 border border-transparent focus:border-[#0058be]/40 transition-all appearance-none font-bold text-slate-700 cursor-pointer shadow-sm"
                      >
                        {sectionAlphabet.map((letter) => (
                          <option key={letter} value={letter}>Section {letter}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                  <button type="button" onClick={() => navigate("/school-admin/class-levels")} className="px-6 py-3 rounded-md text-slate-400 hover:text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors outline-none">
                    Return to Directory
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-8 py-3.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white text-sm rounded-lg font-bold shadow-[0_4px_14px_rgba(0,88,190,0.3)] hover:shadow-[0_6px_20px_rgba(0,88,190,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 outline-none"
                  >
                    {loading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">rocket_launch</span>}
                    Deploy Academic Structure
                  </button>
                </div>
              </form>

            </div>
          </div>

          {/* RIGHT SIDE PANEL */}
          <div className="w-full lg:w-[350px] space-y-6">
            
            <div className="bg-[#eef2fa] rounded-xl p-6 relative overflow-hidden border border-[#d3e4fe] shadow-sm animate-fadeIn">
              <h4 className="font-bold text-[#0058be] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                Smart Auto-Provisioning
              </h4>
              <ul className="space-y-4 text-sm text-slate-600 font-medium">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0058be] rounded-full mt-2 shrink-0"></span>
                  <p>You no longer need to create classes manually. The system analyzes your target configuration on submission.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0058be] rounded-full mt-2 shrink-0"></span>
                  <p>If the <strong>Grade</strong> does not exist yet, the backend constructs it instantly before deploying the Section.</p>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#0b1c30] to-[#1e3450] text-white rounded-xl p-6 shadow-lg">
               <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-300">
                 <span className="material-symbols-outlined">bolt</span>
                 Rapid Entry Tip
               </h4>
               <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">
                 When you click "Deploy", the Section dropdown will automatically increment (e.g., from A to B). 
               </p>
               <p className="text-sm text-slate-300 font-medium leading-relaxed">
                 This allows you to rapidly click deploy multiple times to generate Sections A, B, C, and D for a single grade in seconds!
               </p>
            </div>
            
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}