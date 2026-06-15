import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

export default function AddParent() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [occupation, setOccupation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const userPayload = { email, password, first_name: firstName, last_name: lastName };
      const userResponse = await api.post(`/users/`, userPayload);
      const userData = userResponse.data;

      if (userData.id) {
        const profilePayload = {
          user: userData.id,
          phone_number: phoneNumber,
          emergency_contact_number: emergencyContact,
          occupation: occupation,
        };
        await api.post(`/profiles/parents/`, profilePayload);
      }

      setSuccessMsg("Guardian successfully onboarded!");
      setTimeout(() => navigate("/school-admin/parents"), 1500);

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
          setError("Server crashed (500 Internal Error). Please check your Django terminal for the exact python traceback.");
        } else {
          let errorMsg = Object.entries(data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`).join(" | ");
          setError(errorMsg);
        }
      } else {
        setError(err.message);
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Add Guardian">
      <div className="max-w-5xl mx-auto space-y-6 px-6 py-6">
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Register New Guardian</h1>
            <p className="text-[#6b7280] mt-1 max-w-2xl text-sm">Onboard a new guardian into the institutional ecosystem using the 2-step decoupled identity architecture.</p>
          </div>
          <button type="button" onClick={() => navigate("/school-admin/parents")} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 text-[#0058be] font-semibold rounded transition border border-gray-200 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Directory
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 flex gap-2 shadow-sm items-center">
             <span className="material-symbols-outlined text-[20px]">error</span>
             <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-50 text-green-800 rounded border border-green-200 flex gap-2 shadow-sm items-center">
             <span className="material-symbols-outlined text-[20px]">check_circle</span>
             <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-9 space-y-6">
              
              {/* CORE IDENTITY */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
                   <span className="material-symbols-outlined text-[#0058be] text-[20px]">badge</span> Step 1: Core Identity
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6b7280] tracking-wider uppercase">First Name</label>
                    <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:bg-white focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6b7280] tracking-wider uppercase">Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:bg-white focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6b7280] tracking-wider uppercase">Login Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:bg-white focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6b7280] tracking-wider uppercase">Temporary Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:bg-white focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all" />
                  </div>
                </div>
              </div>

              {/* PARENT PROFILE */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
                   <span className="material-symbols-outlined text-[#6b38d4] text-[20px]">family_restroom</span> Step 2: Guardian Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6b7280] tracking-wider uppercase">Primary Phone</label>
                    <input required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:bg-white focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6b7280] tracking-wider uppercase">Emergency Contact</label>
                    <input required value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:bg-white focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6b7280] tracking-wider uppercase">Occupation</label>
                    <input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:bg-white focus:ring-2 focus:ring-[#0058be]/10 border border-transparent transition-all" />
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" disabled={loading} onClick={() => navigate("/school-admin/parents")} className="px-6 py-2 text-sm text-[#6b7280] font-semibold hover:bg-gray-100 rounded transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-8 py-2 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white text-sm font-bold rounded shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-70">
                  {loading ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">save</span>}
                  {loading ? "Registering..." : "Add Guardian"}
                </button>
              </div>
            </div>

            {/* PROFILE ASSET */}
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm text-center">
                <div className="w-28 h-28 mx-auto rounded-full bg-[#f8f9ff] flex items-center justify-center overflow-hidden border-4 border-white shadow-sm mb-3">
                  <span className="material-symbols-outlined text-5xl text-gray-300">add_a_photo</span>
                </div>
                <h4 className="font-semibold text-slate-800 text-sm">Profile Photo</h4>
                <p className="text-[11px] text-[#6b7280] mt-1 leading-relaxed">Upload a high-resolution portrait for visual identification across the platform.</p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}