import React, { useEffect, useState } from 'react';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { getMyProfile, getTeacherProfile } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { RevalidatingBar, SkeletonBlock } from "../../components/erp/teacher/LoadingPrimitives";

const TeacherProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">
    <div className="mb-6 pl-4 md:pl-0 space-y-3">
      <SkeletonBlock className="h-4 w-40" />
      <SkeletonBlock className="h-10 w-52" />
    </div>

    <section className="bg-surface-container-lowest dark:bg-slate-900/80 rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start shadow-sm border border-gray-100 dark:border-slate-800">
      <SkeletonBlock className="w-32 h-32 md:w-40 md:h-40 rounded-xl mx-auto md:mx-0 shrink-0" />
      <div className="flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-8 w-56" />
            <SkeletonBlock className="h-4 w-36" />
          </div>
          <SkeletonBlock className="h-8 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <SkeletonBlock className="w-10 h-10 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1">
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-gray-100 dark:border-slate-800 space-y-3">
          <SkeletonBlock className="h-3 w-40" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-7 w-24 rounded-md" />
            <SkeletonBlock className="h-7 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </section>

    <section className="bg-surface-container-lowest dark:bg-slate-900/80 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-8">
        <SkeletonBlock className="h-6 w-6" />
        <SkeletonBlock className="h-6 w-60" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBlock className="h-4 w-28 ml-1" />
            <SkeletonBlock className="h-12 w-full rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-gray-100 dark:border-slate-800">
        <SkeletonBlock className="h-12 w-32 rounded-md" />
        <SkeletonBlock className="h-12 w-44 rounded-md" />
      </div>
    </section>
  </div>
);

