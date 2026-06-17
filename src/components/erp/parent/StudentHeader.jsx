import React from "react";
import { useParent } from "../../../context/ParentProvider";

const StudentHeader = () => {
  const { profile, enrollment, loading } = useParent();

  // ── Derived values ────────────────────────────────────────────────────────
  const displayName = (() => {
    if (profile?.user?.first_name)
      return `${profile.user.first_name} ${profile.user.last_name || ""}`.trim();
    if (profile?.first_name)
      return `${profile.first_name} ${profile.last_name || ""}`.trim();
    return "Student";
  })();

  const classSection =
    enrollment?.class_level_name && enrollment?.section_name
      ? `${enrollment.class_level_name} – ${enrollment.section_name}`
      : enrollment?.class_name && enrollment?.section_name
      ? `${enrollment.class_name} – ${enrollment.section_name}`
      : enrollment?.class_name || enrollment?.class_level_name || "—";

  const schoolName =
    enrollment?.school_name ||
    profile?.school_name ||
    "School";

  const teacherEmail =
    enrollment?.class_teacher_email ||
    enrollment?.teacher_email ||
    null;

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center animate-pulse">
        <div className="md:col-span-2 space-y-3">
          <div className="h-8 bg-surface-container-low rounded w-56" />
          <div className="flex gap-4">
            <div className="h-4 bg-surface-container-low rounded w-28" />
            <div className="h-4 bg-surface-container-low rounded w-20" />
            <div className="h-4 bg-surface-container-low rounded w-32" />
          </div>
        </div>
        <div className="flex md:justify-end gap-3">
          <div className="h-10 w-36 bg-surface-container-low rounded-md" />
          <div className="h-10 w-36 bg-surface-container-low rounded-md" />
        </div>
      </section>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      <div className="md:col-span-2 space-y-2">
        <h2 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">
          Parent Dashboard
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">person</span>
            <span className="font-semibold">{displayName}</span>
          </div>

          <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/50" />

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">school</span>
            <span>{classSection}</span>
          </div>

          <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/50" />

          <div className="flex items-center gap-2 text-primary font-medium">
            <span>{schoolName}</span>
          </div>

        </div>
      </div>

      <div className="flex md:justify-end gap-3">
        <button
          onClick={() => window.print()}
          className="bg-surface-container-high text-primary px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-surface-variant transition-colors active:scale-95 duration-75"
        >
          Download Report
        </button>

        {teacherEmail ? (
          <a
            href={`mailto:${teacherEmail}`}
            className="bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-md font-semibold text-sm shadow-md hover:brightness-110 transition-all active:scale-95 duration-75"
          >
            Contact Teacher
          </a>
        ) : (
          <button
            disabled
            title="Teacher email not available"
            className="bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-md font-semibold text-sm shadow-md opacity-60 cursor-not-allowed"
          >
            Contact Teacher
          </button>
        )}
      </div>
    </section>
  );
};

export default StudentHeader;