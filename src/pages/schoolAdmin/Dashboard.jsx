import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosClient";

export default function Dashboard() {
  const navigate = useNavigate();

  const [classLevelsCount, setClassLevelsCount] = useState(0);
  const [sectionsCount, setSectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [classRes, sectionRes] = await Promise.all([
          api.get(`academics/class-levels/`),
          api.get(`academics/sections/`)
        ]);

        setClassLevelsCount(classRes.data.count !== undefined ? classRes.data.count : classRes.data.length);
        setSectionsCount(sectionRes.data.count !== undefined ? sectionRes.data.count : sectionRes.data.length);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <SchoolLayout>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* title & quick actions */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Academic Overview</h2>
            <p className="text-sm text-[#6b7280] mt-0.5">
              Welcome back, Administrator. Here's what's happening today.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => navigate("/school-admin/students/add")}
              className="px-3 py-1.5 bg-[#eff4ff] text-[#0058be] text-sm font-semibold rounded shadow-sm hover:bg-[#dce9ff] transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Add Student
            </button>
            <button
              onClick={() => navigate("/school-admin/teachers/create")}
              className="px-3 py-1.5 bg-[#eff4ff] text-[#0058be] text-sm font-semibold rounded shadow-sm hover:bg-[#dce9ff] transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">group_add</span>
              Add Teacher
            </button>
            <button
              onClick={() => navigate("/school-admin/create-subject")}
              className="px-3 py-1.5 bg-white border border-[#0058be]/20 text-[#0058be] text-sm font-semibold rounded shadow-sm hover:bg-[#eff4ff] transition"
            >
              + Subject
            </button>
            <button
              onClick={() => navigate("/school-admin/create-section")}
              className="px-3 py-1.5 bg-white border border-[#0058be]/20 text-[#0058be] text-sm font-semibold rounded shadow-sm hover:bg-[#eff4ff] transition"
            >
              + Section
            </button>
            <button
              onClick={() => navigate("/school-admin/create-class")}
              className="px-3 py-1.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white text-sm font-semibold rounded shadow-sm hover:shadow-md transition"
            >
              + Class Level
            </button>
          </div>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#0058be]">
            <div className="flex justify-between mb-2">
              <div className="p-1.5 bg-[#d8e2ff] rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0058be] text-[20px]">school</span>
              </div>
              <span className="text-[10px] font-semibold bg-[#d8e2ff] px-1.5 py-0.5 rounded text-[#0058be]">+4%</span>
            </div>
            <p className="text-xs text-[#6b7280]">Total Enrolled</p>
            <h3 className="text-2xl font-bold">1,284</h3>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#6b38d4]">
            <div className="flex justify-between mb-2">
              <div className="p-1.5 bg-[#e9ddff] rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-[#6b38d4] text-[20px]">supervisor_account</span>
              </div>
              <span className="text-[10px] font-semibold bg-[#e9ddff] px-1.5 py-0.5 rounded text-[#6b38d4]">Stable</span>
            </div>
            <p className="text-xs text-[#6b7280]">Total Teachers</p>
            <h3 className="text-2xl font-bold">86</h3>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#924700]">
            <div className="p-1.5 bg-[#ffdcc6] rounded mb-2 w-fit flex items-center justify-center">
              <span className="material-symbols-outlined text-[#924700] text-[20px]">meeting_room</span>
            </div>
            <p className="text-xs text-[#6b7280]">Class Levels</p>
            <h3 className="text-2xl font-bold">{loading ? "..." : classLevelsCount}</h3>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#0f9d58]">
            <div className="p-1.5 bg-green-100 rounded mb-2 w-fit flex items-center justify-center">
              <span className="material-symbols-outlined text-green-700 text-[20px]">groups</span>
            </div>
            <p className="text-xs text-[#6b7280]">Active Sections</p>
            <h3 className="text-2xl font-bold">{loading ? "..." : sectionsCount}</h3>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#ba1a1a]">
            <div className="flex justify-between mb-2">
              <div className="p-1.5 bg-[#ffdad6] rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">how_to_reg</span>
              </div>
              <span className="text-[10px] font-semibold bg-[#ffdad6] px-1.5 py-0.5 rounded text-[#ba1a1a]">-0.2%</span>
            </div>
            <p className="text-xs text-[#6b7280]">Engagement</p>
            <h3 className="text-2xl font-bold">94.8%</h3>
          </div>
        </div>

        {/* charts */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* enrollment chart */}
          <div className="col-span-2 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Enrollment Growth</h3>
                <p className="text-xs text-[#6b7280]">Annual student registration trends</p>
              </div>
              <span className="text-[10px] font-semibold bg-[#eff4ff] text-[#0058be] px-2 py-1 rounded">Last 6 Months</span>
            </div>

            <div className="flex items-end gap-4 h-32 px-2">
              {[
                { h: "h-12", m: "SEP" },
                { h: "h-20", m: "OCT" },
                { h: "h-32", m: "NOV", active: true },
                { h: "h-16", m: "DEC" },
                { h: "h-24", m: "JAN" },
                { h: "h-28", m: "FEB" }
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 w-full">
                  <div
                    className={`${b.active ? "bg-[#0058be] shadow-md shadow-[#0058be]/20" : "bg-[#d3e4fe] hover:bg-[#0058be]"} w-full ${b.h} rounded-t-sm transition`}
                  ></div>
                  <span className={`text-[9px] font-bold ${b.active ? "text-[#0058be]" : "text-[#727785]"}`}>
                    {b.m}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* attendance */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-full text-left mb-2">
              <h3 className="text-lg font-semibold mb-0.5">Attendance Trend</h3>
              <p className="text-xs text-[#6b7280]">Weekly average engagement</p>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <svg className="w-28 h-28 -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="#e5eeff" strokeWidth="10" fill="none" />
                <circle cx="56" cy="56" r="46" stroke="#6b38d4" strokeWidth="10" fill="none" strokeDasharray="289" strokeDashoffset="15" strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <h3 className="text-2xl font-bold">94%</h3>
              </div>
            </div>

            <div className="w-full mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <p className="flex items-center gap-1.5 text-[#6b7280]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6b38d4]"></span>
                  Present
                </p>
                <p className="font-semibold">1,217</p>
              </div>
              <div className="flex justify-between">
                <p className="flex items-center gap-1.5 text-[#6b7280]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d3e4fe]"></span>
                  Absent
                </p>
                <p className="font-semibold">67</p>
              </div>
            </div>
          </div>
        </div>

        {/* activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 flex justify-between items-center bg-[#f8f9ff] border-b border-gray-100">
            <h3 className="text-base font-semibold">Recent Activity</h3>
            <button className="text-[#0058be] text-xs font-semibold">View All</button>
          </div>

          <div className="divide-y divide-gray-50">
            <div className="px-5 py-2.5 flex justify-between items-center hover:bg-gray-50">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-[#d8e2ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-[#0058be]">person_add</span>
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    <span className="text-[#0058be]">Sarah Jenkins </span>
                    was added as a new Student
                  </p>
                  <p className="text-[10px] text-[#6b7280]">Class 10-B • 2 hours ago</p>
                </div>
              </div>
              <span className="text-[10px] text-[#727785] font-mono">#ST-9024</span>
            </div>

            <div className="px-5 py-2.5 flex justify-between items-center hover:bg-gray-50">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-[#e9ddff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-[#6b38d4]">assignment_ind</span>
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    <span className="text-[#6b38d4]">Dr. Robert Miller </span>
                    was assigned to Physics Dept.
                  </p>
                  <p className="text-[10px] text-[#6b7280]">Senior Faculty • 5 hours ago</p>
                </div>
              </div>
              <span className="text-[10px] text-[#727785] font-mono">#TR-4412</span>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}