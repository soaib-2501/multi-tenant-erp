import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import { useTheme } from "../../context/ThemeContext";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getStudentById(id);
        console.log("Fetched Backend Data:", data);
        setStudent(data);
      } catch (err) {
        console.error("Failed to load student", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <SchoolLayout title="Student Details">
        <div className="flex items-center justify-center min-h-[50vh] text-primary font-semibold gap-2 font-body">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Student Details">
      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-primary font-medium flex items-center gap-1 hover:underline transition-all font-body"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Directory
        </button>

        <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-6">
          Student Profile
        </h1>

        {student ? (
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/10">
            {/* Header section */}
            <div className="flex items-center gap-4 mb-8 border-b border-outline-variant/10 pb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">
                  {student.first_name || student.user?.first_name || "N/A"}{" "}
                  {student.last_name || student.user?.last_name || ""}
                </h2>
                <p className="text-sm text-on-surface-variant font-mono font-body">
                  ID: {id}
                </p>
              </div>
            </div>

            {/* Data Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-body">
                  Enrollment Number
                </p>
                <p className="text-lg font-medium text-on-surface bg-surface-container-high p-3 rounded-md border border-outline-variant/10 font-body">
                  {student.enrollment_number || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-body">
                  Email Address
                </p>
                <p className="text-lg font-medium text-on-surface bg-surface-container-high p-3 rounded-md border border-outline-variant/10 font-body">
                  {student.email || student.user?.email || "No Email Provided"}
                </p>
              </div>

              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-body">
                  Phone Number
                </p>
                <p className="text-lg font-medium text-on-surface bg-surface-container-high p-3 rounded-md border border-outline-variant/10 font-body">
                  {student.phone_number || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 font-body">
                  Status
                </p>
                <p className="text-lg font-medium text-on-surface bg-surface-container-high p-3 rounded-md border border-outline-variant/10 flex items-center gap-2 font-body">
                  {!student.is_archived ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-success"></span> Active Profile
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-outline"></span> Archived Profile
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-error/10 text-error rounded-lg border border-error/20 flex items-center gap-3 font-medium font-body">
            <span className="material-symbols-outlined">error</span>
            Student data could not be parsed. Check your console to see the fetched JSON.
          </div>
        )}
      </div>
    </SchoolLayout>
  );
}