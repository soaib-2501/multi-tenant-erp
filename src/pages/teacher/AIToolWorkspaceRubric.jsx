import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { generateRubric } from '../../services/api';
const MATHEMATICS_CHAPTERS = {
  '9': [
    '1 - NUMBER SYSTEMS',
    "10 - HERON'S FORMULA",
    '11 - SURFACE AREAS AND VOLUMES',
    '12 - STATISTICS',
    'lal - PROOFS IN MATHEMATICS',
    '1 a2 - INTRODUCTION TO MATHEMATICAL MODELLING',
    '2 - POLYNOMIALS',
    '3 - COORDINATE GEOMETRY',
    '4 - LINEAR EQUATIONS IN TWO VARIABLES',
    "5 -INTRODUCTION TO EUCLID'S GEOMETRY",
    '6 - LINES AND ANGLES',
    '7 - TRIANGLES',
    '8 - QUADRILATERALS',
    '9 - CIRCLES'
  ],
  '10': [
    '10 - CIRCLES',
    '11 - AREAS RELATED TO CIRCLES',
    '1 - REAL NUMBERS',
    '12 - SURFACE AREAS AND VOLUMES',
    '13 - STATISTICS',
    '14 - PROBABILITY',
    '2 - POLYNOMIALS',
    '3 - PAIR OF LINEAR EQUATIONS IN TWO VARIABLES',
    ' 4 - QUADRATIC EQUATIONS',
    '5 - ARITHMETIC PROGRESSIONS',
    '6 - TRIANGLES',
    '7 - COORDINATE GEOMETRY',
    '8 - INTRODUCTION TO TRIGONOMETRY',
    '9 - SOME APPLICATIONS OF TRIGONOMETRY'
  ]
};

