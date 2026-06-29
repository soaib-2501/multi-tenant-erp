// TopNavbar.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentProvider';

function useSearchIndex() {
  const { dashboard, academic, assignments, submissions, attendanceRecords, profile, enrollment } = useStudent();

  return useMemo(() => {
    const items = [];

    const grades = dashboard?.grades?.results || [];
    grades.forEach((g) => {
      items.push({
        id: `grade-${g.id}`, type: 'grade',
        label: `${g.subject_name || g.subject} Grade`,
        detail: `${g.grade || g.letter_grade || ''} · ${g.marks_obtained ?? g.score ?? ''}${g.total_marks ? `/${g.total_marks}` : ''}`,
        route: '/student/grades', icon: 'grade',
        keywords: [g.subject_name, g.subject, 'grade', 'marks', g.exam_name].filter(Boolean),
      });
    });

    if (dashboard?.reportCard) {
      items.push({
        id: 'report-card', type: 'grade', label: 'Report Card',
        detail: `Overall: ${dashboard.reportCard.overall_percentage ?? ''}%`,
        route: '/student/grades', icon: 'summarize',
        keywords: ['report', 'card', 'overall', 'percentage', 'result'],
      });
    }

    const subjects = academic?.subs || [];
    subjects.forEach((s) => {
      items.push({
        id: `subject-${s.id}`, type: 'subject', label: s.name,
        detail: `${s.code || ''} · ${academic?.classLevel?.name || ''}`.replace(/^·\s*/, ''),
        route: '/student/subjects', icon: 'menu_book',
        keywords: [s.name, s.code, 'subject', 'class'].filter(Boolean),
      });
    });

    assignments.forEach((a) => {
      const isSubmitted = submissions.some((s) => s.assignment === a.id || s.assignment_id === a.id);
      items.push({
        id: `assignment-${a.id}`, type: 'assignment', label: a.title,
        detail: `${a.subject_name || ''} · Due: ${a.due_date ? new Date(a.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'} · ${isSubmitted ? 'Submitted' : 'Pending'}`,
        route: '/student/assignments', icon: isSubmitted ? 'task_alt' : 'assignment',
        keywords: [a.title, a.subject_name, 'assignment', 'task', 'homework', isSubmitted ? 'submitted' : 'pending'].filter(Boolean),
      });
    });

    if (dashboard?.attendanceSummary) {
      const s = dashboard.attendanceSummary;
      items.push({
        id: 'attendance-summary', type: 'attendance', label: 'Attendance Summary',
        detail: `${s.attendance_percentage ?? s.present_percentage ?? ''}% · Present: ${s.present ?? ''} / ${s.total_days ?? ''}`,
        route: '/student/attendance', icon: 'event_available',
        keywords: ['attendance', 'present', 'absent', 'summary', 'percentage'],
      });
    }

    const absentDays = attendanceRecords.filter((r) => r.status === 'absent' || r.status === 'A');
    if (absentDays.length > 0) {
      items.push({
        id: 'attendance-absences', type: 'attendance', label: 'Absent Days',
        detail: `${absentDays.length} absence${absentDays.length > 1 ? 's' : ''} on record`,
        route: '/student/attendance', icon: 'event_busy',
        keywords: ['absent', 'absence', 'attendance', 'missed'],
      });
    }

    if (profile) {
      items.push({
        id: 'profile', type: 'profile', label: 'My Profile',
        detail: `${profile.first_name || ''} ${profile.last_name || ''} · ID: ${profile.student_id || profile.id || ''}`.trim(),
        route: '/student/profile', icon: 'person',
        keywords: ['profile', 'my profile', 'account', profile.first_name, profile.last_name].filter(Boolean),
      });
    }

    if (enrollment) {
      items.push({
        id: 'enrollment', type: 'profile', label: 'My Class',
        detail: `${enrollment.class_level_name || ''} · ${enrollment.section_name || ''} · ${enrollment.academic_year_name || ''}`,
        route: '/student/profile', icon: 'school',
        keywords: ['class', 'section', 'enrollment', 'grade', enrollment.class_level_name, enrollment.section_name].filter(Boolean),
      });
    }

    items.push(
      { id: 'nav-ai-tutor', type: 'shortcut', label: 'AI Tutor', detail: 'Ask any subject question', route: '/student/ai-tutor', icon: 'psychology', keywords: ['ai', 'tutor', 'help', 'doubt', 'question'] },
      { id: 'nav-fees', type: 'shortcut', label: 'Fees', detail: 'Check fee status & receipts', route: '/student/fees', icon: 'payments', keywords: ['fees', 'payment', 'receipt', 'due', 'paid'] },
      { id: 'nav-helpdesk', type: 'shortcut', label: 'Help Desk', detail: 'Raise a support ticket', route: '/student/help-desk', icon: 'support_agent', keywords: ['help', 'support', 'ticket', 'helpdesk', 'issue'] },
    );

    return items;
  }, [dashboard, academic, assignments, submissions, attendanceRecords, profile, enrollment]);
}

