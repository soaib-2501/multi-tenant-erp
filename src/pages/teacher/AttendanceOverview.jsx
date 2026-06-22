import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { getMyProfile, getTeacherClasses, getAttendanceRecords } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { RevalidatingBar, SkeletonBlock } from "../../components/erp/teacher/LoadingPrimitives";

const AttendanceStatSkeleton = () => (
  <>
    <SkeletonBlock className="h-11 w-24 bg-white/25" />
    <SkeletonBlock className="h-4 w-32 mt-4 bg-white/25" />
  </>
);

const AttendanceClassSkeleton = () => (
  <div className="bg-surface-container-lowest rounded-xl p-5 flex flex-col sm:flex-row sm:items-center shadow-sm gap-4">
    <SkeletonBlock className="w-14 h-14 rounded-xl shrink-0" />
    <div className="flex-grow space-y-2">
      <SkeletonBlock className="h-5 w-44" />
      <SkeletonBlock className="h-4 w-32" />
    </div>
    <SkeletonBlock className="h-10 w-32 rounded-md sm:ml-6" />
    <SkeletonBlock className="h-10 w-28 rounded-xl sm:ml-2" />
  </div>
);

const AttendanceOverview = () => {
  const navigate = useNavigate();

  const { data: profileData } = useStaleData("profile:me", getMyProfile);
  const teacherId = profileData?.profiles?.teacher?.id || profileData?.identity?.id;

  const { data: assignmentsData, loading: classesLoading, revalidating: classesRevalidating } = useStaleData(
    `teacher:classes:${teacherId}`,
    () => getTeacherClasses(teacherId),
    { skip: !teacherId }
  );

  const classes = assignmentsData?.results || [];

  const { data: attendancePayload, loading: attendanceLoading, revalidating: attendanceRevalidating } = useStaleData(
    `teacher:attendance-records:${teacherId}`,
    async () => {
      if (!teacherId || classes.length === 0) return [];
      
      const sectionIds = [...new Set(classes.map(a => a.section || a.section_id))].filter(Boolean);
      const sectionPromises = sectionIds.map(sectionId => getAttendanceRecords(sectionId));
      const responses = await Promise.all(sectionPromises);
      
      let allAttendance = [];
      responses.forEach(data => {
        const records = Array.isArray(data) ? data : data.results || [];
        allAttendance = [...allAttendance, ...records];
      });
      return allAttendance;
    },
    { skip: !teacherId || classesLoading || classes.length === 0, deps: classes }
  );

  const attendanceRecords = attendancePayload || [];

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
  const academicYearName = classes[0]?.academic_year_name || "Current Session";

  // Calculations
  const totalAttendanceRecords = attendanceRecords.length;
  const totalPresent = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const avgAttendance = totalAttendanceRecords > 0
    ? ((totalPresent / totalAttendanceRecords) * 100).toFixed(1)
    : 0;

  // Weekly average calculation (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyRecords = attendanceRecords.filter(r => new Date(r.date) >= oneWeekAgo);
  const totalWeekly = weeklyRecords.length;
  const presentWeekly = weeklyRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const weeklyAvg = totalWeekly > 0 
    ? ((presentWeekly / totalWeekly) * 100).toFixed(1) 
    : avgAttendance; // Fallback to overall average if no records in last 7 days

  // Absent students count on the most recent attendance run
  const dates = attendanceRecords.map(r => r.date).filter(Boolean);
  const latestDate = dates.length > 0 ? dates.sort().reverse()[0] : null;
  const latestRecords = latestDate ? attendanceRecords.filter(r => r.date === latestDate) : [];
  const absentLatest = latestRecords.filter(r => r.status === 'Absent').length;

  // Distribution calculations
  const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
  const leaveCount = attendanceRecords.filter(r => r.status === 'Excused' || r.status === 'Leave').length;

  const presentPct = totalAttendanceRecords > 0 ? Math.round((presentCount / totalAttendanceRecords) * 100) : 0;
  const latePct = totalAttendanceRecords > 0 ? Math.round((lateCount / totalAttendanceRecords) * 100) : 0;
  const leavePct = totalAttendanceRecords > 0 ? Math.round((leaveCount / totalAttendanceRecords) * 100) : 0;

  // Group attendance records by date and calculate percentage for each date for trend
  const recordsByDate = {};
  attendanceRecords.forEach(r => {
    if (!r.date) return;
    if (!recordsByDate[r.date]) {
      recordsByDate[r.date] = { present: 0, total: 0 };
    }
    recordsByDate[r.date].total += 1;
    if (r.status === 'Present' || r.status === 'Late') {
      recordsByDate[r.date].present += 1;
    }
  });

  const sortedDates = Object.keys(recordsByDate).sort();
  const trendDates = sortedDates.slice(-5);
  const trendData = trendDates.map(date => {
    const { present, total } = recordsByDate[date];
    return {
      date,
      pct: total > 0 ? Math.round((present / total) * 100) : 0
    };
  });

  const svgHeight = 40;
  const svgWidth = 100;
  let pathD = "";
  if (trendData.length > 0) {
    const points = trendData.map((d, index) => {
      const x = (index / (trendData.length - 1)) * svgWidth;
      const y = svgHeight - 5 - (d.pct / 100) * (svgHeight - 10);
      return `${x},${y}`;
    });
    pathD = `M ${points.join(' L ')}`;
  }

  return (
    <MainLayout title="The Academic Architect">
      <RevalidatingBar show={classesRevalidating || attendanceRevalidating} />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-extrabold text-on-surface font-display tracking-tight">Attendance Overview</h2>
          <p className="text-xs md:text-base text-on-surface-variant font-medium mt-1">Academic Session: {academicYearName} • {formattedDate}</p>
        </div>
        {/* Commented out bulk marking and export report
        <div className="flex space-x-3">
          <button className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-[#0058be] font-semibold bg-[#eff4ff] hover:bg-[#d8e2ff] transition-colors text-sm">
            <span className="material-symbols-outlined text-xl">file_download</span>
            <span>Export Report</span>
          </button>
          <button 
            onClick={() => navigate("/teacher/attendance/mark")}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#0058be] to-[#2170e4] shadow-md active:scale-95 duration-150 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-xl">fact_check</span>
            <span>Mark Attendance</span>
          </button>
        </div>
        */}
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <Card className="flex flex-col justify-between relative overflow-hidden group shadow-lg bg-gradient-to-br from-[#0058be] to-[#0044a0] border-none text-center">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-2xs md:text-sm font-semibold text-blue-100 mb-1 uppercase tracking-wider">Average Attendance</p>
            {attendanceLoading && !attendancePayload ? (
              <AttendanceStatSkeleton />
            ) : (
              <h3 className="text-3xl md:text-4xl font-extrabold text-white">{`${avgAttendance}%`}</h3>
            )}
          </div>
          {!(attendanceLoading && !attendancePayload) && (
            <div className="mt-3 md:mt-4 flex items-center justify-center text-2xs md:text-xs font-bold text-green-300 relative z-10">
              <span className="material-symbols-outlined text-sm md:text-[16px] mr-1">trending_up</span>
              <span>{`${totalAttendanceRecords} total records`}</span>
            </div>
          )}
        </Card>

        <Card className="flex flex-col justify-between relative overflow-hidden group shadow-lg bg-gradient-to-br from-[#6b38d4] to-[#5527b0] border-none text-center">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-2xs md:text-sm font-semibold text-purple-100 mb-1 uppercase tracking-wider">Weekly Avg</p>
            {attendanceLoading && !attendancePayload ? (
              <AttendanceStatSkeleton />
            ) : (
              <h3 className="text-3xl md:text-4xl font-extrabold text-white">{`${weeklyAvg}%`}</h3>
            )}
          </div>
          {!(attendanceLoading && !attendancePayload) && (
            <div className="mt-3 md:mt-4 flex items-center justify-center text-2xs md:text-xs font-bold text-purple-200 relative z-10">
              <span className="material-symbols-outlined text-sm md:text-[16px] mr-1">history</span>
              <span className="hidden md:inline">{`${weeklyRecords.length} records in last 7 days`}</span>
              <span className="md:hidden">{`${weeklyRecords.length} in 7 days`}</span>
            </div>
          )}
        </Card>

        <Card className="flex flex-col justify-between relative overflow-hidden group shadow-lg bg-gradient-to-br from-[#dc2626] to-[#b91c1c] border-none text-center">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-2xs md:text-sm font-semibold text-red-100 mb-1 uppercase tracking-wider">Absent Students</p>
            {attendanceLoading && !attendancePayload ? (
              <AttendanceStatSkeleton />
            ) : (
              <h3 className="text-3xl md:text-4xl font-extrabold text-white">{absentLatest}</h3>
            )}
          </div>
          {!(attendanceLoading && !attendancePayload) && (
            <div className="mt-3 md:mt-4 flex items-center justify-center text-2xs md:text-xs font-bold text-red-200 relative z-10">
              <span className="material-symbols-outlined text-sm md:text-[16px] mr-1">warning</span>
              <span className="hidden md:inline">{latestDate ? `On latest run (${latestDate})` : 'No records yet'}</span>
              <span className="md:hidden">{latestDate ? `Latest run` : 'No records'}</span>
            </div>
          )}
        </Card>
      </div>

      {/* Intelligent Insights (Asymmetric Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Class List Section (8 cols) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-base md:text-xl font-bold text-on-surface">Scheduled Classes Today</h3>
            <span className="text-2xs md:text-sm font-medium text-primary bg-primary/10 px-2 md:px-3 py-1 rounded md:rounded-full">{classes.length} Classes Total</span>
          </div>
          <div className="space-y-3 md:space-y-4">
            
            {classesLoading && classes.length === 0 ? (
              Array.from({ length: 4 }).map((_, index) => <AttendanceClassSkeleton key={index} />)
            ) : classes.length === 0 ? (
              <div className="p-5 text-center text-slate-500 font-semibold bg-surface-container-lowest rounded-xl shadow-sm">No classes scheduled for today.</div>
            ) : (
              classes.map((cls, idx) => {
                const colors = ['blue', 'purple', 'orange', 'green', 'rose'];
                const icons = ['calculate', 'science', 'menu_book', 'computer', 'history_edu'];
                const color = colors[idx % colors.length];
                const icon = icons[idx % icons.length];

                return (
                  <div key={cls.id} className="bg-surface-container-lowest rounded-xl p-3 md:p-5 shadow-sm hover:shadow-md transition-shadow group">
                    {/* Mobile Layout */}
                    <div className="flex md:hidden flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-${color}-50 flex items-center justify-center text-${color}-600 shrink-0`}>
                          <span className="material-symbols-outlined text-2xl">{icon}</span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-on-surface text-sm leading-tight">{cls.subject_name}</h4>
                          <p className="text-2xs text-on-surface-variant">{cls.class_level_name} - {cls.section_name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/teacher/attendance/mark/${cls.id}`)}
                          className="flex-1 px-3 py-2 bg-primary text-white rounded-md font-semibold text-2xs hover:opacity-90 transition"
                        >
                          Mark Attendance
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/classes/${cls.id}/performance`)}
                          className="flex-1 px-3 py-2 rounded-md bg-surface-container-high text-primary font-bold text-2xs hover:bg-primary hover:text-white transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 shrink-0`}>
                        <span className="material-symbols-outlined text-3xl">{icon}</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-on-surface text-lg">{cls.subject_name}</h4>
                        <p className="text-sm text-on-surface-variant">{cls.class_level_name} - {cls.section_name}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/teacher/attendance/mark/${cls.id}`)}
                        className="px-5 py-2 bg-primary text-white rounded-md font-semibold text-sm hover:opacity-90 transition whitespace-nowrap ml-6"
                      >
                        Mark Attendance
                      </button>
                      <button
                        onClick={() => navigate(`/teacher/classes/${cls.id}/performance`)}
                        className="ml-2 px-5 py-2 rounded-xl bg-surface-container-high text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Side Insight Section (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Intelligence Insight - Commented out
          <div className="bg-orange-50 p-6 rounded-xl relative overflow-hidden border border-amber-900/10">
            <div className="absolute top-0 right-0 p-4">
              <span className="material-symbols-outlined text-amber-900/20 text-4xl">psychology</span>
            </div>
            <h4 className="text-[#924700] font-bold text-lg mb-2 flex items-center relative z-10">
              <span className="material-symbols-outlined mr-2 text-xl">auto_awesome</span>
              Attendance AI Insight
            </h4>
            <p className="text-[#723600] text-sm leading-relaxed mb-4 relative z-10">
              James Miller has missed 3 consecutive Lab sessions. This correlates with a 15% drop in his last quiz performance.
            </p>
            <button className="text-xs font-bold text-[#924700] underline decoration-[#b75b00]/30 underline-offset-4 hover:decoration-[#924700] transition-all relative z-10">
              Review Intervention Plan
            </button>
          </div>
          */}

          {/* Attendance Distribution */}
          <Card className="shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 border-none">
            <h4 className="font-bold text-white mb-6">Presence Distribution</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Physical Presence</span>
                  <span className="text-blue-400">{presentPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${presentPct}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Late Arrivals</span>
                  <span className="text-amber-400">{latePct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${latePct}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Authorized Leaves</span>
                  <span className="text-purple-400">{leavePct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${leavePct}%` }}></div>
                </div>
              </div>
            </div>

            {/* Attendance Trends Line Chart */}
            {trendData.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-700">
                <h5 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Attendance Trends</h5>
                <div className="w-full h-[80px] relative">
                  <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#trendGradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="trendGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex justify-between text-3xs font-bold text-slate-400 mt-2 px-1">
                  {trendData.map((d, idx) => {
                    const dateObj = new Date(d.date);
                    const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <div key={idx} className="text-center">
                        <div>{label}</div>
                        <div className="text-blue-400 font-black mt-0.5">{d.pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Quick Contact */}
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <h4 className="font-bold text-on-surface text-sm mb-3">Notify Guardians</h4>
            <p className="text-xs text-on-surface-variant mb-4">Send automatic alerts for the absent students today.</p>
            <button className="w-full py-2.5 bg-white text-primary border border-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all">
              Send Notifications
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AttendanceOverview;