const AIToolWorkspaceRubric = () => {
  const [subject, setSubject] = useState('Mathematics');
  const [className, setClassName] = useState('10');
  const [chapterName, setChapterName] = useState('10 - CIRCLES');

  const handleClassChange = (newClass) => {
    setClassName(newClass);
    const list = MATHEMATICS_CHAPTERS[newClass] || [];
    if (list.length > 0) {
      setChapterName(list[0]);
    } else {
      setChapterName('');
    }
  };

  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [totalScore, setTotalScore] = useState(100);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!className || !subject || !chapterName || !assignmentDesc) { throw new Error('Please provide class_name, subject, chapter_name and assignment description'); }

      const payload = { class_name: String(className), subject: String(subject), chapter_name: String(chapterName), assignment_description: String(assignmentDesc), total_score: Number(totalScore) };
      const data = await generateRubric(payload);
      setResult(data);
    } catch (err) {
      // Show validation details if available
      const details = err && err.details ? err.details : null;
      if (details) {
        try {
          setError(`${err.message}\n${JSON.stringify(details, null, 2)}`);
        } catch (e) {
          setError(err.message);
        }
      } else {
        setError(err.message || 'Failed to generate');
      }
    } finally {
      setLoading(false);
    }
  };

  const mockCriteria = [
    {
      criterion_name: "Concept Accuracy & Diagrams",
      weight: 50,
      excellent: "Drawings are exceptionally neat, highly detailed, fully labeled correctly, and represent tissue structures precisely under the microscope.",
      good: "Drawings represent tissue structures correctly with minor label spelling errors or a minor lack of neat details.",
      needs_improvement: "Drawings lack neat details, labels are missing for major tissues, or contain factual representation errors.",
      poor: "Lab drawing contains massive factual errors, represents entirely different tissue, or is incomplete/copied."
    },
    {
      criterion_name: "Data Analysis & Conclusion",
      weight: 50,
      excellent: "Explanations link microscopic observations to cell specialization principles flawlessly; includes high-fidelity reflective analysis.",
      good: "Explanations describe observations correctly but fail to link them to cell specialization principles thoroughly.",
      needs_improvement: "Descriptions are highly basic, repeats raw data without synthesizing conclusions or answering conceptual prompts.",
      poor: "Analysis section is missing, copied from peers, or fails to address basic lab experimental prompts."
    }
  ];

  const currentCriteria = result?.criteria || mockCriteria;
  const currentTitle = result?.assignment_title || "Tissue Lab Report Assignment";
  const currentScore = result?.total_score || totalScore;

  return (
    <MainLayout title="Rubric Generator">
      
      <div className="max-w-7xl mx-auto w-full px-0 sm:px-4 md:px-8">
        
        {/* Back Button & Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/teacher/ai-tools"
            className="flex items-center gap-2 text-primary font-semibold text-sm mb-6 hover:-translate-x-1 transition-transform w-max font-display"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to AI Tools
          </Link>
          <span className="bg-[#ffdcc6] text-[#311400] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 font-display">
            <span className="material-symbols-outlined text-sm">psychology</span>
            AI POWERED
          </span>
        </div>

        {/* Header Section */}
        <div className="mb-8 pl-3 md:pl-0">
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-on-surface mb-2">Rubric Generator</h2>
          <p className="text-on-surface-variant font-medium font-body text-sm sm:text-base">Create objective, comprehensive grading criteria matrixes for assignments.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Input Configuration Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Main Form Card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary">tune</span>
                Configuration
              </h3>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Subject</label>
                    <select
                      value={subject}
                      onChange={(e)=>setSubject(e.target.value)}
                      className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body w-full"
                    >
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Class</label>
                    <select
                      value={className}
                      onChange={(e)=>handleClassChange(e.target.value)}
                      className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body w-full"
                    >
                      <option value="9">9</option>
                      <option value="10">10</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Chapter Name</label>
                  <select
                    value={chapterName}
                    onChange={(e)=>setChapterName(e.target.value)}
                    className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body w-full"
                  >
                    {(MATHEMATICS_CHAPTERS[className] || []).map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Assignment Desc</label>
                    <input value={assignmentDesc} onChange={(e)=>setAssignmentDesc(e.target.value)} className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" placeholder="e.g., Lab report on onion peel cells" type="text" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Total Score</label>
                    <input value={totalScore} onChange={(e)=>setTotalScore(Number(e.target.value))} className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" type="number" min="10" max="100" />
                  </div>
                </div>
                
                {/* Advanced options */}
                <div className="pt-4 space-y-4 border-t border-outline-variant/15">
                  <h4 className="text-xs font-black text-primary uppercase font-display">Advanced Options</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-on-surface font-body">Distribute Score Uniformly</span>
                      <input defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4 outline-none cursor-pointer" type="checkbox" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  {error && <p className="text-sm text-red-600 mb-2 font-body">{error}</p>}
                </div>
                <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-md font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4 hover:scale-[0.98] transition-all outline-none border-none cursor-pointer disabled:opacity-60 font-display" type="button">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  {loading ? 'Generating...' : 'Generate Rubric'}
                </button>
              </form>
            </div>

            {/* AI Suggestion Panel */}
            <div className="bg-[#ffdcc6]/30 p-5 rounded-2xl border-l-4 border-[#924700]">
              <h4 className="text-sm font-bold text-[#924700] flex items-center gap-2 mb-2 font-display">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                Intelligent Tip
              </h4>
              <p className="text-sm text-[#723600] leading-relaxed font-body">
                Explicit evaluative rubrics clarify standards, decreasing grading discrepancies and student review requests by <span className="font-bold">50%</span>.
              </p>
            </div>

          </div>

          {/* Output & Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Preview Panel */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] border border-outline-variant/10">
              <div className="bg-surface-container-high p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary block">rule</span>
                  <span className="font-bold font-display text-on-surface">Rubric Preview</span>
                </div>
                <div className="flex gap-2">
                  <button className="bg-white/80 p-2 rounded-md hover:bg-white transition-colors border-none outline-none cursor-pointer shadow-sm flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm block">edit</span>
                  </button>
                  <button className="bg-white/80 p-2 rounded-md hover:bg-white transition-colors border-none outline-none cursor-pointer shadow-sm flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm block">fullscreen</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-neutral-50/50">
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* Rubric Matrix Title Card */}
                  <header className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10 text-center space-y-2">
                    <h1 className="text-2xl font-extrabold font-display text-on-surface leading-tight">{currentTitle}</h1>
                    <div className="flex justify-center gap-4 text-xs text-on-surface-variant flex-wrap font-display">
                      <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-low rounded-md"><span className="material-symbols-outlined text-sm">category</span> {subject}</span>
                      <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-low rounded-md"><span className="material-symbols-outlined text-sm">group</span> Class {className}</span>
                      <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md"><span className="material-symbols-outlined text-sm">military_tech</span> Max Score: {currentScore}</span>
                    </div>
                  </header>

                  {/* Matrix Table */}
                  <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-outline-variant/20">
                    <table className="w-full text-left border-collapse min-w-[800px] text-xs font-body text-on-surface-variant">
                      <thead>
                        <tr className="bg-slate-900 text-white font-display text-xs border-b border-slate-900">
                          <th className="px-4 py-4 font-bold min-w-[150px]">CRITERION & WEIGHT</th>
                          <th className="px-4 py-4 font-bold min-w-[150px] bg-emerald-950 text-emerald-300">EXCELLENT (100%-85%)</th>
                          <th className="px-4 py-4 font-bold min-w-[150px] bg-blue-950 text-blue-300">GOOD (84%-70%)</th>
                          <th className="px-4 py-4 font-bold min-w-[150px] bg-amber-950 text-amber-300">NEEDS WORK (69%-50%)</th>
                          <th className="px-4 py-4 font-bold min-w-[150px] bg-rose-950 text-rose-300">POOR (BELOW 50%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentCriteria.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-5 font-bold text-on-surface align-top space-y-2">
                              <p className="font-display text-sm">{c.criterion_name}</p>
                              <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold font-display uppercase tracking-tight">
                                Weight: {c.weight}%
                              </span>
                            </td>
                            <td className="px-4 py-5 align-top leading-relaxed text-slate-700 bg-emerald-50/20">{c.excellent}</td>
                            <td className="px-4 py-5 align-top leading-relaxed text-slate-700 bg-blue-50/20">{c.good}</td>
                            <td className="px-4 py-5 align-top leading-relaxed text-slate-700 bg-amber-50/20">{c.needs_improvement}</td>
                            <td className="px-4 py-5 align-top leading-relaxed text-slate-700 bg-rose-50/20">{c.poor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-md font-bold text-sm shadow-sm hover:opacity-90 transition-opacity border-none cursor-pointer outline-none w-full font-display">
                  <span className="material-symbols-outlined text-lg block" style={{fontVariationSettings: "'FILL' 1"}}>save</span>
                  Save Rubric
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-md font-bold text-sm transition-colors border-none cursor-pointer outline-none w-full font-display">
                  <span className="material-symbols-outlined text-lg block">download</span>
                  Export PDF
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-md font-bold text-sm transition-colors border-none cursor-pointer outline-none w-full font-display">
                  <span className="material-symbols-outlined text-lg block">share</span>
                  Share
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-[#6b38d4] hover:bg-[#8455ef] text-white rounded-md font-bold text-sm transition-colors shadow-sm border-none cursor-pointer outline-none w-full font-display">
                  <span className="material-symbols-outlined text-lg block">assignment_add</span>
                  Assign
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AIToolWorkspaceRubric;
