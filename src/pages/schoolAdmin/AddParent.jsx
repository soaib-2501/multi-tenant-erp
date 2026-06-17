import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";
import { useTheme } from "../../context/ThemeContext";

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
      <div className="max-w-5xl mx-auto space-y-6 px-4 md:px-6 py-4 md:py-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface">Register New Guardian</h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-2xl font-body">
              Onboard a new guardian into the institutional ecosystem using the 2-step decoupled identity architecture.
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => navigate("/school-admin/parents")} 
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/20 text-primary font-semibold rounded-md shadow-sm font-body transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Directory
          </button>
        </div>

        {error && (
          <div className="p-3 bg-error/10 text-error rounded-md border border-error/20 flex gap-2 shadow-sm items-center font-body">
            <span className="material-symbols-outlined text-xl">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-success/10 text-success rounded-md border border-success/20 flex gap-2 shadow-sm items-center font-body">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-9 space-y-6">
              
              {/* CORE IDENTITY */}
              <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
                <h3 className="text-base font-headline font-bold text-on-surface flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-primary text-xl">badge</span> Step 1: Core Identity
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-headline font-bold text-on-surface-variant tracking-wider uppercase">First Name</label>
                    <input 
                      required 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-headline font-bold text-on-surface-variant tracking-wider uppercase">Last Name</label>
                    <input 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-headline font-bold text-on-surface-variant tracking-wider uppercase">Login Email</label>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-headline font-bold text-on-surface-variant tracking-wider uppercase">Temporary Password</label>
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                    />
                  </div>
                </div>
              </div>

              {/* PARENT PROFILE */}
              <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
                <h3 className="text-base font-headline font-bold text-on-surface flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-secondary text-xl">family_restroom</span> Step 2: Guardian Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-headline font-bold text-on-surface-variant tracking-wider uppercase">Primary Phone</label>
                    <input 
                      required 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)} 
                      className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-headline font-bold text-on-surface-variant tracking-wider uppercase">Emergency Contact</label>
                    <input 
                      required 
                      value={emergencyContact} 
                      onChange={(e) => setEmergencyContact(e.target.value)} 
                      className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-2xs font-headline font-bold text-on-surface-variant tracking-wider uppercase">Occupation</label>
                    <input 
                      value={occupation} 
                      onChange={(e) => setOccupation(e.target.value)} 
                      className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  disabled={loading} 
                  onClick={() => navigate("/school-admin/parents")} 
                  className="px-6 py-2 text-sm text-on-surface-variant font-semibold hover:bg-surface-container-high rounded-md transition-colors disabled:opacity-50 font-body"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-8 py-2 bg-primary text-white text-sm font-bold rounded-md shadow-md hover:bg-primary/90 transition flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-70 font-body"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">save</span>
                  )}
                  {loading ? "Registering..." : "Add Guardian"}
                </button>
              </div>
            </div>

            {/* PROFILE ASSET */}
            <div className="lg:col-span-3">
              <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/10 shadow-sm text-center">
                <div className="w-28 h-28 mx-auto rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border-4 border-surface-container-lowest shadow-sm mb-3">
                  <span className="material-symbols-outlined text-5xl text-outline/50">add_a_photo</span>
                </div>
                <h4 className="font-headline font-semibold text-on-surface text-sm">Profile Photo</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed font-body">
                  Upload a high-resolution portrait for visual identification across the platform.
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}