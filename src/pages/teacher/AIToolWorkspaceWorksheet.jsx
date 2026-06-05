import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { generateWorksheet } from '../../services/api';
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

const AIToolWorkspaceWorksheet = () => {
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

  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);

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
      if (!className || !subject || !chapterName || !topic) { throw new Error('Please provide class_name, subject, chapter_name and topic'); }

      const payload = { class_name: String(className), subject: String(subject), chapter_name: String(chapterName), topic: String(topic), num_questions: Number(numQuestions) };
      const data = await generateWorksheet(payload);
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
    <MainLayout title="Worksheet Generator">
      
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
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-on-surface mb-2">Worksheet Generator</h2>
          <p className="text-on-surface-variant font-medium font-body text-sm sm:text-base">Generate topic-specific practice sheets with varying difficulty levels based on textbook content.</p>
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
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Topic</label>
                    <input value={topic} onChange={(e)=>setTopic(e.target.value)} className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" placeholder="e.g., Tangent" type="text" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Total Questions</label>
                    <input value={numQuestions} onChange={(e)=>setNumQuestions(Number(e.target.value))} className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" type="number" min="1" max="30" />
                  </div>
                </div>
                
                {/* Advanced options */}
                <div className="pt-4 space-y-4 border-t border-outline-variant/15">
                  <h4 className="text-xs font-black text-primary uppercase font-display">Advanced Options</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-on-surface font-body">Include Step-by-Step Solutions</span>
                      <input defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4 outline-none cursor-pointer" type="checkbox" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  {error && <p className="text-sm text-red-600 mb-2 font-body">{error}</p>}
                </div>
                <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-md font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4 hover:scale-[0.98] transition-all outline-none border-none cursor-pointer disabled:opacity-60 font-display" type="button">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  {loading ? 'Generating...' : 'Generate Worksheet'}
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
                Varying difficulty levels ensures better student differentiation. A standard high-retention worksheet contains <span className="font-bold">50% Medium</span>, <span className="font-bold">30% Easy</span>, and <span className="font-bold">20% Hard</span> questions.
              </p>
            </div>

          </div>

          {/* Output & Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Preview Panel */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] border border-outline-variant/10">
              <div className="bg-surface-container-high p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary block">description</span>
                  <span className="font-bold font-display text-on-surface">Worksheet Preview</span>
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
              
              <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8">
                  {result ? (
                    <>
                      <header className="text-center pb-6 border-b border-outline-variant/15">
                        <h1 className="text-3xl font-extrabold font-display mb-3 text-on-surface tracking-tight">{result.title || 'Practice Worksheet'}</h1>
                        <div className="flex justify-center gap-4 text-xs text-on-surface-variant flex-wrap font-display">
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">category</span> {subject}</span>
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">group</span> Class {className}</span>
                          {topic && <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">topic</span> Topic: {topic}</span>}
                        </div>
                      </header>

                      <div className="space-y-6">
                        {result.questions?.map((q, i) => {
                          const diff = (q.difficulty || 'medium').toLowerCase();
                          let badgeColor = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
                          if (diff === 'easy') {
                            badgeColor = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
                          } else if (diff === 'hard') {
                            badgeColor = 'bg-rose-500/10 text-rose-700 border-rose-500/20';
                          }

                          return (
                            <div key={i} className="p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
                              <div className="flex justify-between items-center gap-4 mb-3">
                                <span className="font-bold text-xs font-display text-primary bg-primary/5 px-2 py-0.5 rounded">Question {i + 1}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider font-display ${badgeColor}`}>{q.difficulty || 'Medium'}</span>
                              </div>
                              <p className="font-bold text-on-surface text-base sm:text-lg mb-4 font-body leading-relaxed">{q.question}</p>
                              
                              <div className="flex flex-col gap-2">
                                <button 
                                  onClick={() => toggleAnswer(i)}
                                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline outline-none border-none cursor-pointer bg-transparent w-max self-start font-display"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    {visibleAnswers[i] ? 'visibility_off' : 'visibility'}
                                  </span>
                                  {visibleAnswers[i] ? 'Hide Answer Key' : 'Reveal Answer Key'}
                                </button>

                                {visibleAnswers[i] && (
                                  <div className="mt-3 p-4 bg-primary/5 rounded-lg border border-primary/10 relative transition-all duration-200 font-body">
                                    <span className="absolute -top-2.5 left-4 bg-surface-container-lowest px-2 text-[10px] font-bold text-primary uppercase tracking-wider font-display">Answer Key & Explanation</span>
                                    <p className="text-on-surface-variant leading-relaxed text-sm mt-1 whitespace-pre-wrap">{q.answer_key}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <header className="text-center pb-6 border-b border-outline-variant/15">
                        <h1 className="text-3xl font-extrabold font-display mb-3 text-on-surface tracking-tight">Worksheet: Properties of Circles</h1>
                        <div className="flex justify-center gap-4 text-xs text-on-surface-variant flex-wrap font-display">
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">category</span> Mathematics</span>
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">group</span> Class 10</span>
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">topic</span> Topic: Tangent Properties</span>
                        </div>
                      </header>

                      <div className="space-y-6">
                        <div className="p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm relative">
                          <div className="flex justify-between items-center gap-4 mb-3">
                            <span className="font-bold text-xs font-display text-primary bg-primary/5 px-2 py-0.5 rounded">Question 1</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider font-display bg-amber-500/10 text-amber-700 border-amber-500/20">Medium</span>
                          </div>
                          <p className="font-bold text-on-surface text-base sm:text-lg mb-4 font-body leading-relaxed">
                            A tangent PQ at a point P of a circle of radius 5 cm meets a line through the centre O at a point Q so that OQ = 12 cm. Find the length PQ.
                          </p>
                          <div className="flex flex-col gap-2">
                            <button onClick={() => toggleAnswer('d1')} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline outline-none border-none cursor-pointer bg-transparent w-max self-start font-display">
                              <span className="material-symbols-outlined text-sm">{visibleAnswers['d1'] ? 'visibility_off' : 'visibility'}</span>
                              {visibleAnswers['d1'] ? 'Hide Answer Key' : 'Reveal Answer Key'}
                            </button>
                            {visibleAnswers['d1'] && (
                              <div className="mt-3 p-4 bg-primary/5 rounded-lg border border-primary/10 relative font-body">
                                <span className="absolute -top-2.5 left-4 bg-surface-container-lowest px-2 text-[10px] font-bold text-primary uppercase tracking-wider font-display">Answer Key & Explanation</span>
                                <p className="text-on-surface-variant leading-relaxed text-sm mt-1">
                                  Radius OP is perpendicular to tangent PQ at point of contact P. Thus, Triangle OPQ is a right-angled triangle.
                                  <br/>By Pythagoras theorem: OQ² = OP² + PQ²
                                  <br/>12² = 5² + PQ²
                                  <br/>144 = 25 + PQ²
                                  <br/>PQ² = 119 => PQ = √119 cm.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm relative">
                          <div className="flex justify-between items-center gap-4 mb-3">
                            <span className="font-bold text-xs font-display text-primary bg-primary/5 px-2 py-0.5 rounded">Question 2</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider font-display bg-rose-500/10 text-rose-700 border-rose-500/20">Hard</span>
                          </div>
                          <p className="font-bold text-on-surface text-base sm:text-lg mb-4 font-body leading-relaxed">
                            Prove that the tangents drawn at the ends of a diameter of a circle are parallel to each other.
                          </p>
                          <div className="flex flex-col gap-2">
                            <button onClick={() => toggleAnswer('d2')} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline outline-none border-none cursor-pointer bg-transparent w-max self-start font-display">
                              <span className="material-symbols-outlined text-sm">{visibleAnswers['d2'] ? 'visibility_off' : 'visibility'}</span>
                              {visibleAnswers['d2'] ? 'Hide Answer Key' : 'Reveal Answer Key'}
                            </button>
                            {visibleAnswers['d2'] && (
                              <div className="mt-3 p-4 bg-primary/5 rounded-lg border border-primary/10 relative font-body">
                                <span className="absolute -top-2.5 left-4 bg-surface-container-lowest px-2 text-[10px] font-bold text-primary uppercase tracking-wider font-display">Answer Key & Explanation</span>
                                <p className="text-on-surface-variant leading-relaxed text-sm mt-1">
                                  Let AB be a diameter of the circle with centre O. Let PQ and RS be tangents drawn at ends A and B respectively.
                                  <br/>Since radius is perpendicular to the tangent at point of contact:
                                  <br/>OA ⊥ PQ => ∠OAQ = 90°
                                  <br/>OB ⊥ RS => ∠OBS = 90°
                                  <br/>Notice that ∠OAQ and ∠OBS are alternate interior angles. Since ∠OAQ = ∠OBS = 90°, alternate interior angles are equal, meaning PQ is parallel to RS.
                                </p>
                              </div>
                            )}
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
                  Save Worksheet
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

export default AIToolWorkspaceWorksheet;