const TeacherProfileManagement = () => {
  const { data: profileData, mutate: mutateProfile } = useStaleData("profile:me", getMyProfile);
  const teacherId = profileData?.profiles?.teacher?.id || profileData?.identity?.id;

  const { data: teacherProfile, loading: profileLoading, revalidating, mutate: mutateTeacher } = useStaleData(
    teacherId ? `profile:teacher:${teacherId}` : null,
    () => getTeacherProfile(teacherId),
    { skip: !teacherId }
  );

  // Form State initialized from sessionStorage or profile data
  const [firstName, setFirstName] = useState(() => sessionStorage.getItem("edit_profile_first_name") || "");
  const [lastName, setLastName] = useState(() => sessionStorage.getItem("edit_profile_last_name") || "");
  const [phone, setPhone] = useState(() => sessionStorage.getItem("edit_profile_phone") || "");
  const [password, setPassword] = useState("");
  
  // UI State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Sync profile data to form state fields when first loaded
  useEffect(() => {
    if (teacherProfile) {
      if (!sessionStorage.getItem("edit_profile_first_name")) {
        const val = teacherProfile.first_name || profileData?.identity?.first_name || "";
        setFirstName(val);
        sessionStorage.setItem("edit_profile_first_name", val);
      }
      if (!sessionStorage.getItem("edit_profile_last_name")) {
        const val = teacherProfile.last_name || profileData?.identity?.last_name || "";
        setLastName(val);
        sessionStorage.setItem("edit_profile_last_name", val);
      }
      if (!sessionStorage.getItem("edit_profile_phone")) {
        const val = teacherProfile.phone_number || "";
        setPhone(val);
        sessionStorage.setItem("edit_profile_phone", val);
      }
    }
  }, [teacherProfile, profileData]);

  const loading = profileLoading && !teacherProfile;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const baseUrl = import.meta.env?.VITE_API_BASE_URL || process.env?.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem("access_token");
      const headers = { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      };

      const updatePromises = [];
      const identity = profileData?.identity;
      const currentTeacherId = teacherProfile?.id || teacherId;

      // 1. Update Core Identity (User) if available
      if (identity?.id) {
        const userPayload = { first_name: firstName, last_name: lastName };
        if (password && password.trim()) {
          userPayload.password = password;
        }

        updatePromises.push(
          fetch(`${baseUrl}/api/v1/users/${identity.id}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(userPayload)
          })
        );
      }

      // 2. Update Teacher Profile if available
      if (currentTeacherId) {
        const profilePayload = {
          first_name: firstName,
          last_name: lastName,
          phone_number: phone
        };

        updatePromises.push(
          fetch(`${baseUrl}/api/v1/profiles/teachers/${currentTeacherId}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(profilePayload)
          })
        );
      }

      if (updatePromises.length === 0) {
        throw new Error("No profile data available to update.");
      }

      const results = await Promise.allSettled(updatePromises);
      const failed = results.filter(res => res.status === 'rejected' || (res.value && !res.value.ok));

      if (failed.length > 0) {
        throw new Error("Failed to fully synchronize profile changes. Please try again.");
      }

      sessionStorage.removeItem("edit_profile_first_name");
      sessionStorage.removeItem("edit_profile_last_name");
      sessionStorage.removeItem("edit_profile_phone");

      // Mutate cache to reflect the new data immediately without showing loader
      const updatedTeacher = {
        ...teacherProfile,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone
      };
      const updatedProfile = {
        ...profileData,
        identity: {
          ...profileData?.identity,
          first_name: firstName,
          last_name: lastName
        }
      };

      mutateTeacher(updatedTeacher);
      mutateProfile(updatedProfile);

      localStorage.setItem('user_data', JSON.stringify(updatedProfile));

      setSuccess("Profile updated and synchronized successfully!");
      setPassword(""); // Clear password field after save

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const identity = profileData?.identity;
  const fullName = teacherProfile
    ? [teacherProfile.first_name, teacherProfile.last_name].filter(Boolean).join(" ") || "Teacher Profile"
    : [identity?.first_name, identity?.last_name].filter(Boolean).join(" ") || "Teacher Profile";
  const email = teacherProfile?.email || identity?.email || "";
  const phoneDisplay = teacherProfile?.phone_number || phone || "Not provided";
  const qualification = teacherProfile?.qualification || "Teacher";
  const employeeId = teacherProfile?.employee_id || "N/A";
  const schoolName = teacherProfile?.school_name || identity?.school_name || "Current School";
  const profileImage = teacherProfile?.profile_picture || "https://via.placeholder.com/400x400.png?text=Teacher+Profile";
  const specializations = teacherProfile?.qualification
    ? [teacherProfile.qualification]
    : [];

  const getInitials = (first, last) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    return "TR";
  };

  if (loading) {
    return (
      <MainLayout title="Teacher Profile">
        <TeacherProfileSkeleton />
      </MainLayout>
    );
  }

  if (error && !teacherProfile && !profileData) {
    return (
      <MainLayout title="Teacher Profile">
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-red-100 text-center">
          <span className="material-symbols-outlined text-5xl text-red-500 mb-4">gpp_bad</span>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Resolution Failed</h2>
          <p className="text-gray-500 mb-6">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Teacher Profile">
      <RevalidatingBar show={revalidating} />

      <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">
        
        {/* Page Title */}
        <div className="mb-6 pl-4 md:pl-0">
          <p className="text-[#0058be] dark:text-blue-400 font-bold text-sm tracking-widest uppercase mb-1">Account Management</p>
          <h2 className="text-4xl font-extrabold font-display tracking-tight text-slate-800 dark:text-white">My Profile</h2>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex gap-3 shadow-sm">
            <span className="material-symbols-outlined">error</span>
            <div>
              <p className="font-bold text-sm">Action Required</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200 flex gap-3 shadow-sm">
            <span className="material-symbols-outlined">check_circle</span>
            <div>
              <p className="font-bold text-sm">Success!</p>
              <p className="text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Profile Identity Card */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/80 rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
          {/* Subtle Background Texture */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0058be]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative group mx-auto md:mx-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-900 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#0058be] dark:text-blue-400">
              {profileImage && profileImage !== "https://via.placeholder.com/400x400.png?text=Teacher+Profile" ? (
                <img alt={fullName} className="w-full h-full object-cover" src={profileImage} />
              ) : (
                <span className="text-5xl font-bold">{getInitials(teacherProfile?.first_name, teacherProfile?.last_name)}</span>
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-[#0058be] text-white rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-transform outline-none border-none cursor-pointer">
              <span className="material-symbols-outlined text-lg block">photo_camera</span>
            </button>
          </div>
          
          <div className="flex-1 z-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-3xl font-bold font-display text-slate-800 dark:text-white mb-1">{fullName}</h3>
                <p className="text-[#0058be] dark:text-blue-400 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm block">verified</span>
                  {qualification}
                </p>
              </div>
              <span className="bg-[#eff4ff] dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#0058be] dark:text-blue-300 uppercase tracking-wider shadow-sm">Active Status</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-[#0058be] dark:text-blue-400 shrink-0 border border-gray-100 dark:border-slate-700">
                  <span className="material-symbols-outlined block">mail</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Institutional Email</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-[#0058be] dark:text-blue-400 shrink-0 border border-gray-100 dark:border-slate-700">
                  <span className="material-symbols-outlined block">call</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Contact Number</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{phoneDisplay}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-[#0058be] dark:text-blue-400 shrink-0 border border-gray-100 dark:border-slate-700">
                  <span className="material-symbols-outlined block">badge</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Employee ID</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white font-mono">{employeeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-[#0058be] dark:text-blue-400 shrink-0 border border-gray-100 dark:border-slate-700">
                  <span className="material-symbols-outlined block">school</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">School</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{schoolName}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">Core Specializations</p>
              <div className="flex flex-wrap gap-2">
                {specializations.length > 0 ? (
                  specializations.map((item) => (
                    <span key={item} className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-md text-xs font-semibold text-[#0058be] dark:text-blue-400 border border-gray-100 dark:border-slate-700">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-md text-xs font-semibold text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-700">
                    No specialization added
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Edit Profile Section */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/80 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-[#0058be] dark:text-blue-400 block">edit_note</span>
            <h4 className="text-xl font-bold font-display text-slate-800 dark:text-white">Update Profile Information</h4>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 dark:text-slate-300 ml-1">First Name</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-[#f8f9ff] dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-md px-4 py-3.5 text-slate-700 dark:text-white font-medium focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]/40 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none" 
                    placeholder="Enter first name" 
                    type="text" 
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      sessionStorage.setItem("edit_profile_first_name", e.target.value);
                    }}
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#0058be] material-symbols-outlined text-sm block">person</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 dark:text-slate-300 ml-1">Last Name</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-[#f8f9ff] dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-md px-4 py-3.5 text-slate-700 dark:text-white font-medium focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]/40 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none" 
                    placeholder="Enter last name" 
                    type="text" 
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      sessionStorage.setItem("edit_profile_last_name", e.target.value);
                    }}
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#0058be] material-symbols-outlined text-sm block">person</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 dark:text-slate-300 ml-1">Verified Contact Phone</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-[#f8f9ff] dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-md px-4 py-3.5 text-slate-700 dark:text-white font-medium focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]/40 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none" 
                    placeholder="Enter phone number" 
                    type="tel" 
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      sessionStorage.setItem("edit_profile_phone", e.target.value);
                    }}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#0058be] material-symbols-outlined text-sm block">call</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 dark:text-slate-300 ml-1">Update Password</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-[#f8f9ff] dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-md px-4 py-3.5 text-slate-700 dark:text-white font-medium focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be]/40 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none" 
                    placeholder="Enter new password (optional)" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-[#0058be] material-symbols-outlined text-sm block">lock</span>
                </div>
                <p className="text-2xs text-gray-500 dark:text-slate-400 ml-1 font-medium">Leave blank if you do not wish to change your password.</p>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl flex items-start gap-3 border border-amber-100 dark:border-amber-900/30 md:col-span-2">
                <span className="material-symbols-outlined text-[#924700] text-xl block">auto_awesome</span>
                <div>
                  <p className="text-xs font-bold text-[#924700] uppercase">AI Security Insight</p>
                  <p className="text-xs text-amber-900 dark:text-amber-200 mt-1">Profile data is loaded from your current teacher account. Update password details only after confirming with your admin policy.</p>
                </div>
              </div>

            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-4 mt-12 pt-8 border-t border-gray-100 dark:border-slate-800">
              <button 
                className="w-full sm:w-auto px-8 py-3.5 rounded-md text-sm font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors outline-none border border-transparent cursor-pointer" 
                type="button"
                onClick={() => {
                  setFirstName(teacherProfile?.first_name || identity?.first_name || "");
                  setLastName(teacherProfile?.last_name || identity?.last_name || "");
                  setPhone(teacherProfile?.phone_number || "");
                  setPassword("");
                  setError(null);
                  setSuccess(null);
                  sessionStorage.removeItem("edit_profile_first_name");
                  sessionStorage.removeItem("edit_profile_last_name");
                  sessionStorage.removeItem("edit_profile_phone");
                }}
              >
                Reset Changes
              </button>
              <button 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3.5 rounded-md text-sm font-bold text-white bg-gradient-to-r from-[#0058be] to-[#2170e4] shadow-lg shadow-[#0058be]/20 hover:scale-[1.02] active:scale-95 transition-all outline-none border-none cursor-pointer disabled:opacity-70 disabled:scale-100" 
                type="submit"
                disabled={saving}
              >
                {saving ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">save</span>}
                {saving ? "Synchronizing..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </section>

        {/* Footnote Information */}
        <div className="flex justify-center items-center gap-6 py-4 flex-wrap">
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm block">verified_user</span>
            Data encrypted with AES-256
          </p>
          <div className="hidden sm:block h-1 w-1 bg-gray-300 dark:bg-slate-700 rounded-full"></div>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Teacher profile ID: {teacherProfile?.id || identity?.id || "Loading..."}</p>
        </div>

      </div>
    </MainLayout>
  );
};

export default TeacherProfileManagement;
