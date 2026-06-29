import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_INDEX_MAP = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

const todayName = () => {
  const d = new Date().getDay();
  return DAYS.find((day) => DAY_INDEX_MAP[day] === d) || 'Monday';
};

const parseTime = (str) => {
  if (!str) return 0;
  const s = str.trim();
  const ampm = /([ap]m)/i.exec(s);
  const parts = s.replace(/[ap]m/i, '').trim().split(':');
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || '0', 10);
  if (ampm) {
    const suffix = ampm[1].toLowerCase();
    if (suffix === 'pm' && h !== 12) h += 12;
    if (suffix === 'am' && h === 12) h = 0;
  }
  return h * 60 + m;
};

const formatTime = (str) => {
  if (!str) return '';
  const mins = parseTime(str);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

const nowMins = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};

const isOngoing = (lecture) => {
  if (!lecture?.start_time || !lecture?.end_time) return false;
  const now = nowMins();
  return parseTime(lecture.start_time) <= now && now < parseTime(lecture.end_time);
};

const isUpcoming = (lecture) => {
  if (!lecture?.start_time) return false;
  return parseTime(lecture.start_time) > nowMins();
};

// ── Subject palette ──────────────────────────────────────────────────────────
const PALETTE = [
  { bg: '#EEF2FF', text: '#3730A3', border: '#A5B4FC', dot: '#6366F1', dark: { bg: '#1E1B4B', text: '#C7D2FE', border: '#4338CA' } },
  { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7', dot: '#10B981', dark: { bg: '#022C22', text: '#A7F3D0', border: '#059669' } },
  { bg: '#EFF6FF', text: '#1E40AF', border: '#93C5FD', dot: '#3B82F6', dark: { bg: '#0F172A', text: '#BFDBFE', border: '#1D4ED8' } },
  { bg: '#FFF7ED', text: '#9A3412', border: '#FDB87A', dot: '#F97316', dark: { bg: '#431407', text: '#FED7AA', border: '#C2410C' } },
  { bg: '#FDF4FF', text: '#6B21A8', border: '#D8B4FE', dot: '#A855F7', dark: { bg: '#2E1065', text: '#E9D5FF', border: '#7E22CE' } },
  { bg: '#FFF1F2', text: '#9F1239', border: '#FDA4AF', dot: '#F43F5E', dark: { bg: '#4C0519', text: '#FECDD3', border: '#BE123C' } },
  { bg: '#F0FDF4', text: '#166534', border: '#86EFAC', dot: '#22C55E', dark: { bg: '#052E16', text: '#BBF7D0', border: '#15803D' } },
];

const subjectColorMap = {};
let colorIdx = 0;
const getSubjectColor = (name) => {
  if (!subjectColorMap[name]) {
    subjectColorMap[name] = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
  }
  return subjectColorMap[name];
};

const TYPE_META = {
  Theory:   { icon: '📖', label: 'Theory',   color: '#EFF6FF', tc: '#1E40AF' },
  Lab:      { icon: '🔬', label: 'Lab',      color: '#ECFDF5', tc: '#065F46' },
  Tutorial: { icon: '✏️',  label: 'Tutorial', color: '#FFF7ED', tc: '#9A3412' },
};
const getType = (t) => TYPE_META[t] || { icon: '🎓', label: t || 'Lecture', color: '#F8FAFC', tc: '#475569' };

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_TIMETABLE = {
  Monday: [
    { id: 1,  subject_name: 'Data Structures',   faculty_name: 'Dr. Priya Sharma',  start_time: '09:00', end_time: '10:00', classroom: 'Room 301', lecture_type: 'Theory'   },
    { id: 2,  subject_name: 'Mathematics III',   faculty_name: 'Prof. Arjun Mehta', start_time: '10:15', end_time: '11:15', classroom: 'Room 202', lecture_type: 'Theory'   },
    { id: 3,  subject_name: 'Computer Networks', faculty_name: 'Dr. Sneha Patel',   start_time: '11:30', end_time: '13:30', classroom: 'Lab B2',   lecture_type: 'Lab'      },
    { id: 4,  subject_name: 'Operating Systems', faculty_name: 'Dr. Ravi Kumar',    start_time: '14:00', end_time: '15:00', classroom: 'Room 401', lecture_type: 'Theory'   },
    { id: 5,  subject_name: 'Data Structures',   faculty_name: 'Dr. Priya Sharma',  start_time: '15:15', end_time: '16:15', classroom: 'Room 301', lecture_type: 'Tutorial' },
  ],
  Tuesday: [
    { id: 6,  subject_name: 'Computer Networks', faculty_name: 'Dr. Sneha Patel',   start_time: '09:00', end_time: '10:00', classroom: 'Room 401', lecture_type: 'Theory'   },
    { id: 7,  subject_name: 'Operating Systems', faculty_name: 'Dr. Ravi Kumar',    start_time: '10:15', end_time: '12:15', classroom: 'Lab C1',   lecture_type: 'Lab'      },
    { id: 8,  subject_name: 'Mathematics III',   faculty_name: 'Prof. Arjun Mehta', start_time: '14:00', end_time: '15:00', classroom: 'Room 202', lecture_type: 'Tutorial' },
    { id: 9,  subject_name: 'DBMS',              faculty_name: 'Dr. Anita Singh',   start_time: '15:15', end_time: '16:15', classroom: 'Room 105', lecture_type: 'Theory'   },
  ],
  Wednesday: [
    { id: 10, subject_name: 'Data Structures',   faculty_name: 'Dr. Priya Sharma',  start_time: '09:00', end_time: '10:00', classroom: 'Room 301', lecture_type: 'Theory'   },
    { id: 11, subject_name: 'DBMS',              faculty_name: 'Dr. Anita Singh',   start_time: '10:15', end_time: '11:15', classroom: 'Room 105', lecture_type: 'Theory'   },
    { id: 12, subject_name: 'DBMS',              faculty_name: 'Dr. Anita Singh',   start_time: '11:30', end_time: '13:30', classroom: 'Lab A1',   lecture_type: 'Lab'      },
    { id: 13, subject_name: 'Computer Networks', faculty_name: 'Dr. Sneha Patel',   start_time: '14:00', end_time: '15:00', classroom: 'Room 401', lecture_type: 'Tutorial' },
  ],
  Thursday: [
    { id: 14, subject_name: 'Mathematics III',   faculty_name: 'Prof. Arjun Mehta', start_time: '09:00', end_time: '10:00', classroom: 'Room 202', lecture_type: 'Theory'   },
    { id: 15, subject_name: 'Operating Systems', faculty_name: 'Dr. Ravi Kumar',    start_time: '10:15', end_time: '11:15', classroom: 'Room 401', lecture_type: 'Theory'   },
    { id: 16, subject_name: 'DBMS',              faculty_name: 'Dr. Anita Singh',   start_time: '14:00', end_time: '15:00', classroom: 'Room 105', lecture_type: 'Tutorial' },
    { id: 17, subject_name: 'Data Structures',   faculty_name: 'Dr. Priya Sharma',  start_time: '15:15', end_time: '16:15', classroom: 'Room 301', lecture_type: 'Tutorial' },
  ],
  Friday: [
    { id: 18, subject_name: 'Operating Systems', faculty_name: 'Dr. Ravi Kumar',    start_time: '09:00', end_time: '10:00', classroom: 'Room 401', lecture_type: 'Theory'   },
    { id: 19, subject_name: 'DBMS',              faculty_name: 'Dr. Anita Singh',   start_time: '10:15', end_time: '11:15', classroom: 'Room 105', lecture_type: 'Theory'   },
    { id: 20, subject_name: 'Data Structures',   faculty_name: 'Dr. Priya Sharma',  start_time: '11:30', end_time: '13:30', classroom: 'Lab B2',   lecture_type: 'Lab'      },
    { id: 21, subject_name: 'Mathematics III',   faculty_name: 'Prof. Arjun Mehta', start_time: '14:00', end_time: '15:00', classroom: 'Room 202', lecture_type: 'Theory'   },
  ],
  Saturday: [
    { id: 22, subject_name: 'Computer Networks', faculty_name: 'Dr. Sneha Patel',   start_time: '09:00', end_time: '11:00', classroom: 'Lab B2',   lecture_type: 'Lab'      },
  ],
};

// ── Chart: Weekly Overview (Gantt-style) ─────────────────────────────────────
const CHART_START = 8 * 60;  // 8 AM
const CHART_END   = 18 * 60; // 6 PM
const CHART_SPAN  = CHART_END - CHART_START;
const HOUR_SLOTS  = Array.from({ length: 11 }, (_, i) => i + 8); // 8..18

function WeeklyChart({ timetable, today }) {
  const workDays = DAYS.slice(0, 5); // Mon–Fri
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div style={{ minWidth: 680 }}>
        {/* Hour axis */}
        <div style={{ display: 'flex', marginLeft: 72, marginBottom: 4 }}>
          {HOUR_SLOTS.map((h) => (
            <div key={h} style={{
              flex: '0 0 ' + (100 / HOUR_SLOTS.length) + '%',
              fontSize: 10,
              color: '#94A3B8',
              fontWeight: 600,
              letterSpacing: 0.3,
            }}>
              {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
            </div>
          ))}
        </div>

        {/* Rows */}
        {workDays.map((day) => {
          const lectures = [...(timetable[day] || [])].sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time));
          const isToday = day === today;
          return (
            <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              {/* Day label */}
              <div style={{
                width: 64,
                flexShrink: 0,
                fontSize: 11,
                fontWeight: isToday ? 800 : 600,
                color: isToday ? '#3B82F6' : '#64748B',
                paddingRight: 8,
                textAlign: 'right',
                letterSpacing: 0.2,
              }}>
                {day.slice(0, 3).toUpperCase()}
                {isToday && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', margin: '2px auto 0' }} />}
              </div>

              {/* Track */}
              <div style={{
                flex: 1,
                position: 'relative',
                height: 36,
                background: isToday ? '#F0F9FF' : '#F8FAFC',
                borderRadius: 8,
                border: isToday ? '1px solid #BAE6FD' : '1px solid #E2E8F0',
                overflow: 'hidden',
              }}>
                {/* Hour grid lines */}
                {HOUR_SLOTS.map((h, i) => (
                  <div key={h} style={{
                    position: 'absolute',
                    left: `${(i / (HOUR_SLOTS.length - 1)) * 100}%`,
                    top: 0, bottom: 0,
                    width: 1,
                    background: '#E2E8F0',
                    opacity: 0.6,
                  }} />
                ))}

                {/* Now indicator */}
                {isToday && (() => {
                  const now = nowMins();
                  if (now < CHART_START || now > CHART_END) return null;
                  const pct = ((now - CHART_START) / CHART_SPAN) * 100;
                  return (
                    <div style={{
                      position: 'absolute',
                      left: `${pct}%`,
                      top: 0, bottom: 0,
                      width: 2,
                      background: '#EF4444',
                      zIndex: 10,
                      borderRadius: 1,
                    }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', marginLeft: -2.5, marginTop: -1 }} />
                    </div>
                  );
                })()}

                {/* Lecture blocks */}
                {lectures.map((lec) => {
                  const start = Math.max(parseTime(lec.start_time), CHART_START);
                  const end   = Math.min(parseTime(lec.end_time), CHART_END);
                  if (start >= CHART_END || end <= CHART_START) return null;
                  const left  = ((start - CHART_START) / CHART_SPAN) * 100;
                  const width = ((end - start) / CHART_SPAN) * 100;
                  const color = getSubjectColor(lec.subject_name);
                  const live  = isOngoing(lec);
                  return (
                    <div
                      key={lec.id}
                      title={`${lec.subject_name}\n${formatTime(lec.start_time)} – ${formatTime(lec.end_time)}\n${lec.classroom}`}
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 3, bottom: 3,
                        background: color.bg,
                        border: `1.5px solid ${color.border}`,
                        borderRadius: 5,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 5px',
                        overflow: 'hidden',
                        cursor: 'default',
                        boxShadow: live ? `0 0 0 2px ${color.dot}40` : 'none',
                        transition: 'transform 0.15s',
                      }}
                    >
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: color.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}>
                        {live ? '● ' : ''}{lec.subject_name.split(' ').map(w => w[0]).join('')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div style={{ marginLeft: 72, marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {Object.keys(subjectColorMap).map((subj) => {
            const c = subjectColorMap[subj];
            return (
              <div key={subj} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: c.dot }} />
                {subj}
              </div>
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: '#EF4444' }} />
            Now
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StudentTimetable() {
  const today = todayName();
  const [activeDay, setActiveDay]   = useState(today);
  const [prevDay, setPrevDay]       = useState(null);
  const [slideDir, setSlideDir]     = useState('right');
  const [animating, setAnimating]   = useState(false);
  const [timetable, setTimetable]   = useState({});
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [tick, setTick]             = useState(0);
  const [viewMode, setViewMode]     = useState('list'); // 'list' | 'chart'

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const fetchTimetable = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const API_BASE_URL = typeof process !== 'undefined' ? process.env?.REACT_APP_API_BASE_URL : '';
      if (!API_BASE_URL) throw new Error('no api');
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_BASE_URL}/api/v1/timetable/student/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTimetable(json.data || json);
    } catch {
      setTimetable(MOCK_TIMETABLE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTimetable(); }, [fetchTimetable]);

  const switchDay = (day) => {
    if (day === activeDay || animating) return;
    const fromIdx = DAYS.indexOf(activeDay);
    const toIdx   = DAYS.indexOf(day);
    setSlideDir(toIdx > fromIdx ? 'right' : 'left');
    setPrevDay(activeDay);
    setAnimating(true);
    setActiveDay(day);
    setTimeout(() => { setPrevDay(null); setAnimating(false); }, 320);
  };

  const handleTabKeyDown = (e, day) => {
    const idx = DAYS.indexOf(day);
    if (e.key === 'ArrowRight') { e.preventDefault(); switchDay(DAYS[(idx + 1) % DAYS.length]); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); switchDay(DAYS[(idx - 1 + DAYS.length) % DAYS.length]); }
  };

  const lectures = useMemo(() => {
    const raw = timetable[activeDay] || [];
    const sorted = [...raw].sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time));
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (l) => l.subject_name?.toLowerCase().includes(q) || l.faculty_name?.toLowerCase().includes(q) || l.classroom?.toLowerCase().includes(q)
    );
  }, [timetable, activeDay, search, tick]);

  const allTodayLectures = useMemo(() =>
    [...(timetable[today] || [])].sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time)),
    [timetable, today, tick]
  );

  const nextClass     = useMemo(() => allTodayLectures.find(isUpcoming), [allTodayLectures]);
  const liveClass     = useMemo(() => allTodayLectures.find(isOngoing),  [allTodayLectures]);
  const remainingToday = useMemo(
    () => allTodayLectures.filter((l) => parseTime(l.start_time) >= nowMins()).length,
    [allTodayLectures]
  );

  const weekSubjects = useMemo(
    () => new Set(Object.values(timetable).flat().map((l) => l.subject_name)).size,
    [timetable]
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .tt-root {
          min-height: 100vh;
          padding: clamp(16px, 3vw, 28px);
          background: #F0F4FF;
          font-family: 'Inter', system-ui, sans-serif;
          box-sizing: border-box;
        }

        /* ── Header ─────────────────────────────────────────────────────── */
        .tt-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        .tt-header-left { display: flex; align-items: center; gap: 12px; }
        .tt-header-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .tt-title {
          font-size: clamp(18px, 2.5vw, 24px);
          font-weight: 800;
          color: #0F172A;
          line-height: 1.2;
          margin: 0;
          letter-spacing: -0.4px;
        }
        .tt-subtitle {
          font-size: 12px;
          color: #64748B;
          margin-top: 2px;
          font-weight: 500;
        }
        .tt-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .tt-btn {
          display: inline-flex; align-items: center; gap: 6px;
          height: 36px; padding: 0 14px;
          border-radius: 9px;
          border: 1.5px solid #E2E8F0;
          background: #fff;
          color: #475569;
          font-size: 12px; font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          font-family: inherit;
        }
        .tt-btn:hover { background: #F8FAFC; border-color: #CBD5E1; color: #0F172A; }
        .tt-btn:active { transform: scale(0.97); }
        .tt-btn.active {
          background: #EFF6FF; border-color: #93C5FD; color: #1D4ED8;
        }
        .tt-btn-icon { font-size: 15px; }

        /* ── Stats row ──────────────────────────────────────────────────── */
        .tt-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }
        .tt-stat {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .tt-stat:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-1px); }
        .tt-stat-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .tt-stat-label { font-size: 11px; color: #64748B; font-weight: 500; margin-bottom: 2px; }
        .tt-stat-value { font-size: 16px; font-weight: 800; color: #0F172A; line-height: 1; }
        .tt-stat-value.sm { font-size: 12px; font-weight: 700; }

        /* ── Live / next banner ─────────────────────────────────────────── */
        .tt-banner {
          border-radius: 14px;
          padding: 14px 18px;
          margin-bottom: 16px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          flex-wrap: wrap;
          animation: tt-fadein 0.35s ease;
        }
        .tt-banner.live {
          background: linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%);
          border: 1.5px solid #93C5FD;
        }
        .tt-banner.next {
          background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
          border: 1.5px solid #86EFAC;
        }
        .tt-banner-eyebrow {
          font-size: 10px; font-weight: 800;
          letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 3px;
        }
        .tt-banner.live .tt-banner-eyebrow { color: #1D4ED8; }
        .tt-banner.next .tt-banner-eyebrow { color: #166534; }
        .tt-banner-subject { font-size: 15px; font-weight: 800; color: #0F172A; }
        .tt-banner-meta { font-size: 12px; color: #64748B; margin-top: 2px; }
        .tt-banner-time {
          font-size: 24px; font-weight: 900; white-space: nowrap;
          letter-spacing: -0.5px;
        }
        .tt-banner.live .tt-banner-time { color: #1D4ED8; }
        .tt-banner.next .tt-banner-time { color: #15803D; }

        /* ── Day tabs ───────────────────────────────────────────────────── */
        .tt-tabs-wrap {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 13px;
          padding: 5px;
          display: flex; gap: 3px;
          margin-bottom: 16px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tt-tabs-wrap::-webkit-scrollbar { display: none; }
        .tt-tab {
          flex: 1 1 auto; min-width: 52px;
          padding: 8px 10px;
          border-radius: 9px;
          border: none;
          background: transparent;
          font-size: 12px; font-weight: 600;
          color: #64748B;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          position: relative;
          font-family: inherit;
        }
        .tt-tab:hover { background: #F8FAFC; color: #0F172A; }
        .tt-tab:active { transform: scale(0.97); }
        .tt-tab.active {
          background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
          color: #fff;
          box-shadow: 0 3px 10px rgba(99,102,241,0.3);
        }
        .tt-tab.today:not(.active)::after {
          content: '';
          display: block;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #3B82F6;
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
        }
        .tt-tab-count {
          font-size: 9px; font-weight: 800;
          opacity: 0.75;
        }
        .tt-tab-full { display: inline; }
        .tt-tab-short { display: none; }
        @media (max-width: 580px) {
          .tt-tab-full { display: none; }
          .tt-tab-short { display: inline; }
        }

        /* ── View toggle + filter ────────────────────────────────────────── */
        .tt-toolbar {
          display: flex; gap: 10px; align-items: center;
          margin-bottom: 14px; flex-wrap: wrap;
        }
        .tt-search-wrap { position: relative; flex: 1; min-width: 180px; max-width: 320px; }
        .tt-search-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          font-size: 14px; color: #94A3B8; pointer-events: none;
        }
        .tt-search-input {
          width: 100%; height: 36px;
          padding: 0 12px 0 34px;
          border-radius: 9px;
          border: 1.5px solid #E2E8F0;
          background: #fff;
          color: #0F172A;
          font-size: 12px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-sizing: border-box;
          font-family: inherit;
        }
        .tt-search-input:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .tt-count {
          font-size: 11px; color: #94A3B8; margin-left: auto; font-weight: 500;
        }
        .tt-view-toggle {
          display: flex; gap: 3px;
          background: #F1F5F9;
          border-radius: 9px;
          padding: 3px;
        }
        .tt-vbtn {
          display: inline-flex; align-items: center; gap: 5px;
          height: 30px; padding: 0 12px;
          border-radius: 7px;
          border: none; background: transparent;
          font-size: 12px; font-weight: 600;
          color: #64748B;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .tt-vbtn.active {
          background: #fff;
          color: #1D4ED8;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .tt-vbtn:hover:not(.active) { color: #0F172A; }

        /* ── Slide animation ────────────────────────────────────────────── */
        .tt-slide-container { position: relative; overflow: hidden; }
        .tt-enter-right { animation: tt-enter-r 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .tt-enter-left  { animation: tt-enter-l 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes tt-enter-r { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes tt-enter-l { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes tt-fadein   { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        /* ── Lecture cards ──────────────────────────────────────────────── */
        .tt-list { display: flex; flex-direction: column; gap: 8px; padding-bottom: 24px; }
        .tt-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
          cursor: default;
        }
        .tt-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.07); transform: translateY(-1px); }
        .tt-card:focus-within { outline: 2px solid #3B82F6; outline-offset: 2px; }
        .tt-card.live {
          border-color: #93C5FD;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.15), 0 4px 14px rgba(59,130,246,0.1);
          animation: tt-card-pulse 2.4s ease-in-out infinite;
        }
        @keyframes tt-card-pulse {
          0%,100% { box-shadow: 0 0 0 2px rgba(59,130,246,0.15), 0 4px 14px rgba(59,130,246,0.08); }
          50%      { box-shadow: 0 0 0 3px rgba(59,130,246,0.28), 0 4px 18px rgba(59,130,246,0.15); }
        }
        .tt-card-bar { width: 4px; flex-shrink: 0; }
        .tt-card-body {
          flex: 1; padding: 13px 16px;
          display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
          min-width: 0;
        }
        .tt-card-main { flex: 1; min-width: 160px; }

        .tt-card-subject-row {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .tt-subject-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px; font-weight: 700;
          border: 1px solid;
        }
        .tt-live-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 9px; font-weight: 800;
          letter-spacing: 0.5px; text-transform: uppercase;
          background: #3B82F6; color: #fff;
          animation: tt-blink 1.6s ease-in-out infinite;
        }
        @keyframes tt-blink { 0%,100% { opacity:1; } 50% { opacity:0.65; } }
        .tt-live-badge::before {
          content: ''; width: 5px; height: 5px;
          border-radius: 50%; background: #fff;
        }
        .tt-card-faculty {
          font-size: 11px; color: #64748B; font-weight: 500;
          display: flex; align-items: center; gap: 4px;
        }
        .tt-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
        .tt-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 10px; font-weight: 700;
          border: 1px solid;
          white-space: nowrap;
        }
        .tt-room {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; color: #94A3B8; font-weight: 500;
        }
        .tt-card-meta {
          display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0;
        }
        .tt-time { font-size: 13px; font-weight: 800; color: #0F172A; white-space: nowrap; text-align: right; }
        .tt-time-sep { color: #CBD5E1; margin: 0 3px; }
        .tt-dur { font-size: 10px; color: #94A3B8; font-weight: 600; }

        /* ── Empty / skeleton ───────────────────────────────────────────── */
        .tt-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 56px 24px; text-align: center;
          animation: tt-fadein 0.35s ease;
        }
        .tt-empty-art {
          width: 80px; height: 80px; border-radius: 50%;
          background: #F1F5F9;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; margin-bottom: 18px;
        }
        .tt-empty-title { font-size: 17px; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
        .tt-empty-desc  { font-size: 13px; color: #64748B; max-width: 260px; line-height: 1.6; }
        .tt-skel {
          height: 86px; border-radius: 14px;
          background: #fff; border: 1px solid #E2E8F0;
          position: relative; overflow: hidden; margin-bottom: 8px;
        }
        .tt-skel::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
          animation: tt-shimmer 1.4s ease-in-out infinite;
          background-size: 200% 100%;
        }
        @keyframes tt-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

        /* ── Chart section ──────────────────────────────────────────────── */
        .tt-chart-wrap {
          background: #fff; border: 1px solid #E2E8F0;
          border-radius: 14px; padding: 16px 18px;
          padding-bottom: 24px;
          animation: tt-fadein 0.3s ease;
        }
        .tt-chart-heading {
          font-size: 13px; font-weight: 700; color: #0F172A;
          margin-bottom: 14px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .tt-chart-sub { font-size: 11px; color: #94A3B8; font-weight: 500; }

        /* ── Responsive ─────────────────────────────────────────────────── */
        @media (max-width: 480px) {
          .tt-card-meta { align-items: flex-start; }
          .tt-time { text-align: left; }
        }

        /* ── Print ──────────────────────────────────────────────────────── */
        @media print {
          .tt-actions, .tt-toolbar, .tt-tabs-wrap, .tt-stats, .tt-banner { display: none !important; }
          .tt-root { padding: 0; background: #fff; }
          .tt-card { break-inside: avoid; box-shadow: none !important; animation: none !important; }
          .tt-list { gap: 6px; }
        }
      `}</style>

      <div className="tt-root">
        {/* ── Header ── */}
        <div className="tt-header">
          <div className="tt-header-left">
            <div className="tt-header-icon">📅</div>
            <div>
              <h1 className="tt-title">Timetable</h1>
              <p className="tt-subtitle">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="tt-actions">
            <button className="tt-btn" onClick={() => fetchTimetable(true)} title="Refresh">
              <span className="tt-btn-icon">↺</span> Refresh
            </button>
            <button className="tt-btn" onClick={() => window.print()}>
              <span className="tt-btn-icon">🖨</span> Print
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        {!loading && (
          <div className="tt-stats">
            <StatCard icon="🗓️" bg="#EEF2FF" label="Today's classes"    value={`${allTodayLectures.length} lecture${allTodayLectures.length !== 1 ? 's' : ''}`} />
            <StatCard icon="⏳" bg="#FFF7ED" label="Remaining today"    value={`${remainingToday} left`} />
            {liveClass
              ? <StatCard icon="📡" bg="#EFF6FF" label="Happening now" value={liveClass.subject_name} small />
              : nextClass
                ? <StatCard icon="⏰" bg="#F0FDF4" label="Next class at" value={formatTime(nextClass.start_time)} />
                : <StatCard icon="✅" bg="#F0FDF4" label="Status"        value="All done!" />
            }
            <StatCard icon="📚" bg="#FDF4FF" label="Subjects this week" value={`${weekSubjects}`} />
          </div>
        )}

        {/* ── Live / Next banner ── */}
        {!loading && liveClass && (
          <div className="tt-banner live">
            <div>
              <div className="tt-banner-eyebrow">● Live now</div>
              <div className="tt-banner-subject">{liveClass.subject_name}</div>
              <div className="tt-banner-meta">{liveClass.faculty_name} · {liveClass.classroom}</div>
            </div>
            <div className="tt-banner-time">{formatTime(liveClass.start_time)} → {formatTime(liveClass.end_time)}</div>
          </div>
        )}
        {!loading && !liveClass && activeDay === today && nextClass && (
          <div className="tt-banner next">
            <div>
              <div className="tt-banner-eyebrow">↑ Next class</div>
              <div className="tt-banner-subject">{nextClass.subject_name}</div>
              <div className="tt-banner-meta">{nextClass.faculty_name} · {nextClass.classroom}</div>
            </div>
            <div className="tt-banner-time">{formatTime(nextClass.start_time)}</div>
          </div>
        )}

        {/* ── Day tabs ── */}
        <div className="tt-tabs-wrap" role="tablist" aria-label="Days of the week">
          {DAYS.map((day, i) => {
            const count = (timetable[day] || []).length;
            return (
              <button
                key={day}
                role="tab"
                aria-selected={activeDay === day}
                className={`tt-tab ${activeDay === day ? 'active' : ''} ${day === today ? 'today' : ''}`}
                onClick={() => switchDay(day)}
                onKeyDown={(e) => handleTabKeyDown(e, day)}
                tabIndex={activeDay === day ? 0 : -1}
              >
                <span className="tt-tab-full">{day}</span>
                <span className="tt-tab-short">{SHORT_DAYS[i]}</span>
                {count > 0 && <span className="tt-tab-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Toolbar ── */}
        <div className="tt-toolbar">
          <div className="tt-search-wrap">
            <span className="tt-search-icon">🔍</span>
            <input
              type="search"
              className="tt-search-input"
              placeholder="Search subject, faculty, room…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search lectures"
            />
          </div>
          {search && (
            <button className="tt-btn" onClick={() => setSearch('')}>✕ Clear</button>
          )}
          <div className="tt-view-toggle">
            <button className={`tt-vbtn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              ☰ List
            </button>
            <button className={`tt-vbtn ${viewMode === 'chart' ? 'active' : ''}`} onClick={() => setViewMode('chart')}>
              ▦ Chart
            </button>
          </div>
          {!loading && viewMode === 'list' && (
            <span className="tt-count">{lectures.length} lecture{lectures.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* ── Content ── */}
        {viewMode === 'chart' ? (
          <div className="tt-chart-wrap">
            <div className="tt-chart-heading">
              Weekly Schedule
              <span className="tt-chart-sub">Mon – Fri · 8 AM – 6 PM</span>
            </div>
            {loading
              ? <div className="tt-skel" style={{ height: 200 }} />
              : <WeeklyChart timetable={timetable} today={today} />
            }
          </div>
        ) : (
          <div className="tt-slide-container">
            <div className={animating ? (slideDir === 'right' ? 'tt-enter-right' : 'tt-enter-left') : ''}>
              {loading ? (
                <div>{[1,2,3].map(n => <div key={n} className="tt-skel" />)}</div>
              ) : lectures.length === 0 ? (
                <div className="tt-empty">
                  <div className="tt-empty-art">{search ? '🔍' : '🎉'}</div>
                  <div className="tt-empty-title">{search ? 'No matching lectures' : 'No classes scheduled'}</div>
                  <p className="tt-empty-desc">
                    {search ? 'Try a different subject, faculty name, or room.' : 'Enjoy your free day! Rest up or catch up on assignments.'}
                  </p>
                </div>
              ) : (
                <div className="tt-list">
                  {lectures.map((lec) => (
                    <LectureCard key={lec.id} lecture={lec} live={isOngoing(lec)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon, bg, label, value, small }) {
  return (
    <div className="tt-stat">
      <div className="tt-stat-icon" style={{ background: bg }}>{icon}</div>
      <div>
        <div className="tt-stat-label">{label}</div>
        <div className={`tt-stat-value ${small ? 'sm' : ''}`}>{value}</div>
      </div>
    </div>
  );
}

function LectureCard({ lecture, live }) {
  const color    = getSubjectColor(lecture.subject_name);
  const typeMeta = getType(lecture.lecture_type);
  const start    = parseTime(lecture.start_time);
  const end      = parseTime(lecture.end_time);
  const dur      = end - start;
  const durStr   = dur >= 60 ? `${Math.floor(dur/60)}h${dur%60 ? ` ${dur%60}m` : ''}` : `${dur}m`;

  return (
    <article
      className={`tt-card${live ? ' live' : ''}`}
      tabIndex={0}
      aria-label={`${lecture.subject_name}, ${formatTime(lecture.start_time)} to ${formatTime(lecture.end_time)}, ${lecture.classroom}`}
    >
      <div className="tt-card-bar" style={{ background: color.dot }} />
      <div className="tt-card-body">
        <div className="tt-card-main">
          <div className="tt-card-subject-row">
            <span
              className="tt-subject-pill"
              style={{ background: color.bg, color: color.text, borderColor: color.border }}
            >
              {lecture.subject_name}
            </span>
            {live && <span className="tt-live-badge">Live Now</span>}
          </div>
          <div className="tt-card-faculty">
            👤 {lecture.faculty_name}
          </div>
          <div className="tt-chips">
            <span
              className="tt-chip"
              style={{ background: typeMeta.color, color: typeMeta.tc, borderColor: typeMeta.tc + '50' }}
            >
              {typeMeta.icon} {typeMeta.label}
            </span>
            <span className="tt-room">📍 {lecture.classroom}</span>
          </div>
        </div>
        <div className="tt-card-meta">
          <div className="tt-time">
            {formatTime(lecture.start_time)}
            <span className="tt-time-sep">→</span>
            {formatTime(lecture.end_time)}
          </div>
          <div className="tt-dur">{durStr}</div>
        </div>
      </div>
    </article>
  );
}