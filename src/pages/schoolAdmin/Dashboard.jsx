import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosClient";
import { useTheme } from "../../context/ThemeContext";

export default function Dashboard() {
  const navigate = useNavigate();

  const [classLevelsCount, setClassLevelsCount] = useState(0);
  const [sectionsCount, setSectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);

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

  // Quick actions – using routes that are known to exist
  const quickActions = [
    { label: "Add Student", path: "/school-admin/students/add", icon: "person_add" },
    { label: "Add Teacher", path: "/school-admin/teachers/create", icon: "group_add" },
    { label: "Subject", path: "/school-admin/create-subject", icon: "menu_book" },
    { label: "Section", path: "/school-admin/create-section", icon: "groups" },
    { label: "Class Level", path: "/school-admin/class-levels", icon: "meeting_room" },
  ];

  return (
    <SchoolLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6">
        {/* title & quick actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">Academic Overview</h2>
            <p className="text-sm text-on-surface-variant mt-0.5 font-body">
              Welcome back, Administrator. Here's what's happening today.
            </p>
          </div>

          {/* "+" Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">add</span>
            </button>
            {showQuickActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowQuickActions(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 overflow-hidden z-20 py-1">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => { setShowQuickActions(false); navigate(action.path); }}
                      className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 font-body"
                    >
                      <span className="material-symbols-outlined text-base">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* stat cards (unchanged) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border-l-4 border-primary">
            <div className="flex justify-between mb-2">
              <div className="p-1.5 bg-primary/10 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">school</span>
              </div>
              <span className="text-2xs font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">+4%</span>
            </div>
            <p className="text-xs text-on-surface-variant font-body">Total Enrolled</p>
            <h3 className="text-2xl font-headline font-bold text-on-surface">1,284</h3>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border-l-4 border-secondary">
            <div className="flex justify-between mb-2">
              <div className="p-1.5 bg-secondary/10 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-xl">supervisor_account</span>
              </div>
              <span className="text-2xs font-semibold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">Stable</span>
            </div>
            <p className="text-xs text-on-surface-variant font-body">Total Teachers</p>
            <h3 className="text-2xl font-headline font-bold text-on-surface">86</h3>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border-l-4 border-tertiary">
            <div className="p-1.5 bg-tertiary/10 rounded mb-2 w-fit flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-xl">meeting_room</span>
            </div>
            <p className="text-xs text-on-surface-variant font-body">Class Levels</p>
            <h3 className="text-2xl font-headline font-bold text-on-surface">{loading ? "..." : classLevelsCount}</h3>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border-l-4 border-green-600">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded mb-2 w-fit flex items-center justify-center">
              <span className="material-symbols-outlined text-green-700 dark:text-green-400 text-xl">groups</span>
            </div>
            <p className="text-xs text-on-surface-variant font-body">Active Sections</p>
            <h3 className="text-2xl font-headline font-bold text-on-surface">{loading ? "..." : sectionsCount}</h3>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border-l-4 border-error">
            <div className="flex justify-between mb-2">
              <div className="p-1.5 bg-error/10 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-xl">how_to_reg</span>
              </div>
              <span className="text-2xs font-semibold bg-error/10 text-error px-1.5 py-0.5 rounded-full">-0.2%</span>
            </div>
            <p className="text-xs text-on-surface-variant font-body">Engagement</p>
            <h3 className="text-2xl font-headline font-bold text-on-surface">94.8%</h3>
          </div>
        </div>

        {/* charts (unchanged) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-surface-container-lowest p-5 rounded-lg shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">Enrollment Growth</h3>
                <p className="text-xs text-on-surface-variant font-body">Annual student registration trends</p>
              </div>
              <span className="text-2xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">Last 6 Months</span>
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
                  <div className={`${b.active ? "bg-primary shadow-md shadow-primary/20" : "bg-surface-container-high hover:bg-primary"} w-full ${b.h} rounded-t-sm transition`}></div>
                  <span className={`text-3xs font-bold ${b.active ? "text-primary" : "text-outline"} font-body`}>{b.m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm border border-outline-variant/10 flex flex-col items-center justify-center">
            <div className="w-full text-left mb-2">
              <h3 className="text-lg font-headline font-bold text-on-surface mb-0.5">Attendance Trend</h3>
              <p className="text-xs text-on-surface-variant font-body">Weekly average engagement</p>
            </div>
            <div className="relative flex items-center justify-center my-2">
              <svg className="w-28 h-28 -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="var(--color-surface-container-high)" strokeWidth="10" fill="none" />
                <circle cx="56" cy="56" r="46" stroke="var(--color-secondary)" strokeWidth="10" fill="none" strokeDasharray="289" strokeDashoffset="15" strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <h3 className="text-2xl font-headline font-bold text-on-surface">94%</h3>
              </div>
            </div>
            <div className="w-full mt-2 space-y-1.5 text-xs font-body">
              <div className="flex justify-between">
                <p className="flex items-center gap-1.5 text-on-surface-variant"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Present</p>
                <p className="font-semibold text-on-surface">1,217</p>
              </div>
              <div className="flex justify-between">
                <p className="flex items-center gap-1.5 text-on-surface-variant"><span className="w-1.5 h-1.5 rounded-full bg-surface-container-high"></span> Absent</p>
                <p className="font-semibold text-on-surface">67</p>
              </div>
            </div>
          </div>
        </div>

        {/* activity (unchanged) */}
        <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="px-5 py-3 flex justify-between items-center bg-surface-container-high/50 border-b border-outline-variant/10">
            <h3 className="text-base font-headline font-bold text-on-surface">Recent Activity</h3>
            <button className="text-primary text-xs font-semibold hover:underline font-body">View All</button>
          </div>
          <div className="divide-y divide-outline-variant/10">
            <div className="px-5 py-2.5 flex justify-between items-center hover:bg-surface-container-high/30 transition-colors">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-primary">person_add</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface font-body"><span className="text-primary">Sarah Jenkins </span>was added as a new Student</p>
                  <p className="text-2xs text-on-surface-variant font-body">Class 10-B • 2 hours ago</p>
                </div>
              </div>
              <span className="text-2xs text-outline font-mono">#ST-9024</span>
            </div>
            <div className="px-5 py-2.5 flex justify-between items-center hover:bg-surface-container-high/30 transition-colors">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-secondary">assignment_ind</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface font-body"><span className="text-secondary">Dr. Robert Miller </span>was assigned to Physics Dept.</p>
                  <p className="text-2xs text-on-surface-variant font-body">Senior Faculty • 5 hours ago</p>
                </div>
              </div>
              <span className="text-2xs text-outline font-mono">#TR-4412</span>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}