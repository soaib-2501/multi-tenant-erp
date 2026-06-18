import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from '../../context/ThemeContext';

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function SettingsSkeleton() {
  return (
    <MainLayout title="Account Settings">
      <div className="w-full p-3 sm:p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <Skeleton className="w-64 h-4" />
          <Skeleton className="w-full sm:w-32 h-10 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 space-y-3">
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-full h-10 rounded-xl" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl p-4 bg-blue-100 space-y-3">
              <Skeleton className="w-40 h-6 bg-blue-200" />
              <Skeleton className="w-full h-4 bg-blue-200" />
              <Skeleton className="w-28 h-8 rounded-xl bg-blue-200" />
            </div>
            {[1, 2].map(i => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4">
                <Skeleton className="w-24 h-4 mb-2" />
                <Skeleton className="w-full h-3" />
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <Skeleton className="w-24 h-10 rounded-xl" />
              <Skeleton className="w-32 h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Reusable Toggle
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        value ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
        value ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();

  const [settings, setSettings] = useState({
    language: 'English (United States)',
    pushNotifications: true,
    emailAlerts: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await schoolAdminApi.getSettings();
        if (data) setSettings(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) return <SettingsSkeleton />;

  const handleChange = (field, value) =>
    setSettings(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await schoolAdminApi.updateSettings({ ...settings, darkMode });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => window.history.back();

  const notifItems = [
    { field: 'pushNotifications', icon: 'campaign', label: 'Push Notifications', desc: 'Quiz results and class announcements' },
    { field: 'emailAlerts',       icon: 'mail',     label: 'Email Alerts',        desc: 'Weekly summaries and parent updates'  },
  ];

  return (
    <MainLayout title="Account Settings">
      {/*
        KEY RESPONSIVE FIXES:
        1. Removed pr-3 from left col and pl-3 from right col — caused cramping on mobile.
           Grid gap-5 already handles column spacing.
        2. overflow-y-auto on root div — content scrolls instead of overflowing.
        3. p-3 sm:p-4 md:p-6 — breathing room scales with screen size.
        4. All buttons: w-full on mobile, w-auto on sm+.
        5. flex-shrink-0 on icons and toggles so they never collapse.
        6. min-w-0 on text containers so text wraps instead of pushing other elements.
        7. Action buttons: flex-col-reverse on mobile (Save on top), flex-row on sm+.
      */}
      <div className="w-full p-3 sm:p-4 md:p-6 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <p className="text-sm text-on-surface-variant">
            Manage your preferences and communication settings
          </p>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-md hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Two-column grid — single col on mobile, 2 col on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* Preferences card */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">tune</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-on-surface">Preferences</h3>
              </div>

              <div className="space-y-5">
                {/* Language */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Interface Language
                  </label>
                  <div className="relative">
                    <select
                      value={settings.language}
                      onChange={e => handleChange('language', e.target.value)}
                      className="w-full appearance-none bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm text-on-surface font-medium focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer"
                    >
                      <option>English (United States)</option>
                      <option>Spanish (Español)</option>
                      <option>French (Français)</option>
                      <option>German (Deutsch)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="material-symbols-outlined text-base text-on-surface-variant">expand_more</span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 mt-1.5">
                    Changes language of navigation and labels
                  </p>
                </div>

                {/* Dark Mode */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Appearance
                  </label>
                  <div className="flex items-center justify-between gap-3 p-3.5 bg-surface-container-low rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">
                          {darkMode ? 'dark_mode' : 'light_mode'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-on-surface truncate">Dark Mode</span>
                    </div>
                    <Toggle value={darkMode} onChange={toggleDarkMode} />
                  </div>
                </div>
              </div>
            </div>

            {/* Communication card */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">notifications_active</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-on-surface">Communication</h3>
              </div>

              <div className="space-y-3">
                {notifItems.map(({ field, icon, label, desc }) => (
                  <div
                    key={field}
                    className="flex items-center justify-between gap-3 p-3.5 bg-surface-container-low/30 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer"
                    onClick={() => handleChange(field, !settings[field])}
                  >
                    <div className="flex gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-on-surface">{label}</h4>
                        <p className="text-xs text-on-surface-variant line-clamp-1">{desc}</p>
                      </div>
                    </div>
                    <Toggle
                      value={settings[field]}
                      onChange={e => { e.stopPropagation(); handleChange(field, !settings[field]); }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* Help & Support */}
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-4 sm:p-5 text-white shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold mb-1">Need Academic Help?</h4>
              <p className="text-sm text-white/80 mb-4">
                24/7 support for platform issues and learning roadblocks
              </p>
              <button className="w-full sm:w-auto bg-white text-primary px-5 py-2 rounded-xl text-sm font-semibold shadow-md hover:scale-105 transition-transform">
                Contact Support
              </button>
            </div>

            {/* Security */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">verified_user</span>
                </div>
                <span className="text-base font-bold text-on-surface">Security</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed pl-11">
                Your data is encrypted using institutional-grade protocols. Scholar ID verified.
              </p>
            </div>

            {/* Session Info */}
            <div className="bg-surface-container-low/30 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-gray-600 text-lg">computer</span>
                </div>
                <span className="text-sm font-semibold text-on-surface">Active Session</span>
              </div>
              <p className="text-xs text-on-surface-variant pl-11">
                Last active: Today • Chrome on Windows
              </p>
            </div>

            {/* Action Buttons — stacked on mobile, row on sm+ */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                onClick={handleCancel}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-md hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="text-center pb-2">
              <p className="text-2xs text-on-surface-variant/50">ScholarFlow Student Portal v4.2</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}