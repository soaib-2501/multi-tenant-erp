import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

export default function AcademicYears() {
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await api.get(`academics/academic-years/`); // Corrected path
        setYears(response.data.results || response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchYears();
  }, []);

  return (
    <SchoolLayout title="Academic Years">
      <div className="pt-6 px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold">Academic Years</h2>
          <button onClick={() => navigate("/school-admin/academic-years/create")} className="bg-[#0058be] text-white px-4 py-2 rounded text-sm font-semibold">Create Year</button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr><th className="px-6 py-4">Name</th><th>Start Date</th><th>End Date</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr> : 
               years.map(y => (
                 <tr key={y.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/school-admin/academic-years/edit/${y.id}`)}>
                   <td className="px-6 py-4 font-semibold">{y.name}</td>
                   <td>{y.start_date}</td>
                   <td>{y.end_date}</td>
                   <td><span className={`px-2 py-1 text-xs rounded ${y.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{y.is_active ? "Active" : "Archived"}</span></td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </SchoolLayout>
  );
}