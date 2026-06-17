import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { 
  getMyProfile, 
  getTeacherClasses, 
  getSectionEnrollments, 
  getGrades, 
  getExams, 
  bulkSubmitGrades 
} from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { Toaster, toast } from 'react-hot-toast';

const EnterStudentGrades = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get("exam_id");

  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [gradesMap, setGradesMap] = useState({}); // { studentId: { id, marks_obtained, remarks } }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Profile
  const { data: profile } = useStaleData("profile:me", getMyProfile);
  const teacherId = profile?.profiles?.teacher?.id || profile?.identity?.id;

  // 2. Fetch Teacher Classes
  const { data: assignmentsData, loading: classesLoading } = useStaleData(
    `teacher:classes:${teacherId}`,
    () => getTeacherClasses(teacherId),
    { skip: !teacherId }
  );
  const allClasses = assignmentsData?.results || [];

  // Automatically select first class if none
  useEffect(() => {
    if (allClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(allClasses[0].id);
    }
  }, [allClasses, selectedClassId]);

  const currentClass = allClasses.find((c) => String(c.id) === String(selectedClassId));
  const sectionId = currentClass?.section?.id || currentClass?.section;
  const subjectId = currentClass?.subject?.id || currentClass?.subject;
  const targetSubjectId = typeof subjectId === 'object' ? subjectId?.id : subjectId;

  // 3. Fetch Exams & Find Current Exam details
  const { data: examsData } = useStaleData('teacher:exams', async () => {
    const res = await getExams();
    return Array.isArray(res) ? { results: res } : res;
  });
  const currentExam = examsData?.results?.find(e => String(e.id) === String(examId));

  // 4. Fetch Enrollments
  const { data: enrollments, loading: studentsLoading } = useStaleData(
    `section:${sectionId}:students`,
    () => getSectionEnrollments(sectionId),
    { skip: !sectionId }
  );
  
  // 5. Fetch Existing Grades for this exam + subject
  const { data: existingGrades, loading: gradesLoading } = useStaleData(
    `grades:${targetSubjectId}:${examId}`,
    () => getGrades(targetSubjectId, examId),
    { skip: !targetSubjectId || !examId }
  );

  // Initialize unified list of students and grades
  useEffect(() => {
    if (enrollments?.results) {
      const studentList = enrollments.results;
      setStudents(studentList);
      
      const gMap = {};
      if (existingGrades?.results) {
        existingGrades.results.forEach(g => {
          const sid = typeof g.student === 'object' ? g.student.id : g.student;
          if (sid) {
            gMap[sid] = {
              id: g.id,
              marks_obtained: g.marks_obtained,
              remarks: g.remarks || '',
            };
          }
        });
      }
      
      // Merge with empty
      studentList.forEach(s => {
        const sid = s.student || s.id;
        if (!gMap[sid]) {
          gMap[sid] = {
            id: null,
            marks_obtained: '',
            remarks: '',
          };
        }
      });
      setGradesMap(gMap);
    }
  }, [enrollments, existingGrades]);

  const handleGradeChange = (studentId, field, value) => {
    setGradesMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const calculateGrade = (marks, maxMarks = 100) => {
    if (!marks || marks === '') return '--';
    const percentage = (parseFloat(marks) / parseFloat(maxMarks)) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getGradeFromMarks = (marks) => {
    return calculateGrade(marks, currentExam?.max_marks || 100);
  };

  const gradedCount = students.filter(s => {
    const studentId = s.student || s.id;
    const g = gradesMap[studentId];
    return g && g.marks_obtained !== '' && g.marks_obtained !== null;
  }).length;

  const handleBulkSubmit = async () => {
    if (!examId || !targetSubjectId || !sectionId) {
      toast.error('Missing required info to submit grades.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const records = Object.entries(gradesMap).map(([studentId, data]) => ({
        student_id: studentId,
        marks_obtained: data.marks_obtained || "0",
        max_marks: currentExam?.max_marks || "100.00",
        remarks: data.remarks || ""
      }));
      
      const payload = {
        exam_id: examId,
        subject_id: targetSubjectId,
        section_id: sectionId,
        records
      };
      
      await bulkSubmitGrades(payload);
      toast.success('Grades saved successfully!');
      setTimeout(() => {
        navigate('/teacher/grades');
      }, 1000);
    } catch (err) {
      toast.error('Failed to submit grades: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingData = classesLoading || studentsLoading || gradesLoading;

  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    return "ST";
  };

  return (
    <MainLayout title="Enter Grades">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
        <Link to="/teacher/grades" className="flex items-center gap-2 text-primary font-semibold text-sm hover:-translate-x-1 transition-transform w-max">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Grades Overview
        </Link>

        {/* Hero Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                {currentExam?.academic_year_name || 'Academic Year'}
              </span>
              <span className="text-slate-400 text-sm font-medium">Exam Date: {currentExam ? currentExam.start_date : 'N/A'}</span>
            </div>
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-display leading-none">
              {currentExam ? currentExam.name : 'Unknown Exam'} - Grades
            </h1>
            <p className="text-on-surface-variant mt-2 max-w-lg">
              Enter student performance data for {currentClass?.subject_name || currentClass?.subject?.name || 'the selected subject'}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="bg-surface-container-high border-none rounded-md text-sm font-bold p-2.5 outline-none cursor-pointer"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {allClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.subject_name || c.subject?.name || 'Unknown Subject'} - {c.section_name || c.section?.name || 'Class'}
                </option>
              ))}
            </select>
            <button 
              onClick={handleBulkSubmit}
              disabled={isSubmitting || students.length === 0}
              className={`px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-md text-sm shadow-md transition-all outline-none cursor-pointer border-none ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95 shadow-primary/20'}`}
            >
              {isSubmitting ? 'Saving...' : 'Publish Results'}
            </button>
          </div>
        </div>

        {/* Bento Layout Content */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Grading Table */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl">
              <div className="flex gap-8 px-4">
                <div>
                  <p className="text-2xs font-bold text-slate-500 uppercase tracking-widest">Total Students</p>
                  <p className="text-xl font-bold text-on-surface text-center">{students.length}</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-slate-500 uppercase tracking-widest">Graded</p>
                  <p className="text-xl font-bold text-primary text-center">{gradedCount}/{students.length}</p>
                </div>
              </div>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm border border-outline-variant/10">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-surface-container-low/50 text-left border-b border-surface-container">
                      <th className="px-6 py-4 text-2xs font-black text-slate-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-2xs font-black text-slate-500 uppercase tracking-wider">Enrollment No.</th>
                      <th className="px-6 py-4 text-2xs font-black text-slate-500 uppercase tracking-wider text-center">Marks ({currentExam?.max_marks || 100})</th>
                      <th className="px-6 py-4 text-2xs font-black text-slate-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-4 text-2xs font-black text-slate-500 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/50">
                    {isLoadingData ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-slate-500 text-sm">Loading data...</td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-slate-500 text-sm">No students found.</td>
                      </tr>
                    ) : students.map((enrollment) => {
                      const studentId = enrollment.student || enrollment.id;
                      const sGrades = gradesMap[studentId] || {};
                      const hasMarks = !!sGrades.marks_obtained;
                      
                      const displayName = enrollment.student_name || `${enrollment.first_name || ''} ${enrollment.last_name || ''}`.trim() || 'Unknown';
                      const enrollmentNo = enrollment.student_enrollment_no || enrollment.enrollment_number || 'N/A';
                      
                      return (
                        <tr key={studentId} className={`hover:bg-blue-50/30 transition-colors ${hasMarks ? 'bg-blue-50/10' : ''}`}>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                {getInitials(enrollment.first_name, enrollment.last_name)}
                              </div>
                              <div>
                                <p className="font-bold text-on-surface text-sm">
                                  {displayName}
                                </p>
                                <p className="text-xs text-slate-400">{enrollment.email || 'No email'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-slate-500 font-mono">{enrollmentNo}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center">
                              <input 
                                className={`w-20 text-center py-2 border-none rounded-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none ${hasMarks ? 'bg-white shadow-sm ring-2 ring-primary/10' : 'bg-surface-container-low'}`} 
                                placeholder="--" 
                                type="number"
                                min="0"
                                max={currentExam?.max_marks || 100}
                                value={sGrades.marks_obtained}
                                onChange={(e) => handleGradeChange(studentId, 'marks_obtained', e.target.value)}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-block text-center py-1.5 px-3 font-bold text-sm rounded ${hasMarks ? 'bg-white text-primary shadow-sm ring-1 ring-primary/20' : 'text-slate-400'}`}>
                              {hasMarks ? getGradeFromMarks(sGrades.marks_obtained) : '--'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <input 
                              className="min-w-[120px] w-full text-xs py-2 px-3 border-none bg-surface-container-low rounded focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 italic outline-none transition-all" 
                              placeholder="Add optional remark..." 
                              type="text"
                              value={sGrades.remarks}
                              onChange={(e) => handleGradeChange(studentId, 'remarks', e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-8">
            {/* Grading Rules Card */}
            <div className="bg-surface-container-low p-6 rounded-xl space-y-4 shadow-sm border border-outline-variant/10">
              <h4 className="text-2xs font-black text-slate-400 uppercase tracking-widest">Grading Schema</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface">90% - 100%</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-2xs font-black rounded">A+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface">80% - 89%</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-2xs font-black rounded">A</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface">70% - 79%</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-2xs font-black rounded">B</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface">60% - 69%</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-2xs font-black rounded">C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface">50% - 59%</span>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-2xs font-black rounded">D</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface">Below 50%</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-2xs font-black rounded">F</span>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 relative overflow-hidden shadow-sm">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <span className="material-symbols-outlined text-lg">timer</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Submission Goal</span>
                </div>
                <p className="text-2xl font-black text-red-800">24 Hours</p>
                <p className="text-xs text-red-800/70 mt-1">Remaining until portal closes.</p>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-red-600/5 rotate-12">schedule</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EnterStudentGrades;