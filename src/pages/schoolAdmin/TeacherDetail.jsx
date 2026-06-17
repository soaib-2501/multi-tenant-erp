import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import { useTheme } from "../../context/ThemeContext";

export default function TeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getTeacherById(id);
        console.log("Fetched Teacher Data:", data);
        setTeacher(data);
      } catch (err) {
        console.error("Failed to load teacher", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <SchoolLayout title="Teacher Details">
        <div className="flex items-center justify-center min-h-[50vh] text-primary font-semibold gap-2 font-body">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Teacher Details">
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-primary font-medium flex items-center gap-1 hover:underline transition-all font-body"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Directory
        </button>

        <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-6">
          Faculty Profile
        </h1>

        {teacher ? (
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/10">
            {/* Header section */}
            <div className="flex items-center gap-4 mb-8 border-b border-outline-variant/10 pb-6">
              <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-2xl font-bold">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">
                  {teacher.first_name || teacher.user?.first_name || "N/A"}{" "}
                  {teacher.last_name || teacher.user?.last_name || ""}
                </h2>
                <p className="text-sm text-on-surface-variant font-mono font-body">
                  UUID: {id}
                </p>
              </div>
            </div>

            {/* Data Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-body">
                  Employee ID
                </p>
                <p className="text-lg font-medium text-on-surface bg-surface-container-high p-3 rounded-md border border-outline-variant/10 font-body">
                  {teacher.employee_id || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-body">
                  Email Address
                </p>
                <p className="text-lg font-medium text-on-surface bg-surface-container-high p-3 rounded-md border border-outline-variant/10 font-body">
                  {teacher.email || teacher.user?.email || "No Email Provided"}
                </p>
              </div>

              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-body">
                  Qualification
                </p>
                <p className="text-lg font-medium text-on-surface bg-surface-container-high p-3 rounded-md border border-outline-variant/10 font-body">
                  {teacher.qualification || "Unspecified"}
                </p>
              </div>

              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-body">
                  Joining Date
                </p>
                <p className="text-lg font-medium text-on-surface bg-surface-container-high p-3 rounded-md border border-outline-variant/10 font-body">
                  {teacher.joining_date || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-error/10 text-error rounded-lg border border-error/20 flex items-center gap-3 font-medium font-body">
            <span className="material-symbols-outlined">error</span>
            Teacher data could not be parsed.
          </div>
        )}
      </div>
    </SchoolLayout>
  );
}