import React, { useState, useMemo } from "react";
import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import { useParent } from "../../context/ParentProvider";

/* ─── Static + dynamic notifications ───────────────────────────────────── */
const STATIC_NOTIFS = [
  {
    id: "s1",
    category: "academic",
    icon: "psychology",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accent: "border-orange-400",
    bg: "",
    title: "AI Insight generated",
    body: (name) => `Based on recent math quizzes, ${name} shows a 15% improvement in spatial reasoning. Learning path updated.`,
    action: { label: "View Analysis", to: "/parent/ai-insights" },
    time: "2m ago",
    unread: true,
  },
  {
    id: "s2",
    category: "academic",
    icon: "assignment",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accent: "",
    bg: "",
    title: "New Assignment Posted",
    body: () => `Biology: "Micro-ecosystems Project" is now available for submission. Due date: Oct 24th.`,
    action: { label: "Open Assignment", to: "/parent/assignments" },
    time: "1h ago",
    unread: true,
  },
  {
    id: "s3",
    category: "academic",
    icon: "assessment",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    accent: "",
    bg: "",
    title: "Grade Published",
    body: (name) => `Final marks for the Mid-term History Exam have been released. ${name} achieved an A-.`,
    action: { label: "View Report Card", to: "/parent/grades" },
    time: "4h ago",
    unread: false,
  },
  {
    id: "s4",
    category: "attendance",
    icon: "calendar_today",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    accent: "border-red-400",
    bg: "bg-red-50",
    title: "Attendance Alert",
    body: (name) => `${name} was marked absent for the afternoon Physics session without prior notification.`,
    action: null,
    time: "Yesterday",
    unread: true,
  },
  {
    id: "s5",
    category: "academic",
    icon: "forum",
    iconBg: "bg-surface-container-low",
    iconColor: "text-on-surface-variant",
    accent: "",
    bg: "",
    title: "Teacher Remark Added",
    body: () => `Mrs. Gable left a comment on the English Literature essay: "Excellent use of metaphor in the opening paragraph."`,
    action: { label: "Read Full Remark", to: "/parent/grades" },
    time: "Yesterday",
    unread: false,
  },
  {
    id: "s6",
    category: "system",
    icon: "notifications",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    accent: "",
    bg: "",
    title: "Leave Request Approved",
    body: (name) => `${name}'s leave request for Oct 18–19 has been approved by the school administration.`,
    action: { label: "View Attendance", to: "/parent/attendance" },
    time: "2 days ago",
    unread: false,
  },
  {
    id: "s7",
    category: "system",
    icon: "event",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    accent: "",
    bg: "",
    title: "Parent-Teacher Meeting",
    body: () => `Reminder: Parent-Teacher meeting scheduled for Oct 28th at 3:00 PM. Please confirm attendance.`,
    action: null,
    time: "3 days ago",
    unread: false,
  },
];

/* ─── Older notifications (loaded on demand) ───────────────────────────── */
const OLDER_NOTIFS = [
  {
    id: "o1",
    category: "academic",
    icon: "quiz",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    accent: "",
    bg: "",
    title: "Quiz Score Updated",
    body: (name) => `${name} scored 18/20 in the weekly Science quiz. Great improvement from last week!`,
    action: { label: "View Grades", to: "/parent/grades" },
    time: "4 days ago",
    unread: false,
  },
  {
    id: "o2",
    category: "attendance",
    icon: "check_circle",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    accent: "",
    bg: "",
    title: "Full Week Attendance",
    body: (name) => `${name} was present all 5 days this week. Keep it up!`,
    action: { label: "View Attendance", to: "/parent/attendance" },
    time: "5 days ago",
    unread: false,
  },
  {
    id: "o3",
    category: "system",
    icon: "campaign",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    accent: "border-yellow-400",
    bg: "bg-yellow-50",
    title: "School Holiday Notice",
    body: () => `School will remain closed on Nov 1st (Diwali). Classes resume Nov 4th.`,
    action: null,
    time: "6 days ago",
    unread: false,
  },
  {
    id: "o4",
    category: "academic",
    icon: "menu_book",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    accent: "",
    bg: "",
    title: "New Learning Material",
    body: (name) => `New study notes for Chapter 7 (Organic Chemistry) have been uploaded for ${name}'s class.`,
    action: { label: "View Materials", to: "/parent/child-overview" },
    time: "1 week ago",
    unread: false,
  },
  {
    id: "o5",
    category: "system",
    icon: "receipt_long",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    accent: "border-rose-400",
    bg: "",
    title: "Fee Payment Reminder",
    body: () => `Term 2 fee payment is due by Oct 31st. Please complete the payment to avoid a late fine.`,
    action: null,
    time: "1 week ago",
    unread: false,
  },
  {
    id: "o6",
    category: "academic",
    icon: "emoji_events",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    accent: "border-amber-400",
    bg: "bg-amber-50",
    title: "Achievement Unlocked",
    body: (name) => `${name} was recognised as "Student of the Week" by the Mathematics department.`,
    action: { label: "View Profile", to: "/parent/child-overview" },
    time: "10 days ago",
    unread: false,
  },
];

