import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import { getParentChildren } from "../../services/parentAPIs";
import {
    createGrievance,
    getGrievances,
    getGrievanceStats,
    getCategories,
    getPriorities,
    closeGrievance,
} from "../../services/schoolAdminApi";

// ── Status badge config (keys MUST match backend Grievance.StatusChoices) ──
const STATUS = {
    "Pending": { label: "Pending", cls: "text-amber-700 bg-amber-50 border border-amber-200" },
    "In-Progress": { label: "In Progress", cls: "text-blue-700 bg-blue-50 border border-blue-200" },
    "Resolved": { label: "Resolved", cls: "text-green-700 bg-green-50 border border-green-200" },
    "Rejected": { label: "Rejected", cls: "text-red-700 bg-red-50 border border-red-200" },
    "Closed": { label: "Closed", cls: "text-gray-600 bg-gray-100 border border-gray-200" },
};
const statusBadge = (s) => STATUS[s] || { label: s || "Unknown", cls: "text-gray-600 bg-gray-100 border border-gray-200" };

// ── Priority badge config (keys MUST match backend Grievance.PriorityChoices) ──
const PRIORITY = {
    "Low": { label: "Low", dot: "bg-green-500", cls: "text-green-700 bg-green-50" },
    "Medium": { label: "Medium", dot: "bg-amber-500", cls: "text-amber-700 bg-amber-50" },
    "High": { label: "High", dot: "bg-red-500", cls: "text-red-700 bg-red-50" },
    "Urgent": { label: "Urgent", dot: "bg-purple-600", cls: "text-purple-700 bg-purple-50" },
};
const priorityBadge = (p) => PRIORITY[p] || { label: p || "—", dot: "bg-gray-400", cls: "text-gray-600 bg-gray-50" };

// ── Category icon/color map (presentation only — falls back gracefully for any
//    category value returned by the backend that we don't have a custom icon for) ──
const CATEGORY_STYLE = {
    Academic: { icon: "school", color: "bg-blue-50 text-blue-600" },
    Fee: { icon: "payments", color: "bg-emerald-50 text-emerald-600" },
    Facilities: { icon: "domain", color: "bg-orange-50 text-orange-600" },
    Teacher: { icon: "supervisor_account", color: "bg-rose-50 text-rose-600" },
    Transport: { icon: "directions_bus", color: "bg-indigo-50 text-indigo-600" },
    Examination: { icon: "edit_document", color: "bg-purple-50 text-purple-600" },
    Library: { icon: "menu_book", color: "bg-teal-50 text-teal-600" },
    Sports: { icon: "sports_soccer", color: "bg-lime-50 text-lime-700" },
    Canteen: { icon: "restaurant", color: "bg-yellow-50 text-yellow-700" },
    Other: { icon: "help_outline", color: "bg-gray-100 text-gray-600" },
};
const categoryStyle = (value) => CATEGORY_STYLE[value] || { icon: "help_outline", color: "bg-gray-100 text-gray-600" };

// Normalizes whatever getParentChildren() returns into {id, label, raw}.
// IMPORTANT: child.id from this endpoint is the parent-student MAPPING id,
// not the StudentProfile pk the Grievance API expects — child.student_id
// is the correct value to send as `student` when creating a grievance.
const normalizeChild = (child) => ({
    id: child.student_id,
    label: child.name || child.full_name || child.email || "Unnamed student",
    raw: child,
});

