import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { generatePresentationOutline } from '../../services/api';
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

  const [activeSlide, setActiveSlide] = useState(0);

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
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-on-surface mb-2">Presentation Outline</h2>
          <p className="text-on-surface-variant font-medium font-body text-sm sm:text-base">Develop a compelling, slide-by-slide educational presentation outline with speaker notes.</p>
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
            <div className="bg-[#ffdcc6]/30 p-5 rounded-2xl border-l-4 border-[#924700]">
              <h4 className="text-sm font-bold text-[#924700] flex items-center gap-2 mb-2 font-display">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                Intelligent Tip
              </h4>
              <p className="text-sm text-[#723600] leading-relaxed font-body">
                Widescreen outlines structure core concept transitions perfectly. Using slide speaker scripts reduces classroom presentation anxiety by <span className="font-bold">45%</span>.
              </p>
            </div>

          </div>

          {/* Output & Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Preview Panel */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] border border-outline-variant/10">
              <div className="bg-surface-container-high p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary block">slideshow</span>
                  <span className="font-bold font-display text-on-surface">Slide Deck Preview</span>
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
              
              <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-neutral-100 flex flex-col justify-between">
                <div className="max-w-2xl mx-auto w-full space-y-6">
                  
                  {/* Widescreen 16:9 Slide Presentation Frame */}
                  <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10 select-none">
                    
                    {/* Canva styled abstract circle vectors */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary-container/20 rounded-full blur-2xl"></div>
                    
                    {/* Header */}
                    <div className="flex justify-between items-center text-[10px] tracking-widest text-primary font-bold uppercase z-10 font-display border-b border-white/5 pb-2">
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
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold font-display z-10 pt-2 border-t border-white/5">
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
                  <div className="bg-[#18181b] text-emerald-400 p-6 rounded-2xl font-mono text-xs sm:text-sm leading-relaxed border-l-4 border-emerald-500 shadow-inner relative select-text">
                    <span className="absolute top-3 right-4 bg-white/5 text-[9px] px-2 py-0.5 rounded font-display font-bold text-neutral-400 uppercase tracking-widest">
                      Speaker Notes Script
                    </span>
                    <h4 className="font-display font-bold text-neutral-200 mb-2 border-b border-white/5 pb-1 uppercase tracking-wide text-xs">
                      Teleprompter (Slide {slide.slide_number || activeSlide + 1})
                    </h4>
                    <p className="whitespace-pre-wrap leading-relaxed">{slide.speaker_notes || "No presenter script compiled for this slide."}</p>
                  </div>

                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-md font-bold text-sm shadow-sm hover:opacity-90 transition-opacity border-none cursor-pointer outline-none w-full font-display">
                  <span className="material-symbols-outlined text-lg block" style={{fontVariationSettings: "'FILL' 1"}}>save</span>
                  Save Outline
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest text-primary rounded-md font-bold text-sm transition-colors border-none cursor-pointer outline-none w-full font-display">
                  <span className="material-symbols-outlined text-lg block">download</span>
                  Export PPTX
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

export default AIToolWorkspacePresentationOutline;
