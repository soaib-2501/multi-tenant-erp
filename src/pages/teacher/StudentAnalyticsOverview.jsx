import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";

const studentRoster = [
  { id: 1, initials: 'AA', name: 'Arjun Agarwal', score: '94.5%', attendance: '98%', level: 'Exceptional', levelColor: 'bg-green-100 text-green-700', iconColor: 'bg-blue-100 text-blue-700' },
  { id: 2, initials: 'BP', name: 'Beatriz Pereira', score: '72.1%', attendance: '85%', level: 'Proficient', levelColor: 'bg-blue-100 text-blue-700', iconColor: 'bg-purple-100 text-purple-700' },
  { id: 3, initials: 'CL', name: 'Caleb Lewis', score: '45.8%', attendance: '72%', level: 'Critical', levelColor: 'bg-red-100 text-red-700', iconColor: 'bg-orange-100 text-orange-700' },
  { id: 4, initials: 'DM', name: 'David Miller', score: '64.0%', attendance: '92%', level: 'Emerging', levelColor: 'bg-surface-container-high text-slate-600', iconColor: 'bg-slate-100 text-slate-700' }
];

const StudentAnalyticsOverview = () => {
  const navigate = useNavigate();

  return (
    <MainLayout title="Student Analytics">
      <div className="p-4 md:p-8 bg-surface space-y-8 max-w-7xl mx-auto w-full">
        {/* Header Section with Actions */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-on-surface">Student Analytics</h1>
            <p className="text-on-surface-variant font-medium mt-1">Class 12-B | Semester 2 Insights</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-primary font-semibold rounded-md transition-all active:scale-95 outline-none border-none cursor-pointer">
              <span className="material-symbols-outlined text-xl">file_download</span> Export
            </button>
            <button

onClick={() => navigate("/teacher/analytics/student/1")}

className="px-5 py-2 bg-primary text-white rounded-md font-semibold"
>

View Detail

</button>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-surface-container-low p-4 rounded-xl flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-2xs uppercase tracking-wider font-bold text-on-surface-variant mb-1 ml-1">Class</label>
            <select className="w-full bg-surface-container-lowest border-none rounded-md text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer py-2 px-3">
              <option>Class 12</option>
              <option>Class 11</option>
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-2xs uppercase tracking-wider font-bold text-on-surface-variant mb-1 ml-1">Section</label>
            <select className="w-full bg-surface-container-lowest border-none rounded-md text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer py-2 px-3">
              <option>Section B</option>
              <option>Section A</option>
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-2xs uppercase tracking-wider font-bold text-on-surface-variant mb-1 ml-1">Subject</label>
            <select className="w-full bg-surface-container-lowest border-none rounded-md text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer py-2 px-3">
              <option>Advanced Physics</option>
              <option>Calculus III</option>
              <option>Organic Chemistry</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-2xs uppercase tracking-wider font-bold text-on-surface-variant mb-1 ml-1">Time Range</label>
            <select className="w-full bg-surface-container-lowest border-none rounded-md text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none cursor-pointer py-2 px-3">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>
        </section>

        {/* Summary Metrics: Bento Style */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <p className="text-sm font-semibold text-on-surface-variant">Average Score</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-3xl font-extrabold font-display">78.4<span className="text-lg font-bold text-slate-400">%</span></h2>
              <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-1.5 py-0.5 rounded">+2.4%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">vs Last Month</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#6b38d4]/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <p className="text-sm font-semibold text-on-surface-variant">Avg Attendance</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-3xl font-extrabold font-display">92.1<span className="text-lg font-bold text-slate-400">%</span></h2>
              <span className="text-xs font-bold text-red-600 flex items-center bg-red-50 px-1.5 py-0.5 rounded">-0.8%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">vs School Average</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#924700]/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <p className="text-sm font-semibold text-on-surface-variant">Assignment Rate</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-3xl font-extrabold font-display">85.0<span className="text-lg font-bold text-slate-400">%</span></h2>
            </div>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#924700] h-full w-[85%] rounded-full"></div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg border-l-4 border-red-500 shadow-sm relative overflow-hidden group">
            <p className="text-sm font-semibold text-red-600">Needing Attention</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-3xl font-extrabold font-display">06</h2>
              <span className="text-sm font-bold text-on-surface-variant">Students</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">High risk of grade drop</p>
          </div>
        </section>

        {/* AI Insight & Weak Topics Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insight Panel */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#23005c] to-[#8455ef] p-[1px] rounded-xl shadow-xl">
            <div className="bg-slate-900/90 rounded-xl p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#ffb786]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                  <h3 className="text-white font-display font-bold text-lg">AI Performance Insight</h3>
                </div>
                <p className="text-blue-100/80 leading-relaxed text-sm">
                  Class performance in <span className="text-white font-bold">Thermodynamics</span> has dipped by 12% compared to the previous cohort. This correlates with a lower assignment completion rate in lab practicals.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-md">
                    <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                    <p className="text-xs text-blue-50">Schedule a remedial session for "Entropy Calculation" next Tuesday.</p>
                  </div>
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-md">
                    <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                    <p className="text-xs text-blue-50">5 students are excelling; consider them for the Physics Olympiad track.</p>
                  </div>
                </div>
              </div>
              <button className="mt-6 text-blue-300 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 outline-none border-none cursor-pointer bg-transparent w-max">
                Generate detailed report <span className="material-symbols-outlined text-sm block">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Weak Topics Panel */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="text-lg font-bold font-display mb-4">Critical Concept Gaps</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface">Wave Optics</span>
                  <span className="text-xs text-on-surface-variant">42% Understanding</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[42%]"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-on-surface">Electromagnetism</span>
                  <span class="text-xs text-on-surface-variant">58% Understanding</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-20 bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div class="bg-[#924700] h-full w-[58%]"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-on-surface">Quantum Mechanics</span>
                  <span class="text-xs text-on-surface-variant">61% Understanding</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-20 bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div class="bg-primary h-full w-[61%]"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-[#ffdcc6]/30 rounded-lg border border-[#924700]/10">
              <p className="text-xs font-bold text-[#723600] uppercase tracking-tighter mb-1">Teacher Recommendation</p>
              <p className="text-xs font-medium text-[#b75b00] italic">"Focus on visual simulations for Wave Optics to improve conceptual retention."</p>
            </div>
          </div>
        </section>

        {/* Chart Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-surface-container-lowest p-6 rounded-xl h-80 flex flex-col shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold font-display">Performance Trends</h3>
              <div className="flex items-center gap-4 text-2xs font-bold uppercase text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span> This Year</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Prev Year</span>
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 flex flex-col justify-between">
                <div className="border-b border-slate-100 h-0 w-full"></div>
                <div className="border-b border-slate-100 h-0 w-full"></div>
                <div className="border-b border-slate-100 h-0 w-full"></div>
                <div className="border-b border-slate-100 h-0 w-full"></div>
              </div>
              {/* Simulated Chart Path using basic SVG */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M0,160 Q100,120 200,140 T400,60 T600,80 T800,20" fill="none" stroke="url(#gradient-line)" strokeLinecap="round" strokeWidth="4"></path>
                <defs>
                  <linearGradient id="gradient-line" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#0058be"></stop>
                    <stop offset="100%" stopColor="#8455ef"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex justify-between mt-4 px-2">
              <span className="text-2xs font-bold text-slate-400">SEP</span>
              <span className="text-2xs font-bold text-slate-400">NOV</span>
              <span className="text-2xs font-bold text-slate-400">JAN</span>
              <span className="text-2xs font-bold text-slate-400">MAR</span>
              <span className="text-2xs font-bold text-slate-400">MAY</span>
            </div>
          </div>
          
          {/* Bar Chart: Subject Comparison */}
          <div className="bg-surface-container-lowest p-6 rounded-xl h-80 flex flex-col shadow-sm border border-outline-variant/10">
            <h3 className="text-lg font-bold font-display mb-8">Subject Comparison</h3>
            <div className="flex-1 flex items-end justify-between gap-4 px-4">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-primary/10 rounded-t-lg h-[65%] relative group">
                  <div className="absolute inset-0 bg-primary rounded-t-lg scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300"></div>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary">65%</span>
                </div>
                <span className="text-2xs font-bold text-on-surface-variant">MATH</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-primary/10 rounded-t-lg h-[88%] relative group">
                  <div className="absolute inset-0 bg-primary rounded-t-lg scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300"></div>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary">88%</span>
                </div>
                <span className="text-2xs font-bold text-on-surface-variant">PHYS</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-primary/10 rounded-t-lg h-[45%] relative group">
                  <div className="absolute inset-0 bg-red-500 rounded-t-lg scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300"></div>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500">45%</span>
                </div>
                <span className="text-2xs font-bold text-on-surface-variant">CHEM</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-primary/10 rounded-t-lg h-[72%] relative group">
                  <div className="absolute inset-0 bg-primary rounded-t-lg scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300"></div>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary">72%</span>
                </div>
                <span className="text-2xs font-bold text-on-surface-variant">BIO</span>
              </div>
            </div>
          </div>
        </section>

        {/* Student Performance Table */}
        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="p-6 border-b border-surface-container flex items-center justify-between">
            <h3 className="text-xl font-bold font-display">Student Performance Roster</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-surface-container rounded-md transition-colors border-none outline-none cursor-pointer bg-transparent text-slate-400">
                <span className="material-symbols-outlined text-xl block">filter_list</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-surface-container-low/50">
                <tr>
                  <th className="px-6 py-4 text-2xs font-bold uppercase tracking-widest text-slate-500">Name</th>
                  <th className="px-6 py-4 text-2xs font-bold uppercase tracking-widest text-slate-500">Avg Score</th>
                  <th className="px-6 py-4 text-2xs font-bold uppercase tracking-widest text-slate-500">Attendance %</th>
                  <th className="px-6 py-4 text-2xs font-bold uppercase tracking-widest text-slate-500">Level</th>
                  <th className="px-6 py-4 text-2xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/50">
                {studentRoster.map(student => (
                   <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${student.iconColor}`}>{student.initials}</div>
                         <span className="text-sm font-semibold">{student.name}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-sm font-medium">{student.score}</td>
                     <td className="px-6 py-4 text-sm font-medium">{student.attendance}</td>
                     <td className="px-6 py-4">
                       <span className={`px-3 py-1 text-2xs font-extrabold rounded-full uppercase ${student.levelColor}`}>{student.level}</span>
                     </td>
                     <td className="px-6 py-4">
                       <button onClick={() => navigate('/analytics/student/1')} className="text-primary hover:underline text-xs font-bold border-none outline-none cursor-pointer bg-transparent">Details</button>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-surface-container-low/30 flex items-center justify-center border-t border-surface-container">
            <button className="text-slate-500 text-xs font-bold hover:text-primary flex items-center gap-1 border-none outline-none cursor-pointer bg-transparent">
              Load more students <span className="material-symbols-outlined text-sm block">keyboard_arrow_down</span>
            </button>
          </div>
        </section>

      </div>
    </MainLayout>
  );
};

export default StudentAnalyticsOverview;
