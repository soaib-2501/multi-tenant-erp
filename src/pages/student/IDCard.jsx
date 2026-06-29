import React, { useRef, useState, useEffect } from "react";
import { useStudent } from "../../context/StudentProvider";
import { API_BASE_URL } from "../../services/api";

// ─── helpers ────────────────────────────────────────────────────────────────

async function fetchViewUrl(filePath) {
  if (!filePath) return null;
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${API_BASE_URL}/api/v1/uploads/view-url/?file_path=${encodeURIComponent(filePath)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.url || data.view_url || null;
}

// ─── ID Card Visual ──────────────────────────────────────────────────────────

function IDCardVisual({ student, enroll, avatarSrc, cardRef }) {
  const fullName = student?.name || `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim();
  const classInfo = enroll ? `${enroll.class_level_name} – ${enroll.section_name}` : "—";
  const rollNo = enroll?.roll_number ?? "—";
  const enrollNo = student?.enrollment_number ?? "—";
  const email = student?.email ?? "—";
  const year = enroll?.academic_year_name ?? new Date().getFullYear();

  return (
    <div
      ref={cardRef}
      style={{
        width: "340px",
        background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)",
        borderRadius: "18px",
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        flexShrink: 0,
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "140px", height: "140px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "60px", left: "-30px",
        width: "100px", height: "100px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        padding: "20px 22px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        {/* School logo placeholder */}
        <div style={{
          width: "44px", height: "44px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "22px" }}>🏫</span>
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: "13px", letterSpacing: "0.03em", lineHeight: 1.2 }}>
            Academic Architect
          </div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "10px", marginTop: "2px", letterSpacing: "0.05em" }}>
            STUDENT IDENTITY CARD
          </div>
        </div>
        <div style={{
          marginLeft: "auto",
          background: "rgba(255,255,255,0.12)",
          borderRadius: "6px",
          padding: "3px 8px",
          color: "rgba(255,255,255,0.7)",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.1em",
        }}>
          {year}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

          {/* Avatar */}
          <div style={{
            width: "80px", height: "96px",
            borderRadius: "12px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.1)",
            flexShrink: 0,
            border: "2px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Student"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                crossOrigin="anonymous"
              />
            ) : (
              <span style={{ fontSize: "40px", color: "rgba(255,255,255,0.4)" }}>👤</span>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: "15px",
              lineHeight: 1.25,
              marginBottom: "6px",
              wordBreak: "break-word",
            }}>
              {fullName}
            </div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(99,179,237,0.2)",
              borderRadius: "6px",
              padding: "2px 8px",
              color: "#93c5fd",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: "12px",
            }}>
              {classInfo}
            </div>

            {/* Fields */}
            {[
              { label: "ROLL NO", value: rollNo },
              { label: "ENROLL ID", value: enrollNo },
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: "6px" }}>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "8.5px", fontWeight: 700, letterSpacing: "0.1em" }}>
                  {label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", fontWeight: 600 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email row */}
        <div style={{
          marginTop: "14px",
          padding: "8px 12px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{ fontSize: "12px" }}>✉️</span>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", wordBreak: "break-all" }}>
            {email}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div style={{
        background: "rgba(255,255,255,0.07)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "10px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "8px", letterSpacing: "0.08em" }}>
          VALID FOR ACADEMIC YEAR {year}
        </div>
        {/* Barcode-style decoration */}
        <div style={{ display: "flex", gap: "2px", alignItems: "flex-end" }}>
          {[6, 10, 7, 12, 8, 5, 11, 9, 6, 10, 8, 7].map((h, i) => (
            <div key={i} style={{
              width: "2px",
              height: `${h}px`,
              background: "rgba(255,255,255,0.3)",
              borderRadius: "1px",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ID Card ──────────────────────────────────────────────────────

function SkeletonIDCardVisual() {
  return (
    <div
      style={{
        width: "340px",
        background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)",
        borderRadius: "18px",
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        flexShrink: 0,
      }}
    >
      {/* Decorative circles - same as real card */}
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "140px", height: "140px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "60px", left: "-30px",
        width: "100px", height: "100px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
        pointerEvents: "none",
      }} />

      {/* Header skeleton */}
      <div style={{
        padding: "20px 22px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <div style={{
          width: "44px", height: "44px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.1)",
          flexShrink: 0,
        }} className="animate-pulse" />
        <div style={{ flex: 1 }}>
          <div style={{ width: "60%", height: "12px", background: "rgba(255,255,255,0.15)", borderRadius: "4px" }} className="animate-pulse" />
          <div style={{ width: "40%", height: "8px", marginTop: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }} className="animate-pulse" />
        </div>
        <div style={{
          width: "40px", height: "18px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "6px",
        }} className="animate-pulse" />
      </div>

      {/* Body skeleton */}
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          {/* Avatar placeholder */}
          <div style={{
            width: "80px", height: "96px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.1)",
            flexShrink: 0,
            border: "2px solid rgba(255,255,255,0.15)",
          }} className="animate-pulse" />
          {/* Info placeholders */}
          <div style={{ flex: 1 }}>
            <div style={{ width: "70%", height: "16px", background: "rgba(255,255,255,0.15)", borderRadius: "4px", marginBottom: "6px" }} className="animate-pulse" />
            <div style={{ width: "40%", height: "14px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", marginBottom: "12px" }} className="animate-pulse" />
            <div style={{ marginBottom: "6px" }}>
              <div style={{ width: "30%", height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", marginBottom: "4px" }} className="animate-pulse" />
              <div style={{ width: "50%", height: "10px", background: "rgba(255,255,255,0.12)", borderRadius: "4px" }} className="animate-pulse" />
            </div>
            <div>
              <div style={{ width: "30%", height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", marginBottom: "4px" }} className="animate-pulse" />
              <div style={{ width: "60%", height: "10px", background: "rgba(255,255,255,0.12)", borderRadius: "4px" }} className="animate-pulse" />
            </div>
          </div>
        </div>
        {/* Email row placeholder */}
        <div style={{
          marginTop: "14px",
          padding: "8px 12px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{ fontSize: "12px" }}>✉️</span>
          <div style={{ width: "70%", height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }} className="animate-pulse" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "10px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ width: "40%", height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px" }} className="animate-pulse" />
        <div style={{ display: "flex", gap: "2px", alignItems: "flex-end" }}>
          {[6, 10, 7, 12, 8, 5, 11, 9, 6, 10, 8, 7].map((h, i) => (
            <div key={i} style={{
              width: "2px",
              height: `${h}px`,
              background: "rgba(255,255,255,0.15)",
              borderRadius: "1px",
            }} className="animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export default function IDCardModal({ onClose }) {
  const { profile: student, enrollment: enroll } = useStudent();

  const cardRef = useRef(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resolve avatar URL
  useEffect(() => {
    if (!student?.profile_picture) {
      setLoading(false);
      return;
    }
    if (student.profile_picture.startsWith("http")) {
      setAvatarSrc(student.profile_picture);
      setLoading(false);
      return;
    }
    fetchViewUrl(student.profile_picture).then(url => {
      if (url) setAvatarSrc(url);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [student?.profile_picture]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setMsg(null);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      const name = student?.name || `${student?.first_name ?? "student"}`.trim();
      link.download = `ID_Card_${name.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setMsg({ type: "success", text: "ID card downloaded!" });
    } catch (err) {
      console.error("ID card download failed:", err);
      setMsg({ type: "error", text: "Download failed. Please try again." });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        {/* Modal Panel */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-container-lowest rounded-2xl shadow-2xl"
          style={{
            maxWidth: "420px",
            width: "100%",
            overflow: "hidden",
            animation: "idcard-in 0.22s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
            <div>
              <h2 className="text-base font-extrabold text-on-surface font-headline">Student ID Card</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Preview & download your identity card</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-sm text-on-surface-variant">close</span>
            </button>
          </div>

          {/* Card Preview */}
          <div className="p-6 flex justify-center" style={{ background: "var(--md-sys-color-surface-container-low, #f3f4f6)" }}>
            {loading ? (
              <SkeletonIDCardVisual />
            ) : (
              <IDCardVisual
                student={student}
                enroll={enroll}
                avatarSrc={avatarSrc}
                cardRef={cardRef}
              />
            )}
          </div>

          {/* Actions */}
          <div className="px-5 py-4 border-t border-outline-variant/20 flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">
                {downloading ? "hourglass_empty" : "download"}
              </span>
              {downloading ? "Generating…" : "Download PNG"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high transition-colors"
            >
              Close
            </button>
          </div>

          {/* Status */}
          {msg && (
            <div className={`mx-5 mb-4 text-xs font-semibold flex items-center gap-1.5 ${msg.type === "success" ? "text-green-600" : "text-red-500"
              }`}>
              <span className="material-symbols-outlined text-sm">
                {msg.type === "success" ? "check_circle" : "error"}
              </span>
              {msg.text}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes idcard-in {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}