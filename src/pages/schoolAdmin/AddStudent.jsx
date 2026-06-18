import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import api from "../../services/axiosClient";

export default function AddStudent() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch class levels and sections on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [clRes, secRes, yearRes] = await Promise.all([
          schoolAdminApi.getClassLevels(),
          schoolAdminApi.getSections(),
          schoolAdminApi.getAcademicYears(),
        ]);
        const clData = clRes.results ?? clRes;
        const secData = secRes.results ?? secRes;
        const yearData = yearRes.results ?? yearRes;
        setClassLevels(Array.isArray(clData) ? clData : []);
        setSections(Array.isArray(secData) ? secData : []);
        setAcademicYears(Array.isArray(yearData) ? yearData : []);
      } catch (err) {
        console.error("Failed to fetch class levels/sections:", err);
      }
    };
    fetchOptions();
  }, []);

  // Filter sections whenever class level changes
  useEffect(() => {
    if (classLevel) {
      setFilteredSections(sections.filter(s => String(s.class_level) === String(classLevel) || String(s.class_level?.id) === String(classLevel)));
    } else {
      setFilteredSections(sections);
    }
    setSection("");
  }, [classLevel, sections]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);

    try {
      const userPayload = { email, password, first_name: firstName, last_name: lastName };
      const userData = await schoolAdminApi.createUser(userPayload);

      if (userData.id) {
        const profilePayload = {
          user: userData.id,
          enrollment_number: enrollmentNumber,
          is_archived: false
        };
        // Strip empty fields to prevent Django crashes
        if (dateOfBirth) profilePayload.date_of_birth = dateOfBirth;
        if (phoneNumber) profilePayload.phone_number = phoneNumber;
        if (bloodGroup) profilePayload.blood_group = bloodGroup;
        if (address) profilePayload.address = address;

        const studentProfile = await schoolAdminApi.createStudentProfile(profilePayload);

        // Create enrollment record so class/section appear on the details page
        if (classLevel && academicYear && studentProfile?.id) {
          const enrollmentPayload = {
            student: studentProfile.id,
            academic_year: academicYear,
            class_level: classLevel,
            section: section || null,
          };
          await api.post(`academics/enrollments/`, enrollmentPayload);
        }
      }
      alert("Student registration complete!");
      navigate("/school-admin/students");

    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
          setError("Server Error (500). Please check Django terminal.");
        } else {
          setError(Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(" | "));
        }
      } else setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Student Registration">
      <div className="max-w-4xl mx-auto space-y-6 px-6 py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Register New Student</h1>
          </div>
          <button type="button" onClick={() => navigate("/school-admin/students")} className="px-4 py-2 bg-white border border-gray-200 text-[#0058be] font-semibold rounded shadow-sm text-sm">Go Back</button>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-base font-bold mb-4">Core Identity</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none" />
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temporary Password" className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-base font-bold mb-4">Academic Profile</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input required value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} placeholder="Enrollment Number" className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none" />
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none text-slate-600" />
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone Number" className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none" />
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none text-slate-600">
                <option value="">Blood Group...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none text-slate-600"
              >
                <option value="">Class Level...</option>
                {classLevels.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name}
                  </option>
                ))}
              </select>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                disabled={!classLevel}
                className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{classLevel ? "Select Section..." : "Select Class Level first"}</option>
                {filteredSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
            <textarea rows="2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Residential Address" className="w-full bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none resize-none" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-base font-bold mb-4">Class Enrollment</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none text-slate-600"
              >
                <option value="">Academic Year...</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none text-slate-600"
              >
                <option value="">Class Level...</option>
                {classLevels.map((cl) => (
                  <option key={cl.id} value={cl.id}>{cl.name}</option>
                ))}
              </select>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                disabled={!classLevel}
                className="bg-[#eff4ff] px-4 py-2.5 rounded text-sm outline-none text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{classLevel ? "Select Section..." : "Select Class Level first"}</option>
                {filteredSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-8 py-2.5 bg-[#0058be] text-white text-sm font-bold rounded shadow-md">{loading ? "Saving..." : "Register Student"}</button>
          </div>
        </form>
      </div>
    </SchoolLayout>
  );
}