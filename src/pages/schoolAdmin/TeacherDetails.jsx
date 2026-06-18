import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

export default function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await api.get(`profiles/teachers/${id}/`);
        setTeacher(response.data);
      } catch (err) {
        setError("Failed to load faculty details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  if (loading) {
    return <SchoolLayout><div className="flex justify-center items-center h-[50vh]">Loading profile...</div></SchoolLayout>;
  }

  if (error || !teacher) {
    return <SchoolLayout><div className="p-6 text-red-500">{error || "Teacher not found."}</div></SchoolLayout>;
  }

  const fName = teacher.first_name || teacher.user?.first_name || "";
  const lName = teacher.last_name || teacher.user?.last_name || "";
  const displayName = (fName || lName) ? `${fName} ${lName}`.trim() : (teacher.user?.email || "Unknown");
  const emailAddr = teacher.email || teacher.user?.email || "No Email Provided";

  const getInitials = () => {
    if (fName && lName) return `${fName[0]}${lName[0]}`.toUpperCase();
    return "TR";
  };

  return (
    <SchoolLayout title="Teacher Details">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <button onClick={() => navigate("/school-admin/teachers")} className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline mb-6">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Directory
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">Faculty Profile</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-50">
            <div className="w-16 h-16 rounded-2xl bg-[#f4ebff] text-[#6b38d4] flex items-center justify-center font-bold text-xl border border-[#e9ddff]">
              {getInitials()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-xs text-gray-400 font-mono mt-1">UUID: {teacher.user?.id || teacher.id}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-y-8 gap-x-12">
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Employee ID</p>
              <p className="text-base font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{teacher.employee_id || "N/A"}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Email Address</p>
              <p className="text-base font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{emailAddr}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Qualification</p>
              <p className="text-base font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{teacher.qualification || "Unspecified"}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Joining Date</p>
              <p className="text-base font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{teacher.joining_date || "Unknown"}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Phone Number</p>
              <p className="text-base font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{teacher.phone_number || "No Phone"}</p>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}