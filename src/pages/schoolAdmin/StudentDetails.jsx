import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`profiles/students/${id}/`);
        setStudent(response.data);
      } catch (err) {
        setError("Failed to load student details.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return <SchoolLayout><div className="flex justify-center items-center h-[50vh]">Loading profile...</div></SchoolLayout>;
  if (error || !student) return <SchoolLayout><div className="p-6 text-red-500">{error || "Student not found."}</div></SchoolLayout>;

  const fName = student.first_name || student.user?.first_name || "";
  const lName = student.last_name || student.user?.last_name || "";
  const displayName = (fName || lName) ? `${fName} ${lName}`.trim() : (student.user?.email || "Unknown Student");
  const emailAddr = student.email || student.user?.email || "No Email Provided";

  const getInitials = () => {
    if (fName && lName) return `${fName[0]}${lName[0]}`.toUpperCase();
    return "ST";
  };

  return (
    <SchoolLayout title="Student Details">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <button onClick={() => navigate("/school-admin/students")} className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline mb-6">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Directory
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">Student Profile</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-50">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#e5eeff] text-[#0058be] flex items-center justify-center font-bold text-xl border border-blue-100">
                {getInitials()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                <p className="text-xs text-gray-400 font-mono mt-1">{emailAddr}</p>
              </div>
            </div>
            <div>
              {student.is_archived ? 
                <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold text-sm">Archived Profile</span> : 
                <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">check_circle</span> Active Student
                </span>
              }
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-y-8 gap-x-12">
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Enrollment Number</p>
              <p className="text-base font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100 font-mono">{student.enrollment_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Date of Birth</p>
              <p className="text-base font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{student.date_of_birth || "Unknown"}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Phone Number</p>
              <p className="text-base font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{student.phone_number || "No Phone"}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Blood Group</p>
              <p className="text-base font-bold text-slate-800 bg-[#f8f9ff] px-4 py-2.5 rounded-md border border-gray-100">{student.blood_group || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Residential Address</p>
              <p className="text-sm font-semibold text-slate-800 bg-[#f8f9ff] px-4 py-3 rounded-md border border-gray-100 min-h-[3rem]">{student.address || "No Address Provided"}</p>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}