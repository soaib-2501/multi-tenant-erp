import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { generateQuestionPaper } from '../../services/api';
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

const AIToolWorkspaceQuestionPaper = () => {
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

  const [totalMarks, setTotalMarks] = useState(50);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [visibleAnswers, setVisibleAnswers] = useState({});

  const toggleAnswer = (idx) => {
    setVisibleAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!className || !subject || !chapterName) { throw new Error('Please provide class_name, subject and chapter_name'); }

      const payload = { class_name: String(className), subject: String(subject), chapter_name: String(chapterName), total_marks: Number(totalMarks) };
      const data = await generateQuestionPaper(payload);
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

  return (
    <MainLayout title="Question Paper Generator">
      
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
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-on-surface mb-2">Question Paper Generator</h2>
          <p className="text-on-surface-variant font-medium font-body text-sm sm:text-base">Design official, structured term-end examination papers with automated mark weightings.</p>
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
                
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Total Marks</label>
                  <input value={totalMarks} type="number" onChange={(e)=>setTotalMarks(Number(e.target.value))} className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" min="1" max="100" />
                </div>
                
                {/* Advanced options */}
                <div className="pt-4 space-y-4 border-t border-outline-variant/15">
                  <h4 className="text-xs font-black text-primary uppercase font-display">Advanced Options</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-on-surface font-body">Include Candidate Sign Block</span>
                      <input defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4 outline-none cursor-pointer" type="checkbox" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  {error && <p className="text-sm text-red-600 mb-2 font-body">{error}</p>}
                </div>
                <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-md font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4 hover:scale-[0.98] transition-all outline-none border-none cursor-pointer disabled:opacity-60 font-display" type="button">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  {loading ? 'Generating...' : 'Generate Paper'}
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
                Official papers split questions into Sections by cognitive complexity (Recall, Application, Synthesis) to map standard national syllabus grading protocols.
              </p>
            </div>

          </div>

          {/* Output & Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Preview Panel */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] border border-outline-variant/10">
              <div className="bg-surface-container-high p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary block">history_edu</span>
                  <span className="font-bold font-display text-on-surface">Question Paper Preview</span>
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
                <div className="max-w-2xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 font-serif text-[#1e293b]">
                  {result ? (
                    <>
                      {/* Examination Paper Header */}
                      <div className="text-center pb-6 border-b-2 border-double border-slate-900 space-y-2">
                        <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-slate-950 leading-tight">{result.exam_title || 'Examination Paper'}</h1>
                        <h2 className="text-sm font-semibold tracking-wide text-slate-700">CLASS: {className} | SUBJECT: {subject}</h2>
                        
                        <div className="flex justify-between items-center text-xs font-semibold pt-4 text-slate-600">
                          <span>TIME ALLOWED: {result.duration || '2 Hours'}</span>
                          <span>TOTAL MARKS: {result.total_marks || totalMarks}</span>
                        </div>
                      </div>

                      {/* Candidate Registration fields */}
                      <div className="py-4 border-b border-slate-200 text-xs font-mono text-slate-500 flex justify-between flex-wrap gap-2">
                        <span>CANDIDATE NAME: .............................................................</span>
                        <span>ROLL NO: ....................</span>
                      </div>

                      {/* Sections iteration */}
                      <div className="space-y-8">
                        {result.sections?.map((sec, si) => (
                          <div key={si} className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-900 pb-1 pt-2">
                              <h3 className="font-bold text-base uppercase tracking-wide text-slate-900 font-display">{sec.section_name}</h3>
                              <span className="text-xs font-bold text-slate-700 font-display">[{sec.total_section_marks} Marks]</span>
                            </div>
                            
                            {sec.instructions && (
                              <p className="text-xs italic text-slate-600 mb-3 leading-relaxed font-body">Instructions: {sec.instructions}</p>
                            )}

                            <div className="space-y-6 font-body">
                              {sec.questions?.map((q, qi) => {
                                const keyId = `q_${si}_${qi}`;
                                return (
                                  <div key={qi} className="space-y-3">
                                    <div className="flex justify-between items-start gap-4 text-sm leading-relaxed text-slate-900">
                                      <p className="flex-1 font-medium">
                                        <span className="font-bold mr-2 text-slate-950">{qi + 1}.</span>
                                        {q.question_text}
                                      </p>
                                      <span className="font-bold text-slate-700 text-xs whitespace-nowrap">[{q.marks || 5} M]</span>
                                    </div>

                                    {/* Togglable Answer Keys */}
                                    <div className="flex flex-col gap-1.5 ml-5">
                                      <button 
                                        onClick={() => toggleAnswer(keyId)}
                                        className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline outline-none border-none cursor-pointer bg-transparent w-max self-start font-display"
                                      >
                                        <span className="material-symbols-outlined text-xs">
                                          {visibleAnswers[keyId] ? 'visibility_off' : 'visibility'}
                                        </span>
                                        {visibleAnswers[keyId] ? 'Hide Solution' : 'Reveal Answer Key'}
                                      </button>

                                      {visibleAnswers[keyId] && (
                                        <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/10 relative text-xs">
                                          <span className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] font-bold text-primary uppercase tracking-wider font-display">Answer Key & Grading Notes</span>
                                          <p className="text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">{q.answer_key}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Examination Paper Mock Header */}
                      <div className="text-center pb-6 border-b-2 border-double border-slate-900 space-y-2">
                        <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-slate-950 leading-tight">First Terminal Examination</h1>
                        <h2 className="text-sm font-semibold tracking-wide text-slate-700">CLASS: 10 | SUBJECT: MATHEMATICS</h2>
                        
                        <div className="flex justify-between items-center text-xs font-semibold pt-4 text-slate-600">
                          <span>TIME ALLOWED: 2 Hours</span>
                          <span>TOTAL MARKS: 50</span>
                        </div>
                      </div>

                      {/* Candidate Registration fields */}
                      <div className="py-4 border-b border-slate-200 text-xs font-mono text-slate-500 flex justify-between flex-wrap gap-2">
                        <span>CANDIDATE NAME: .............................................................</span>
                        <span>ROLL NO: ....................</span>
                      </div>

                      <div className="space-y-8">
                        {/* Section A */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-1 pt-2">
                            <h3 className="font-bold text-base uppercase tracking-wide text-slate-900 font-display">SECTION A: CONCEPTUAL & GEOMETRIC PROOFS</h3>
                            <span className="text-xs font-bold text-slate-700 font-display">[20 Marks]</span>
                          </div>
                          
                          <p className="text-xs italic text-slate-600 mb-3 leading-relaxed font-body">Instructions: All questions are compulsory. Draw clean neat figures where necessary.</p>

                          <div className="space-y-6 font-body">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-4 text-sm leading-relaxed text-slate-900">
                                <p className="flex-1 font-medium">
                                  <span className="font-bold mr-2 text-slate-950">1.</span>
                                  Prove that a tangent at any point of a circle is perpendicular to the radius through the point of contact.
                                </p>
                                <span className="font-bold text-slate-700 text-xs whitespace-nowrap">[10 M]</span>
                              </div>

                              <div className="flex flex-col gap-1.5 ml-5">
                                <button onClick={() => toggleAnswer('d_sa1')} className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline outline-none border-none cursor-pointer bg-transparent w-max self-start font-display">
                                  <span className="material-symbols-outlined text-xs">{visibleAnswers['d_sa1'] ? 'visibility_off' : 'visibility'}</span>
                                  {visibleAnswers['d_sa1'] ? 'Hide Solution' : 'Reveal Answer Key'}
                                </button>
                                {visibleAnswers['d_sa1'] && (
                                  <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/10 relative text-xs">
                                    <span className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] font-bold text-primary uppercase tracking-wider font-display">Answer Key & Grading Notes</span>
                                    <p className="text-slate-700 leading-relaxed font-sans">
                                      - **Given**: A circle with centre O and a tangent XY at point P.
                                      <br/>- **To Prove**: OP ⊥ XY
                                      <br/>- **Construction**: Take a point Q on XY, other than P and join OQ. Let OQ intersect circle at R.
                                      <br/>- **Proof**: Since Q is on tangent XY outside the circle, OQ &gt; OP (radius).
                                      <br/>This holds true for any point on the tangent XY other than P. OP is therefore the shortest distance from centre O to tangent XY. Hence, OP is perpendicular to XY.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-4 text-sm leading-relaxed text-slate-900">
                                <p className="flex-1 font-medium">
                                  <span className="font-bold mr-2 text-slate-950">2.</span>
                                  Prove that the lengths of tangents drawn from an external point to a circle are equal.
                                </p>
                                <span className="font-bold text-slate-700 text-xs whitespace-nowrap">[10 M]</span>
                              </div>

                              <div className="flex flex-col gap-1.5 ml-5">
                                <button onClick={() => toggleAnswer('d_sa2')} className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline outline-none border-none cursor-pointer bg-transparent w-max self-start font-display">
                                  <span className="material-symbols-outlined text-xs">{visibleAnswers['d_sa2'] ? 'visibility_off' : 'visibility'}</span>
                                  {visibleAnswers['d_sa2'] ? 'Hide Solution' : 'Reveal Answer Key'}
                                </button>
                                {visibleAnswers['d_sa2'] && (
                                  <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/10 relative text-xs">
                                    <span className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] font-bold text-primary uppercase tracking-wider font-display">Answer Key & Grading Notes</span>
                                    <p className="text-slate-700 leading-relaxed font-sans">
                                      - **Construction**: Draw a circle with centre O. Let P be an external point and PQ, PR be tangents. Join OP, OQ, OR.
                                      <br/>- **Triangles Comparison**: In right triangles OQP and ORP (since tangent perpendicular to radius):
                                      <br/>1. OQ = OR (Radii of same circle)
                                      <br/>2. OP = OP (Common side)
                                      <br/>3. ∠OQP = ∠ORP = 90°
                                      <br/>- **Congruence**: By RHS criteria, ΔOQP ≅ ΔORP.
                                      <br/>- **Conclusion**: By CPCT, PQ = PR. (Lengths of tangents are equal).
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-md font-bold text-sm shadow-sm hover:opacity-90 transition-opacity border-none cursor-pointer outline-none w-full font-display">
                  <span className="material-symbols-outlined text-lg block" style={{fontVariationSettings: "'FILL' 1"}}>save</span>
                  Save Paper
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-md font-bold text-sm transition-colors border-none cursor-pointer outline-none w-full font-display">
                  <span className="material-symbols-outlined text-lg block">download</span>
                  Print Paper
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

export default AIToolWorkspaceQuestionPaper;