const PAGE_SIZE = 4;

const TABS = [
  { key: "all",        label: "All"        },
  { key: "academic",   label: "Academic"   },
  { key: "attendance", label: "Attendance" },
  { key: "system",     label: "System"     },
];

function NotifCard({ notif, studentName, isUnread, onRead, onDismiss }) {
  return (
    <div
      onClick={onRead}
      className={`relative flex gap-3 items-start px-4 py-3.5 rounded-xl border transition-all cursor-pointer group
        ${notif.accent ? `border-l-4 ${notif.accent}` : "border border-outline-variant/10"}
        ${notif.bg || "bg-surface-container-lowest"}
        ${isUnread ? "shadow-sm" : "opacity-75"}
        hover:shadow-md hover:translate-x-0.5
      `}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.iconBg}`}>
        <span className={`material-symbols-outlined text-base ${notif.iconColor}`}>{notif.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3 className="text-xs font-bold text-on-surface leading-tight">{notif.title}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xs text-on-surface-variant uppercase font-medium">{notif.time}</span>
            {isUnread && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
          </div>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed mb-2">{notif.body(studentName)}</p>
        {notif.action && (
          <a
            href={notif.action.to}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs font-semibold hover:underline ${notif.iconColor}`}
          >
            {notif.action.label} →
          </a>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-all flex-shrink-0 mt-0.5"
        title="Dismiss"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

export default function NotificationsHub() {
  const { profile } = useParent();
  const studentName = profile?.first_name || "your child";

  const [activeTab, setActiveTab]     = useState("all");
  const [readIds, setReadIds]         = useState(new Set());
  const [dismissed, setDismissed]     = useState(new Set());
  const [olderLoaded, setOlderLoaded] = useState([]);   // older notifs revealed so far
  const [olderPage, setOlderPage]     = useState(0);    // pages fetched
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded]     = useState(false);

  const markAllRead = () => {
    const allIds = [...STATIC_NOTIFS, ...olderLoaded].map(n => n.id);
    setReadIds(new Set(allIds));
  };

  const markRead = (id) => setReadIds(prev => new Set([...prev, id]));

  const dismiss = (id) => {
    setDismissed(prev => new Set([...prev, id]));
    markRead(id);
  };

  const handleLoadMore = async () => {
    if (loadingMore || allLoaded) return;
    setLoadingMore(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    const nextPage = olderPage + 1;
    const start = olderPage * PAGE_SIZE;
    const end   = nextPage  * PAGE_SIZE;
    const batch = OLDER_NOTIFS.slice(start, end);
    setOlderLoaded(prev => [...prev, ...batch]);
    setOlderPage(nextPage);
    if (end >= OLDER_NOTIFS.length) setAllLoaded(true);
    setLoadingMore(false);
  };

  const allNotifs = useMemo(() => [...STATIC_NOTIFS, ...olderLoaded], [olderLoaded]);

  const visible = useMemo(() => {
    return allNotifs.filter(n => {
      if (dismissed.has(n.id)) return false;
      if (activeTab === "all") return true;
      return n.category === activeTab;
    });
  }, [activeTab, dismissed, allNotifs]);

  const unreadCount = allNotifs.filter(n => n.unread && !readIds.has(n.id) && !dismissed.has(n.id)).length;

  // how many older notifs still remain to load (for current tab)
  const remainingOlder = OLDER_NOTIFS.slice(olderPage * PAGE_SIZE).filter(n =>
    activeTab === "all" || n.category === activeTab
  ).length;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-base font-bold font-headline text-on-surface">Notifications</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Stay updated with {studentName}&apos;s latest academic progress and school alerts.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-base">done_all</span>
              Mark all as read
            </button>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex bg-surface-container-low p-1 rounded-xl gap-1">
            {TABS.map(({ key, label }) => {
              const count = allNotifs.filter(n =>
                n.unread && !readIds.has(n.id) && !dismissed.has(n.id) &&
                (key === "all" || n.category === key)
              ).length;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === key
                      ? "bg-white shadow-sm text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-3xs font-bold rounded-full flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-on-surface-variant">{visible.length} notification{visible.length !== 1 ? "s" : ""}</span>
        </div>

        {/* ── Notification list ── */}
        {visible.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 py-16 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">notifications_off</span>
            <p className="text-sm text-on-surface-variant">No notifications in this category</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((notif) => (
              <NotifCard
                key={notif.id}
                notif={notif}
                studentName={studentName}
                isUnread={notif.unread && !readIds.has(notif.id)}
                onRead={() => markRead(notif.id)}
                onDismiss={() => dismiss(notif.id)}
              />
            ))}
          </div>
        )}

        {/* ── Load more ── */}
        <div className="flex justify-center pt-2 pb-4">
          {allLoaded || remainingOlder === 0 ? (
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">check</span>
              You&apos;re all caught up
            </p>
          ) : (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container px-5 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Loading…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                  Load older notifications ({remainingOlder} more)
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}