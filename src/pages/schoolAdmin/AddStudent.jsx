import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

export default function AddStudent() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");

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
        // CRITICAL FIX: Only add optional fields if they are actually populated!
        // Sending "" (empty strings) breaks Django DateFields and ChoiceFields causing 500s.
        const profilePayload = {
          user: userData.id,
          enrollment_number: enrollmentNumber,
          is_archived: false
        };
        
        if (dateOfBirth) profilePayload.date_of_birth = dateOfBirth;
        if (phoneNumber) profilePayload.phone_number = phoneNumber;
        if (bloodGroup) profilePayload.blood_group = bloodGroup;
        if (address) profilePayload.address = address;

        await api.post(`profiles/students/`, profilePayload);
      }

      setSuccessMsg("Student registration complete!");
      setTimeout(() => navigate("/school-admin/students"), 1500);

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
          setError("Server crashed (500 Internal Error). Check Django terminal.");
        } else {
          setError(Object.entries(data).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`).join(" | "));
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
    <SchoolLayout title="Student Registration">
      <div className="max-w-4xl mx-auto space-y-6 px-6 py-6">
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Register New Student</h1>
            <p className="text-[#6b7280] mt-1 max-w-2xl text-sm">Create authentication identity and academic profile.</p>
          </div>
          <button type="button" onClick={() => navigate("/school-admin/students")} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white hover:bg-gray-50 border border-gray-200 text-[#0058be] font-semibold rounded shadow-sm">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Directory
          </button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm font-medium flex gap-2"><span className="material-symbols-outlined text-[20px]">error</span>{error}</div>}
        {successMsg && <div className="p-3 bg-green-50 text-green-800 rounded border border-green-200 text-sm font-medium flex gap-2"><span className="material-symbols-outlined text-[20px]">check_circle</span>{successMsg}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
               <span className="material-symbols-outlined text-[#0058be] text-[20px]">badge</span> Core Identity
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
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Email Address</label>
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
               <span className="material-symbols-outlined text-[#6b38d4] text-[20px]">assignment_ind</span> Academic Profile
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Enrollment Number</label>
                <input required value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Date of Birth</label>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Phone Number</label>
                <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase">Blood Group</label>
                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20">
                  <option value="">Select Group</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#6b7280] uppercase">Residential Address</label>
              <textarea rows="2" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-[#eff4ff] px-3 py-2 text-sm rounded outline-none focus:ring-2 focus:ring-[#0058be]/20 resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" disabled={loading} onClick={() => navigate("/school-admin/students")} className="px-6 py-2 text-sm text-[#6b7280] font-semibold hover:bg-gray-100 rounded disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-2 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white text-sm font-bold rounded shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-70">
              {loading ? "Registering..." : "Register Student"}
            </button>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}