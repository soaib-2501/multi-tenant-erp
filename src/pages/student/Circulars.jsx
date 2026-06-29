import React, { useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";

/* ─── Mock data — replace with API call later ───────────────────────────── */
const MOCK_CIRCULARS = [
  {
    id: "c1",
    title: "Half-Yearly Examination Schedule — 2026",
    category: "Examination",
    priority: "urgent",
    date: "2026-06-28",
    postedBy: "Academic Office",
    body: "The Half-Yearly Examinations will commence from July 14, 2026. Students are advised to collect their admit cards from the school office by July 10. All examinations will be held in the Main Hall from 9:00 AM to 12:00 PM. Please carry your school ID card on all exam days.",
    attachments: [
      { name: "Exam_Schedule_HY2026.pdf", size: "142 KB" },
    ],
  },
  {
    id: "c2",
    title: "Annual Sports Day — Registration Open",
    category: "Event",
    priority: "normal",
    date: "2026-06-25",
    postedBy: "Sports Department",
    body: "The Annual Sports Day is scheduled for July 22, 2026. Students wishing to participate in track & field, team sports, or cultural events must register with their respective class teachers by July 5. Practice sessions will be held every Tuesday and Thursday from 4:00 PM.",
    attachments: [],
  },
  {
    id: "c3",
    title: "Change in School Timings — Effective July 1",
    category: "General",
    priority: "important",
    date: "2026-06-22",
    postedBy: "School Administration",
    body: "Effective July 1, 2026, school timings will change to 7:45 AM – 2:15 PM for all classes. The first bell will ring at 7:40 AM. Parents are requested to adjust drop-off timings accordingly. Late arrivals after 8:00 AM will be marked as late.",
    attachments: [
      { name: "Revised_Timetable_July.pdf", size: "98 KB" },
      { name: "Parent_Notice_Timings.pdf",  size: "54 KB" },
    ],
  },
  {
    id: "c4",
    title: "Library Books Return — Final Reminder",
    category: "General",
    priority: "normal",
    date: "2026-06-20",
    postedBy: "Library Committee",
    body: "All students who have borrowed books from the school library must return them by June 30, 2026. A fine of ₹5 per day will be levied on overdue books. Students with pending returns will not receive their examination admit cards.",
    attachments: [],
  },
  {
    id: "c5",
    title: "Science Exhibition — Project Submission Guidelines",
    category: "Academic",
    priority: "normal",
    date: "2026-06-18",
    postedBy: "Science Department",
    body: "The Inter-School Science Exhibition will be held on August 3, 2026. Students from Grade 8 and above are eligible to participate. Project proposals must be submitted to the Science Lab in-charge by July 12. Each project must have a maximum of 3 members. Shortlisted projects will be announced by July 16.",
    attachments: [
      { name: "Exhibition_Guidelines_2026.pdf", size: "210 KB" },
    ],
  },
  {
    id: "c6",
    title: "Parent-Teacher Meeting — July 2026",
    category: "Event",
    priority: "important",
    date: "2026-06-15",
    postedBy: "School Administration",
    body: "The quarterly Parent-Teacher Meeting is scheduled for July 5, 2026 from 10:00 AM to 1:00 PM. Parents of students in Grade 6-10 are requested to attend. Slot bookings can be done through the school app or by contacting the class teacher directly. Please note that attendance is compulsory.",
    attachments: [],
  },
  {
    id: "c7",
    title: "Fee Payment — Last Date Extended",
    category: "Fees",
    priority: "urgent",
    date: "2026-06-10",
    postedBy: "Accounts Department",
    body: "The last date for Term 2 fee payment has been extended to July 15, 2026. Students with pending dues will not be permitted to appear in the Half-Yearly Examination. Online payment can be done through the school portal. For any queries contact the accounts office between 9 AM – 12 PM on working days.",
    attachments: [],
  },
  {
    id: "c8",
    title: "Holiday Notice — Eid al-Adha",
    category: "Holiday",
    priority: "normal",
    date: "2026-06-05",
    postedBy: "School Administration",
    body: "The school will remain closed on June 17, 2026 (Wednesday) on account of Eid al-Adha. Classes will resume on June 18, 2026 as per the regular schedule. Students are advised to complete pending assignments during the holiday.",
    attachments: [],
  },
];

const CATEGORIES = ["All", "Examination", "Event", "Academic", "General", "Fees", "Holiday"];

const PRIORITY_META = {
  urgent:    { label: "Urgent",    bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
  important: { label: "Important", bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500"  },
  normal:    { label: "Notice",    bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-400"   },
};

const CATEGORY_ICONS = {
  Examination: { icon: "assignment",        bg: "bg-purple-50",  text: "text-purple-600" },
  Event:       { icon: "event",             bg: "bg-green-50",   text: "text-green-600"  },
  Academic:    { icon: "science",           bg: "bg-blue-50",    text: "text-blue-600"   },
  General:     { icon: "campaign",          bg: "bg-orange-50",  text: "text-orange-600" },
  Fees:        { icon: "account_balance",   bg: "bg-red-50",     text: "text-red-600"    },
  Holiday:     { icon: "celebration",       bg: "bg-teal-50",    text: "text-teal-600"   },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function daysAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function CircularsSkeleton() {
  return (
    <MainLayout title="Circulars & Notices">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="w-48 h-7" />
          <Skeleton className="w-72 h-4" />
        </div>
        <Skeleton className="w-full h-10 rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex gap-3 items-start">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

/* ─── Detail Modal ───────────────────────────────────────────────────────── */
function CircularModal({ circular, onClose }) {
  const priority = PRIORITY_META[circular.priority];
  const catMeta  = CATEGORY_ICONS[circular.category] || CATEGORY_ICONS.General;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start gap-4 px-5 sm:px-6 py-5 border-b border-gray-100">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${catMeta.bg}`}>
            <span className={`material-symbols-outlined text-xl ${catMeta.text}`}>{catMeta.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${priority.bg} ${priority.text}`}>
                {priority.label}
              </span>
              <span className="text-2xs text-on-surface-variant font-medium">{circular.category}</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-on-surface leading-snug">{circular.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-on-surface-variant flex-shrink-0 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {formatDate(circular.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">person</span>
              {circular.postedBy}
            </span>
          </div>

          {/* Body text */}
          <p className="text-sm text-on-surface leading-relaxed">{circular.body}</p>

          {/* Attachments */}
          {circular.attachments.length > 0 && (
            <div>
              <p className="text-2xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Attachments ({circular.attachments.length})
              </p>
              <div className="space-y-2">
                {circular.attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-sm text-red-600">picture_as_pdf</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface truncate">{att.name}</p>
                      <p className="text-2xs text-on-surface-variant">{att.size}</p>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline flex-shrink-0">
                      <span className="material-symbols-outlined text-sm">download</span>
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Circular Card ──────────────────────────────────────────────────────── */
function CircularCard({ circular, onClick }) {
  const priority = PRIORITY_META[circular.priority];
  const catMeta  = CATEGORY_ICONS[circular.category] || CATEGORY_ICONS.General;

  return (
    <div
      onClick={onClick}
      className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-sm border border-outline-variant/10
                 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Category icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${catMeta.bg} transition-transform group-hover:scale-105`}>
          <span className={`material-symbols-outlined text-xl ${catMeta.text}`}>{catMeta.icon}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-on-surface leading-snug group-hover:text-primary transition-colors pr-2">
              {circular.title}
            </h3>
            {/* Priority badge */}
            <span className={`flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${priority.bg} ${priority.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priority.dot}`} />
              {priority.label}
            </span>
          </div>

          {/* Body preview */}
          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-3">
            {circular.body}
          </p>

          {/* Footer row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1 text-2xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">person</span>
              {circular.postedBy}
            </span>
            <span className="flex items-center gap-1 text-2xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {daysAgo(circular.date)}
            </span>
            {circular.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-2xs text-primary font-semibold">
                <span className="material-symbols-outlined text-sm">attach_file</span>
                {circular.attachments.length} attachment{circular.attachments.length > 1 ? "s" : ""}
              </span>
            )}
            <span className="ml-auto text-2xs font-semibold text-primary flex items-center gap-0.5 group-hover:gap-1 transition-all">
              Read more
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Circulars() {
  const [loading]          = useState(false); // set true when wiring real API
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery,      setSearchQuery]      = useState("");
  const [activeCircular,   setActiveCircular]   = useState(null);

  const filtered = useMemo(() => {
    return MOCK_CIRCULARS.filter(c => {
      const matchCat    = selectedCategory === "All" || c.category === selectedCategory;
      const matchSearch = !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.postedBy.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const urgentCount = MOCK_CIRCULARS.filter(c => c.priority === "urgent").length;

  if (loading) return <CircularsSkeleton />;

  return (
    <MainLayout title="Circulars & Notices">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline text-on-surface">
              Circulars &amp; Notices
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Official announcements and updates from the school
            </p>
          </div>
          {/* Urgent banner */}
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              {urgentCount} urgent notice{urgentCount > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search circulars, notices…"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 text-on-surface
                       placeholder:text-on-surface-variant"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* ── Category Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${selectedCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
            >
              {cat === "All"
                ? `All (${MOCK_CIRCULARS.length})`
                : `${cat} (${MOCK_CIRCULARS.filter(c => c.category === cat).length})`
              }
            </button>
          ))}
        </div>

        {/* ── Circular List ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-30">campaign</span>
            <p className="text-sm text-on-surface-variant">No circulars found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="text-sm text-primary font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Count */}
            <p className="text-2xs text-on-surface-variant font-medium">
              Showing {filtered.length} of {MOCK_CIRCULARS.length} notices
              {selectedCategory !== "All" && ` · ${selectedCategory}`}
            </p>

            {filtered.map(circular => (
              <CircularCard
                key={circular.id}
                circular={circular}
                onClick={() => setActiveCircular(circular)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {activeCircular && (
        <CircularModal
          circular={activeCircular}
          onClose={() => setActiveCircular(null)}
        />
      )}
    </MainLayout>
  );
}