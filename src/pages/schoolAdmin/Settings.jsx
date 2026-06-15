import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

const translations = {
  English: {
    title: "School Configuration",
    subtitle: "Manage your institution's identity and academic parameters.",
    schoolProfile: "School Profile",
    schoolProfileDesc: "Public identity details for your reports and communication.",
    institutionLogo: "Institution Logo",
    logoRecommended: "Recommended: 400x400px. PNG/SVG.",
    uploadLogo: "Upload New Logo",
    schoolName: "School Name",
    email: "Email",
    phone: "Phone",
    country: "Country",
    streetAddress: "Street Address",
    academicPreferences: "Academic Preferences",
    academicPreferencesDesc: "Define operational logic for grading and reporting cycles.",
    gradingScale: "Grading Scale System",
    gradingScaleDesc: "Choose how performance is evaluated.",
    attendanceTracking: "Attendance Tracking",
    attendanceTrackingDesc: "Automated alerts for absences.",
    defaultAcademicYear: "Default Academic Year",
    defaultAcademicYearDesc: "Active period for registrations.",
    appearance: "Appearance & Language",
    appearanceDesc: "Customize the look and language of your portal.",
    darkMode: "Dark Mode",
    darkModeDesc: "Switch between light and dark interface.",
    language: "Interface Language",
    languageDesc: "Choose your preferred display language.",
    discard: "Discard",
    saveChanges: "Save Changes",
    saving: "Saving...",
    saved: "Configuration updated successfully!",
    discarded: "Changes discarded.",
  },
  Hindi: {
    title: "स्कूल कॉन्फ़िगरेशन",
    subtitle: "अपनी संस्था की पहचान और शैक्षणिक मापदंडों को प्रबंधित करें।",
    schoolProfile: "स्कूल प्रोफ़ाइल",
    schoolProfileDesc: "आपकी रिपोर्ट और संचार के लिए सार्वजनिक पहचान विवरण।",
    institutionLogo: "संस्था का लोगो",
    logoRecommended: "अनुशंसित: 400x400px. PNG/SVG.",
    uploadLogo: "नया लोगो अपलोड करें",
    schoolName: "स्कूल का नाम",
    email: "ईमेल",
    phone: "फ़ोन",
    country: "देश",
    streetAddress: "पता",
    academicPreferences: "शैक्षणिक प्राथमिकताएं",
    academicPreferencesDesc: "ग्रेडिंग और रिपोर्टिंग चक्रों के लिए परिचालन तर्क परिभाषित करें।",
    gradingScale: "ग्रेडिंग स्केल सिस्टम",
    gradingScaleDesc: "चुनें कि प्रदर्शन का मूल्यांकन कैसे किया जाए।",
    attendanceTracking: "उपस्थिति ट्रैकिंग",
    attendanceTrackingDesc: "अनुपस्थिति के लिए स्वचालित अलर्ट।",
    defaultAcademicYear: "डिफ़ॉल्ट शैक्षणिक वर्ष",
    defaultAcademicYearDesc: "पंजीकरण के लिए सक्रिय अवधि।",
    appearance: "रूप और भाषा",
    appearanceDesc: "अपने पोर्टल की थीम और भाषा अनुकूलित करें।",
    darkMode: "डार्क मोड",
    darkModeDesc: "लाइट और डार्क इंटरफ़ेस के बीच स्विच करें।",
    language: "इंटरफ़ेस भाषा",
    languageDesc: "अपनी पसंदीदा प्रदर्शन भाषा चुनें।",
    discard: "रद्द करें",
    saveChanges: "परिवर्तन सहेजें",
    saving: "सहेजा जा रहा है...",
    saved: "कॉन्फ़िगरेशन सफलतापूर्वक अपडेट किया गया!",
    discarded: "परिवर्तन रद्द किए गए।",
  },
};

const defaultForm = {
  schoolName: "St. Augustine International Academy",
  email: "admin@staugustine.edu",
  phone: "+1 (555) 0123-4567",
  country: "United States",
  address: "742 Evergreen Terrace, Springfield",
  grading: "4.0 GPA",
  attendance: true,
  academicYear: "2023-2024",
};