const TYPE_META = {
  grade:      { label: 'Grade',      color: 'bg-primary/10 text-primary'     },
  subject:    { label: 'Subject',    color: 'bg-secondary/10 text-secondary' },
  assignment: { label: 'Assignment', color: 'bg-tertiary/10 text-tertiary'   },
  attendance: { label: 'Attendance', color: 'bg-error/10 text-error'         },
  profile:    { label: 'Profile',    color: 'bg-green-100 text-green-700'    },
  shortcut:   { label: 'Quick Link', color: 'bg-purple-100 text-purple-700'  },
};

// ─── Shared result list (used by both desktop dropdown & mobile overlay) ───────
function ResultList({ grouped, activeIndex, onSelect, onHover }) {
  let globalIndex = 0;
  const entries = Object.entries(grouped);
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map(([type, items]) => (
        <div key={type}>
          <div className="px-4 pt-3 pb-1">
            <span className="text-xs font-semibold text-outline uppercase tracking-widest">
              {TYPE_META[type]?.label ?? type}
            </span>
          </div>
          {items.map((item) => {
            const idx = globalIndex++;
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                onMouseEnter={() => onHover(idx)}
                onClick={() => onSelect(item)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${isActive ? 'bg-primary/10' : 'hover:bg-surface-container-highest/50'}`}
              >
                <span
                  className={`material-symbols-outlined w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${TYPE_META[type]?.color ?? 'bg-surface-container text-on-surface-variant'}`}
                  style={{ fontSize: '18px' }}
                >
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{item.label}</p>
                  <p className="text-xs text-outline truncate">{item.detail}</p>
                </div>
                <span className="material-symbols-outlined text-outline text-sm flex-shrink-0">arrow_forward</span>
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
}

// ─── useSearchLogic hook ───────────────────────────────────────────────────────
function useSearchLogic(searchIndex, onClose) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); return; }
    const filtered = searchIndex.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.detail.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
    ).slice(0, 8);
    setResults(filtered);
    setActiveIndex(-1);
  }, [query, searchIndex]);

  const grouped = useMemo(() => {
    const g = {};
    results.forEach((r) => { if (!g[r.type]) g[r.type] = []; g[r.type].push(r); });
    return g;
  }, [results]);

  const handleSelect = useCallback((item) => {
    navigate(item.route);
    setQuery('');
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); handleSelect(results[activeIndex]); }
    else if (e.key === 'Escape') { onClose(); }
  };

  return { query, setQuery, results, grouped, activeIndex, setActiveIndex, handleSelect, handleKeyDown };
}

// ─── Desktop SearchBar ─────────────────────────────────────────────────────────
function DesktopSearchBar({ searchIndex }) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropRef  = useRef(null);

  const { query, setQuery, results, grouped, activeIndex, setActiveIndex, handleSelect, handleKeyDown } =
    useSearchLogic(searchIndex, () => { setIsOpen(false); inputRef.current?.blur(); });

  useEffect(() => { setIsOpen(results.length > 0); }, [results]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center bg-surface-container-lowest rounded-full px-3 py-2 custom-shadow">
        <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>search</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search grades, tasks..."
          className="bg-transparent border-none focus:ring-0 text-sm w-44 font-medium placeholder:text-outline outline-none px-2 text-on-surface"
          autoComplete="off"
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-sm leading-none">close</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div ref={dropRef} className="absolute right-0 top-full mt-2 w-80 bg-surface-container-low rounded-2xl shadow-lg border border-outline-variant/30 overflow-hidden z-50">
          <ResultList grouped={grouped} activeIndex={activeIndex} onSelect={handleSelect} onHover={setActiveIndex} />
        </div>
      )}
    </div>
  );
}

// ─── Mobile Search Overlay ─────────────────────────────────────────────────────
function MobileSearchOverlay({ onClose, searchIndex }) {
  const inputRef = useRef(null);
  const { query, setQuery, grouped, activeIndex, setActiveIndex, handleSelect, handleKeyDown } =
    useSearchLogic(searchIndex, onClose);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm flex flex-col">
      {/* Search input bar */}
      <div className="bg-surface-container-low px-4 pt-12 pb-3 flex items-center gap-3 border-b border-outline-variant/30">
        <button onClick={onClose} className="text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 flex items-center bg-surface-container-lowest rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-outline" style={{ fontSize: '20px' }}>search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search grades, assignments..."
            className="bg-transparent border-none focus:ring-0 text-sm flex-1 font-medium placeholder:text-outline outline-none px-2 text-on-surface"
            autoComplete="off"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-outline">
              <span className="material-symbols-outlined text-sm leading-none">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 bg-surface-container-low overflow-y-auto">
        {query.trim() === '' ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-outline">
            <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>search</span>
            <p className="text-sm">Search for grades, subjects, assignments…</p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-outline">
            <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>search_off</span>
            <p className="text-sm">No results for "{query}"</p>
          </div>
        ) : (
          <ResultList grouped={grouped} activeIndex={activeIndex} onSelect={handleSelect} onHover={setActiveIndex} />
        )}
      </div>
    </div>
  );
}

// ─── TopNavbar ─────────────────────────────────────────────────────────────────
export default function TopNavbar({ title, headerActions }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchIndex = useSearchIndex();

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-md border-b border-outline-variant/30 transition-colors duration-300">
        <div className="flex justify-between items-center px-4 sm:px-8 py-3 sm:py-4">
          {/*
            pl-12 reserves space for Sidebar's floating hamburger button
            (fixed top-4 left-4), which renders whenever the sidebar is in
            overlay mode. That mode now applies below 1280px (matches the
            threshold in Sidebar.jsx / MainLayout.jsx), so the padding must
            only drop away at xl, not md — otherwise on iPad widths the
            floating button overlaps the title text.
          */}
          <div className="flex items-center gap-4 pl-12 xl:pl-0">
            <h1 className="text-lg sm:text-xl font-bold font-headline text-on-background tracking-tight">
              {title}
            </h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-3">

            {/* ── Extra actions injected by the page (e.g. ID Card button) ── */}
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}

            {/* Desktop search */}
            <div className="hidden lg:block">
              <DesktopSearchBar searchIndex={searchIndex} />
            </div>

            {/* Mobile search icon */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
              aria-label="Search"
            >
              <span className="material-symbols-outlined">search</span>
            </button>

            {/* Notifications */}
            <Link
              to="/student/notifications"
              className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors relative block"
            >
              <span className="material-symbols-outlined block">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-low"></span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileSearchOpen && (
        <MobileSearchOverlay
          onClose={() => setMobileSearchOpen(false)}
          searchIndex={searchIndex}
        />
      )}
    </>
  );
}