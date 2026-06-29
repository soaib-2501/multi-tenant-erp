import React, { useState, useRef, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";

// ── Status badge config ────────────────────────────────────────────────────
const STATUS = {
    open: { label: "Open", cls: "text-blue-700  bg-blue-50   border border-blue-200" },
    in_review: { label: "In Review", cls: "text-amber-700 bg-amber-50  border border-amber-200" },
    resolved: { label: "Resolved", cls: "text-green-700 bg-green-50  border border-green-200" },
    rejected: { label: "Rejected", cls: "text-red-700   bg-red-50    border border-red-200" },
    closed: { label: "Closed", cls: "text-gray-600  bg-gray-100  border border-gray-200" },
};

// ── Priority badge config ──────────────────────────────────────────────────
const PRIORITY = {
    low: { label: "Low", dot: "bg-green-500", cls: "text-green-700 bg-green-50" },
    medium: { label: "Medium", dot: "bg-amber-500", cls: "text-amber-700 bg-amber-50" },
    high: { label: "High", dot: "bg-red-500", cls: "text-red-700   bg-red-50" },
};

// ── Category config ────────────────────────────────────────────────────────
const CATEGORIES = [
    { value: "academic", label: "Academic", icon: "school", color: "bg-blue-50 text-blue-600" },
    { value: "fee", label: "Fee & Finance", icon: "payments", color: "bg-emerald-50 text-emerald-600" },
    { value: "ragging", label: "Ragging", icon: "warning", color: "bg-red-50 text-red-600" },
    { value: "discrimination", label: "Discrimination", icon: "balance", color: "bg-purple-50 text-purple-600" },
    { value: "facility", label: "Facility", icon: "domain", color: "bg-orange-50 text-orange-600" },
    { value: "staff", label: "Staff Conduct", icon: "supervisor_account", color: "bg-rose-50 text-rose-600" },
    { value: "exam", label: "Examination", icon: "edit_document", color: "bg-indigo-50 text-indigo-600" },
    { value: "other", label: "Other", icon: "help_outline", color: "bg-gray-100 text-gray-600" },
];

// ── Mock grievance history ─────────────────────────────────────────────────
const MOCK_GRIEVANCES = [
    {
        id: "GRV-2024-001",
        title: "Incorrect marks entered for Chemistry Mid-Term",
        category: "exam",
        priority: "high",
        status: "in_review",
        date: "2024-10-02",
        lastUpdate: "2024-10-05",
        description: "My chemistry mid-term marks were incorrectly entered as 34/50 whereas I scored 44/50. My answer sheet had a clear score at the top.",
        timeline: [
            { action: "Grievance Submitted", date: "2 Oct 2024", note: "Your grievance has been registered.", icon: "add_circle", color: "text-blue-600 bg-blue-50" },
            { action: "Assigned to Exam Cell", date: "3 Oct 2024", note: "Forwarded to the Examination department.", icon: "forward", color: "text-amber-600 bg-amber-50" },
            { action: "Under Review", date: "5 Oct 2024", note: "Exam coordinator is reviewing your answer sheet.", icon: "manage_search", color: "text-purple-600 bg-purple-50" },
        ],
    },
    {
        id: "GRV-2024-002",
        title: "Library fine incorrectly charged",
        category: "fee",
        priority: "low",
        status: "resolved",
        date: "2024-09-14",
        lastUpdate: "2024-09-18",
        description: "A fine of ₹150 was charged for a book I returned on time. The receipt timestamp confirms the return was within the due date.",
        timeline: [
            { action: "Grievance Submitted", date: "14 Sep 2024", note: "Your grievance has been registered.", icon: "add_circle", color: "text-blue-600 bg-blue-50" },
            { action: "Verified", date: "16 Sep 2024", note: "Library records confirmed your return.", icon: "verified", color: "text-green-600 bg-green-50" },
            { action: "Fine Reversed", date: "18 Sep 2024", note: "₹150 has been credited to your account.", icon: "check_circle", color: "text-green-600 bg-green-50" },
        ],
    },
];

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
    return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

// ── Home Skeleton ─────────────────────────────────────────────────────────
function HomeSkeleton() {
    return (
        <MainLayout title="Grievance">
            <div className="px-8 py-8 space-y-8 max-w-6xl mx-auto">
                {/* Hero skeleton */}
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

                {/* Stats skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
                            <Skeleton className="w-9 h-9 rounded-lg mb-3" />
                            <Skeleton className="w-16 h-7 mb-1" />
                            <Skeleton className="w-20 h-3" />
                        </div>
                    ))}
                </div>

                {/* Category grid skeleton */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <Skeleton className="w-40 h-5" />
                            <Skeleton className="w-52 h-3 mt-1" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="flex flex-col items-center gap-2 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                                <Skeleton className="w-12 h-12 rounded-xl" />
                                <Skeleton className="w-16 h-3" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent grievances skeleton */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="w-40 h-5" />
                        <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2].map(i => (
                            <div key={i} className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="w-24 h-6" />
                                    <Skeleton className="w-16 h-5" />
                                </div>
                                <Skeleton className="w-full h-4" />
                                <Skeleton className="w-3/4 h-3" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rights skeleton */}
                <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
                    <Skeleton className="w-32 h-4 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="w-3/4 h-4" />
                                    <Skeleton className="w-full h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

// ── Track Skeleton ────────────────────────────────────────────────────────
function TrackSkeleton() {
    return (
        <MainLayout title="Track Grievances">
            <div className="px-8 py-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div>
                        <Skeleton className="w-40 h-6" />
                        <Skeleton className="w-56 h-3 mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left list skeleton */}
                    <div className="lg:col-span-2 space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="w-16 h-7 rounded-full" />
                            ))}
                        </div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="w-24 h-6" />
                                    <Skeleton className="w-16 h-5" />
                                </div>
                                <Skeleton className="w-3/4 h-4" />
                                <div className="flex items-center justify-between">
                                    <Skeleton className="w-20 h-3" />
                                    <Skeleton className="w-16 h-3" />
                                </div>
                            </div>
                        ))}
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>

                    {/* Right detail skeleton */}
                    <div className="lg:col-span-3">
                        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                    <Skeleton className="w-24 h-4" />
                                </div>
                                <Skeleton className="w-20 h-6 rounded-full" />
                            </div>
                            <Skeleton className="w-3/4 h-6" />
                            <div className="flex gap-4">
                                <Skeleton className="w-24 h-3" />
                                <Skeleton className="w-24 h-3" />
                                <Skeleton className="w-24 h-3" />
                            </div>
                            <div className="border-t border-surface-container-low pt-4">
                                <Skeleton className="w-32 h-3 mb-2" />
                                <Skeleton className="w-full h-4" />
                                <Skeleton className="w-3/4 h-4 mt-1" />
                            </div>
                            <div>
                                <Skeleton className="w-40 h-3 mb-4" />
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                                            <div className="flex-1 space-y-1">
                                                <Skeleton className="w-32 h-4" />
                                                <Skeleton className="w-48 h-3" />
                                                <Skeleton className="w-20 h-3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

