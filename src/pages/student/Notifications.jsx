import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";

// Student mock notifications data
const studentMockNotifications = [
  {
    id: 1,
    title: "Assignment Submitted Successfully",
    message: "Your Mathematics assignment has been submitted and is pending review.",
    category: "academic",
    timeLabel: "2 hours ago",
    is_read: false,
    type: "success"
  },
  {
    id: 2,
    title: "New Announcement from Teacher",
    message: "Physics practical exam schedule has been updated. Please check the timetable.",
    category: "announcement",
    timeLabel: "5 hours ago",
    is_read: false,
    type: "info"
  },
  {
    id: 3,
    title: "Attendance Alert",
    message: "Your attendance is below 75% in Mathematics. Please ensure regular attendance.",
    category: "attendance",
    timeLabel: "1 day ago",
    is_read: true,
    type: "warning"
  },
  {
    id: 4,
    title: "Result Published",
    message: "Mid-term examination results for Science have been published. Check now!",
    category: "academic",
    timeLabel: "2 days ago",
    is_read: true,
    type: "success"
  },
  {
    id: 5,
    title: "Fee Reminder",
    message: "The deadline for fee submission is approaching. Please pay by 25th March.",
    category: "finance",
    timeLabel: "3 days ago",
    is_read: true,
    type: "warning"
  }
];

// Skeleton Component
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function NotificationsSkeleton() {
  return (
    <MainLayout title="Notifications">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-64 h-4" />
        </div>
        
        <div className="mb-6 flex justify-between items-center">
          <Skeleton className="w-32 h-10 rounded-lg" />
          <Skeleton className="w-36 h-10 rounded-lg" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="w-48 h-5" />
                    <Skeleton className="w-20 h-3" />
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
  const [expandedId, setExpandedId] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Try to fetch from API if available
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/student/notifications/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            const realData = data?.results || data;
            if (Array.isArray(realData) && realData.length > 0) {
              setNotifications(realData);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.log("Using mock notifications data");
        }
      }
      // Fallback to mock data
      setNotifications(studentMockNotifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setNotifications(studentMockNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === "all" || n.category === activeTab;
    return matchesTab;
  });

  const unreadCount = filteredNotifications.filter(n => !n.is_read).length;

  const getTypeStyle = (type) => {
    switch (type) {
      case "warning":
        return { bg: "bg-amber-50", text: "text-amber-600", icon: "warning", border: "border-l-amber-400" };
      case "success":
        return { bg: "bg-emerald-50", text: "text-emerald-600", icon: "check_circle", border: "border-l-emerald-400" };
      case "info":
        return { bg: "bg-blue-50", text: "text-blue-600", icon: "info", border: "border-l-blue-400" };
      default:
        return { bg: "bg-purple-50", text: "text-purple-600", icon: "notifications", border: "border-l-purple-400" };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "academic": return "school";
      case "announcement": return "campaign";
      case "attendance": return "event_available";
      case "finance": return "payments";
      default: return "notifications";
    }
  };

  if (studentLoading || loading) return <NotificationsSkeleton />;

  return (
    <MainLayout title="Notifications">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
          <p className="text-sm text-slate-500 mt-1">Stay updated with your academic journey</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            {["all", "academic", "announcement", "attendance", "finance"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  activeTab === tab 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              Mark all as read
            </button>
          )}
        </div>

        {/* Unread Count */}
        {unreadCount > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Unread</span>
            <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {unreadCount}
            </span>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl py-12 text-center border">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">notifications_off</span>
              <p className="text-sm text-slate-500">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const typeStyle = getTypeStyle(n.type);
              const isExpanded = expandedId === n.id;

              return (
                <div
                  key={n.id}
                  onClick={() => toggleExpand(n.id)}
                  className={`bg-white rounded-xl border border-l-4 transition-all cursor-pointer ${typeStyle.border} ${
                    !n.is_read ? "shadow-sm" : "opacity-70"
                  }`}
                >
                  <div className="p-4 flex gap-3 items-start">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeStyle.bg}`}>
                      <span className="material-symbols-outlined text-base">{getCategoryIcon(n.category)}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                        <h3 className={`text-sm font-semibold ${!n.is_read ? "text-slate-900" : "text-slate-600"}`}>
                          {n.title}
                        </h3>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timeLabel}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="w-7 h-7 rounded-full bg-slate-50 border text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all"
                          title="Mark as read"
                        >
                          <span className="material-symbols-outlined text-sm">done</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteNotification(n.id, e)}
                        className="w-7 h-7 rounded-full bg-slate-50 border text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <span className={`material-symbols-outlined text-slate-300 text-sm transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <div className={`overflow-hidden transition-all duration-300 border-t bg-slate-50/30 rounded-b-xl ${
                    isExpanded ? "max-h-32 py-3 px-4" : "max-h-0 py-0 px-4"
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Notification ID: #{n.id}</span>
                      <span className="text-slate-400 text-[10px]">Category: {n.category}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 text-center text-xs text-slate-400 border-t">
          ScholarFlow Student Portal
        </footer>
      </div>
    </MainLayout>
  );
}