import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { generatePresentationOutline, saveAIContent, getSavedAIContentById, updateSavedAIContent } from '../../services/api';
import ToolActionButtons from '../../components/erp/global/ToolActionButtons';
import AIResultEditor from '../../components/erp/global/AIResultEditor';
import AIWorkspacePreviewSkeleton from '../../components/erp/global/AIWorkspacePreviewSkeleton';
import html2pdf from 'html2pdf.js';

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

const AIToolWorkspacePresentationOutline = () => {
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
  const [numSlides, setNumSlides] = useState(7);

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
        content_type: 'PresentationOutline',
        data: result
      };

      if (currentSaveId) {
        await updateSavedAIContent(currentSaveId, payload);
        alert("PresentationOutline updated successfully!");
      } else {
        const saved = await saveAIContent(payload);
        setCurrentSaveId(saved.id);
        alert("PresentationOutline saved successfully!");
      }
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save PresentationOutline. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };


  const [activeSlide, setActiveSlide] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const printRef = useRef(null);

  // Custom multi-page PDF export
  const handleExportPDF = async () => {
    if (!currentSlides || !printRef.current) return;
    setIsExportingPDF(true);

    const element = printRef.current;
    // Reveal hidden print container
    element.style.display = 'block';
    await new Promise(r => setTimeout(r, 80)); // let browser paint

    try {
      const filename = `Presentation_Outline_${new Date().getTime()}.pdf`;
      const opt = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename,
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF.');
    } finally {
      element.style.display = 'none';
      setIsExportingPDF(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setActiveSlide(0);
    try {
      if (!className || !subject || !chapterName || !topic) { throw new Error('Please provide class_name, subject, chapter_name and topic'); }

      const payload = { class_name: String(className), subject: String(subject), chapter_name: String(chapterName), topic: String(topic), num_slides: Number(numSlides) };
      const data = await generatePresentationOutline(payload);
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

  const nextSlide = (slidesLength) => {
    setActiveSlide(prev => (prev + 1) % slidesLength);
  };

  const prevSlide = (slidesLength) => {
    setActiveSlide(prev => (prev - 1 + slidesLength) % slidesLength);
  };

  const mockSlides = [
    {
      slide_number: 1,
      title: "Introduction to Mitosis",
      bullet_points: [
        "Process of cell division forming two genetically identical daughter cells.",
        "Essential for growth, tissue repair, and asexual reproduction.",
        "Occurs in somatic (body) cells rather than germ cells."
      ],
      speaker_notes: "Welcome class! Today we will learn about Mitosis - the cell's copying machine. Mitosis ensures that every new somatic cell receives an exact replica of the parental DNA. Remember, mitosis is for growth and healing; reproduction relies on meiosis."
    },
    {
      slide_number: 2,
      title: "Stages of Mitosis (PMAT)",
      bullet_points: [
        "Prophase: Chromatin condenses, spindle fibers form, nuclear envelope breaks down.",
        "Metaphase: Chromosomes align along the cell's equator (Metaphase plate).",
        "Anaphase: Sister chromatids separate and are pulled to opposite poles.",
        "Telophase: Nuclear envelopes reform, chromosomes decondense."
      ],
      speaker_notes: "To easily remember the sequence of stages, use the acronym PMAT: Prophase, Metaphase, Anaphase, and Telophase. For Metaphase, think of 'M' for 'Middle' - chromosomes line up in the middle. For Anaphase, think of 'A' for 'Away' - sister chromatids move away from each other."
    }
  ];

  const currentSlides = result?.slides || mockSlides;
  const currentTitle = result?.presentation_title || "Cell Division Presentation";
  const slide = currentSlides[activeSlide] || currentSlides[0];

  return (
    <MainLayout title="Presentation Outline Generator">
      
      <div className="max-w-7xl mx-auto w-full px-0 sm:px-4 md:px-8">
        
        {/* Back Button & Breadcrumb */}
        <div className="mb-4 md:mb-6 flex items-center justify-between px-3 sm:px-0">
          <button
            onClick={handleBackNavigation}
            className="flex items-center gap-1 md:gap-2 text-primary font-semibold text-3xs md:text-sm mb-4 md:mb-6 hover:-translate-x-1 transition-transform w-max font-display outline-none border-none bg-transparent cursor-pointer p-0"
          >
            <span className="material-symbols-outlined text-2xs md:text-sm">arrow_back</span>
            Back to AI Tools
          </button>
          <span className="bg-[#ffdcc6] text-[#311400] px-2 md:px-3 py-0.5 md:py-1 rounded-full text-3xs md:text-xs font-bold flex items-center gap-1 font-display">
            <span className="material-symbols-outlined text-2xs md:text-sm">psychology</span>
            AI POWERED
          </span>
        </div>

        {/* Header Section */}
        <div className="mb-5 md:mb-8 px-3 sm:px-0 md:pl-0">
          <h2 className="text-xl md:text-3xl font-extrabold font-display tracking-tight text-on-surface mb-1 md:mb-2">Presentation Outline</h2>
          <p className="text-on-surface-variant font-medium font-body text-2xs md:text-base">Develop a compelling, slide-by-slide educational presentation outline with speaker notes.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Input Configuration Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Main Form Card */}
            <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-outline-variant/10">
              <h3 className="text-base md:text-lg font-bold font-display mb-3 md:mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-lg md:text-xl">tune</span>
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
                    <input value={topic} onChange={(e)=>setTopic(e.target.value)} className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" placeholder="e.g., Mitosis" type="text" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display"># Slides</label>
                    <input value={numSlides} type="number" onChange={(e)=>setNumSlides(Number(e.target.value))} className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" min="2" max="20" />
                  </div>
                </div>
                
                {/* Advanced options */}
                <div className="pt-4 space-y-4 border-t border-outline-variant/15">
                  <h4 className="text-xs font-black text-primary uppercase font-display">Advanced Options</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-on-surface font-body">Generate Interactive Script</span>
                      <input defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4 outline-none cursor-pointer" type="checkbox" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  {error && <p className="text-sm text-red-600 mb-2 font-body">{error}</p>}
                </div>
                <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-md font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4 hover:scale-[0.98] transition-all outline-none border-none cursor-pointer disabled:opacity-60 font-display" type="button">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  {loading ? 'Generating...' : 'Generate Slides'}
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
                Widescreen outlines structure core concept transitions perfectly. Using slide speaker scripts reduces classroom presentation anxiety by <span className="font-bold">45%</span>.
              </p>
            </div>

          </div>

          {/* Output & Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Preview Panel */}
            <div className={`bg-surface-container-lowest shadow-sm flex flex-col h-full border border-outline-variant/10 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none overflow-y-auto w-full' : 'rounded-2xl overflow-hidden min-h-[600px]'}`}>
              <div className="bg-surface-container-high p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary block">slideshow</span>
                  <span className="font-bold font-display text-on-surface">Slide Deck Preview</span>
                </div>
                <div className="flex gap-2">
                  {result && (
                    <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-md transition-colors border-none outline-none cursor-pointer shadow-sm flex items-center ${isEditing ? 'bg-primary text-white' : 'bg-white/80 hover:bg-white text-on-surface-variant'}`}>
                      <span className={`material-symbols-outlined text-sm block ${isEditing ? 'text-white' : 'text-on-surface-variant'}`}>edit</span>
                    </button>
                  )}
                  <button onClick={() => setIsFullscreen(!isFullscreen)} className="bg-white/80 p-2 rounded-md hover:bg-white transition-colors border-none outline-none cursor-pointer shadow-sm flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm block">{isFullscreen ? 'close_fullscreen' : 'fullscreen'}</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-neutral-100 flex flex-col justify-between" ref={previewRef}>
                <div className="max-w-2xl mx-auto w-full space-y-6">
                  {loading ? (
                    <AIWorkspacePreviewSkeleton />
                  ) : isEditing && result ? (
                    <AIResultEditor data={result} onChange={(newData) => { setResult(newData); setIsDirty(true); }} />
                  ) : (
                    <>
                      {/* Widescreen 16:9 Slide Presentation Frame */}
                  <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10 select-none">
                    
                    {/* Canva styled abstract circle vectors */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary-container/20 rounded-full blur-2xl"></div>
                    
                    {/* Header */}
                    <div className="flex justify-between items-center text-2xs tracking-widest text-primary font-bold uppercase z-10 font-display border-b border-white/5 pb-2">
                      <span>{currentTitle}</span>
                      <span>Class {className} | {subject}</span>
                    </div>

                    {/* Mid content */}
                    <div className="my-auto z-10">
                      <h3 className="font-display font-extrabold text-xl sm:text-3xl text-left mb-4 tracking-wide bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent leading-snug">
                        {slide.title}
                      </h3>
                      <ul className="space-y-2.5 font-body text-xs sm:text-sm text-neutral-200 list-disc pl-5">
                        {slide.bullet_points?.map((bp, bpIdx) => (
                          <li key={bpIdx} className="leading-relaxed">{bp}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center text-2xs text-neutral-400 font-bold font-display z-10 pt-2 border-t border-white/5">
                      <span>THE INTELLECTUAL ARCHITECT</span>
                      <span className="px-2 py-0.5 bg-white/10 text-white rounded">SLIDE {slide.slide_number || activeSlide + 1} OF {currentSlides.length}</span>
                    </div>

                  </div>

                  {/* Carousel Controllers */}
                  <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl shadow-sm border border-outline-variant/10">
                    <button 
                      onClick={() => prevSlide(currentSlides.length)}
                      className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors border-none outline-none cursor-pointer text-primary"
                    >
                      <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </button>
                    
                    {/* Slide Dots Indicator */}
                    <div className="flex gap-2">
                      {currentSlides.map((_, dotIdx) => (
                        <button 
                          key={dotIdx} 
                          onClick={() => setActiveSlide(dotIdx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all border-none outline-none cursor-pointer ${activeSlide === dotIdx ? 'bg-primary w-6' : 'bg-outline-variant'}`}
                        />
                      ))}
                    </div>

                    <button 
                      onClick={() => nextSlide(currentSlides.length)}
                      className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors border-none outline-none cursor-pointer text-primary"
                    >
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>

                  {/* Dark Mode Presenter Speaker Notes Console */}
                  {showTranscript && (
                  <div className="bg-[#18181b] text-emerald-400 p-6 rounded-2xl font-mono text-xs sm:text-sm leading-relaxed border-l-4 border-emerald-500 shadow-inner relative select-text">
                    <span className="absolute top-3 right-4 bg-white/5 text-3xs px-2 py-0.5 rounded font-display font-bold text-neutral-400 uppercase tracking-widest">
                      Speaker Notes Script
                    </span>
                    <h4 className="font-display font-bold text-neutral-200 mb-2 border-b border-white/5 pb-1 uppercase tracking-wide text-xs">
                      Teleprompter (Slide {slide.slide_number || activeSlide + 1})
                    </h4>
                    <p className="whitespace-pre-wrap leading-relaxed">{slide.speaker_notes || "No presenter script compiled for this slide."}</p>
                  </div>
                  )}
                  </>
                  )}
                </div>
              </div>

              {/* NEW ACTION BAR COMPONENT */}
              {result && !loading && (
                <div className="px-6 pb-6 bg-surface-container-lowest">
                  {/* Transcript toggle */}
                  <div className="flex items-center gap-3 mb-3 pt-4">
                    <button
                      onClick={() => setShowTranscript(prev => !prev)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all outline-none cursor-pointer ${
                        showTranscript
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showTranscript ? 'mic' : 'mic_off'}
                      </span>
                      {showTranscript ? 'Transcript Visible' : 'Transcript Hidden'}
                    </button>
                    <span className="text-xs text-on-surface-variant font-body">
                      PDF will {showTranscript ? 'include' : 'exclude'} speaker notes
                    </span>
                  </div>
                  <ToolActionButtons 
                    onSave={handleSave}
                    isSaving={isSaving}
                    contentData={result} 
                    toolName="Presentation Outline" 
                    exportType="PDF" 
                    contentRef={previewRef}
                    onExport={handleExportPDF}
                  />
                </div>
              )}

              {/* Hidden Print Layout — All slides rendered linearly for PDF */}
              <div ref={printRef} style={{ display: 'none' }} className="bg-white p-6">
                <h1 style={{ fontFamily: 'sans-serif', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px', color: '#0f172a' }}>
                  {currentTitle}
                </h1>
                <p style={{ fontFamily: 'sans-serif', fontSize: '11px', color: '#64748b', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  Class {className} | {subject} &nbsp;&bull;&nbsp; {currentSlides.length} Slides
                </p>
                {currentSlides.map((s, idx) => (
                  <div key={idx} style={{ marginBottom: '28px', pageBreakInside: 'avoid', borderLeft: '4px solid #4f46e5', paddingLeft: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ background: '#4f46e5', color: 'white', borderRadius: '4px', padding: '2px 10px', fontSize: '10px', fontWeight: 'bold', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>
                        Slide {s.slide_number || idx + 1}
                      </span>
                      <h2 style={{ fontFamily: 'sans-serif', fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{s.title}</h2>
                    </div>
                    <ul style={{ paddingLeft: '20px', margin: '0 0 10px 0' }}>
                      {s.bullet_points?.map((bp, bpIdx) => (
                        <li key={bpIdx} style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#334155', marginBottom: '4px', lineHeight: '1.6' }}>{bp}</li>
                      ))}
                    </ul>
                    {showTranscript && s.speaker_notes && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', marginTop: '8px' }}>
                        <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#475569', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          🎤 {s.speaker_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AIToolWorkspacePresentationOutline;
