import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../../components/erp/parent/DashboardLayout';
import { useParent } from '../../context/ParentProvider';
import api from '../../services/axiosClient';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS      = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SHORT_DAYS= ['Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_IDX   = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };

const todayName = () => {
  const d = new Date().getDay();
  return DAYS.find(day => DAY_IDX[day] === d) || 'Monday';
};

const parseTime = (str) => {
  if (!str) return 0;
  const s = str.trim();
  const ampm = /([ap]m)/i.exec(s);
  const parts = s.replace(/[ap]m/i,'').trim().split(':');
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || '0', 10);
  if (ampm) {
    const sf = ampm[1].toLowerCase();
    if (sf === 'pm' && h !== 12) h += 12;
    if (sf === 'am' && h === 12) h = 0;
  }
  return h * 60 + m;
};

const formatTime = (str) => {
  if (!str) return '';
  const mins = parseTime(str);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const sf = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${sf}`;
};

const nowMins = () => { const n = new Date(); return n.getHours()*60 + n.getMinutes(); };
const isOngoing  = l => l?.start_time && l?.end_time && parseTime(l.start_time) <= nowMins() && nowMins() < parseTime(l.end_time);
const isUpcoming = l => l?.start_time && parseTime(l.start_time) > nowMins();

// ── Subject colours (deterministic) ──────────────────────────────────────────
const PALETTE = [
  { bg:'#EEF2FF', text:'#3730A3', border:'#A5B4FC', dot:'#6366F1' },
  { bg:'#ECFDF5', text:'#065F46', border:'#6EE7B7', dot:'#10B981' },
  { bg:'#EFF6FF', text:'#1E40AF', border:'#93C5FD', dot:'#3B82F6' },
  { bg:'#FFF7ED', text:'#9A3412', border:'#FDB87A', dot:'#F97316' },
  { bg:'#FDF4FF', text:'#6B21A8', border:'#D8B4FE', dot:'#A855F7' },
  { bg:'#FFF1F2', text:'#9F1239', border:'#FDA4AF', dot:'#F43F5E' },
  { bg:'#F0FDF4', text:'#166534', border:'#86EFAC', dot:'#22C55E' },
];
const colorMap = {}; let cIdx = 0;
const subjectColor = name => { if (!colorMap[name]) { colorMap[name] = PALETTE[cIdx++ % PALETTE.length]; } return colorMap[name]; };

const TYPE_META = {
  Theory:   { label:'Theory',   bg:'bg-blue-50',   text:'text-blue-700',   icon:'menu_book'  },
  Lab:      { label:'Lab',      bg:'bg-green-50',  text:'text-green-700',  icon:'science'    },
  Tutorial: { label:'Tutorial', bg:'bg-amber-50',  text:'text-amber-700',  icon:'edit_note'  },
};
const getType = t => TYPE_META[t] || { label: t||'Lecture', bg:'bg-slate-50', text:'text-slate-600', icon:'school' };

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK = {
  Monday:[
    {id:1, subject_name:'Data Structures',   faculty_name:'Dr. Priya Sharma',  start_time:'09:00',end_time:'10:00',classroom:'Room 301',lecture_type:'Theory'},
    {id:2, subject_name:'Mathematics III',   faculty_name:'Prof. Arjun Mehta', start_time:'10:15',end_time:'11:15',classroom:'Room 202',lecture_type:'Theory'},
    {id:3, subject_name:'Computer Networks', faculty_name:'Dr. Sneha Patel',   start_time:'11:30',end_time:'13:30',classroom:'Lab B2',  lecture_type:'Lab'},
    {id:4, subject_name:'Operating Systems', faculty_name:'Dr. Ravi Kumar',    start_time:'14:00',end_time:'15:00',classroom:'Room 401',lecture_type:'Theory'},
    {id:5, subject_name:'Data Structures',   faculty_name:'Dr. Priya Sharma',  start_time:'15:15',end_time:'16:15',classroom:'Room 301',lecture_type:'Tutorial'},
  ],
  Tuesday:[
    {id:6, subject_name:'Computer Networks', faculty_name:'Dr. Sneha Patel',   start_time:'09:00',end_time:'10:00',classroom:'Room 401',lecture_type:'Theory'},
    {id:7, subject_name:'Operating Systems', faculty_name:'Dr. Ravi Kumar',    start_time:'10:15',end_time:'12:15',classroom:'Lab C1',  lecture_type:'Lab'},
    {id:8, subject_name:'Mathematics III',   faculty_name:'Prof. Arjun Mehta', start_time:'14:00',end_time:'15:00',classroom:'Room 202',lecture_type:'Tutorial'},
    {id:9, subject_name:'DBMS',              faculty_name:'Dr. Anita Singh',   start_time:'15:15',end_time:'16:15',classroom:'Room 105',lecture_type:'Theory'},
  ],
  Wednesday:[
    {id:10,subject_name:'Data Structures',   faculty_name:'Dr. Priya Sharma',  start_time:'09:00',end_time:'10:00',classroom:'Room 301',lecture_type:'Theory'},
    {id:11,subject_name:'DBMS',              faculty_name:'Dr. Anita Singh',   start_time:'10:15',end_time:'11:15',classroom:'Room 105',lecture_type:'Theory'},
    {id:12,subject_name:'DBMS',              faculty_name:'Dr. Anita Singh',   start_time:'11:30',end_time:'13:30',classroom:'Lab A1',  lecture_type:'Lab'},
    {id:13,subject_name:'Computer Networks', faculty_name:'Dr. Sneha Patel',   start_time:'14:00',end_time:'15:00',classroom:'Room 401',lecture_type:'Tutorial'},
  ],
  Thursday:[
    {id:14,subject_name:'Mathematics III',   faculty_name:'Prof. Arjun Mehta', start_time:'09:00',end_time:'10:00',classroom:'Room 202',lecture_type:'Theory'},
    {id:15,subject_name:'Operating Systems', faculty_name:'Dr. Ravi Kumar',    start_time:'10:15',end_time:'11:15',classroom:'Room 401',lecture_type:'Theory'},
    {id:16,subject_name:'DBMS',              faculty_name:'Dr. Anita Singh',   start_time:'14:00',end_time:'15:00',classroom:'Room 105',lecture_type:'Tutorial'},
    {id:17,subject_name:'Data Structures',   faculty_name:'Dr. Priya Sharma',  start_time:'15:15',end_time:'16:15',classroom:'Room 301',lecture_type:'Tutorial'},
  ],
  Friday:[
    {id:18,subject_name:'Operating Systems', faculty_name:'Dr. Ravi Kumar',    start_time:'09:00',end_time:'10:00',classroom:'Room 401',lecture_type:'Theory'},
    {id:19,subject_name:'DBMS',              faculty_name:'Dr. Anita Singh',   start_time:'10:15',end_time:'11:15',classroom:'Room 105',lecture_type:'Theory'},
    {id:20,subject_name:'Data Structures',   faculty_name:'Dr. Priya Sharma',  start_time:'11:30',end_time:'13:30',classroom:'Lab B2',  lecture_type:'Lab'},
    {id:21,subject_name:'Mathematics III',   faculty_name:'Prof. Arjun Mehta', start_time:'14:00',end_time:'15:00',classroom:'Room 202',lecture_type:'Theory'},
  ],
  Saturday:[
    {id:22,subject_name:'Computer Networks', faculty_name:'Dr. Sneha Patel',   start_time:'09:00',end_time:'11:00',classroom:'Lab B2',  lecture_type:'Lab'},
  ],
};

// ── Weekly Gantt chart ────────────────────────────────────────────────────────
const C_START = 8*60, C_END = 18*60, C_SPAN = C_END - C_START;
const HOURS   = Array.from({length:11},(_,i)=>i+8);

function WeeklyChart({ timetable, today }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div style={{minWidth:640}}>
        {/* Hour axis */}
        <div className="flex ml-16 mb-1">
          {HOURS.map(h => (
            <div key={h} style={{flex:`0 0 ${100/HOURS.length}%`}}
              className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              {h===12?'12 PM':h>12?`${h-12} PM`:`${h} AM`}
            </div>
          ))}
        </div>

        {/* Day rows */}
        {DAYS.slice(0,5).map(day => {
          const lecs   = [...(timetable[day]||[])].sort((a,b)=>parseTime(a.start_time)-parseTime(b.start_time));
          const isTday = day===today;
          return (
            <div key={day} className="flex items-center mb-1.5">
              <div className={`w-14 shrink-0 text-right pr-2 text-[11px] font-bold ${isTday?'text-indigo-600 dark:text-indigo-400':'text-slate-400 dark:text-slate-500'}`}>
                {day.slice(0,3).toUpperCase()}
                {isTday && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mx-auto mt-0.5"/>}
              </div>
              <div className={`flex-1 relative h-9 rounded-lg border ${isTday?'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800':'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'} overflow-hidden`}>
                {/* grid lines */}
                {HOURS.map((_,i)=>(
                  <div key={i} className="absolute top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-600 opacity-50"
                    style={{left:`${(i/(HOURS.length-1))*100}%`}}/>
                ))}
                {/* now line */}
                {isTday && nowMins()>=C_START && nowMins()<=C_END && (
                  <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{left:`${((nowMins()-C_START)/C_SPAN)*100}%`}}>
                    <div className="w-2 h-2 rounded-full bg-red-500 -mt-0.5 -ml-0.5"/>
                  </div>
                )}
                {/* lecture blocks */}
                {lecs.map(lec => {
                  const s = Math.max(parseTime(lec.start_time), C_START);
                  const e = Math.min(parseTime(lec.end_time),   C_END);
                  if (s>=C_END||e<=C_START) return null;
                  const left  = ((s-C_START)/C_SPAN)*100;
                  const width = ((e-s)/C_SPAN)*100;
                  const c     = subjectColor(lec.subject_name);
                  return (
                    <div key={lec.id}
                      title={`${lec.subject_name} · ${formatTime(lec.start_time)}–${formatTime(lec.end_time)} · ${lec.classroom}`}
                      style={{position:'absolute',left:`${left}%`,width:`${width}%`,top:3,bottom:3,
                              background:c.bg,border:`1.5px solid ${c.border}`,borderRadius:5,
                              display:'flex',alignItems:'center',padding:'0 4px',overflow:'hidden'}}>
                      <span style={{fontSize:9,fontWeight:700,color:c.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'100%'}}>
                        {isOngoing(lec)?'● ':''}{lec.subject_name.split(' ').map(w=>w[0]).join('')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 ml-16 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          {Object.keys(colorMap).map(s=>(
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{background:colorMap[s].dot}}/>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{s}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-500"/>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className='' }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-slate-700 rounded-md ${className}`}/>;
}

