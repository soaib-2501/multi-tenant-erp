import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { schoolAdminApi } from '../../services/schoolAdminApi';
import { useTheme } from '../../context/ThemeContext';

// Skeleton Components
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function SettingsSkeleton() {
  return (
    <MainLayout title="Account Settings">
      <div className="h-full w-full p-4 md:p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <Skeleton className="w-48 h-7 mb-1" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-32 h-9 rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4">
              <Skeleton className="w-24 h-5 mb-3" />
              <Skeleton className="w-32 h-3 mb-2" />
              <Skeleton className="w-full h-10 rounded-md" />
              <Skeleton className="w-48 h-3 mt-2" />
              <div className="mt-3">
                <Skeleton className="w-24 h-3 mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="w-24 h-5" />
                  <Skeleton className="w-10 h-5 rounded-full" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <Skeleton className="w-32 h-5 mb-3" />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="w-32 h-4 mb-1" />
                    <Skeleton className="w-48 h-3" />
                  </div>
                  <Skeleton className="w-10 h-5 rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="w-32 h-4 mb-1" />
                    <Skeleton className="w-48 h-3" />
                  </div>
                  <Skeleton className="w-10 h-5 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-4">
              <Skeleton className="w-40 h-6 mb-2 bg-white/20" />
              <Skeleton className="w-64 h-3 mb-4 bg-white/20" />
              <Skeleton className="w-28 h-8 rounded-md bg-white/20" />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <Skeleton className="w-16 h-4 mb-2" />
              <Skeleton className="w-full h-3" />
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <Skeleton className="w-24 h-3 mb-1" />
              <Skeleton className="w-48 h-3" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Skeleton className="w-20 h-9 rounded-md" />
              <Skeleton className="w-28 h-9 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
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
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) return <SettingsSkeleton />;

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

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

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <MainLayout title="Account Settings">
      <div className="h-full w-full p-4 md:p-6">
        {/* Header - Only subtitle now, no duplicate title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <p className="text-sm text-on-surface-variant">Manage your preferences and communication settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-md hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Left Column */}
          <div className="space-y-5 pr-3">
            {/* Preferences Section */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">tune</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Preferences</h3>
              </div>
              
              <div className="space-y-5">
                {/* Language Selector */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Interface Language
                  </label>
                  <div className="relative">
                    <select
                      value={settings.language}
                      onChange={(e) => handleChange('language', e.target.value)}
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
                  <p className="text-[11px] text-on-surface-variant/70 mt-1.5">
                    Changes language of navigation and labels
                  </p>
                </div>

                {/* Dark Mode Toggle */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Appearance
                  </label>
                  <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">
                          {darkMode ? 'dark_mode' : 'light_mode'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-on-surface">Dark Mode</span>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        darkMode ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Section */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">notifications_active</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Communication</h3>
              </div>
              
              <div className="space-y-3">
                {/* Push Notifications */}
                <div className="flex items-center justify-between p-3.5 bg-surface-container-low/30 rounded-xl hover:bg-surface-container-low transition-all group cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                      <span className="material-symbols-outlined text-primary text-sm">campaign</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface">Push Notifications</h4>
                      <p className="text-xs text-on-surface-variant">Quiz results and class announcements</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChange('pushNotifications', !settings.pushNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                      settings.pushNotifications ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Email Alerts */}
                <div className="flex items-center justify-between p-3.5 bg-surface-container-low/30 rounded-xl hover:bg-surface-container-low transition-all group cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                      <span className="material-symbols-outlined text-primary text-sm">mail</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface">Email Alerts</h4>
                      <p className="text-xs text-on-surface-variant">Weekly summaries and parent updates</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChange('emailAlerts', !settings.emailAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                      settings.emailAlerts ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5 pl-3">
            {/* Help & Support Card */}
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-5 text-white shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <h4 className="text-lg font-bold mb-1">Need Academic Help?</h4>
              <p className="text-sm text-white/80 mb-4">
                24/7 support for platform issues and learning roadblocks
              </p>
              <button className="bg-white text-primary px-5 py-2 rounded-xl text-sm font-semibold shadow-md hover:scale-105 transition-transform">
                Contact Support
              </button>
            </div>

            {/* Security Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">verified_user</span>
                </div>
                <span className="text-base font-bold text-on-surface">Security</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed pl-11">
                Your data is encrypted using institutional-grade protocols. Scholar ID verified.
              </p>
            </div>

            {/* Session Info */}
            <div className="bg-surface-container-low/30 rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-600 text-lg">computer</span>
                </div>
                <span className="text-sm font-semibold text-on-surface">Active Session</span>
              </div>
              <p className="text-xs text-on-surface-variant pl-11">
                Last active: Today • Chrome on Windows
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <button 
                onClick={handleCancel}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-md hover:opacity-90 transition-all disabled:opacity-50`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Footer Note */}
            <div className="text-center pt-4 pb-2">
              <p className="text-[10px] text-on-surface-variant/50">
                ScholarFlow Student Portal v4.2
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </MainLayout>
  );
}