// A grievance came from the parent's own submission if submitted_by_role is
// "Parent" — this field comes straight from GrievanceSerializer on /me/, so
// no extra lookups or guessing are needed to tell "filed by me" apart from
// "filed by my child".
const isFiledByParent = (g) => g.submitted_by_role === "Parent";

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
    return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function HomeSkeleton() {
    return (
        <DashboardLayout>
            <div className="px-8 py-8 space-y-8 max-w-6xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a237e] to-[#283593] p-8">
                    <div className="relative z-10 max-w-2xl space-y-4">
                        <Skeleton className="w-48 h-4 bg-white/20" />
                        <Skeleton className="w-64 h-8 bg-white/20" />
                        <Skeleton className="w-3/4 h-4 bg-white/20" />
                        <div className="flex gap-3">
                            <Skeleton className="w-40 h-10 rounded-xl bg-white/30" />
                            <Skeleton className="w-40 h-10 rounded-xl bg-white/20" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
                            <Skeleton className="w-9 h-9 rounded-lg mb-3" />
                            <Skeleton className="w-16 h-7 mb-1" />
                            <Skeleton className="w-20 h-3" />
                        </div>
                    ))}
                </div>
                <div>
                    <Skeleton className="w-40 h-5 mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className="flex flex-col items-center gap-2 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                                <Skeleton className="w-12 h-12 rounded-xl" />
                                <Skeleton className="w-16 h-3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function TrackSkeleton() {
    return (
        <DashboardLayout>
            <div className="px-8 py-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div><Skeleton className="w-40 h-6" /><Skeleton className="w-56 h-3 mt-1" /></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10 space-y-3">
                                <Skeleton className="w-24 h-6" />
                                <Skeleton className="w-3/4 h-4" />
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-3">
                        <Skeleton className="w-full h-64 rounded-2xl" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function NewSkeleton() {
    return (
        <DashboardLayout>
            <div className="px-8 py-8 max-w-5xl mx-auto">
                <Skeleton className="w-40 h-6 mb-6" />
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-10">
                    <Skeleton className="w-full h-8 mb-6" />
                    <Skeleton className="w-full h-40" />
                </div>
            </div>
        </DashboardLayout>
    );
}

// ── GrievanceCard ──────────────────────────────────────────────────────────
function GrievanceCard({ g, onClick, isSelected }) {
    const cat = categoryStyle(g.category);
    const stat = statusBadge(g.status);
    const pri = priorityBadge(g.priority);
    const filedByParent = isFiledByParent(g);

    return (
        <button
            onClick={() => onClick(g)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:border-primary/40 hover:shadow-sm
        ${isSelected ? "border-primary/60 bg-primary/5 shadow-sm" : "border-outline-variant/20 bg-surface-container-lowest"}`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                        <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                    </span>
                    <span className="text-2xs font-bold text-on-surface-variant">{g.category}</span>
                </div>
                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${stat.cls}`}>
                    {stat.label}
                </span>
            </div>
            <p className="text-xs font-bold text-on-surface line-clamp-2 mb-2">{g.title}</p>
            <div className="flex items-center justify-between">
                <span className="text-2xs text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">{filedByParent ? "person" : "school"}</span>
                    {filedByParent ? "Filed by you" : `Filed by ${g.student_name || "child"}`}
                </span>
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                    <span className={`text-2xs font-bold ${pri.cls.split(" ")[0]}`}>{pri.label}</span>
                </div>
            </div>
            <p className="text-2xs text-outline mt-1">
                Updated: {g.updated_at ? new Date(g.updated_at).toLocaleDateString() : "—"}
            </p>
        </button>
    );
}

// ── Withdraw confirmation ──────────────────────────────────────────────────
function WithdrawConfirm({ onConfirm, onCancel, busy }) {
    return (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
            <p className="text-xs font-bold text-red-800">Withdraw this grievance?</p>
            <p className="text-2xs text-red-700 leading-relaxed">
                This marks it as closed and stops any further action on it. You can't undo this — if it was a
                mistake, you'll need to file a new grievance with the correct details.
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onConfirm}
                    disabled={busy}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-2xs font-bold hover:bg-red-700 disabled:opacity-60"
                >
                    {busy ? "Withdrawing..." : "Yes, withdraw it"}
                </button>
                <button
                    onClick={onCancel}
                    disabled={busy}
                    className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-2xs font-bold hover:bg-surface-container-low"
                >
                    Keep it
                </button>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ParentGrievance() {
    const [view, setView] = useState("home"); // "home" | "new" | "track"
    const [step, setStep] = useState(1);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [submittedGrievance, setSubmittedGrievance] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [scopeFilter, setScopeFilter] = useState("all"); // "all" | "mine" | "child"
    const [loading, setLoading] = useState(true);
    const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    // When a category card is clicked directly from the Home view, we already
    // know the category — jumping back to "Select a Category" would just make
    // the parent click the same thing twice. This flag lets us skip straight
    // to step 2 (Details) in that case, while manually opening "File New
    // Grievance" still starts at step 1 as normal.
    const [skipCategoryStep, setSkipCategoryStep] = useState(false);

    // ── Backend-driven data (no hardcoding) ──
    const [children, setChildren] = useState([]);
    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [grievances, setGrievances] = useState([]);
    const [stats, setStats] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Form state
    const [form, setForm] = useState({
        category: "",
        priority: "Medium",
        title: "",
        description: "",
        student: "",
        file: null,
    });
    const [errors, setErrors] = useState({});

    const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

    // ── Initial load: children, categories, priorities, stats, list ──
    const loadBaseData = useCallback(async () => {
        const [childrenRes, categoriesRes, prioritiesRes, statsRes, grievancesRes] = await Promise.allSettled([
            getParentChildren(),
            getCategories(),
            getPriorities(),
            getGrievanceStats(),
            getGrievances(),
        ]);

        if (childrenRes.status === "fulfilled") {
            setChildren((childrenRes.value || []).map(normalizeChild));
        }
        if (categoriesRes.status === "fulfilled") setCategories(categoriesRes.value || []);
        if (prioritiesRes.status === "fulfilled") setPriorities(prioritiesRes.value || []);
        if (statsRes.status === "fulfilled") setStats(statsRes.value);
        if (grievancesRes.status === "fulfilled") setGrievances(grievancesRes.value?.results || []);
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            await loadBaseData();
            if (active) setLoading(false);
        })();
        return () => { active = false; };
    }, [loadBaseData]);

    // Default the form's student field once children load (single-child households
    // shouldn't have to pick) — never hardcoded, always from the real mapping list.
    useEffect(() => {
        if (children.length === 1 && !form.student) {
            setField("student", children[0].id);
        }
    }, [children]); // eslint-disable-line react-hooks/exhaustive-deps

    const refreshGrievances = async () => {
        const [statsRes, listRes] = await Promise.allSettled([getGrievanceStats(), getGrievances()]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value);
        if (listRes.status === "fulfilled") setGrievances(listRes.value?.results || []);
    };

    const validateStep = () => {
        const e = {};
        if (step === 1) {
            if (!form.category) e.category = "Please select a category.";
            if (!form.student) e.student = "Please select which child this grievance is for.";
        }
        if (step === 2) {
            if (!form.title.trim()) e.title = "Subject is required.";
            if (form.description.trim().length < 30) e.description = "Please describe the issue in at least 30 characters.";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => { if (validateStep()) setStep(s => s + 1); };
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setSubmitError("");
        setSubmitting(true);
        try {
            const created = await createGrievance({
                title: form.title,
                description: form.description,
                category: form.category,
                priority: form.priority,
                student: form.student,
            });
            // GrievanceCreateSerializer's 201 response only echoes input fields
            // (no id/status yet) — so we refetch the list to get the real record
            // rather than fabricating an ID client-side.
            await refreshGrievances();
            setSubmittedGrievance(created);
            setSubmitted(true);
        } catch (err) {
            const apiMsg =
                err?.response?.data?.detail ||
                err?.response?.data?.student?.[0] ||
                err?.response?.data?.title?.[0] ||
                "Something went wrong submitting your grievance. Please try again.";
            setSubmitError(apiMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Withdraw === close_grievance. It's the only self-service action the backend
    // exposes to a non-admin (DELETE on the viewset is IsTeacherOrStaff-only), and
    // GrievanceViewSet.close_grievance explicitly allows grievance.submitted_by == user
    // regardless of role, so this works whether the parent or the child filed it —
    // as long as the logged-in parent is the one who actually submitted it.
    const handleWithdraw = async (grievanceId) => {
        setWithdrawing(true);
        try {
            await closeGrievance(grievanceId);
            await refreshGrievances();
            setSelectedGrievance(prev => prev ? { ...prev, status: "Closed" } : prev);
            setConfirmingWithdraw(false);
        } catch (err) {
            console.error("Failed to withdraw grievance:", err);
        } finally {
            setWithdrawing(false);
        }
    };

    // Status filtering: "All Statuses" shows every grievance regardless of status
    // (including Closed ones), and each specific status pill — including "Closed" —
    // narrows the list down to only that status. Scope (You/Child) is applied on
    // top of whatever the status filter has already selected.
    const activeGrievances = grievances.filter(g => g.status !== "Closed");

    const scopedGrievances = scopeFilter === "all"
        ? grievances
        : scopeFilter === "mine"
            ? grievances.filter(isFiledByParent)
            : grievances.filter(g => !isFiledByParent(g));

    const filteredGrievances = filterStatus === "all"
        ? scopedGrievances
        : scopedGrievances.filter(g => g.status === filterStatus);

    // Tab counts (All / Filed by You / Filed by Child) reflect active, non-closed
    // grievances only — these are summary counters, independent of the status filter.
    const mineCount = activeGrievances.filter(isFiledByParent).length;
    const childCount = activeGrievances.length - mineCount;

    const resetForm = () => {
        setForm({ category: "", priority: "Medium", title: "", description: "", student: children.length === 1 ? children[0].id : "", file: null });
        setErrors({});
        setSubmitError("");
        setStep(1);
        setSkipCategoryStep(false);
        setSubmitted(false);
        setSubmittedGrievance(null);
        setView("home");
    };

    const switchView = (newView) => {
        setView(newView);
        if (newView !== "track") { setSelectedGrievance(null); setConfirmingWithdraw(false); }
        if (newView !== "new") { setSubmitted(false); setSubmittedGrievance(null); setStep(1); setSkipCategoryStep(false); }
        // Track view always shows the latest data when opened
        if (newView === "track") refreshGrievances();
    };

    // Opens the "new grievance" wizard with a category already chosen — used by
    // the Home view's category grid. Skips straight to step 2 (Details) since
    // re-showing the category grid the parent just clicked through would be
    // repetitive busywork.
    const openNewGrievanceWithCategory = (categoryValue) => {
        setField("category", categoryValue);
        setErrors(e => ({ ...e, category: undefined }));
        setSkipCategoryStep(true);
        setStep(2);
        setView("new");
    };

    const StepBar = () => (
        <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                    <div className={`flex items-center gap-2 ${s < step ? "text-green-600" : s === step ? "text-primary" : "text-on-surface-variant"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${s < step ? "bg-green-500 border-green-500 text-white"
                                : s === step ? "border-primary text-primary bg-primary/5"
                                    : "border-outline-variant text-outline-variant bg-surface-container"}`}>
                            {s < step ? <span className="material-symbols-outlined text-sm">check</span> : s}
                        </div>
                        <span className="text-xs font-semibold hidden sm:block">
                            {s === 1 ? "Category" : s === 2 ? "Details" : "Review"}
                        </span>
                    </div>
                    {s < 3 && <div className={`flex-1 h-0.5 rounded-full transition-all ${s < step ? "bg-green-400" : "bg-surface-container-high"}`} />}
                </React.Fragment>
            ))}
        </div>
    );

    if (loading) {
        if (view === "home") return <HomeSkeleton />;
        if (view === "track") return <TrackSkeleton />;
        if (view === "new") return <NewSkeleton />;
    }

    // ── HOME VIEW ─────────────────────────────────────────────────────────
    if (view === "home") {
        return (
            <DashboardLayout>
                <div className="px-8 py-8 space-y-8 max-w-6xl mx-auto">

                    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a237e] to-[#283593] p-8 text-white">
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-white/80 text-base">shield</span>
                                <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">Parent Grievance Portal</span>
                            </div>
                            <h2 className="text-2xl font-extrabold font-headline mb-2">Raise a Grievance</h2>
                            <p className="text-white/75 text-sm leading-relaxed">
                                Your voice matters. File complaints, track resolutions, and get fair outcomes — confidentially and efficiently.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-6">
                                <button
                                    onClick={() => switchView("new")}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a237e] rounded-xl font-bold text-xs hover:bg-white/90 transition-colors shadow-lg"
                                >
                                    <span className="material-symbols-outlined text-sm">add_circle</span>
                                    File New Grievance
                                </button>
                                <button
                                    onClick={() => switchView("track")}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold text-xs hover:bg-white/25 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">manage_search</span>
                                    Track My Grievances
                                </button>
                            </div>
                        </div>
                        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full" />
                        <div className="absolute right-8 bottom-0 hidden lg:block">
                            <span className="material-symbols-outlined text-[140px] opacity-[0.07]">gavel</span>
                        </div>
                    </section>

                    {/* Stats row — from GET /grievances/me/stats/ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Filed", val: stats?.total ?? "—", icon: "folder_open", color: "bg-blue-50 text-blue-600" },
                            { label: "In Progress", val: stats?.in_progress ?? "—", icon: "pending", color: "bg-amber-50 text-amber-600" },
                            { label: "Resolved", val: stats?.resolved ?? "—", icon: "check_circle", color: "bg-green-50 text-green-600" },
                            { label: "Resolution Rate", val: stats ? `${stats.resolution_rate}%` : "—", icon: "schedule", color: "bg-purple-50 text-purple-600" },
                        ].map(s => (
                            <div key={s.label} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 custom-shadow">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                                    <span className="material-symbols-outlined text-base">{s.icon}</span>
                                </div>
                                <p className="text-xl font-extrabold font-headline text-on-surface">{s.val}</p>
                                <p className="text-2xs text-on-surface-variant font-medium mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Category grid — from GET /grievances/categories/ */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-black text-on-surface">What's your concern?</h3>
                                <p className="text-2xs text-on-surface-variant mt-0.5">Select a category to file a new grievance</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {categories.map(cat => {
                                const style = categoryStyle(cat.value);
                                return (
                                    <button
                                        key={cat.value}
                                        onClick={() => openNewGrievanceWithCategory(cat.value)}
                                        className="group flex flex-col items-center gap-2 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/40 hover:shadow-md transition-all duration-200 custom-shadow"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.color} group-hover:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined text-lg">{style.icon}</span>
                                        </div>
                                        <span className="text-2xs font-bold text-on-surface text-center leading-tight">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Recent grievances — from GET /grievances/me/ */}
                    {grievances.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-on-surface">Recent Grievances</h3>
                                <button onClick={() => switchView("track")} className="flex items-center gap-1 text-2xs font-bold text-primary hover:underline">
                                    View all <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {grievances.slice(0, 2).map(g => (
                                    <GrievanceCard
                                        key={g.id}
                                        g={g}
                                        isSelected={false}
                                        onClick={(g) => { setSelectedGrievance(g); switchView("track"); }}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
                        <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4">Know Your Rights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: "lock", title: "Confidential", desc: "Your grievance is only visible to you and school administration." },
                                { icon: "timer", title: "Tracked Resolution", desc: "Every grievance is logged with a status you can follow in real time." },
                                { icon: "no_accounts", title: "Zero Retaliation", desc: "Filing a grievance will never affect your child's academic standing." },
                            ].map(r => (
                                <div key={r.title} className="flex gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="material-symbols-outlined text-primary text-sm">{r.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface">{r.title}</p>
                                        <p className="text-2xs text-on-surface-variant mt-0.5 leading-relaxed">{r.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </DashboardLayout>
        );
    }

    // ── TRACK VIEW ────────────────────────────────────────────────────────
    if (view === "track") {
        return (
            <DashboardLayout>
                <div className="px-8 py-8 max-w-6xl mx-auto">

                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => switchView("home")} className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_back</span>
                        </button>
                        <div>
                            <h2 className="text-lg font-extrabold font-headline text-on-surface">My Grievances</h2>
                            <p className="text-2xs text-on-surface-variant">Track the status of your filed complaints</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        <div className="lg:col-span-2 space-y-3">

                            {/* Scope tabs: filed by parent vs filed by child */}
                            <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl">
                                {[
                                    { key: "all", label: "All", count: activeGrievances.length },
                                    { key: "mine", label: "Filed by You", count: mineCount },
                                    { key: "child", label: "Filed by Child", count: childCount },
                                ].map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => setScopeFilter(t.key)}
                                        className={`flex-1 text-2xs font-bold py-2 rounded-lg transition-colors
                                            ${scopeFilter === t.key
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-on-surface-variant hover:text-on-surface"
                                            }`}
                                    >
                                        {t.label} <span className="opacity-60">({t.count})</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2 pb-2">
                                {["all", ...Object.keys(STATUS)].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`text-2xs font-bold px-3 py-1 rounded-full border transition-colors
                      ${filterStatus === s
                                                ? "bg-primary text-white border-primary"
                                                : "border-outline-variant text-on-surface-variant hover:border-primary/40"
                                            }`}
                                    >
                                        {s === "all" ? "All Statuses" : STATUS[s]?.label || s}
                                    </button>
                                ))}
                            </div>

                            {filteredGrievances.length === 0 ? (
                                <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                                    <span className="material-symbols-outlined text-4xl text-outline mb-2 block">inbox</span>
                                    <p className="text-xs font-bold text-on-surface">No grievances found</p>
                                    <p className="text-2xs text-on-surface-variant mt-1">Try a different filter or file a new one</p>
                                </div>
                            ) : (
                                filteredGrievances.map(g => (
                                    <GrievanceCard
                                        key={g.id}
                                        g={g}
                                        isSelected={selectedGrievance?.id === g.id}
                                        onClick={(g) => { setSelectedGrievance(g); setConfirmingWithdraw(false); }}
                                    />
                                ))
                            )}

                            <button
                                onClick={() => switchView("new")}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary text-xs font-bold hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                File New Grievance
                            </button>
                        </div>

                        <div className="lg:col-span-3">
                            {selectedGrievance ? (
                                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden custom-shadow">
                                    <div className="p-6 border-b border-surface-container-low">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const cat = categoryStyle(selectedGrievance.category);
                                                    return (
                                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                                                            <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                                                        </span>
                                                    );
                                                })()}
                                                <span className="text-2xs font-bold text-on-surface-variant">{selectedGrievance.category}</span>
                                            </div>
                                            <span className={`text-2xs font-bold px-3 py-1 rounded-full ${statusBadge(selectedGrievance.status).cls}`}>
                                                {statusBadge(selectedGrievance.status).label}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-extrabold text-on-surface font-headline">{selectedGrievance.title}</h3>
                                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                                            <span className="text-2xs text-outline flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[13px]">
                                                    {isFiledByParent(selectedGrievance) ? "person" : "school"}
                                                </span>
                                                {isFiledByParent(selectedGrievance) ? "Filed by you" : `Filed by ${selectedGrievance.student_name || "child"}`}
                                            </span>
                                            <span className="text-2xs text-outline">For: {selectedGrievance.student_name}</span>
                                            <span className="text-2xs text-outline">
                                                Filed: {selectedGrievance.created_at ? new Date(selectedGrievance.created_at).toLocaleDateString() : "—"}
                                            </span>
                                            <div className={`flex items-center gap-1 text-2xs font-bold ${priorityBadge(selectedGrievance.priority).cls.split(" ")[0]}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${priorityBadge(selectedGrievance.priority).dot}`} />
                                                {priorityBadge(selectedGrievance.priority).label} Priority
                                            </div>
                                        </div>
                                    </div>

                                    {selectedGrievance.description && (
                                        <div className="p-6 border-b border-surface-container-low">
                                            <p className="text-2xs font-black text-on-surface-variant uppercase tracking-widest mb-2">Description</p>
                                            <p className="text-xs text-on-surface leading-relaxed">{selectedGrievance.description}</p>
                                        </div>
                                    )}

                                    {selectedGrievance.admin_remarks && (
                                        <div className="p-6 border-b border-surface-container-low bg-surface-container-low/40">
                                            <p className="text-2xs font-black text-on-surface-variant uppercase tracking-widest mb-2">School's Response</p>
                                            <p className="text-xs text-on-surface leading-relaxed">{selectedGrievance.admin_remarks}</p>
                                            {selectedGrievance.assigned_to_name && (
                                                <p className="text-2xs text-outline mt-2">Handled by: {selectedGrievance.assigned_to_name}</p>
                                            )}
                                        </div>
                                    )}

                                    {!["Closed", "Rejected"].includes(selectedGrievance.status) && (
                                        <div className="p-6">
                                            {confirmingWithdraw ? (
                                                <WithdrawConfirm
                                                    busy={withdrawing}
                                                    onConfirm={() => handleWithdraw(selectedGrievance.id)}
                                                    onCancel={() => setConfirmingWithdraw(false)}
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmingWithdraw(true)}
                                                    className="text-2xs font-bold text-red-700 border border-red-200 bg-red-50 rounded-lg px-4 py-2 hover:bg-red-100 transition-colors flex items-center gap-1.5"
                                                >
                                                    <span className="material-symbols-outlined text-xs">undo</span>
                                                    {isFiledByParent(selectedGrievance)
                                                        ? "Withdraw this grievance"
                                                        : "Withdraw on behalf of child"}
                                                </button>
                                            )}
                                            <p className="text-2xs text-on-surface-variant mt-2">
                                                Made a mistake filing this? Withdrawing closes it — you'll need to file
                                                a fresh grievance with corrected details if needed.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full min-h-[300px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 text-center p-10">
                                    <span className="material-symbols-outlined text-5xl text-outline mb-3">folder_open</span>
                                    <p className="text-xs font-bold text-on-surface">Select a grievance</p>
                                    <p className="text-2xs text-on-surface-variant mt-1">Click on any grievance to see full details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ── NEW GRIEVANCE VIEW ────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <div className="px-8 py-8 max-w-5xl mx-auto">

                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => { resetForm(); switchView("home"); }} className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-lg font-extrabold font-headline text-on-surface">File a Grievance</h2>
                        <p className="text-2xs text-on-surface-variant">Takes less than 3 minutes</p>
                    </div>
                </div>

                {submitted ? (
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-12 text-center custom-shadow">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                        </div>
                        <h3 className="text-xl font-extrabold font-headline text-on-surface mb-2">Grievance Submitted!</h3>
                        {submittedGrievance?.title && (
                            <p className="text-on-surface-variant text-xs mb-1">"{submittedGrievance.title}" has been filed.</p>
                        )}
                        <p className="text-xs text-on-surface-variant max-w-xs mx-auto mb-8 leading-relaxed mt-3">
                            You can track its status anytime from "Track My Grievances."
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => switchView("track")}
                                className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
                            >
                                Track My Grievance
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface text-xs font-bold hover:bg-surface-container-low transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-10 custom-shadow">
                        <StepBar />

                        {/* ── STEP 1: Category + Child + Priority ── */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold font-headline text-on-surface mb-1">Select a Category</h3>
                                    <p className="text-sm text-on-surface-variant">Choose the category that best describes your issue</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {categories.map(cat => {
                                        const style = categoryStyle(cat.value);
                                        return (
                                            <button
                                                key={cat.value}
                                                onClick={() => { setField("category", cat.value); setErrors(e => ({ ...e, category: undefined })); }}
                                                className={`group flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200
                          ${form.category === cat.value ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:border-primary/30 bg-surface-container-low"}`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.color} transition-transform group-hover:scale-110`}>
                                                    <span className="material-symbols-outlined text-lg">{style.icon}</span>
                                                </div>
                                                <span className="text-xs font-bold text-on-surface text-center leading-tight">{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.category && <p className="text-xs text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.category}</p>}

                                {/* Child selector — required for parents */}
                                <div className="space-y-2 pt-2">
                                    <label className="text-sm font-semibold text-on-surface-variant">Which child is this regarding?</label>
                                    {children.length === 0 ? (
                                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                            No children found on your account. Please contact the school office.
                                        </p>
                                    ) : (
                                        <select
                                            value={form.student}
                                            onChange={e => { setField("student", e.target.value); setErrors(er => ({ ...er, student: undefined })); }}
                                            className="w-full bg-surface-container-low border-none rounded-xl py-3.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
                                        >
                                            <option value="">Select a child...</option>
                                            {children.map(child => (
                                                <option key={child.id} value={child.id}>
                                                    {child.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.student && <p className="text-xs text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.student}</p>}
                                </div>

                                {/* Priority — from GET /grievances/priorities/ */}
                                <div className="space-y-2 pt-2">
                                    <label className="text-sm font-semibold text-on-surface-variant">Priority Level</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {priorities.map(p => (
                                            <button
                                                key={p.value}
                                                onClick={() => setField("priority", p.value)}
                                                title={p.description}
                                                className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-bold transition-all
                          ${form.priority === p.value
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-outline-variant/20 text-on-surface-variant hover:border-primary/30"
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${priorityBadge(p.value).dot}`} />
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Details ── */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold font-headline text-on-surface mb-1">Describe Your Issue</h3>
                                    <p className="text-sm text-on-surface-variant">Be specific — it helps us resolve faster</p>
                                </div>

                                {/* When the category was pre-selected from Home, show a quick summary
                                    chip instead of forcing the parent through step 1 again. They can
                                    still change it without re-doing the whole flow. */}
                                {skipCategoryStep && form.category && (
                                    <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryStyle(form.category).color}`}>
                                                <span className="material-symbols-outlined text-base">{categoryStyle(form.category).icon}</span>
                                            </span>
                                            <div>
                                                <p className="text-2xs text-on-surface-variant font-semibold">Category</p>
                                                <p className="text-sm font-bold text-on-surface">
                                                    {categories.find(c => c.value === form.category)?.label || form.category}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setStep(1)}
                                            className="text-xs font-bold text-primary hover:underline flex-shrink-0"
                                        >
                                            Change
                                        </button>
                                    </div>
                                )}

                                {/* Child selector also surfaces here when the wizard was opened
                                    directly from a category card, since step 1 (where it normally
                                    lives) was skipped. */}
                                {skipCategoryStep && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-on-surface-variant">Which child is this regarding?</label>
                                        {children.length === 0 ? (
                                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                                No children found on your account. Please contact the school office.
                                            </p>
                                        ) : (
                                            <select
                                                value={form.student}
                                                onChange={e => setField("student", e.target.value)}
                                                className="w-full bg-surface-container-low border-none rounded-xl py-3.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
                                            >
                                                <option value="">Select a child...</option>
                                                {children.map(child => (
                                                    <option key={child.id} value={child.id}>
                                                        {child.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-on-surface-variant">Subject <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => setField("title", e.target.value)}
                                        placeholder="Brief summary of your grievance..."
                                        className="w-full bg-surface-container-low border-none rounded-xl py-3.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
                                    />
                                    {errors.title && <p className="text-xs text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.title}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-on-surface-variant">
                                        Detailed Description <span className="text-red-500">*</span>
                                        <span className="ml-2 text-xs text-outline font-normal">Min. 30 characters</span>
                                    </label>
                                    <textarea
                                        rows={6}
                                        value={form.description}
                                        onChange={e => setField("description", e.target.value)}
                                        placeholder="Explain the incident clearly — when it happened, who was involved, and what outcome you expect..."
                                        className="w-full bg-surface-container-low border-none rounded-xl py-3.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all resize-none"
                                    />
                                    <div className="flex items-center justify-between">
                                        {errors.description
                                            ? <p className="text-xs text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.description}</p>
                                            : <span />}
                                        <span className={`text-xs ml-auto ${form.description.length >= 30 ? "text-green-600" : "text-outline"}`}>
                                            {form.description.length} / 30 min
                                        </span>
                                    </div>
                                </div>

                                {/* NOTE: file upload kept disabled — Grievance model/serializer has no
                                    attachment field yet (unlike Submissions, which has the signed-URL
                                    upload flow). Wire this up once that's added backend-side. */}
                                <div className="space-y-1.5 opacity-60">
                                    <label className="text-sm font-semibold text-on-surface-variant">Supporting Evidence <span className="text-outline font-normal">(Coming soon)</span></label>
                                    <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-6 text-center cursor-not-allowed">
                                        <span className="material-symbols-outlined text-2xl text-outline mb-2 block">cloud_upload</span>
                                        <p className="text-sm font-semibold text-on-surface">File attachments aren't supported yet</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Review ── */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold font-headline text-on-surface mb-1">Review & Submit</h3>
                                    <p className="text-sm text-on-surface-variant">Confirm the details before submitting</p>
                                </div>

                                <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
                                    {[
                                        {
                                            label: "Category",
                                            value: categories.find(c => c.value === form.category)?.label || form.category || "—",
                                            icon: categoryStyle(form.category).icon,
                                            color: categoryStyle(form.category).color,
                                        },
                                        { label: "Child", value: children.find(c => c.id === form.student)?.label || "—", icon: "person" },
                                        { label: "Priority", value: priorities.find(p => p.value === form.priority)?.label || form.priority || "—", icon: "flag" },
                                        { label: "Subject", value: form.title || "—", icon: "title" },
                                    ].map((r, i) => (
                                        <div key={r.label} className={`flex items-start gap-4 px-5 py-4 ${i > 0 ? "border-t border-surface-container-low" : ""}`}>
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${r.color || "bg-surface-container text-on-surface-variant"}`}>
                                                <span className="material-symbols-outlined text-sm">{r.icon}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-on-surface-variant font-semibold">{r.label}</p>
                                                <p className="text-sm font-bold text-on-surface mt-0.5 break-words">{r.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t border-surface-container-low px-5 py-4 bg-surface-container-low/40">
                                        <p className="text-xs text-on-surface-variant font-semibold mb-1">Description</p>
                                        <p className="text-sm text-on-surface leading-relaxed">{form.description}</p>
                                    </div>
                                </div>

                                {submitError && (
                                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <span className="material-symbols-outlined text-red-600 text-base flex-shrink-0">error</span>
                                        <p className="text-xs text-red-800 leading-relaxed">{submitError}</p>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <span className="material-symbols-outlined text-amber-600 text-base flex-shrink-0">info</span>
                                    <p className="text-xs text-amber-800 leading-relaxed">
                                        By submitting, you confirm that all information is accurate and truthful. False grievances may lead to disciplinary action under school policy.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-container-low">
                            <button
                                onClick={
                                    step === 1
                                        ? () => { resetForm(); switchView("home"); }
                                        : (step === 2 && skipCategoryStep)
                                            ? () => { resetForm(); switchView("home"); }
                                            : prevStep
                                }
                                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-bold hover:bg-surface-container-low transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {step === 1 || (step === 2 && skipCategoryStep) ? "close" : "arrow_back"}
                                </span>
                                {step === 1 || (step === 2 && skipCategoryStep) ? "Cancel" : "Back"}
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
                                >
                                    Continue
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-60"
                                >
                                    <span className="material-symbols-outlined text-sm">{submitting ? "hourglass_top" : "send"}</span>
                                    {submitting ? "Submitting..." : "Submit Grievance"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}