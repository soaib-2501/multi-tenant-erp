import React from 'react';
import MainLayout from "../../components/erp/teacher/MainLayout";

const TeacherNotificationsHub = () => {
  return (
    <MainLayout title="The Academic Architect">
      <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)] relative">
        <div className="flex-1 max-w-5xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-1">
              <h2 className="text-4xl font-extrabold font-display text-on-surface tracking-tight">Notifications</h2>
              <p className="text-on-surface-variant font-medium text-sm">Manage your alerts, updates, and classroom insights.</p>
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap">
              <span className="material-symbols-outlined text-lg">done_all</span>
              Mark all as read
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-2xl w-fit mb-8 overflow-x-auto max-w-full">
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white text-primary shadow-sm transition-all whitespace-nowrap">All</button>
            <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-white/50 transition-all whitespace-nowrap">Assignments</button>
            <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-white/50 transition-all whitespace-nowrap">Attendance</button>
            <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-white/50 transition-all whitespace-nowrap">System</button>
          </div>

          {/* Notification List */}
          <div className="space-y-4">
            
            {/* Today Section */}
            <div className="pt-2 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 px-2">Today</h3>
            </div>

            {/* Assignment Card */}
            <div className="group bg-surface-container-lowest p-6 rounded-2xl flex items-start gap-5 transition-all hover:bg-surface-container-low relative border border-transparent hover:border-outline-variant/15 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary shadow-inner shrink-0 hidden sm:flex">
                <span className="material-symbols-outlined">assignment_turned_in</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lg text-on-surface font-display leading-tight">Assignment Submitted</h4>
                  <span className="text-xs font-medium text-on-surface-variant/70 whitespace-nowrap ml-2">2 min ago</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed font-medium text-sm sm:text-base">12 students from <span className="text-primary font-semibold">Advanced Calculus (Sec-A)</span> have submitted their midterm projects.</p>
                <div className="flex items-center gap-3 pt-2">
                  <button className="px-4 py-1.5 bg-surface-container-high text-primary text-xs font-bold rounded-lg hover:bg-primary-container hover:text-white transition-all">View related page</button>
                  <button className="p-1.5 text-on-surface-variant hover:text-error transition-colors outline-none cursor-pointer">
                    <span className="material-symbols-outlined text-lg block">delete</span>
                  </button>
                </div>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,88,190,0.5)]"></div>
            </div>

            {/* Low Attendance Card */}
            <div className="group bg-surface-container-lowest p-6 rounded-2xl flex items-start gap-5 transition-all hover:bg-surface-container-low relative border border-transparent hover:border-outline-variant/15 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-error shadow-inner shrink-0 hidden sm:flex">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lg text-on-surface font-display leading-tight">Low Attendance Alert</h4>
                  <span className="text-xs font-medium text-on-surface-variant/70 whitespace-nowrap ml-2">1 hour ago</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed font-medium text-sm sm:text-base">Critical drop in attendance for <span className="text-primary font-semibold">History of Arts</span>. 15% of students missed more than 3 sessions this week.</p>
                <div className="flex items-center gap-3 pt-2">
                  <button className="px-4 py-1.5 bg-surface-container-high text-primary text-xs font-bold rounded-lg hover:bg-primary-container hover:text-white transition-all">Check Analytics</button>
                </div>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,88,190,0.5)]"></div>
            </div>

            {/* System Insight Card */}
            <div className="group bg-surface-container-lowest p-6 rounded-2xl flex items-start gap-5 transition-all hover:bg-surface-container-low border border-transparent hover:border-outline-variant/15 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#6b38d4] shadow-inner shrink-0 hidden sm:flex">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lg text-on-surface font-display leading-tight">AI Insight: Engagement Growth</h4>
                  <span className="text-xs font-medium text-on-surface-variant/70 whitespace-nowrap ml-2">4 hours ago</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed font-medium text-sm sm:text-base">Student engagement in your <span className="text-primary font-semibold">Intro to Sociology</span> course has increased by 24% following the new resource upload.</p>
                <div className="flex items-center gap-3 pt-2">
                  <button className="px-4 py-1.5 bg-surface-container-high text-primary text-xs font-bold rounded-lg hover:bg-primary-container hover:text-white transition-all">View Details</button>
                </div>
              </div>
            </div>

            {/* Yesterday Section */}
            <div className="pt-6 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 px-2">Yesterday</h3>
            </div>

            {/* Schedule Change Card */}
            <div className="group opacity-70 bg-surface-container-lowest p-6 rounded-2xl flex items-start gap-5 transition-all hover:opacity-100 hover:bg-surface-container-low shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner shrink-0 hidden sm:flex">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lg text-on-surface font-display leading-tight">Schedule Update</h4>
                  <span className="text-xs font-medium text-on-surface-variant/70 whitespace-nowrap ml-2">1 day ago</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed font-medium text-sm sm:text-base">The Faculty Meeting scheduled for tomorrow has been moved to <span class="text-primary font-semibold">10:00 AM</span> in Hall B.</p>
              </div>
            </div>

            {/* Grade Report Card */}
            <div className="group opacity-70 bg-surface-container-lowest p-6 rounded-2xl flex items-start gap-5 transition-all hover:opacity-100 hover:bg-surface-container-low shadow-sm mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner shrink-0 hidden sm:flex">
                <span className="material-symbols-outlined">fact_check</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lg text-on-surface font-display leading-tight">Grade Verification Required</h4>
                  <span className="text-xs font-medium text-on-surface-variant/70 whitespace-nowrap ml-2">1 day ago</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed font-medium text-sm sm:text-base">Please verify the final grades for <span className="text-primary font-semibold">Computational Theory</span> before the registrar deadline.</p>
                <div className="flex items-center gap-3 pt-2">
                  <button className="px-4 py-1.5 bg-surface-container-high text-primary text-xs font-bold rounded-lg hover:bg-primary-container hover:text-white transition-all">Go to Grades</button>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State / Load More */}
          <div className="mt-12 flex flex-col items-center justify-center p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-b from-surface-container-low to-transparent">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-primary/30 text-3xl">history</span>
            </div>
            <p className="text-on-surface-variant font-semibold text-center mb-6 max-w-xs text-sm sm:text-base">You've reached the end of your recent notifications from the last 7 days.</p>
            <button className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all outline-none text-sm cursor-pointer border-none bg-transparent">Load older notifications</button>
          </div>
        </div>

        {/* Side Intelligence Panel (Desktop Only) */}
        <div className="hidden xl:flex w-80 flex-col px-4 sticky top-6 self-start space-y-8">
          <section>
            <h3 className="font-display font-extrabold text-on-surface text-lg mb-4 pl-1">AI Digest</h3>
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 bg-orange-50 rounded-bl-xl">
                <span className="material-symbols-outlined text-[#924700] text-sm">auto_awesome</span>
              </div>
              <p className="text-xs font-bold text-[#b75b00] tracking-widest uppercase mt-2">Intelligent Highlight</p>
              <p className="text-sm text-on-surface-variant font-medium leading-snug">Students are most active between 8 PM and 10 PM. Consider scheduling your automated assignment release for 7:45 PM.</p>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-[#924700] w-3/4"></div>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="font-display font-extrabold text-on-surface text-lg mb-4 pl-1">Quick Stats</h3>
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface-variant">Unread Alerts</span>
                <span className="px-2.5 py-1 bg-primary text-white text-2xs font-black rounded-full">03</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface-variant">Avg. Response Time</span>
                <span className="text-sm font-bold text-on-surface">1.2 hrs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface-variant">Action Required</span>
                <span className="text-sm font-bold text-error">01</span>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="rounded-2xl overflow-hidden aspect-[4/5] relative group shadow-sm">
              <img alt="Academic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLdgdUrfwSiSjAT53NLo3ARK_QsoMp1MOEGfry15KtzjY9DMBz4ekHGxGwUSAB7Lzc1i_tRYDhysdiy8dyqcPdoYkJ15SWQ4_v282WB666CTkYhmI7jgUuVrcpZXNV-0L0pqIJq8EfpRmw4i4oSaT_j6uO19dwkhLJnN4mGwccZm3ZEgOQtiuNuJO7BK0j414A9Ppxo4s4tBvc-IrF_gxHyVvdFzn2pC8Eo0PbP7iSzLN95cx5UeOYfx53iHSkLLsrDfK60KZtJQ" className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-display font-bold text-lg leading-tight">Academic Year 2024</p>
                <p className="text-white/70 text-xs font-medium mt-1">Portal Maintenance scheduled for Sunday 2 AM.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherNotificationsHub;
