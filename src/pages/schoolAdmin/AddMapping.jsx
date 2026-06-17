import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import { useTheme } from "../../context/ThemeContext";

export default function AddMapping() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedParent, setSelectedParent] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [relationship, setRelationship] = useState("Guardian");
  
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);
  const [canViewAcademics, setCanViewAcademics] = useState(true);
  const [canPayFees, setCanPayFees] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [parentsData, studentsData] = await Promise.all([
          schoolAdminApi.getParents(1, ""),
          schoolAdminApi.getStudents(1, "")
        ]);
        setParents(parentsData.results || parentsData || []);
        setStudents(studentsData.results || studentsData || []);
      } catch (err) {
        setError("Failed to load Guardians or Students.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedParent || !selectedStudent) {
      setError("Please select both a Guardian and a Student.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const payload = {
        parent: selectedParent,
        student: selectedStudent,
        relationship: relationship,
        is_primary_contact: isPrimaryContact,
        can_view_academics: canViewAcademics,
        can_pay_fees: canPayFees
      };
      
      await api.post(`profiles/parent-student-mappings/`, payload);
      alert("Relationship mapping created successfully!");
      navigate("/school-admin/mapping");
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        setError(Object.entries(data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`).join(" | "));
      } else {
        setError("Failed to create mapping.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (userObj) => {
    if (!userObj) return "Unknown";
    const fName = userObj.first_name || userObj.user?.first_name || "";
    const lName = userObj.last_name || userObj.user?.last_name || "";
    return (fName || lName) ? `${fName} ${lName}`.trim() : userObj.email || "No Name";
  };

  return (
    <SchoolLayout title="Parent-Student Mapping">
      <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-6 py-4 md:py-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface">Create Relationship Link</h1>
            <p className="text-sm text-on-surface-variant mt-1 font-body">Establish a secure relational bridge between guardian and student.</p>
          </div>
          <button 
            type="button" 
            onClick={() => navigate("/school-admin/mapping")} 
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/20 text-primary font-semibold rounded-md shadow-sm font-body transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Directory
          </button>
        </div>

        {error && (
          <div className="p-3 bg-error/10 text-error rounded-md border border-error/20 text-sm font-medium flex gap-2 font-body">
            <span className="material-symbols-outlined text-xl">error</span>{error}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
          <h3 className="text-base font-headline font-bold text-on-surface flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">link</span> Entity Selection
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-headline font-bold text-on-surface-variant uppercase">Select Guardian</label>
              <select 
                required 
                value={selectedParent} 
                onChange={(e) => setSelectedParent(e.target.value)} 
                className="w-full px-3 py-2.5 text-sm bg-surface-container-low rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface"
              >
                <option value="">Select Guardian...</option>
                {initialLoading ? <option disabled>Loading...</option> : parents.map(p => <option key={p.id} value={p.id}>{getDisplayName(p)}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-headline font-bold text-on-surface-variant uppercase">Select Student</label>
              <select 
                required 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)} 
                className="w-full px-3 py-2.5 text-sm bg-surface-container-low rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface"
              >
                <option value="">Select Student...</option>
                {initialLoading ? <option disabled>Loading...</option> : students.map(s => <option key={s.id} value={s.id}>{getDisplayName(s)} (EMP: {s.enrollment_number || "N/A"})</option>)}
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-xs font-headline font-bold text-on-surface-variant uppercase block mb-3">Relationship Designation</label>
            <div className="grid grid-cols-3 gap-4">
              {["Father", "Mother", "Guardian"].map((rel) => (
                <button 
                  key={rel} 
                  type="button" 
                  onClick={() => setRelationship(rel)} 
                  className={`py-2.5 rounded-lg border-2 text-sm font-bold uppercase transition-all font-body ${
                    relationship === rel 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-outline-variant/40"
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <label className="flex items-center justify-between p-3 bg-surface-container-low/50 border border-outline-variant/10 rounded-md cursor-pointer hover:bg-surface-container-high/50 transition-colors">
              <div><p className="text-sm font-headline font-bold text-on-surface">Primary Contact</p></div>
              <input 
                type="checkbox" 
                checked={isPrimaryContact} 
                onChange={(e) => setIsPrimaryContact(e.target.checked)} 
                className="w-4 h-4 rounded text-primary focus:ring-primary/20" 
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-surface-container-low/50 border border-outline-variant/10 rounded-md cursor-pointer hover:bg-surface-container-high/50 transition-colors">
              <div><p className="text-sm font-headline font-bold text-on-surface">Academic Visibility</p></div>
              <input 
                type="checkbox" 
                checked={canViewAcademics} 
                onChange={(e) => setCanViewAcademics(e.target.checked)} 
                className="w-4 h-4 rounded text-primary focus:ring-primary/20" 
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-surface-container-low/50 border border-outline-variant/10 rounded-md cursor-pointer hover:bg-surface-container-high/50 transition-colors">
              <div><p className="text-sm font-headline font-bold text-on-surface">Financial Authorization</p></div>
              <input 
                type="checkbox" 
                checked={canPayFees} 
                onChange={(e) => setCanPayFees(e.target.checked)} 
                className="w-4 h-4 rounded text-primary focus:ring-primary/20" 
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
            <button 
              type="button" 
              disabled={loading} 
              onClick={() => navigate("/school-admin/mapping")} 
              className="px-6 py-2 text-sm text-on-surface-variant font-semibold hover:bg-surface-container-high rounded-md transition-colors disabled:opacity-50 font-body"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-8 py-2 bg-primary text-white text-sm font-bold rounded-md shadow-md hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-70 font-body"
            >
              {loading ? "Establishing..." : "Establish Link"}
            </button>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}