export default function Settings() {
  const { darkMode, toggleDarkMode, language, toggleLanguage } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [savedForm, setSavedForm] = useState(defaultForm);
  const [toast, setToast] = useState(null);

  const t = translations[language] || translations.English;
  const dk = darkMode;

  // Force a full re-render when darkMode changes
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [darkMode]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleAttendance = () => setForm({ ...form, attendance: !form.attendance });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const discard = () => {
    setForm(savedForm);
    showToast(t.discarded, "info");
  };

  const save = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setSavedForm(form);
      setIsSaving(false);
      showToast(t.saved, "success");
    }, 1000);
  };

  return (
    <SchoolLayout title={t.title} key={`layout-${renderKey}`}>
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500" key={`content-${darkMode}`}>

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl font-bold text-sm flex items-center gap-3 transition-all
            ${toast.type === "success" ? "bg-green-500 text-white" : "bg-slate-600 text-white"}`}>
            <span className="material-symbols-outlined text-base">
              {toast.type === "success" ? "check_circle" : "info"}
            </span>
            {toast.msg}
          </div>
        )}

        <div className="mb-10">
          <h1 className={`text-3xl font-black mb-2 ${dk ? "text-white" : "text-[#0b1c30]"}`}>{t.title}</h1>
          <p className={dk ? "text-slate-400" : "text-[#6b7280]"}>{t.subtitle}</p>
        </div>

        <form onSubmit={save} className="space-y-14" key={`form-${renderKey}`}>

          {/* SCHOOL PROFILE */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <h3 className={`text-xl font-bold mb-2 ${dk ? "text-white" : "text-[#0b1c30]"}`}>{t.schoolProfile}</h3>
              <p className={`text-sm leading-relaxed ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{t.schoolProfileDesc}</p>
            </div>
            <div className={`lg:col-span-2 p-8 rounded-xl shadow-sm border ${dk ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
              <div className="flex gap-8 items-start mb-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-xl bg-[#e5eeff] flex items-center justify-center border-2 border-dashed border-[#0058be]/30">
                    <span className="material-symbols-outlined text-4xl text-[#0058be]/50">school</span>
                  </div>
                  <button type="button" className="absolute -bottom-2 -right-2 w-10 h-10 rounded-lg bg-[#0058be] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
                <div>
                  <p className={`font-bold ${dk ? "text-white" : "text-[#0b1c30]"}`}>{t.institutionLogo}</p>
                  <p className={`text-sm mb-4 ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{t.logoRecommended}</p>
                  <button type="button" className="px-5 py-2 bg-[#eff4ff] text-[#0058be] font-bold text-sm rounded-md hover:bg-[#e5eeff] transition-colors">{t.uploadLogo}</button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { key: "schoolName", label: t.schoolName },
                  { key: "email", label: t.email },
                  { key: "phone", label: t.phone },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={`text-[10px] font-black tracking-widest uppercase mb-2 block ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{label}</label>
                    <input name={key} value={form[key]} onChange={change}
                      className={`w-full border px-4 py-3 rounded-lg outline-none focus:border-[#0058be] transition-all
                        ${dk ? "bg-slate-700 border-slate-600 text-white" : "bg-[#f9fbff] border-slate-200 text-[#0b1c30]"}`} />
                  </div>
                ))}
                <div>
                  <label className={`text-[10px] font-black tracking-widest uppercase mb-2 block ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{t.country}</label>
                  <select name="country" value={form.country} onChange={change}
                    className={`w-full border px-4 py-3 rounded-lg outline-none cursor-pointer
                      ${dk ? "bg-slate-700 border-slate-600 text-white" : "bg-[#f9fbff] border-slate-200"}`}>
                    <option>United States</option>
                    <option>India</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={`text-[10px] font-black tracking-widest uppercase mb-2 block ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{t.streetAddress}</label>
                  <input name="address" value={form.address} onChange={change}
                    className={`w-full border px-4 py-3 rounded-lg outline-none focus:border-[#0058be] transition-all
                      ${dk ? "bg-slate-700 border-slate-600 text-white" : "bg-[#f9fbff] border-slate-200"}`} />
                </div>
              </div>
            </div>
          </div>

          {/* APPEARANCE & LANGUAGE */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <h3 className={`text-xl font-bold mb-2 ${dk ? "text-white" : "text-[#0b1c30]"}`}>{t.appearance}</h3>
              <p className={`text-sm leading-relaxed ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{t.appearanceDesc}</p>
            </div>
            <div className={`lg:col-span-2 p-8 rounded-xl shadow-sm border space-y-8 ${dk ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>

              {/* Dark Mode */}
              <div className={`flex justify-between items-center pb-8 border-b ${dk ? "border-slate-700" : "border-slate-100"}`}>
                <div>
                  <p className={`font-bold ${dk ? "text-white" : "text-[#0b1c30]"}`}>{t.darkMode}</p>
                  <p className={`text-xs ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{t.darkModeDesc}</p>
                </div>
                <button type="button" onClick={toggleDarkMode}
                  className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${dk ? "bg-[#0058be]" : "bg-slate-300"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${dk ? "translate-x-7" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Language */}
              <div className="flex justify-between items-center">
                <div>
                  <p className={`font-bold ${dk ? "text-white" : "text-[#0b1c30]"}`}>{t.language}</p>
                  <p className={`text-xs ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{t.languageDesc}</p>
                </div>
                <div className={`flex rounded-xl overflow-hidden border ${dk ? "border-slate-600" : "border-slate-200"}`}>
                  {["English", "Hindi"].map((lang) => (
                    <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                      className={`px-5 py-2.5 text-sm font-bold transition-all
                        ${language === lang
                          ? "bg-[#0058be] text-white"
                          : dk ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-white text-[#6b7280] hover:bg-slate-50"}`}>
                      {lang === "English" ? "🇺🇸 English" : "🇮🇳 हिंदी"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ACADEMIC PREFERENCES */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div>
              <h3 className={`text-xl font-bold mb-2 ${dk ? "text-white" : "text-[#0b1c30]"}`}>{t.academicPreferences}</h3>
              <p className={`text-sm ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{t.academicPreferencesDesc}</p>
            </div>
            <div className={`lg:col-span-2 p-8 rounded-xl shadow-sm border space-y-8 ${dk ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
              {[
                { label: t.gradingScale, sub: t.gradingScaleDesc, key: "grading", type: "select" },
                { label: t.attendanceTracking, sub: t.attendanceTrackingDesc, key: "attendance", type: "toggle" },
                { label: t.defaultAcademicYear, sub: t.defaultAcademicYearDesc, key: "academicYear", type: "select" },
              ].map((item) => (
                <div key={item.key} className={`flex justify-between items-center pb-6 border-b last:border-0 last:pb-0 ${dk ? "border-slate-700" : "border-slate-50"}`}>
                  <div>
                    <p className={`font-bold ${dk ? "text-white" : "text-[#0b1c30]"}`}>{item.label}</p>
                    <p className={`text-xs ${dk ? "text-slate-400" : "text-[#6b7280]"}`}>{item.sub}</p>
                  </div>
                  {item.type === "toggle" ? (
                    <button type="button" onClick={toggleAttendance}
                      className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 ${form.attendance ? "bg-[#0058be]" : "bg-slate-300"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${form.attendance ? "translate-x-7" : "translate-x-0"}`} />
                    </button>
                  ) : (
                    <select name={item.key} value={form[item.key]} onChange={change}
                      className={`border px-4 py-2 rounded-lg text-sm font-bold
                        ${dk ? "bg-slate-700 border-slate-600 text-white" : "bg-[#f9fbff] border-slate-200"}`}>
                      <option>4.0 GPA Scale</option>
                      <option>Percentage (0-100)</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-end gap-4 pt-8 border-t ${dk ? "border-slate-700" : "border-slate-100"}`}>
            <button type="button" onClick={discard}
              className={`px-6 py-3 font-bold text-sm rounded-lg border transition-all
                ${dk ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-[#0b1c30] hover:bg-slate-50"}`}>
              {t.discard}
            </button>
            <button type="submit" disabled={isSaving}
              className="px-8 py-3 bg-[#0058be] text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-200 hover:bg-[#00489c] transition-all flex items-center gap-2 disabled:opacity-70">
              {isSaving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t.saving}</>
                : t.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}