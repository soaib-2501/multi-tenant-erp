import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { generateStudyNotes, saveAIContent, getSavedAIContentById, updateSavedAIContent } from '../../services/api';
import ToolActionButtons from '../../components/erp/global/ToolActionButtons';
import AIResultEditor from '../../components/erp/global/AIResultEditor';
import AIWorkspacePreviewSkeleton from '../../components/erp/global/AIWorkspacePreviewSkeleton';
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

const AIToolWorkspaceStudyNotes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const savedId = queryParams.get('id');

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [currentSaveId, setCurrentSaveId] = useState(savedId);

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

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const previewRef = useRef(null);

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
          console.error("Failed to load saved content:", err);
          setError("Failed to load saved content. It may have been deleted.");
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

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const payload = {
        class_name: className,
        subject: subject,
        content_type: 'StudyNotes',
        data: result
      };

      if (currentSaveId) {
        await updateSavedAIContent(currentSaveId, payload);
        alert("StudyNotes updated successfully!");
      } else {
        const saved = await saveAIContent(payload);
        setCurrentSaveId(saved.id);
        alert("StudyNotes saved successfully!");
      }
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save StudyNotes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };


  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!className || !subject || !chapterName || !topic) { throw new Error('Please provide class_name, subject, chapter_name and topic'); }

      const payload = { class_name: String(className), subject: String(subject), chapter_name: String(chapterName), topic: String(topic) };
      const data = await generateStudyNotes(payload);
      setResult(data);
      setIsDirty(true);
      setCurrentSaveId(null);
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
    <MainLayout title="Study Notes Generator">
      
      <div className="max-w-7xl mx-auto w-full px-0 sm:px-4 md:px-8">
        
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
          <h2 className="text-lg md:text-3xl font-extrabold font-display tracking-tight text-on-surface mb-1 md:mb-2">Study Notes Generator</h2>
          <p className="text-on-surface-variant font-medium font-body text-3xs md:text-base">Synthesize complex lectures and chapters into elegant, summarized study notes.</p>
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
                      onChange={(e)=>setSubject(e.target.value)}
                      className="bg-surface-container-low border-none rounded-md py-2 md:py-3 px-3 md:px-4 text-2xs md:text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body w-full"
                    >
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 md:gap-1.5">
                    <label className="text-3xs md:text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Class</label>
                    <select
                      value={className}
                      onChange={(e)=>handleClassChange(e.target.value)}
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
                    onChange={(e)=>setChapterName(e.target.value)}
                    className="bg-surface-container-low border-none rounded-md py-2 md:py-3 px-3 md:px-4 text-2xs md:text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body w-full"
                  >
                    {(MATHEMATICS_CHAPTERS[className] || []).map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1 md:gap-1.5 mb-3 md:mb-4">
                  <label className="text-3xs md:text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Topic</label>
                  <input value={topic} onChange={(e)=>setTopic(e.target.value)} className="bg-surface-container-low border-none rounded-md py-2 md:py-3 px-3 md:px-4 text-2xs md:text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" placeholder="e.g., Ohm's Law" type="text" />
                </div>
                
                {/* Advanced options */}
                <div className="pt-3 md:pt-4 space-y-3 md:space-y-4 border-t border-outline-variant/15">
                  <h4 className="text-3xs md:text-xs font-black text-primary uppercase font-display">Advanced Options</h4>
                  <div className="flex flex-col gap-2 md:gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs md:text-sm font-medium text-on-surface font-body">Highlight Key Vocabs</span>
                      <input defaultChecked className="rounded text-primary focus:ring-primary h-3 w-3 md:h-4 md:w-4 outline-none cursor-pointer" type="checkbox" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-1 md:mt-2">
                  {error && <p className="text-2xs md:text-sm text-red-600 mb-2 font-body">{error}</p>}
                </div>
                <button onClick={handleGenerate} disabled={loading} className="w-full py-3 md:py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-md font-bold text-sm md:text-lg shadow-lg flex items-center justify-center gap-2 mt-3 md:mt-4 hover:scale-[0.98] transition-all outline-none border-none cursor-pointer disabled:opacity-60 font-display" type="button">
                  <span className="material-symbols-outlined text-base md:text-xl">auto_awesome</span>
                  {loading ? 'Generating...' : 'Generate Study Notes'}
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
                Bullet point summaries enhance visual processing and conceptual memory indices by <span className="font-bold">40%</span>. Great for quick exam revisions!
              </p>
            </div>

          </div>

          {/* Output & Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-4 md:gap-6">
            
            {/* Preview Panel */}
            <div className={`bg-surface-container-lowest shadow-sm flex flex-col h-full border border-outline-variant/10 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none overflow-y-auto w-full' : 'rounded-xl md:rounded-2xl overflow-hidden min-h-[400px] md:min-h-[600px]'}`}>
              <div className="bg-surface-container-high p-3 md:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary block text-base md:text-xl">menu_book</span>
                  <span className="font-bold font-display text-on-surface text-sm md:text-base">Study Notes Preview</span>
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
                <div className="max-w-2xl mx-auto space-y-8">
                  {loading ? (
                    <AIWorkspacePreviewSkeleton />
                  ) : isEditing && result ? (
                    <AIResultEditor data={result} onChange={(newData) => { setResult(newData); setIsDirty(true); }} />
                  ) : result ? (
                    <>
                      <header className="text-center pb-6 border-b border-outline-variant/15">
                        <h1 className="text-3xl font-extrabold font-display mb-3 text-on-surface tracking-tight">Study Notes: {result.topic || 'Summary Guide'}</h1>
                        <div className="flex justify-center gap-4 text-xs text-on-surface-variant flex-wrap font-display">
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">category</span> {subject}</span>
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">group</span> Class {className}</span>
                        </div>
                      </header>

                      {/* Overview */}
                      {result.overview && (
                        <section className="space-y-3">
                          <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined">info</span>
                            Overview
                          </h2>
                          <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 border-l-4 border-primary p-5 rounded-r-2xl font-body leading-relaxed text-on-surface-variant shadow-sm text-sm sm:text-base">
                            {result.overview}
                          </div>
                        </section>
                      )}

                      {/* Sections */}
                      {result.sections && result.sections.length > 0 && (
                        <section className="space-y-6 pt-2">
                          {result.sections.map((sec, idx) => (
                            <div key={idx} className="space-y-3">
                              <h3 className="text-lg font-bold font-display text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                                <span className="material-symbols-outlined text-primary text-base">sticky_note_2</span>
                                {sec.heading}
                              </h3>
                              <ul className="space-y-2.5 font-body pl-2 text-sm sm:text-base text-on-surface-variant">
                                {sec.bullet_points?.map((bp, bidx) => (
                                  <li key={bidx} className="flex items-start gap-2.5 leading-relaxed">
                                    <span className="text-primary font-bold mt-0.5">→</span>
                                    <span>{bp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </section>
                      )}

                      {/* Key Terms */}
                      {result.key_terms && result.key_terms.length > 0 && (
                        <section className="space-y-4 pt-4 border-t border-outline-variant/15">
                          <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined">tag</span>
                            Key Terms & Vocabulary
                          </h2>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-display">
                            {result.key_terms.map((term, tIdx) => (
                              <div key={tIdx} className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-3 text-center text-xs font-semibold text-on-surface hover:scale-[1.02] transition-all cursor-default shadow-sm uppercase tracking-wider">
                                {term}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </>
                  ) : (
                    <>
                      <header className="text-center pb-6 border-b border-outline-variant/15">
                        <h1 className="text-3xl font-extrabold font-display mb-3 text-on-surface tracking-tight">Study Notes: Tangents of a Circle</h1>
                        <div className="flex justify-center gap-4 text-xs text-on-surface-variant flex-wrap font-display">
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">category</span> Mathematics</span>
                          <span className="flex items-center gap-1 font-semibold px-2 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">group</span> Class 10</span>
                        </div>
                      </header>

                      {/* Overview */}
                      <section className="space-y-3">
                        <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined">info</span>
                          Overview
                        </h2>
                        <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 border-l-4 border-primary p-5 rounded-r-2xl font-body leading-relaxed text-on-surface-variant shadow-sm text-sm sm:text-base">
                          A circle is a collection of all points in a plane which are at a constant distance from a fixed point. A line can intersect a circle in two points (secant), touch it in exactly one point (tangent), or not intersect at all. This study guide focuses on the characteristics and properties of tangents.
                        </div>
                      </section>

                      {/* Sections */}
                      <section className="space-y-6 pt-2">
                        <div className="space-y-3">
                          <h3 className="text-lg font-bold font-display text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                            <span className="material-symbols-outlined text-primary text-base">sticky_note_2</span>
                            Basic Properties of Tangents
                          </h3>
                          <ul className="space-y-2.5 font-body pl-2 text-sm sm:text-base text-on-surface-variant">
                            <li className="flex items-start gap-2.5 leading-relaxed">
                              <span className="text-primary font-bold mt-0.5">→</span>
                              <span>A tangent to a circle touches the circle in exactly one point. This point is called the point of contact.</span>
                            </li>
                            <li className="flex items-start gap-2.5 leading-relaxed">
                              <span className="text-primary font-bold mt-0.5">→</span>
                              <span>There can only be one unique tangent line at any given point on the circumference of a circle.</span>
                            </li>
                            <li className="flex items-start gap-2.5 leading-relaxed">
                              <span className="text-primary font-bold mt-0.5">→</span>
                              <span>The tangent at any point of a circle is perpendicular to the radius through the point of contact (Theorem 10.1).</span>
                            </li>
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-lg font-bold font-display text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                            <span className="material-symbols-outlined text-primary text-base">sticky_note_2</span>
                            Tangents from an External Point
                          </h3>
                          <ul className="space-y-2.5 font-body pl-2 text-sm sm:text-base text-on-surface-variant">
                            <li className="flex items-start gap-2.5 leading-relaxed">
                              <span className="text-primary font-bold mt-0.5">→</span>
                              <span>The lengths of tangents drawn from an external point to a circle are equal (Theorem 10.2).</span>
                            </li>
                            <li className="flex items-start gap-2.5 leading-relaxed">
                              <span className="text-primary font-bold mt-0.5">→</span>
                              <span>Tangents drawn from an external point subtend equal angles at the centre of the circle.</span>
                            </li>
                            <li className="flex items-start gap-2.5 leading-relaxed">
                              <span className="text-primary font-bold mt-0.5">→</span>
                              <span>They are equally inclined to the line segment joining the centre to that external point.</span>
                            </li>
                          </ul>
                        </div>
                      </section>

                      {/* Key Terms */}
                      <section className="space-y-4 pt-4 border-t border-outline-variant/15">
                        <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined">tag</span>
                          Key Terms & Vocabulary
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-display">
                          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-3 text-center text-xs font-semibold text-on-surface shadow-sm uppercase tracking-wider">Tangent</div>
                          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-3 text-center text-xs font-semibold text-on-surface shadow-sm uppercase tracking-wider">Secant</div>
                          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-3 text-center text-xs font-semibold text-on-surface shadow-sm uppercase tracking-wider">Point of Contact</div>
                        </div>
                      </section>
                    </>
                  )}
                </div>
              </div>

              {/* NEW ACTION BAR COMPONENT */}
              {result && !loading && (
                <div className="px-6 pb-6 bg-surface-container-lowest">
                  <ToolActionButtons 
                    onSave={handleSave}
                    isSaving={isSaving}
                    contentData={result} 
                    toolName="Study Notes" 
                    exportType="PDF" 
                    contentRef={previewRef}
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

export default AIToolWorkspaceStudyNotes;
