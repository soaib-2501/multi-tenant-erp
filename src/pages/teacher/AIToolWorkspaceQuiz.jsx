import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { generateQuiz, saveAIContent, getSavedAIContentById, updateSavedAIContent } from '../../services/api';
import ToolActionButtons from '../../components/erp/global/ToolActionButtons';
import AIResultEditor from '../../components/erp/global/AIResultEditor';
import AIWorkspacePreviewSkeleton from '../../components/erp/global/AIWorkspacePreviewSkeleton';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

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

const AIToolWorkspaceQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const savedId = queryParams.get('id');

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
  const [numMCQs, setNumMCQs] = useState(5);
  const [numShortAnswers, setNumShortAnswers] = useState(3);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const previewRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [currentSaveId, setCurrentSaveId] = useState(savedId);

  // Load saved content if ID exists
  useEffect(() => {
    if (savedId) {
      setLoading(true);
      getSavedAIContentById(savedId)
        .then(data => {
          setResult(data.data);
          setSubject(data.subject || 'Mathematics');
          setClassName(data.class_name || '10');
          setIsDirty(false);
        })
        .catch(err => {
          console.error("Failed to load saved quiz:", err);
          setError("Failed to load saved quiz. It may have been deleted.");
        })
        .finally(() => setLoading(false));
    }
  }, [savedId]);

  // Handle BeforeUnload for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBackNavigation = (e) => {
    e.preventDefault();
    if (isDirty) {
      const confirmExit = window.confirm("You have unsaved changes. Do you want to exit without saving?");
      if (!confirmExit) return;
    }
    navigate('/teacher/ai-tools');
  };

  const toggleAnswer = (idx) => {
    setVisibleAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Called by ToolActionButtons before PDF export — reveals/hides ALL answers (MCQs + short answers)
  const setAllAnswersVisible = async (isVisible) => {
    if (!result) return;
    const newVisible = {};
    if (isVisible) {
      if (result.mcqs) {
        result.mcqs.forEach((_, i) => { newVisible[`mcq_${i}`] = true; });
      }
      if (result.short_answers) {
        result.short_answers.forEach((_, i) => { newVisible[i] = true; });
      }
    }
    setVisibleAnswers(newVisible);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!className || !subject || !chapterName || !topic) {
        throw new Error('Please provide class_name, subject, chapter_name and topic');
      }
      const payload = {
        class_name: String(className),
        subject: String(subject),
        chapter_name: String(chapterName),
        topic: String(topic),
        num_mcqs: Number(numMCQs),
        num_short_answers: Number(numShortAnswers)
      };
      const data = await generateQuiz(payload);
      setResult(data);
      setIsDirty(true);
      setCurrentSaveId(null);
    } catch (err) {
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

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const payload = {
        class_name: className,
        subject: subject,
        content_type: 'Quiz',
        data: result
      };
      if (currentSaveId) {
        await updateSavedAIContent(currentSaveId, payload);
        alert("Quiz updated successfully!");
      } else {
        const saved = await saveAIContent(payload);
        setCurrentSaveId(saved.id);
        alert("Quiz saved successfully!");
      }
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save quiz. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout title="Quiz Generator">
      
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-8">
        
        {/* Back Button & Breadcrumb */}
        <div className="mb-3 md:mb-6 flex items-center justify-between px-3 sm:px-0">
          <button
            onClick={handleBackNavigation}
            className="flex items-center gap-1 md:gap-2 text-primary font-semibold text-3xs md:text-sm mb-3 md:mb-6 hover:-translate-x-1 transition-transform w-max font-display outline-none border-none bg-transparent cursor-pointer p-0"
          >
            <span className="material-symbols-outlined text-xs md:text-sm">arrow_back</span>
            Back to AI Tools
          </button>
          <span className="bg-[#ffdcc6] text-[#311400] px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-3xs md:text-xs font-bold flex items-center gap-0.5 md:gap-1 font-display">
            <span className="material-symbols-outlined text-2xs md:text-sm">psychology</span>
            AI POWERED
          </span>
        </div>

        {/* Header Section */}
        <div className="mb-4 md:mb-8 px-3 sm:px-0">
          <h2 className="text-lg md:text-3xl font-extrabold font-display tracking-tight text-on-surface mb-1 md:mb-2">Quiz Generator</h2>
          <p className="text-on-surface-variant font-medium font-body text-3xs md:text-base">Generate instant, curriculum-aligned Multiple Choice and Short Answer Quizzes.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
          
          {/* Input Configuration Column */}
          <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
            
            {/* Main Form Card */}
            <div className="bg-surface-container-lowest p-3 md:p-6 rounded-lg md:rounded-2xl shadow-sm border border-outline-variant/10">
              <h3 className="text-sm md:text-lg font-bold font-display mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-sm md:text-xl">tune</span>
                Configuration
              </h3>
              <form className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="flex flex-col gap-1 md:gap-1.5">
                    <label className="text-3xs md:text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-surface-container-low border-none rounded-md py-2 md:py-3 px-3 md:px-4 text-2xs md:text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body w-full"
                    >
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 md:gap-1.5">
                    <label className="text-3xs md:text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Class</label>
                    <select
                      value={className}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="bg-surface-container-low border-none rounded-md py-2 md:py-3 px-3 md:px-4 text-2xs md:text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body w-full"
                    >
                      <option value="9">9</option>
                      <option value="10">10</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1 md:gap-1.5">
                  <label className="text-3xs md:text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Chapter Name</label>
                  <select
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    className="bg-surface-container-low border-none rounded-md py-2 md:py-3 px-3 md:px-4 text-2xs md:text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body w-full"
                  >
                    {(MATHEMATICS_CHAPTERS[className] || []).map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="flex flex-col gap-1 md:gap-1.5 col-span-1">
                    <label className="text-3xs md:text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Topic</label>
                    <input value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-surface-container-low border-none rounded-md py-2 md:py-3 px-3 md:px-4 text-2xs md:text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" placeholder="e.g., Cell organelles" type="text" />
                  </div>
                  <div className="flex flex-col gap-1 md:gap-1.5">
                    <label className="text-3xs md:text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display"># MCQs</label>
                    <input value={numMCQs} type="number" onChange={(e) => setNumMCQs(Number(e.target.value))} className="bg-surface-container-low border-none rounded-md py-2 md:py-3 px-3 md:px-4 text-2xs md:text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" min="0" max="30" />
                  </div>
                  <div className="flex flex-col gap-1 md:gap-1.5">
                    <label className="text-3xs md:text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display"># Short Ans</label>
                    <input value={numShortAnswers} type="number" onChange={(e) => setNumShortAnswers(Number(e.target.value))} className="bg-surface-container-low border-none rounded-md py-2 md:py-3 px-3 md:px-4 text-2xs md:text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" min="0" max="30" />
                  </div>
                </div>
                
                {/* Advanced options */}
                <div className="pt-3 md:pt-4 space-y-3 md:space-y-4 border-t border-outline-variant/15">
                  <h4 className="text-3xs md:text-xs font-black text-primary uppercase font-display">Advanced Options</h4>
                  <div className="flex flex-col gap-2 md:gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs md:text-sm font-medium text-on-surface font-body">Include Grading Explanations</span>
                      <input defaultChecked className="rounded text-primary focus:ring-primary h-3 w-3 md:h-4 md:w-4 outline-none cursor-pointer" type="checkbox" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-1 md:mt-2">
                  {error && <p className="text-2xs md:text-sm text-red-600 mb-2 font-body">{error}</p>}
                </div>
                <button onClick={handleGenerate} disabled={loading} className="w-full py-3 md:py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-md font-bold text-sm md:text-lg shadow-lg flex items-center justify-center gap-2 mt-3 md:mt-4 hover:scale-[0.98] transition-all outline-none border-none cursor-pointer disabled:opacity-60 font-display" type="button">
                  <span className="material-symbols-outlined text-base md:text-xl">auto_awesome</span>
                  {loading ? 'Generating...' : 'Generate Quiz'}
                </button>
              </form>
            </div>

            {/* AI Suggestion Panel */}
            <div className="bg-[#ffdcc6]/30 p-3 md:p-5 rounded-lg md:rounded-2xl border-l-4 border-[#924700]">
              <h4 className="text-3xs md:text-sm font-bold text-[#924700] flex items-center gap-1 md:gap-2 mb-1 md:mb-2 font-display">
                <span className="material-symbols-outlined text-2xs md:text-sm">lightbulb</span>
                Intelligent Tip
              </h4>
              <p className="text-3xs md:text-sm text-[#723600] leading-relaxed font-body">
                For Science subjects like <span className="font-bold text-[#924700]">Biology</span>, combining MCQs with conceptual short answers improves analytical assessment metrics by <span className="font-bold">32%</span>.
              </p>
            </div>

          </div>

          {/* Output & Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-4 md:gap-6">
            
            {/* Preview Panel */}
            <div className={`bg-surface-container-lowest shadow-sm flex flex-col h-full border border-outline-variant/10 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none overflow-y-auto w-full' : 'rounded-xl md:rounded-2xl overflow-hidden min-h-[400px] md:min-h-[600px]'}`}>
              <div className="bg-surface-container-high p-3 md:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary block text-base md:text-xl">quiz</span>
                  <span className="font-bold font-display text-on-surface text-sm md:text-base">Quiz Preview</span>
                </div>
                <div className="flex gap-1.5 md:gap-2">
                  {result && (
                    <button onClick={() => setIsEditing(!isEditing)} className={`p-1.5 md:p-2 rounded-md transition-colors border-none outline-none cursor-pointer shadow-sm flex items-center ${isEditing ? 'bg-primary text-white' : 'bg-white/80 hover:bg-white text-on-surface-variant'}`}>
                      <span className={`material-symbols-outlined text-xs md:text-sm block ${isEditing ? 'text-white' : 'text-on-surface-variant'}`}>edit</span>
                    </button>
                  )}
                  <button onClick={() => setIsFullscreen(!isFullscreen)} className="bg-white/80 p-1.5 md:p-2 rounded-md hover:bg-white transition-colors border-none outline-none cursor-pointer shadow-sm flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-xs md:text-sm block">{isFullscreen ? 'close_fullscreen' : 'fullscreen'}</span>
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-8 flex-1 overflow-y-auto" ref={previewRef}>
                <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
                  {loading ? (
                    <AIWorkspacePreviewSkeleton />
                  ) : isEditing && result ? (
                    <AIResultEditor data={result} onChange={(newData) => { setResult(newData); setIsDirty(true); }} />
                  ) : result ? (
                    <>
                      <header className="text-center pb-4 md:pb-6 border-b border-outline-variant/15">
                        <h1 className="text-xl md:text-3xl font-extrabold font-display mb-2 md:mb-3 text-on-surface tracking-tight">{result.title || 'Topic Quiz'}</h1>
                        <div className="flex justify-center gap-2 md:gap-4 text-3xs md:text-xs text-on-surface-variant flex-wrap font-display">
                          <span className="flex items-center gap-1 font-semibold px-2 py-0.5 md:py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-xs md:text-sm">category</span> {subject}</span>
                          <span className="flex items-center gap-1 font-semibold px-2 py-0.5 md:py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-xs md:text-sm">group</span> Class {className}</span>
                          {topic && <span className="flex items-center gap-1 font-semibold px-2 py-0.5 md:py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-xs md:text-sm">topic</span> Topic: {topic}</span>}
                        </div>
                      </header>

                      {result.mcqs && result.mcqs.length > 0 && (
                        <section className="space-y-6">
                          <h2 className="text-xl font-bold font-display text-primary flex items-center gap-2 pt-4 border-t border-outline-variant/15">
                            <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">fact_check</span>
                            Multiple Choice Questions
                          </h2>
                          <div className="space-y-4">
                            {result.mcqs.map((m, i) => {
                              const mcqKey = `mcq_${i}`;
                              const isAnswerVisible = !!visibleAnswers[mcqKey];
                              return (
                                <div key={i} className="p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                  <div className="font-bold text-on-surface text-base sm:text-lg mb-4 font-body leading-relaxed flex gap-2">
                                    <span className="text-primary shrink-0">{i + 1}.</span>
                                    <div className="prose prose-sm max-w-none">
                                      <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{m.question}</ReactMarkdown>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-0 sm:ml-6 font-body">
                                    {m.options?.map((opt, oi) => {
                                      const isCorrect = opt === m.correct_answer;
                                      const showCorrect = isAnswerVisible && isCorrect;
                                      return (
                                        <div
                                          key={oi}
                                          className={`flex items-start gap-2 p-3 rounded-xl border text-sm transition-all ${
                                            showCorrect
                                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                                              : 'bg-surface-container-low text-on-surface-variant border-transparent'
                                          }`}
                                        >
                                          <span className={`font-semibold mr-1 text-xs px-1.5 py-0.5 rounded shrink-0 ${showCorrect ? 'bg-emerald-200 text-emerald-950' : 'bg-surface-container-high'}`}>
                                            {String.fromCharCode(65 + oi)}
                                          </span>
                                          <span className="flex-1">{opt}</span>
                                          {showCorrect && (
                                            <span className="material-symbols-outlined text-emerald-600 text-base self-center">check_circle</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="mt-3">
                                    <button
                                      onClick={() => toggleAnswer(mcqKey)}
                                      className="flex items-center gap-1 text-xs font-bold text-primary hover:underline outline-none border-none cursor-pointer bg-transparent w-max font-display"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        {isAnswerVisible ? 'visibility_off' : 'visibility'}
                                      </span>
                                      {isAnswerVisible ? 'Hide Answer' : 'Reveal Answer'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}

                      {result.short_answers && result.short_answers.length > 0 && (
                        <section className="space-y-6">
                          <h2 className="text-xl font-bold font-display text-primary flex items-center gap-2 pt-4 border-t border-outline-variant/15">
                            <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">edit_note</span>
                            Short Answer Questions
                          </h2>
                          <div className="space-y-4">
                            {result.short_answers.map((s, i) => (
                              <div key={i} className="p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="font-bold text-on-surface text-base sm:text-lg mb-3 font-body leading-relaxed flex gap-2">
                                  <span className="text-primary shrink-0">{i + 1}.</span>
                                  <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{s.question}</ReactMarkdown>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 mt-4">
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
                                    <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/10 relative font-body transition-all">
                                      <span className="absolute -top-2.5 left-4 bg-surface-container-lowest px-2 text-2xs font-bold text-primary uppercase tracking-wider font-display">Ideal Answer Key</span>
                                      <div className="text-on-surface-variant leading-relaxed text-sm mt-1 prose prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{s.answer_key}</ReactMarkdown>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </>
                  ) : (
                    <>
                      <header className="text-center pb-6 border-b border-outline-variant/15">
                        <h1 className="text-3xl font-extrabold font-display mb-3 text-on-surface tracking-tight">Quiz: Cell - Structure and Functions</h1>
                        <div className="flex justify-center gap-4 text-xs text-on-surface-variant flex-wrap font-display">
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">category</span> Biology</span>
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">group</span> Class 9</span>
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">topic</span> Topic: Cell Organelles</span>
                        </div>
                      </header>

                      <section className="space-y-6">
                        <h2 className="text-xl font-bold font-display text-primary flex items-center gap-2 pt-4">
                          <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">fact_check</span>
                          Multiple Choice Questions
                        </h2>
                        
                        <div className="space-y-4">
                          <div className="p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm">
                            <p className="font-bold text-on-surface text-base sm:text-lg mb-4 font-body leading-relaxed">
                              <span className="mr-2 text-primary">1.</span>Which of the following cellular organelles is known as the "powerhouse of the cell"?
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:ml-6 font-body">
                              {['Nucleus','Ribosome','Mitochondria','Lysosome'].map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2 p-3 rounded-xl border text-sm bg-surface-container-low text-on-surface-variant border-transparent">
                                  <span className="font-semibold mr-1 text-xs px-1.5 py-0.5 rounded bg-surface-container-high">{String.fromCharCode(65+oi)}</span>
                                  <span className="flex-1">{opt}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3">
                              <button onClick={() => toggleAnswer('d_mcq1')} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline outline-none border-none cursor-pointer bg-transparent w-max font-display">
                                <span className="material-symbols-outlined text-sm">{visibleAnswers['d_mcq1'] ? 'visibility_off' : 'visibility'}</span>
                                {visibleAnswers['d_mcq1'] ? 'Hide Answer' : 'Reveal Answer'}
                              </button>
                              {visibleAnswers['d_mcq1'] && <p className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">✓ Correct Answer: C - Mitochondria</p>}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h2 className="text-xl font-bold font-display text-primary flex items-center gap-2 pt-4 border-t border-outline-variant/15">
                          <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">edit_note</span>
                          Short Answer Questions
                        </h2>
                        <div className="space-y-4">
                          <div className="p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm">
                            <p className="font-bold text-on-surface text-base sm:text-lg mb-3 font-body leading-relaxed">
                              <span className="mr-2 text-primary">1.</span>Explain the structural and functional difference between the cell wall and the cell membrane.
                            </p>
                            <div className="flex flex-col gap-2 mt-4">
                              <button onClick={() => toggleAnswer('d_sa1')} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline outline-none border-none cursor-pointer bg-transparent w-max self-start font-display">
                                <span className="material-symbols-outlined text-sm">{visibleAnswers['d_sa1'] ? 'visibility_off' : 'visibility'}</span>
                                {visibleAnswers['d_sa1'] ? 'Hide Answer Key' : 'Reveal Answer Key'}
                              </button>
                              {visibleAnswers['d_sa1'] && (
                                <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/10 relative font-body transition-all">
                                  <span className="absolute -top-2.5 left-4 bg-surface-container-lowest px-2 text-2xs font-bold text-primary uppercase tracking-wider font-display">Ideal Answer Key</span>
                                  <p className="text-on-surface-variant leading-relaxed text-sm mt-1">
                                    The cell wall is a rigid, outer layer found only in plants, fungi, and bacteria. The cell membrane is a flexible, semi-permeable bilayer found in all cells.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </section>
                    </>
                  )}

                </div>
              </div>

              {/* Action Bar */}
              {result && !loading && (
                <div className="px-6 pb-6 bg-surface-container-lowest">
                  <ToolActionButtons 
                    contentData={result} 
                    toolName="Quiz" 
                    exportType="PDF" 
                    contentRef={previewRef}
                    onSave={handleSave}
                    isSaving={isSaving}
                    requiresAnswerPrompt={true}
                    onToggleAnswers={setAllAnswersVisible}
                  />
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AIToolWorkspaceQuiz;
