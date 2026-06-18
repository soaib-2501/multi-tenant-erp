import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

export default function GuardianDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: "",
    occupation: "",
    emergency_contact_number: ""
  });

  useEffect(() => {
    const fetchParent = async () => {
      try {
        const response = await api.get(`profiles/parents/${id}/`);
        setParent(response.data);
        setFormData({
          phone_number: response.data.phone_number || "",
          occupation: response.data.occupation || "",
          emergency_contact_number: response.data.emergency_contact_number || ""
        });
      } catch (err) {
        setError("Failed to load guardian details.");
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch(`profiles/parents/${id}/`, formData);
      setParent(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Failed to save changes. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <SchoolLayout><div className="flex justify-center items-center h-[50vh]">Loading profile...</div></SchoolLayout>;
  if (error || !parent) return <SchoolLayout><div className="p-6 text-red-500">{error || "Guardian not found."}</div></SchoolLayout>;

  const fName = parent.first_name || parent.user?.first_name || "";
  const lName = parent.last_name || parent.user?.last_name || "";
  const displayName = (fName || lName) ? `${fName} ${lName}`.trim() : (parent.user?.email || "Unknown Guardian");
  const emailAddr = parent.email || parent.user?.email || "No Email Provided";

  return (
    <SchoolLayout title="Guardian Details">
      <div className="max-w-4xl mx-auto px-8 py-8">
        
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate("/school-admin/parents")} className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Directory
          </button>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-[#eff4ff] text-[#0058be] text-sm font-bold rounded-md hover:bg-[#dce9ff] transition-colors">
              <span className="material-symbols-outlined text-[16px]">edit</span> Edit Guardian
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-md">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white text-sm font-bold rounded-md shadow-sm disabled:opacity-70">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-6">{displayName}</h1>

          <div className="grid md:grid-cols-2 gap-y-8 gap-x-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Email Address</p>
              <p className="text-sm font-bold text-slate-500 bg-gray-50 px-4 py-2.5 rounded-md border border-gray-100 cursor-not-allowed">{emailAddr}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Phone Number</p>
              {isEditing ? (
                <input value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="w-full text-sm font-bold text-slate-800 bg-white border border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none px-4 py-2 rounded-md" />
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{parent.phone_number || "N/A"}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Occupation</p>
              {isEditing ? (
                <input value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full text-sm font-bold text-slate-800 bg-white border border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none px-4 py-2 rounded-md" />
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{parent.occupation || "N/A"}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Emergency Contact</p>
              {isEditing ? (
                <input value={formData.emergency_contact_number} onChange={e => setFormData({...formData, emergency_contact_number: e.target.value})} className="w-full text-sm font-bold text-slate-800 bg-white border border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none px-4 py-2 rounded-md" />
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{parent.emergency_contact_number || "N/A"}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}