// ── New Grievance Skeleton ──────────────────────────────────────────────
function NewSkeleton() {
    return (
        <MainLayout title="File Grievance">
            <div className="px-8 py-8 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div>
                        <Skeleton className="w-40 h-6" />
                        <Skeleton className="w-56 h-3 mt-1" />
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-8">
                    {/* Step bar skeleton */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map(s => (
                            <React.Fragment key={s}>
                                <Skeleton className="w-7 h-7 rounded-full" />
                                {s < 3 && <Skeleton className="flex-1 h-0.5" />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1 content skeleton (category selection) */}
                    <div className="space-y-5">
                        <div>
                            <Skeleton className="w-48 h-6 mb-1" />
                            <Skeleton className="w-72 h-4" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-outline-variant/20 bg-surface-container-low">
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                    <Skeleton className="w-16 h-3" />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="w-32 h-4" />
                            <div className="flex gap-3">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="flex-1 h-11 rounded-lg" />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
                            <div>
                                <Skeleton className="w-40 h-4" />
                                <Skeleton className="w-56 h-3 mt-1" />
                            </div>
                            <Skeleton className="w-11 h-6 rounded-full" />
                        </div>
                    </div>

                    {/* Navigation buttons skeleton */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-container-low">
                        <Skeleton className="w-24 h-10 rounded-xl" />
                        <Skeleton className="w-32 h-10 rounded-xl" />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

// ── Timeline component ─────────────────────────────────────────────────────
function Timeline({ events }) {
    return (
        <div className="relative space-y-4 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-[2px] before:bg-surface-container">
            {events.map((e, i) => (
                <div key={i} className="relative pl-10">
                    <div className={`absolute left-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white ${e.color}`}>
                        <span className="material-symbols-outlined text-sm">{e.icon}</span>
                    </div>
                    <p className="text-sm font-bold text-on-surface">{e.action}</p>
                    <p className="text-xs text-on-surface-variant">{e.note}</p>
                    <span className="text-2xs text-outline mt-0.5 block">{e.date}</span>
                </div>
            ))}
        </div>
    );
}

// ── GrievanceCard ──────────────────────────────────────────────────────────
function GrievanceCard({ g, onClick, isSelected }) {
    const cat = CATEGORIES.find(c => c.value === g.category) || CATEGORIES[7];
    const stat = STATUS[g.status] || STATUS.open;
    const pri = PRIORITY[g.priority] || PRIORITY.low;

    return (
        <button
            onClick={() => onClick(g)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:border-primary/40 hover:shadow-sm
        ${isSelected
                    ? "border-primary/60 bg-primary/5 shadow-sm"
                    : "border-outline-variant/20 bg-surface-container-lowest"
                }`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                        <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                    </span>
                    <span className="text-xs font-bold text-on-surface-variant">{cat.label}</span>
                </div>
                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${stat.cls}`}>
                    {stat.label}
                </span>
            </div>
            <p className="text-sm font-bold text-on-surface line-clamp-2 mb-2">{g.title}</p>
            <div className="flex items-center justify-between">
                <span className="text-2xs text-outline">{g.id}</span>
                <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                    <span className={`text-2xs font-bold ${pri.cls.split(" ")[0]}`}>{pri.label}</span>
                </div>
            </div>
            <p className="text-2xs text-outline mt-1">Last updated: {g.lastUpdate}</p>
        </button>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Grievance() {
    const [view, setView] = useState("home"); // "home" | "new" | "track"
    const [step, setStep] = useState(1);      // form steps 1–3
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const fileRef = useRef(null);

    // Form state
    const [form, setForm] = useState({
        category: "",
        priority: "medium",
        title: "",
        description: "",
        anonymous: false,
        file: null,
    });
    const [errors, setErrors] = useState({});

    // ── Helpers ──
    const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const validateStep = () => {
        const e = {};
        if (step === 1 && !form.category) e.category = "Please select a category.";
        if (step === 2 && !form.title.trim()) e.title = "Subject is required.";
        if (step === 2 && form.description.trim().length < 30) e.description = "Please describe the issue in at least 30 characters.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => { if (validateStep()) setStep(s => s + 1); };
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = () => {
        // In real app: call API here
        setSubmitted(true);
    };

    const filteredGrievances = filterStatus === "all"
        ? MOCK_GRIEVANCES
        : MOCK_GRIEVANCES.filter(g => g.status === filterStatus);

    const resetForm = () => {
        setForm({ category: "", priority: "medium", title: "", description: "", anonymous: false, file: null });
        setErrors({});
        setStep(1);
        setSubmitted(false);
        setView("home");
    };

    // ── Loading control ──
    const switchView = (newView) => {
        setLoading(true);
        setView(newView);
        // Reset some states when switching away
        if (newView !== "track") {
            setSelectedGrievance(null);
        }
        if (newView !== "new") {
            setSubmitted(false);
            setStep(1);
        }
        // Simulate loading delay
        setTimeout(() => setLoading(false), 800);
    };

    // Initial load
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // ── Step progress indicator ──
    const StepBar = () => (
        <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                    <div className={`flex items-center gap-2 ${s < step ? "text-green-600" : s === step ? "text-primary" : "text-on-surface-variant"}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${s < step ? "bg-green-500 border-green-500 text-white"
                                : s === step ? "border-primary text-primary bg-primary/5"
                                    : "border-outline-variant text-outline-variant bg-surface-container"}`}>
                            {s < step
                                ? <span className="material-symbols-outlined text-sm">check</span>
                                : s}
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

    // ── Render ──
    // Show skeletons when loading is true
    if (loading) {
        if (view === "home") return <HomeSkeleton />;
        if (view === "track") return <TrackSkeleton />;
        if (view === "new") return <NewSkeleton />;
    }

    // ── HOME VIEW ─────────────────────────────────────────────────────────────
    if (view === "home") {
        return (
            <MainLayout title="Grievance">
                <div className="px-8 py-8 space-y-8 max-w-6xl mx-auto">

                    {/* Hero */}
                    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a237e] to-[#283593] p-8 text-white">
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-white/80 text-lg">shield</span>
                                <span className="text-white/80 text-sm font-semibold tracking-wide uppercase">Student Rights Portal</span>
                            </div>
                            <h2 className="text-3xl font-extrabold font-headline mb-2">Raise a Grievance</h2>
                            <p className="text-white/75 text-base leading-relaxed">
                                Your voice matters. File complaints, track resolutions, and get fair outcomes — confidentially and efficiently.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-6">
                                <button
                                    onClick={() => switchView("new")}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a237e] rounded-xl font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
                                >
                                    <span className="material-symbols-outlined text-base">add_circle</span>
                                    File New Grievance
                                </button>
                                <button
                                    onClick={() => switchView("track")}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold text-sm hover:bg-white/25 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">manage_search</span>
                                    Track My Grievances
                                </button>
                            </div>
                        </div>
                        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full" />
                        <div className="absolute right-8 bottom-0 hidden lg:block">
                            <span className="material-symbols-outlined text-[140px] opacity-[0.07]">gavel</span>
                        </div>
                    </section>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total Filed", val: MOCK_GRIEVANCES.length, icon: "folder_open", color: "bg-blue-50 text-blue-600" },
                            { label: "In Progress", val: MOCK_GRIEVANCES.filter(g => g.status === "in_review").length, icon: "pending", color: "bg-amber-50 text-amber-600" },
                            { label: "Resolved", val: MOCK_GRIEVANCES.filter(g => g.status === "resolved").length, icon: "check_circle", color: "bg-green-50 text-green-600" },
                            { label: "Avg. Resolution", val: "4 days", icon: "schedule", color: "bg-purple-50 text-purple-600" },
                        ].map(s => (
                            <div key={s.label} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 custom-shadow">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                                    <span className="material-symbols-outlined text-lg">{s.icon}</span>
                                </div>
                                <p className="text-2xl font-extrabold font-headline text-on-surface">{s.val}</p>
                                <p className="text-xs text-on-surface-variant font-medium mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Category grid */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-black text-on-surface">What's your concern?</h3>
                                <p className="text-xs text-on-surface-variant mt-0.5">Select a category to file a new grievance</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => { setField("category", cat.value); switchView("new"); }}
                                    className="group flex flex-col items-center gap-2 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/40 hover:shadow-md transition-all duration-200 custom-shadow"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                    </div>
                                    <span className="text-xs font-bold text-on-surface text-center leading-tight">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Recent grievances preview */}
                    {MOCK_GRIEVANCES.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-black text-on-surface">Recent Grievances</h3>
                                <button onClick={() => switchView("track")} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                                    View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {MOCK_GRIEVANCES.slice(0, 2).map(g => (
                                    <GrievanceCard
                                        key={g.id}
                                        g={g}
                                        isSelected={false}
                                        onClick={() => { setSelectedGrievance(g); switchView("track"); }}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Know your rights */}
                    <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
                        <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-4">Know Your Rights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: "lock", title: "Confidential", desc: "Your identity is protected. Anonymous filing available for sensitive issues." },
                                { icon: "timer", title: "7-Day Resolution", desc: "All grievances are reviewed and responded to within 7 working days." },
                                { icon: "no_accounts", title: "Zero Retaliation", desc: "Filing a grievance will never affect your academic record or standing." },
                            ].map(r => (
                                <div key={r.title} className="flex gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="material-symbols-outlined text-primary text-base">{r.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-on-surface">{r.title}</p>
                                        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{r.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </MainLayout>
        );
    }

    // ── TRACK VIEW ────────────────────────────────────────────────────────────
    if (view === "track") {
        return (
            <MainLayout title="Track Grievances">
                <div className="px-8 py-8 max-w-6xl mx-auto">

                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => switchView("home")} className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
                            <span className="material-symbols-outlined text-base text-on-surface-variant">arrow_back</span>
                        </button>
                        <div>
                            <h2 className="text-xl font-extrabold font-headline text-on-surface">My Grievances</h2>
                            <p className="text-xs text-on-surface-variant">Track the status of your filed complaints</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* Left: list */}
                        <div className="lg:col-span-2 space-y-3">
                            {/* Filter pills */}
                            <div className="flex flex-wrap gap-2 pb-2">
                                {["all", "open", "in_review", "resolved", "closed"].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`text-2xs font-bold px-3 py-1 rounded-full border transition-colors capitalize
                      ${filterStatus === s
                                                ? "bg-primary text-white border-primary"
                                                : "border-outline-variant text-on-surface-variant hover:border-primary/40"
                                            }`}
                                    >
                                        {s === "all" ? "All" : STATUS[s]?.label || s}
                                    </button>
                                ))}
                            </div>

                            {filteredGrievances.length === 0 ? (
                                <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                                    <span className="material-symbols-outlined text-4xl text-outline mb-2 block">inbox</span>
                                    <p className="text-sm font-bold text-on-surface">No grievances found</p>
                                    <p className="text-xs text-on-surface-variant mt-1">Try a different filter or file a new one</p>
                                </div>
                            ) : (
                                filteredGrievances.map(g => (
                                    <GrievanceCard
                                        key={g.id}
                                        g={g}
                                        isSelected={selectedGrievance?.id === g.id}
                                        onClick={setSelectedGrievance}
                                    />
                                ))
                            )}

                            <button
                                onClick={() => switchView("new")}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-bold hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                File New Grievance
                            </button>
                        </div>

                        {/* Right: detail */}
                        <div className="lg:col-span-3">
                            {selectedGrievance ? (
                                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden custom-shadow">
                                    {/* Header */}
                                    <div className="p-6 border-b border-surface-container-low">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const cat = CATEGORIES.find(c => c.value === selectedGrievance.category) || CATEGORIES[7];
                                                    return (
                                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                                                            <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                                                        </span>
                                                    );
                                                })()}
                                                <span className="text-xs font-bold text-on-surface-variant">
                                                    {CATEGORIES.find(c => c.value === selectedGrievance.category)?.label}
                                                </span>
                                            </div>
                                            <span className={`text-2xs font-bold px-3 py-1 rounded-full ${STATUS[selectedGrievance.status]?.cls}`}>
                                                {STATUS[selectedGrievance.status]?.label}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-extrabold text-on-surface font-headline">{selectedGrievance.title}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-2xs text-outline font-medium">{selectedGrievance.id}</span>
                                            <span className="text-2xs text-outline">Filed: {selectedGrievance.date}</span>
                                            <div className={`flex items-center gap-1 text-2xs font-bold ${PRIORITY[selectedGrievance.priority]?.cls.split(" ")[0]}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY[selectedGrievance.priority]?.dot}`} />
                                                {PRIORITY[selectedGrievance.priority]?.label} Priority
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="p-6 border-b border-surface-container-low">
                                        <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2">Description</p>
                                        <p className="text-sm text-on-surface leading-relaxed">{selectedGrievance.description}</p>
                                    </div>

                                    {/* Timeline */}
                                    <div className="p-6">
                                        <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4">Progress Timeline</p>
                                        <Timeline events={selectedGrievance.timeline} />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[300px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 text-center p-10">
                                    <span className="material-symbols-outlined text-5xl text-outline mb-3">folder_open</span>
                                    <p className="text-sm font-bold text-on-surface">Select a grievance</p>
                                    <p className="text-xs text-on-surface-variant mt-1">Click on any grievance to see full details and timeline</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // ── NEW GRIEVANCE VIEW ────────────────────────────────────────────────────
    return (
        <MainLayout title="File Grievance">
            <div className="px-8 py-8 max-w-3xl mx-auto">

                {/* Back */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => { resetForm(); switchView("home"); }} className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-base text-on-surface-variant">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-xl font-extrabold font-headline text-on-surface">File a Grievance</h2>
                        <p className="text-xs text-on-surface-variant">Takes less than 3 minutes</p>
                    </div>
                </div>

                {submitted ? (
                    /* ── SUCCESS STATE ── */
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-12 text-center custom-shadow">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                        </div>
                        <h3 className="text-2xl font-extrabold font-headline text-on-surface mb-2">Grievance Submitted!</h3>
                        <p className="text-on-surface-variant text-sm mb-1">Your grievance ID is</p>
                        <p className="text-lg font-bold text-primary mb-4">GRV-2024-00{Math.floor(Math.random() * 9) + 3}</p>
                        <p className="text-sm text-on-surface-variant max-w-xs mx-auto mb-8 leading-relaxed">
                            You will receive updates on this page and notifications as your grievance progresses. Expected resolution: <strong>7 working days</strong>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => switchView("track")}
                                className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
                            >
                                Track My Grievance
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface text-sm font-bold hover:bg-surface-container-low transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-8 custom-shadow">
                        <StepBar />

                        {/* ── STEP 1: Category ── */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-lg font-bold font-headline text-on-surface mb-1">Select a Category</h3>
                                    <p className="text-sm text-on-surface-variant">Choose the category that best describes your issue</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.value}
                                            onClick={() => { setField("category", cat.value); setErrors({}); }}
                                            className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                        ${form.category === cat.value
                                                    ? "border-primary bg-primary/5"
                                                    : "border-outline-variant/20 hover:border-primary/30 bg-surface-container-low"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color} transition-transform group-hover:scale-110`}>
                                                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                                            </div>
                                            <span className="text-xs font-bold text-on-surface text-center leading-tight">{cat.label}</span>
                                            {form.category === cat.value && (
                                                <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-xs">check</span>
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {errors.category && <p className="text-xs text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.category}</p>}

                                {/* Priority */}
                                <div className="space-y-2 pt-2">
                                    <label className="text-sm font-semibold text-on-surface-variant">Priority Level</label>
                                    <div className="flex gap-3">
                                        {Object.entries(PRIORITY).map(([k, p]) => (
                                            <button
                                                key={k}
                                                onClick={() => setField("priority", k)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-bold transition-all
                          ${form.priority === k
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-outline-variant/20 text-on-surface-variant hover:border-primary/30"
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Anonymous toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
                                    <div>
                                        <p className="text-sm font-bold text-on-surface">File Anonymously</p>
                                        <p className="text-xs text-on-surface-variant mt-0.5">Your name won't be disclosed to authorities</p>
                                    </div>
                                    <button
                                        onClick={() => setField("anonymous", !form.anonymous)}
                                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.anonymous ? "bg-primary" : "bg-surface-container-high"}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.anonymous ? "translate-x-5" : "translate-x-0"}`} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Details ── */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-lg font-bold font-headline text-on-surface mb-1">Describe Your Issue</h3>
                                    <p className="text-sm text-on-surface-variant">Be specific — it helps us resolve faster</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-on-surface-variant">Subject <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => setField("title", e.target.value)}
                                        placeholder="Brief summary of your grievance..."
                                        className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
                                    />
                                    {errors.title && <p className="text-xs text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.title}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-on-surface-variant">
                                        Detailed Description <span className="text-red-500">*</span>
                                        <span className="ml-2 text-2xs text-outline font-normal">Min. 30 characters</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        value={form.description}
                                        onChange={e => setField("description", e.target.value)}
                                        placeholder="Explain the incident clearly — when it happened, who was involved, and what outcome you expect..."
                                        className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all resize-none"
                                    />
                                    <div className="flex items-center justify-between">
                                        {errors.description
                                            ? <p className="text-xs text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.description}</p>
                                            : <span />}
                                        <span className={`text-2xs ml-auto ${form.description.length >= 30 ? "text-green-600" : "text-outline"}`}>
                                            {form.description.length} / 30 min
                                        </span>
                                    </div>
                                </div>

                                {/* File upload */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-on-surface-variant">Supporting Evidence <span className="text-outline font-normal">(Optional)</span></label>
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        className="border-2 border-dashed border-outline-variant/40 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-3xl text-outline mb-2 block">cloud_upload</span>
                                        <p className="text-sm font-semibold text-on-surface">
                                            {form.file ? form.file.name : "Click to upload a file"}
                                        </p>
                                        <p className="text-xs text-on-surface-variant mt-1">JPG, PNG, PDF — max 5 MB</p>
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            className="hidden"
                                            onChange={e => setField("file", e.target.files[0])}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Review ── */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-lg font-bold font-headline text-on-surface mb-1">Review & Submit</h3>
                                    <p className="text-sm text-on-surface-variant">Confirm the details before submitting</p>
                                </div>

                                <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
                                    {[
                                        {
                                            label: "Category",
                                            value: CATEGORIES.find(c => c.value === form.category)?.label || "—",
                                            icon: CATEGORIES.find(c => c.value === form.category)?.icon || "help_outline",
                                            color: CATEGORIES.find(c => c.value === form.category)?.color,
                                        },
                                        { label: "Priority", value: PRIORITY[form.priority]?.label || "—", icon: "flag" },
                                        { label: "Anonymous", value: form.anonymous ? "Yes — identity hidden" : "No — name visible", icon: "person" },
                                        { label: "Subject", value: form.title || "—", icon: "title" },
                                        { label: "Attachment", value: form.file ? form.file.name : "None", icon: "attach_file" },
                                    ].map((r, i) => (
                                        <div key={r.label} className={`flex items-start gap-4 px-5 py-4 ${i > 0 ? "border-t border-surface-container-low" : ""}`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.color || "bg-surface-container text-on-surface-variant"}`}>
                                                <span className="material-symbols-outlined text-sm">{r.icon}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-on-surface-variant font-semibold">{r.label}</p>
                                                <p className="text-sm font-bold text-on-surface mt-0.5 break-words">{r.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Description preview */}
                                    <div className="border-t border-surface-container-low px-5 py-4 bg-surface-container-low/40">
                                        <p className="text-xs text-on-surface-variant font-semibold mb-1">Description</p>
                                        <p className="text-sm text-on-surface leading-relaxed">{form.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <span className="material-symbols-outlined text-amber-600 text-lg flex-shrink-0">info</span>
                                    <p className="text-xs text-amber-800 leading-relaxed">
                                        By submitting, you confirm that all information is accurate and truthful. False grievances may lead to disciplinary action under school policy.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-container-low">
                            <button
                                onClick={step === 1 ? () => { resetForm(); switchView("home"); } : prevStep}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-bold hover:bg-surface-container-low transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">{step === 1 ? "close" : "arrow_back"}</span>
                                {step === 1 ? "Cancel" : "Back"}
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
                                >
                                    Continue
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined text-base">send</span>
                                    Submit Grievance
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}