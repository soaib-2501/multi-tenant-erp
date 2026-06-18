import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";

const studentMockNotifications = [
  {
    id: 1,
    title: "Assignment Submitted Successfully",
    message: "Your Mathematics assignment has been submitted and is pending review.",
    category: "academic",
    timeLabel: "2 hours ago",
    is_read: false,
    type: "success",
    details: { subject: "Mathematics", status: "Pending Review", submitted: "Today 10:30 AM" }
  },
  {
    id: 2,
    title: "New Announcement from Teacher",
    message: "Physics practical exam schedule has been updated. Please check the timetable.",
    category: "announcement",
    timeLabel: "5 hours ago",
    is_read: false,
    type: "info",
    details: { subject: "Physics", teacher: "Dr. Sharma", updatedOn: "Today" }
  },
  {
    id: 3,
    title: "Attendance Alert",
    message: "Your attendance is below 75% in Mathematics. Please ensure regular attendance.",
    category: "attendance",
    timeLabel: "1 day ago",
    is_read: true,
    type: "warning",
    details: { subject: "Mathematics", currentAttendance: "68%", required: "75%" }
  },
  {
    id: 4,
    title: "Result Published",
    message: "Mid-term examination results for Science have been published. Check now!",
    category: "academic",
    timeLabel: "2 days ago",
    is_read: true,
    type: "success",
    details: { exam: "Mid-term", subject: "Science", publishedOn: "2 days ago" }
  },
  {
    id: 5,
    title: "Fee Reminder",
    message: "The deadline for fee submission is approaching. Please pay by 25th March.",
    category: "finance",
    timeLabel: "3 days ago",
    is_read: true,
    type: "warning",
    details: { deadline: "25th March", amount: "Pending", paymentMode: "Online/Offline" }
  }
];

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function NotificationsSkeleton() {
  return (
    <MainLayout title="Notifications">
      <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
        <div className="mb-5">
          <Skeleton className="w-40 sm:w-48 h-7 mb-2" />
          <Skeleton className="w-56 sm:w-64 h-4" />
        </div>
        <div className="mb-5 flex flex-col sm:flex-row gap-3">
          <Skeleton className="w-full h-10 rounded-xl" />
          <Skeleton className="w-full sm:w-36 h-10 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 border">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 mb-2">
                    <Skeleton className="w-36 sm:w-48 h-5" />
                    <Skeleton className="w-16 h-3 shrink-0" />
                  </div>
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default function Notifications() {
  const { loading: studentLoading } = useStudent();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/student/notifications/`,
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          if (response.ok) {
            const data = await response.json();
            const realData = data?.results || data;
            if (Array.isArray(realData) && realData.length > 0) {
              setNotifications(realData);
              setLoading(false);
              return;
            }
          }
        } catch {
          console.log("Using mock notifications data");
        }
      }
      setNotifications(studentMockNotifications);
    } catch {
      setNotifications(studentMockNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllAsRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id) =>
    setExpandedId(expandedId === id ? null : id);

  const filteredNotifications = notifications.filter(n => {
    const matchesTab   = activeTab === "all" || n.category === activeTab;
    const matchesSearch = searchQuery === "" ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTypeStyle = (type) => {
    switch (type) {
      case "warning": return { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-l-amber-400"   };
      case "success": return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-l-emerald-400" };
      case "info":    return { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-l-blue-400"    };
      default:        return { bg: "bg-purple-50",  text: "text-purple-600",  border: "border-l-purple-400"  };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "academic":     return "school";
      case "announcement": return "campaign";
      case "attendance":   return "event_available";
      case "finance":      return "payments";
      default:             return "notifications";
    }
  };

  if (studentLoading || loading) return <NotificationsSkeleton />;

  const TABS = ["all", "academic", "announcement", "attendance", "finance"];

  return (
    <MainLayout title="Notifications">
      {/*
        KEY RESPONSIVE FIXES:
        1. p-3 sm:p-4 md:p-6 — scales with screen size.
        2. Header "Mark all" button — full-width on mobile.
        3. Filter tabs — overflow-x-auto + nowrap so they NEVER wrap/break on small screens.
        4. Action buttons (mark-read / delete) — always visible on mobile (opacity-100),
           hover-reveal only on sm+ (sm:opacity-0 sm:group-hover:opacity-100).
           Touch screens don't have hover so buttons were invisible before.
        5. Expanded details grid — grid-cols-1 on xs, 2 on sm, 3 on md.
           max-h increased to 80 (20rem) so cards don't get clipped on mobile.
        6. min-w-0 on all text containers to prevent text overflow.
      */}
      <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">Notifications</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Stay updated with your academic journey
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-surface-container-lowest border border-outline-variant/20 text-primary text-xs font-semibold rounded-lg shadow-sm hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="mb-5 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/10 shadow-sm space-y-2 sm:space-y-0 sm:flex sm:gap-3 sm:items-center">

          {/* Tabs — horizontal scroll on mobile, never wraps */}
          <div className="overflow-x-auto">
            <div className="flex bg-surface-container-low p-1 rounded-lg gap-1 w-max min-w-full sm:min-w-0">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "bg-white text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-surface-container-low pl-9 pr-4 py-2 rounded-lg text-xs font-medium border border-transparent focus:border-primary/30 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        {/* Unread badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Recent Activity
          </span>
          {unreadCount > 0 && (
            <span className="bg-primary text-white px-2 py-0.5 rounded-full text-2xs font-bold">
              {unreadCount} New
            </span>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl py-12 text-center border border-outline-variant/10 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-5xl text-outline/30">notifications_off</span>
              <p className="text-sm text-on-surface-variant font-medium">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const typeStyle  = getTypeStyle(n.type);
              const isExpanded = expandedId === n.id;

              return (
                <div
                  key={n.id}
                  onClick={() => toggleExpand(n.id)}
                  className={`group bg-surface-container-lowest rounded-xl border border-l-4 transition-all cursor-pointer hover:shadow-md ${typeStyle.border} ${
                    !n.is_read ? "shadow-sm" : "opacity-75"
                  }`}
                >
                  <div className="p-3 sm:p-4 flex gap-3 items-start">

                    {/* Category icon */}
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${typeStyle.bg}`}>
                      <span className={`material-symbols-outlined text-sm sm:text-base ${typeStyle.text}`}>
                        {getCategoryIcon(n.category)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-1 mb-1">
                        <h3 className={`text-sm font-semibold leading-snug ${!n.is_read ? "text-on-surface" : "text-on-surface-variant"}`}>
                          {n.title}
                          {!n.is_read && (
                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary align-middle" />
                          )}
                        </h3>
                        <span className="text-2xs text-on-surface-variant/60 shrink-0 whitespace-nowrap">
                          {n.timeLabel}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed break-words">
                        {n.message}
                      </p>
                    </div>

                    {/* Action buttons
                        MOBILE  (< sm): always visible — opacity-100
                        DESKTOP (sm+) : hidden until hover — sm:opacity-0 sm:group-hover:opacity-100
                        This is the key fix for touch screens where hover never fires. */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={e => handleMarkAsRead(n.id, e)}
                          title="Mark as read"
                          className="w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-sm">done</span>
                        </button>
                      )}
                      <button
                        onClick={e => handleDeleteNotification(n.id, e)}
                        title="Delete"
                        className="w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <span className={`material-symbols-outlined text-outline/40 text-sm transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details
                      max-h-80 (20rem) instead of max-h-48 — on mobile 1-col grid is taller */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-surface-container-low bg-surface-container-low/30 rounded-b-xl px-3 sm:px-5 ${
                    isExpanded ? "max-h-80 py-4 opacity-100" : "max-h-0 py-0 opacity-0 pointer-events-none"
                  }`}>
                    {n.details && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                        {Object.entries(n.details).map(([key, value]) => (
                          <div key={key} className="bg-white p-2.5 rounded-lg border border-outline-variant/10 shadow-sm">
                            <span className="block text-2xs text-on-surface-variant capitalize mb-0.5">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="text-xs font-bold text-on-surface truncate block">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 text-center text-xs text-on-surface-variant/40 border-t border-outline-variant/10">
          ScholarFlow Student Portal
        </div>
      </div>
    </MainLayout>
  );
}