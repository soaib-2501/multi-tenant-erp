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

  useEffect(() => {
    const fetchParent = async () => {
      try {
        const response = await api.get(`profiles/parents/${id}/`);
        setParent(response.data);
      } catch (err) {
        setError("Failed to load guardian details.");
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, [id]);

  if (loading) return <SchoolLayout><div className="flex justify-center items-center h-[50vh]">Loading profile...</div></SchoolLayout>;
  if (error || !parent) return <SchoolLayout><div className="p-6 text-red-500">{error || "Guardian not found."}</div></SchoolLayout>;

  const fName = parent.first_name || parent.user?.first_name || "";
  const lName = parent.last_name || parent.user?.last_name || "";
  const displayName = (fName || lName) ? `${fName} ${lName}`.trim() : (parent.user?.email || "Unknown Guardian");
  const emailAddr = parent.email || parent.user?.email || "No Email Provided";

  return (
    <SchoolLayout title="Guardian Details">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <button onClick={() => navigate("/school-admin/parents")} className="flex items-center gap-1.5 text-[#0058be] text-sm font-semibold hover:underline mb-8">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Directory
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-6">{displayName}</h1>

          <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium w-32">Email:</span>
              <span className="text-gray-900 font-semibold text-sm">{emailAddr}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium w-32">Phone:</span>
              <span className="text-gray-900 font-semibold text-sm">{parent.phone_number || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium w-32">Occupation:</span>
              <span className="text-gray-900 font-semibold text-sm">{parent.occupation || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium w-32">Emergency Contact:</span>
              <span className="text-gray-900 font-semibold text-sm">{parent.emergency_contact_number || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}