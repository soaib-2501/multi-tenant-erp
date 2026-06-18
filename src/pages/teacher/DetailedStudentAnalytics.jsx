import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";

const DetailedStudentAnalytics = () => {
  return (
    <MainLayout title="Student Detailed Analytics flex-1 w-full px-0">
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24 md:pb-8 w-full">
        
        {/* Back Button Navigation */}
        <Link

to="/teacher/analytics"

className="flex items-center gap-2 text-primary font-semibold text-sm"

>

<span className="material-symbols-outlined">

arrow_back

</span>

Back to Student Analytics

</Link>
        
        {/* Student Glance Card */}
        <div className="bg-surface-container-lowest rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="relative">
            <img alt="Aditya Sharma" className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmGY6ygG3NYYUIoAzhwOsGf2BKd_ry0AyPAgQsxe8IqSSM5Y83Ka4kRuaWZ2Uo6_5UPuCiusk8RvZcYbb-x_ZNswamEMohWJF1jNxF7Bef8-2Y1hTnXwJ5R6RQYNZNI2Nky2saSNAze6XO9vQW7DmBRUV4SOOgduSZM0kpAi5GOYJox6MbyLkXF5UtlEV6DVSTPGmIhHa6lRbtkfpsV586bEmuuZMGThDDrynVNEAHk0m1K1aycCQic8UMU6R13UnaK0QwHHGdtA" />
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-2xs font-bold px-2 py-1 rounded-full uppercase tracking-widest">Active</div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">Aditya Sharma</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mt-2 text-on-surface-variant font-medium text-sm">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-xs block">school</span> Class 10-B</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-xs block">badge</span> Roll No: #42</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-xs block">location_on</span> Science Wing</span>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-low p-3 rounded-md">
                <p className="text-2xs uppercase font-bold text-slate-500 tracking-wider">Avg Score</p>
                <p className="text-xl font-extrabold font-display text-primary">88.4%</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-md">
                <p className="text-2xs uppercase font-bold text-slate-500 tracking-wider">Attendance</p>
                <p className="text-xl font-extrabold font-display text-on-surface">94%</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-md">
                <p className="text-2xs uppercase font-bold text-slate-500 tracking-wider">Rank</p>
                <p className="text-xl font-extrabold font-display text-[#6b38d4]">04/45</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-md">
                <p className="text-2xs uppercase font-bold text-slate-500 tracking-wider">Assessments</p>
                <p className="text-xl font-extrabold font-display text-on-surface">12/12</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Table Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progress Chart Placeholder */}
            <div className="bg-surface-container-lowest rounded-lg p-6 shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold text-on-surface">Academic Performance Trend</h3>
                <select className="text-xs bg-surface-container-low border-0 rounded-md py-1 px-3 text-slate-600 focus:ring-0 outline-none cursor-pointer">
                  <option>Current Semester</option>
                  <option>Previous Year</option>
                </select>
              </div>
              <div className="h-48 w-full flex items-end justify-between gap-1 px-2 relative">
                {/* Simulated Chart Grid */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div className="border-t border-on-surface w-full"></div>
                  <div className="border-t border-on-surface w-full"></div>
                  <div className="border-t border-on-surface w-full"></div>
                  <div className="border-t border-on-surface w-full"></div>
                </div>
                {/* Simulated Bar/Line Hybrid */}
                <div className="flex-1 group flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/20 rounded-t-lg transition-all h-[60%] hover:bg-primary"></div>
                  <span className="text-2xs font-bold text-slate-400">JUL</span>
                </div>
                <div className="flex-1 group flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/20 rounded-t-lg transition-all h-[75%] hover:bg-primary"></div>
                  <span className="text-2xs font-bold text-slate-400">AUG</span>
                </div>
                <div className="flex-1 group flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/20 rounded-t-lg transition-all h-[70%] hover:bg-primary"></div>
                  <span className="text-2xs font-bold text-slate-400">SEP</span>
                </div>
                <div className="flex-1 group flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/40 rounded-t-lg transition-all h-[88%] hover:bg-primary"></div>
                  <span className="text-2xs font-bold text-primary">OCT</span>
                </div>
                <div className="flex-1 group flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/20 rounded-t-lg transition-all h-[82%] hover:bg-primary"></div>
                  <span className="text-2xs font-bold text-slate-400">NOV</span>
                </div>
                <div className="flex-1 group flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/20 rounded-t-lg transition-all h-[92%] hover:bg-primary"></div>
                  <span className="text-2xs font-bold text-slate-400">DEC</span>
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-surface-container-lowest rounded-lg p-6 shadow-sm border border-outline-variant/10">
              <h3 className="font-display text-lg font-bold mb-6 text-on-surface">Subject Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="text-2xs uppercase tracking-widest text-slate-400 border-b border-surface-container">
                      <th className="pb-4 font-bold">Subject</th>
                      <th className="pb-4 font-bold">Assignments</th>
                      <th className="pb-4 font-bold">Exams</th>
                      <th className="pb-4 font-bold text-right">Final Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/30 text-sm">
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-4 font-semibold text-on-surface">Physics</td>
                      <td className="py-4 text-on-surface-variant">92%</td>
                      <td className="py-4 text-on-surface-variant">88%</td>
                      <td className="py-4 text-right font-extrabold text-primary">90%</td>
                    </tr>
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-4 font-semibold text-on-surface">Mathematics</td>
                      <td className="py-4 text-on-surface-variant">96%</td>
                      <td className="py-4 text-on-surface-variant">94%</td>
                      <td className="py-4 text-right font-extrabold text-primary">95%</td>
                    </tr>
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-4 font-semibold text-on-surface text-[#924700]">Organic Chemistry</td>
                      <td className="py-4 text-on-surface-variant">68%</td>
                      <td className="py-4 text-on-surface-variant">72%</td>
                      <td className="py-4 text-right font-extrabold text-[#924700]">70%</td>
                    </tr>
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-4 font-semibold text-on-surface">Computer Science</td>
                      <td className="py-4 text-on-surface-variant">98%</td>
                      <td className="py-4 text-on-surface-variant">95%</td>
                      <td className="py-4 text-right font-extrabold text-primary">97%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Panels */}
          <div className="space-y-6">
            
            {/* Weak Areas Panel */}
            <div className="bg-surface-container-high rounded-lg p-6 border-l-4 border-[#924700]">
              <div className="flex items-center gap-2 mb-4 text-[#924700]">
                <span className="material-symbols-outlined block" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
                <h3 className="font-display font-bold">Weak Areas</h3>
              </div>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">Based on recent quiz performance, Aditya is struggling with the following concepts:</p>
              <div className="space-y-4">
                <div className="bg-white/60 p-3 rounded-md">
                  <p className="text-sm font-bold text-on-surface">Chemical Bonding</p>
                  <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-[#924700] h-full w-[45%]"></div>
                  </div>
                  <p className="text-2xs mt-1 text-slate-500">Mastery: 45%</p>
                </div>
                <div className="bg-white/60 p-3 rounded-md">
                  <p className="text-sm font-bold text-on-surface">Fluid Dynamics</p>
                  <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-[#924700] h-full w-[58%]"></div>
                  </div>
                  <p className="text-2xs mt-1 text-slate-500">Mastery: 58%</p>
                </div>
              </div>
              <button className="w-full mt-6 bg-[#924700] text-white py-3 rounded-md text-sm font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 outline-none border-none cursor-pointer">
                <span className="material-symbols-outlined text-sm block">auto_awesome</span>
                Recommend Practice
              </button>
            </div>

            {/* Action Sidebar */}
            <div className="bg-surface-container-lowest rounded-lg p-6 space-y-4 shadow-sm border border-outline-variant/10">
              <h3 className="font-display font-bold mb-4 text-on-surface">Quick Actions</h3>
              <button className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-primary-container/10 rounded-md group transition-all outline-none border-none cursor-pointer text-on-surface">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform block">mail</span>
                  <span className="text-sm font-bold">Notify Parent</span>
                </div>
                <span className="material-symbols-outlined text-sm opacity-30 block">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-primary-container/10 rounded-md group transition-all outline-none border-none cursor-pointer text-on-surface">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform block">download</span>
                  <span className="text-sm font-bold">Export Report</span>
                </div>
                <span className="material-symbols-outlined text-sm opacity-30 block">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-primary-container/10 rounded-md group transition-all outline-none border-none cursor-pointer text-on-surface">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform block">event</span>
                  <span className="text-sm font-bold">Schedule Meeting</span>
                </div>
                <span className="material-symbols-outlined text-sm opacity-30 block">chevron_right</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default DetailedStudentAnalytics;
