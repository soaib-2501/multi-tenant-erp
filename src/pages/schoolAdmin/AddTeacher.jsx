import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

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
      const userResponse = await api.post(`users/`, userPayload); // No leading slash
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
        await api.post(`profiles/teachers/`, profilePayload); // No leading slash
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
      <div className="max-w-4xl mx-auto space-y-6 px-6 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Onboard New Faculty</h1>
            <p className="text-[#6b7280] mt-1 text-sm">Register a new educator into the academic system.</p>
          </div>
          <button type="button" onClick={() => navigate("/school-admin/teachers")} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 border border-gray-200 text-[#0058be] font-semibold rounded shadow-sm">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Directory
          </button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm font-medium flex gap-2"><span className="material-symbols-outlined text-[20px]">error</span>{error}</div>}
        {successMsg && <div className="p-3 bg-green-50 text-green-800 rounded border border-green-200 text-sm font-medium flex gap-2"><span className="material-symbols-outlined text-[20px]">check_circle</span>{successMsg}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
               <span className="material-symbols-outlined text-[#0058be] text-[20px]">badge</span> Identity Credentials
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">First Name</label>
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Professional Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Temporary Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
               <span className="material-symbols-outlined text-[#6b38d4] text-[20px]">school</span> Professional Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Employee ID</label>
                <input required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Qualification</label>
                <input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="e.g. PhD, M.Sc" className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Phone Number</label>
                <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Joining Date</label>
                <input type="date" required value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" disabled={loading} onClick={() => navigate("/school-admin/teachers")} className="px-6 py-2 text-sm text-[#6b7280] font-semibold hover:bg-gray-100 rounded transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-2 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white text-sm font-bold rounded shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-70">
              {loading ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">save</span>}
              {loading ? "Registering..." : "Add Faculty"}
            </button>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}