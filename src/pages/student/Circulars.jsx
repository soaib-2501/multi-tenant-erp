import React, { useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import { schoolAdminApi } from "../../services/schoolAdminApi";

const AUDIENCE_ICONS = {
  Student: { icon: "school", bg: "bg-blue-50", text: "text-blue-600" },
  Parent: { icon: "family_restroom", bg: "bg-purple-50", text: "text-purple-600" },
  Teacher: { icon: "person", bg: "bg-green-50", text: "text-green-600" },
  All: { icon: "campaign", bg: "bg-orange-50", text: "text-orange-600" },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

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
          {[1, 2, 3, 4].map((i) => (
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
function CircularModal({ circular, onClose, loading }) {
  const audMeta = AUDIENCE_ICONS[circular.target_audience_display] || AUDIENCE_ICONS.All;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${audMeta.bg}`}>
            <span className={`material-symbols-outlined text-lg sm:text-xl ${audMeta.text}`}>{audMeta.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-surface-container-low text-on-surface-variant">
                {circular.target_audience_display || "All"}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-on-surface leading-snug break-words">
              {circular.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-on-surface-variant flex-shrink-0 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {formatDate(circular.created_at)}
            </span>
            {circular.created_by_name && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">person</span>
                {circular.created_by_name}
              </span>
            )}
          </div>

          {/* Content — shows skeleton while loading */}
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-5/6 h-3" />
              <Skeleton className="w-4/6 h-3" />
              <Skeleton className="w-full h-3 mt-2" />
              <Skeleton className="w-3/4 h-3" />
            </div>
          ) : (
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line break-words">
              {circular.content || "No content provided."}
            </p>
          )}

          {circular.attachment_name && (
            <div>
              <p className="text-2xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Attachment
              </p>
              <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-3 sm:px-4 py-3 flex-wrap sm:flex-nowrap">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-sm text-red-600">attach_file</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-on-surface truncate">
                    {circular.attachment_name}
                  </p>
                </div>
                <a
                  href={circular.attachment_key}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
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
  const audMeta = AUDIENCE_ICONS[circular.target_audience_display] || AUDIENCE_ICONS.All;

  return (
    <div
      onClick={onClick}
      className="bg-surface-container-lowest rounded-xl p-3.5 sm:p-4 lg:p-5 shadow-sm border border-outline-variant/10
                 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${audMeta.bg} transition-transform group-hover:scale-105`}>
          <span className={`material-symbols-outlined text-lg sm:text-xl ${audMeta.text}`}>{audMeta.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start justify-between gap-1.5 sm:gap-2 mb-1">
            <h3 className="text-sm font-bold text-on-surface leading-snug group-hover:text-primary transition-colors pr-0 sm:pr-2 break-words">
              {circular.title}
            </h3>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 bg-surface-container-low text-on-surface-variant self-start">
              {circular.target_audience_display || "All"}
            </span>
          </div>

          {/* Card preview — content not in list response, so show nothing here */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
            {circular.created_by_name && (
              <span className="flex items-center gap-1 text-2xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">person</span>
                {circular.created_by_name}
              </span>
            )}
            <span className="flex items-center gap-1 text-2xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {daysAgo(circular.created_at)}
            </span>
            {circular.attachment_name && (
              <span className="flex items-center gap-1 text-2xs text-primary font-semibold">
                <span className="material-symbols-outlined text-sm">attach_file</span>
                Attachment
              </span>
            )}
            <span className="w-full sm:w-auto sm:ml-auto text-2xs font-semibold text-primary flex items-center gap-0.5 group-hover:gap-1 transition-all">
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
  const { circulars, loading } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCircular, setActiveCircular] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const allCirculars = useMemo(() => circulars || [], [circulars]);

  // Fetch full detail (including content) when opening a circular,
  // since the list endpoint omits the content field.
  const openCircular = async (circular) => {
    setActiveCircular({ ...circular, content: null }); // open modal immediately with metadata
    setModalLoading(true);
    try {
      const full = await schoolAdminApi.getCircularById(circular.id);
      setActiveCircular(full);
    } catch (err) {
      console.error("Failed to load circular detail:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return allCirculars.filter((c) => {
      const matchSearch =
        !searchQuery ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.created_by_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [allCirculars, searchQuery]);

  if (loading) return <CircularsSkeleton />;

  return (
    <MainLayout title="Circulars & Notices">
      <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold font-headline text-on-surface">
              Circulars &amp; Notices
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Official announcements and updates from the school
            </p>
          </div>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3 text-center px-4">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-30">
              campaign
            </span>
            <p className="text-sm text-on-surface-variant">
              {allCirculars.length === 0
                ? "No circulars yet."
                : "No circulars found matching your search."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-primary font-semibold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            <p className="text-2xs text-on-surface-variant font-medium">
              Showing {filtered.length} of {allCirculars.length} notices
            </p>

            {filtered.map((circular) => (
              <CircularCard
                key={circular.id}
                circular={circular}
                onClick={() => openCircular(circular)}
              />
            ))}
          </div>
        )}
      </div>

      {activeCircular && (
        <CircularModal
          circular={activeCircular}
          loading={modalLoading}
          onClose={() => setActiveCircular(null)}
        />
      )}
    </MainLayout>
  );
}
