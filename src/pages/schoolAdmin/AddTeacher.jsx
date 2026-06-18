import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";
import { useTheme } from "../../context/ThemeContext";

export default function AddTeacher() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [qualification, setQualification] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

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
      const userResponse = await api.post(`users/`, userPayload);
      const userData = userResponse.data;

      if (userData.id) {
        const profilePayload = {
          user: userData.id,
          first_name: firstName,
          last_name: lastName,
          employee_id: employeeId,
          qualification: qualification,
          phone_number: phoneNumber,
          joining_date: joiningDate || null,
        };
        await api.post(`profiles/teachers/`, profilePayload);
      }

      setSuccessMsg("Faculty onboarding complete!");
      setTimeout(() => navigate("/school-admin/teachers"), 1500);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
          setError("Server crashed (500). Check Django terminal.");
        } else {
          setError(Object.entries(data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`).join(" | "));
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Add Faculty">
      <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface">Onboard New Faculty</h1>
            <p className="text-sm text-on-surface-variant mt-1 font-body">Register a new educator into the academic system.</p>
          </div>
          <button 
            type="button" 
            onClick={() => navigate("/school-admin/teachers")} 
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
        {successMsg && (
          <div className="p-3 bg-success/10 text-success rounded-md border border-success/20 text-sm font-medium flex gap-2 font-body">
            <span className="material-symbols-outlined text-xl">check_circle</span>{successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
            <h3 className="text-base font-headline font-bold text-on-surface flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary text-xl">badge</span> Identity Credentials
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-headline font-bold text-on-surface-variant uppercase">First Name</label>
                <input 
                  required 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-headline font-bold text-on-surface-variant uppercase">Last Name</label>
                <input 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-headline font-bold text-on-surface-variant uppercase">Professional Email</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-headline font-bold text-on-surface-variant uppercase">Temporary Password</label>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10">
            <h3 className="text-base font-headline font-bold text-on-surface flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-secondary text-xl">school</span> Professional Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-headline font-bold text-on-surface-variant uppercase">Employee ID</label>
                <input 
                  required 
                  value={employeeId} 
                  onChange={(e) => setEmployeeId(e.target.value)} 
                  className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-headline font-bold text-on-surface-variant uppercase">Qualification</label>
                <input 
                  value={qualification} 
                  onChange={(e) => setQualification(e.target.value)} 
                  placeholder="e.g. PhD, M.Sc" 
                  className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-headline font-bold text-on-surface-variant uppercase">Phone Number</label>
                <input 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface placeholder:text-outline" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-2xs font-headline font-bold text-on-surface-variant uppercase">Joining Date</label>
                <input 
                  type="date" 
                  required 
                  value={joiningDate} 
                  onChange={(e) => setJoiningDate(e.target.value)} 
                  className="bg-surface-container-low px-3 py-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/40 transition-all font-body text-on-surface" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              disabled={loading} 
              onClick={() => navigate("/school-admin/teachers")} 
              className="px-6 py-2 text-sm text-on-surface-variant font-semibold hover:bg-surface-container-high rounded-md transition-colors disabled:opacity-50 font-body"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-8 py-2 bg-primary text-white text-sm font-bold rounded-md shadow-md hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-70 font-body"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">save</span>
              )}
              {loading ? "Registering..." : "Add Faculty"}
            </button>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}