function TimetableSkeleton() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex gap-3">
          {[1,2,3,4].map(i=><Skeleton key={i} className="flex-1 h-20 rounded-xl"/>)}
        </div>
        <div className="flex gap-2">
          {[1,2,3,4,5,6].map(i=><Skeleton key={i} className="flex-1 h-10 rounded-xl"/>)}
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i=><Skeleton key={i} className="w-full h-20 rounded-xl"/>)}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Child Selector (shared parent portal pattern) ─────────────────────────────
function ChildSelector({ students, activeChild, switchChild }) {
  const [open, setOpen] = useState(false);

  if (!students || students.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-sm font-semibold text-gray-900 dark:text-white"
      >
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {(activeChild?.name || 'S')[0].toUpperCase()}
        </span>
        <span className="truncate max-w-[140px]">{activeChild?.name || 'Select child'}</span>
        <span className="material-symbols-outlined text-base text-gray-400">{open ? 'expand_less' : 'expand_more'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1.5 z-40 w-64 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl py-1.5 animate-[fadeIn_0.15s_ease]">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Select child
            </p>
            {students.map((child) => (
              <button
                key={child.id}
                onClick={() => { switchChild(child.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors
                  ${child.id === activeChild?.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${child.id === activeChild?.id
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                  }`}>
                  {(child.name || 'S')[0].toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{child.name}</p>
                  {child.enrollment_number && (
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{child.enrollment_number}</p>
                  )}
                </div>
                {child.id === activeChild?.id && (
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-base ml-auto shrink-0">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ParentTimetable() {
  const {
    activeChild,
    activeChildId,
    students,
    switchChild,
    loading: parentLoading,
    enrollment,
  } = useParent();

  const today = todayName();
  const [activeDay,  setActiveDay]  = useState(today);
  const [slideDir,   setSlideDir]   = useState('right');
  const [animating,  setAnimating]  = useState(false);
  const [timetable,  setTimetable]  = useState({});
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [tick,       setTick]       = useState(0);
  const [viewMode,   setViewMode]   = useState('list'); // 'list' | 'chart'

  // Clock tick for live badge
  useEffect(()=>{ const id=setInterval(()=>setTick(t=>t+1),60_000); return()=>clearInterval(id); },[]);

  // Fetch timetable scoped to active child
  const fetchTimetable = useCallback(async () => {
    if (!activeChildId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Try parent-scoped timetable endpoint first
      const res = await api.get(`/profiles/parents/me/children/${activeChildId}/timetable/`);
      setTimetable(res.data?.data || res.data || {});
    } catch {
      try {
        // Fallback: try student timetable endpoint
        const base = typeof process!=='undefined' ? process.env?.REACT_APP_API_BASE_URL : '';
        if (!base) throw new Error('no api');
        const token = typeof localStorage!=='undefined' ? localStorage.getItem('access_token') : null;
        const res = await fetch(`${base}/api/v1/timetable/student/?child_id=${activeChildId}`, {
          headers: token ? { Authorization:`Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setTimetable(json.data || json);
      } catch {
        setTimetable(MOCK);
      }
    }
    finally { setLoading(false); }
  }, [activeChildId]);

  useEffect(()=>{ fetchTimetable(); },[fetchTimetable]);

  const switchDay = day => {
    if (day===activeDay||animating) return;
    setSlideDir(DAYS.indexOf(day)>DAYS.indexOf(activeDay)?'right':'left');
    setAnimating(true);
    setActiveDay(day);
    setTimeout(()=>setAnimating(false), 280);
  };

  const handleTabKey = (e, day) => {
    const i = DAYS.indexOf(day);
    if (e.key==='ArrowRight'){e.preventDefault();switchDay(DAYS[(i+1)%DAYS.length]);}
    if (e.key==='ArrowLeft') {e.preventDefault();switchDay(DAYS[(i-1+DAYS.length)%DAYS.length]);}
  };

  const lectures = useMemo(()=>{
    const raw = [...(timetable[activeDay]||[])].sort((a,b)=>parseTime(a.start_time)-parseTime(b.start_time));
    if (!search.trim()) return raw;
    const q = search.toLowerCase();
    return raw.filter(l=>l.subject_name?.toLowerCase().includes(q)||l.faculty_name?.toLowerCase().includes(q)||l.classroom?.toLowerCase().includes(q));
  },[timetable,activeDay,search,tick]);

  const todayLecs = useMemo(()=>
    [...(timetable[today]||[])].sort((a,b)=>parseTime(a.start_time)-parseTime(b.start_time)),
    [timetable,today,tick]
  );
  const liveClass      = useMemo(()=>todayLecs.find(isOngoing),  [todayLecs]);
  const nextClass      = useMemo(()=>todayLecs.find(isUpcoming), [todayLecs]);
  const remainingToday = useMemo(()=>todayLecs.filter(l=>parseTime(l.start_time)>=nowMins()).length,[todayLecs]);
  const weekSubjects   = useMemo(()=>new Set(Object.values(timetable).flat().map(l=>l.subject_name)).size,[timetable]);

  if (parentLoading || loading) return <TimetableSkeleton/>;

  const dur = (s,e) => { const d=parseTime(e)-parseTime(s); return d>=60?`${Math.floor(d/60)}h${d%60?` ${d%60}m`:''}`:` ${d}m`; };

  const childName = activeChild?.name || 'Your child';
  const classInfo = enrollment
    ? `${enrollment.class_level_name} ${enrollment.section_name ? `– ${enrollment.section_name}` : ''}`
    : '';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── PAGE HEADER with child selector ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">calendar_month</span>
              {childName}'s Timetable
            </h1>
            {classInfo && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 ml-8">{classInfo}</p>
            )}
          </div>
          <ChildSelector students={students} activeChild={activeChild} switchChild={switchChild} />
        </div>

        {/* ── STAT CARDS ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Today's classes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-xl">calendar_month</span>
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Today's classes</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{todayLecs.length}</p>
            </div>
          </div>
          {/* Remaining */}
          <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <span className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-xl">hourglass_bottom</span>
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Remaining</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{remainingToday} left</p>
            </div>
          </div>
          {/* Live / Next */}
          <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <span className={`p-2 rounded-lg shrink-0 ${liveClass?'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400':'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'}`}>
              <span className="material-symbols-outlined text-xl">{liveClass?'wifi':'alarm'}</span>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{liveClass?'Happening now':'Next class'}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
                {liveClass ? liveClass.subject_name : nextClass ? formatTime(nextClass.start_time) : 'All done!'}
              </p>
            </div>
          </div>
          {/* Week subjects */}
          <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <span className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-xl">library_books</span>
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Subjects / week</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{weekSubjects}</p>
            </div>
          </div>
        </section>

        {/* ── LIVE / NEXT BANNER ── */}
        {liveClass && (
          <div className="flex items-center justify-between flex-wrap gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-0.5">● Live now</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{liveClass.subject_name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{liveClass.faculty_name} · {liveClass.classroom}</p>
            </div>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 tracking-tight whitespace-nowrap">
              {formatTime(liveClass.start_time)} → {formatTime(liveClass.end_time)}
            </p>
          </div>
        )}
        {!liveClass && activeDay===today && nextClass && (
          <div className="flex items-center justify-between flex-wrap gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-green-700 dark:text-green-400 mb-0.5">↑ Next class</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{nextClass.subject_name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{nextClass.faculty_name} · {nextClass.classroom}</p>
            </div>
            <p className="text-2xl font-black text-green-700 dark:text-green-300 tracking-tight whitespace-nowrap">
              {formatTime(nextClass.start_time)}
            </p>
          </div>
        )}

        {/* ── DAY TABS ── */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-1.5 flex gap-1 overflow-x-auto scrollbar-hide"
          role="tablist" aria-label="Days of the week">
          {DAYS.map((day,i)=>{
            const count = (timetable[day]||[]).length;
            const active= activeDay===day;
            const isT   = day===today;
            return (
              <button key={day} role="tab" aria-selected={active}
                tabIndex={active?0:-1}
                onKeyDown={e=>handleTabKey(e,day)}
                onClick={()=>switchDay(day)}
                className={`flex-1 min-w-[52px] flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all relative
                  ${active
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{SHORT_DAYS[i]}</span>
                {count>0 && <span className={`text-[9px] font-extrabold ${active?'opacity-80':'opacity-60'}`}>{count}</span>}
                {isT && !active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400"/>}
              </button>
            );
          })}
        </div>

        {/* ── TOOLBAR ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
            <input type="search"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              placeholder="Subject, faculty, room…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button onClick={()=>setSearch('')}
              className="h-9 px-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
              ✕ Clear
            </button>
          )}
          {/* View toggle */}
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg p-1 ml-auto">
            {[['list','☰ List'],['chart','▦ Chart']].map(([mode,label])=>(
              <button key={mode} onClick={()=>setViewMode(mode)}
                className={`h-7 px-3 rounded-md text-xs font-semibold transition-all
                  ${viewMode===mode?'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm':'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}>
                {label}
              </button>
            ))}
          </div>
          {viewMode==='list' && (
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              {lectures.length} lecture{lectures.length!==1?'s':''}
            </span>
          )}
        </div>

        {/* ── CONTENT ── */}
        {viewMode==='chart' ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Weekly Schedule</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Mon – Fri · 8 AM – 6 PM</p>
            </div>
            <WeeklyChart timetable={timetable} today={today}/>
          </div>
        ) : (
          <div className={`space-y-2.5 ${animating?(slideDir==='right'?'animate-[slideInRight_0.25s_ease]':'animate-[slideInLeft_0.25s_ease]'):''}`}>
            {lectures.length===0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-slate-500">
                    {search?'search_off':'event_available'}
                  </span>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  {search?'No matching lectures':'No classes scheduled'}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400 max-w-[260px] leading-relaxed">
                  {search?'Try a different subject, faculty, or room.':`${childName} has a free day! 🎉`}
                </p>
              </div>
            ) : lectures.map(lec => {
              const c    = subjectColor(lec.subject_name);
              const tm   = getType(lec.lecture_type);
              const live = isOngoing(lec);
              return (
                <div key={lec.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm flex overflow-hidden transition-all hover:shadow-md hover:-translate-y-px
                    ${live?'border-blue-300 dark:border-blue-700 ring-2 ring-blue-100 dark:ring-blue-900 animate-pulse-border':'border-gray-100 dark:border-slate-700'}`}>
                  {/* colour accent bar */}
                  <div className="w-1 shrink-0" style={{background:c.dot}}/>
                  <div className="flex-1 px-4 py-3 flex flex-wrap items-center gap-3 min-w-0">
                    {/* left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                          style={{background:c.bg,color:c.text,borderColor:c.border}}>
                          {lec.subject_name}
                        </span>
                        {live && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"/>Live
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {lec.faculty_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tm.bg} ${tm.text}`}>
                          <span className="material-symbols-outlined text-[11px]">{tm.icon}</span>
                          {tm.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {lec.classroom}
                        </span>
                      </div>
                    </div>
                    {/* right: time */}
                    <div className="flex flex-col items-end shrink-0 gap-0.5">
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatTime(lec.start_time)}
                        <span className="text-slate-300 dark:text-slate-600 mx-1">→</span>
                        {formatTime(lec.end_time)}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400">{dur(lec.start_time,lec.end_time)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}