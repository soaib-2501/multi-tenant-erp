import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { generateLessonPlan, saveAIContent, getSavedAIContentById, updateSavedAIContent } from '../../services/api';
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

const AIToolWorkspaceLessonPlan = () => {
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

  const [lessonDuration, setLessonDuration] = useState('60');

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
        content_type: 'LessonPlan',
        data: result
      };

      if (currentSaveId) {
        await updateSavedAIContent(currentSaveId, payload);
        alert("LessonPlan updated successfully!");
      } else {
        const saved = await saveAIContent(payload);
        setCurrentSaveId(saved.id);
        alert("LessonPlan saved successfully!");
      }
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save LessonPlan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };


  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!className || !subject || !chapterName) {
        throw new Error('Please provide class_name, subject and chapter_name');
      }

      const payload = {
        class_name: String(className),
        subject: String(subject),
        chapter_name: String(chapterName),
      };
      const parsedDuration = Number(lessonDuration);
      if (lessonDuration && !isNaN(parsedDuration) && parsedDuration > 0) {
        payload.lesson_duration = parsedDuration;
      }
      const data = await generateLessonPlan(payload);
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

  const mockObjectives = [
    { objective: "Define the primary inputs (light, CO2, water) and outputs (glucose, oxygen) of photosynthesis." },
    { objective: "Explain how solar energy is absorbed by chlorophyll and converted into stable chemical energy (ATP/NADPH)." },
    { objective: "Contrast the basic cellular location and biochemical role of light-dependent vs light-independent reactions." }
  ];

  const mockActivities = [
    {
      activity_title: "The Light-Dependent Hook",
      duration: "10 mins",
      description: "Teacher displays active oxygen bubble release from an Elodea sprig under a desk lamp. Students record their visual observations. Teacher bridges observations to introduce the raw chemical reactants equation."
    },
    {
      activity_title: "Chlorophyll Energy Absorption",
      duration: "20 mins",
      description: "Detailed interactive diagram analysis showing how chlorophyll molecules inside the thylakoid membranes absorb specific solar wavelengths, split water molecules (photolysis), and release oxygen gas."
    },
    {
      activity_title: "Calvin Cycle Mapping",
      duration: "15 mins",
      description: "Students draw a conceptual map tracing how ATP and NADPH migrate from the thylakoid to the stroma to drive carbon dioxide fixation (light-independent reaction)."
    }
  ];

  const mockAssessments = [
    {
      assessment_type: "Exit Ticket",
      description: "AI-driven insight: Asking students to list the three primary inputs and two final outputs of photosynthesis on a card allows rapid formative grading on basic concepts before next week's cell respiration lecture."
    },
    {
      assessment_type: "Concept Mapping Review",
      description: "Evaluate active structural understanding of the chemical linkages between the stroma and the thylakoid membranes."
    }
  ];

  const currentTitle = result?.lesson_title || "Photosynthesis: The Light Reaction & Energy Conversion";
  const currentAlignment = result?.curriculum_alignment || "NGSS MS-LS1-6: Construct a scientific explanation based on evidence for the role of photosynthesis in the cycling of matter and flow of energy.";
  const currentObjectives = result?.learning_objectives || mockObjectives;
  const currentMaterials = result?.materials_needed || ["Green leaves under glass cover", "Elodea sprigs in water beaker", "Bromothymol Blue pH indicator solution", "Interactive photosynthesis concept maps"];
  const currentIntro = result?.introduction || "Start the lesson by asking the students a provocative hook: 'Do plants eat light?' Place a healthy plant next to a jar of water under a lamp. Explain that today, we will dissect the precise cellular engines that turn rays of light into sugary molecular fuel.";
  const currentActivities = result?.activities || mockActivities;
  const currentConclusion = result?.conclusion || "Gather the class for a brief recap. Ask one student to trace the path of a solar photon and another to explain what happens to the split water molecule. Emphasize that all carbon inside their own bodies was once floating as gaseous CO2, captured by plant chloroplasts.";
  const currentAssessments = result?.assessments || mockAssessments;

  return (
    <MainLayout title="Lesson Plan Generator">
      
      <div className="max-w-7xl mx-auto w-full px-0 sm:px-4 md:px-8">
        
        {/* Back Button & Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBackNavigation}
            className="flex items-center gap-2 text-primary font-semibold text-sm mb-6 hover:-translate-x-1 transition-transform w-max font-display outline-none border-none bg-transparent cursor-pointer p-0"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to AI Tools
          </button>
          <span className="bg-[#ffdcc6] text-[#311400] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 font-display">
            <span className="material-symbols-outlined text-sm">psychology</span>
            AI POWERED
          </span>
        </div>

        {/* Header Section */}
        <div className="mb-8 pl-3 md:pl-0">
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-on-surface mb-2">Lesson Plan Generator</h2>
          <p className="text-on-surface-variant font-medium font-body text-sm sm:text-base">Design comprehensive, curriculum-aligned lesson plans and assessments in seconds with AI-driven insights.</p>
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
                  <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Lesson Duration (mins)</label>
                  <input
                    value={lessonDuration}
                    type="number"
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="e.g., 60"
                    className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body"
                    min="15"
                    max="180"
                  />
                </div>
                
                <div className="pt-4 space-y-4 border-t border-outline-variant/15">
                  <h4 className="text-xs font-black text-primary uppercase font-display">Advanced Options</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-on-surface font-body">Map Next Generation Standards</span>
                      <input defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4 outline-none cursor-pointer" type="checkbox" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  {error && <p className="text-sm text-red-600 mb-2 font-body">{error}</p>}
                </div>
                <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-md font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4 hover:scale-[0.98] transition-all outline-none border-none cursor-pointer disabled:opacity-60 font-display" type="button">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  {loading ? 'Generating...' : 'Generate Lesson Plan'}
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
                Structuring active experiments as core lesson activities increases student retention by <span className="font-bold">35%</span> according to school assessment studies.
              </p>
            </div>

          </div>

          {/* Output & Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Preview Panel */}
            <div className={`bg-surface-container-lowest shadow-sm flex flex-col h-full border border-outline-variant/10 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none overflow-y-auto w-full' : 'rounded-2xl overflow-hidden min-h-[600px]'}`}>
              <div className="bg-surface-container-high p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary block">description</span>
                  <span className="font-bold font-display text-on-surface">Lesson Plan Preview</span>
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
              
              <div className="p-6 md:p-8 flex-1 overflow-y-auto" ref={previewRef}>
                <div className="max-w-2xl mx-auto space-y-8">
                  {loading ? (
                    <AIWorkspacePreviewSkeleton />
                  ) : isEditing && result ? (
                    <AIResultEditor data={result} onChange={(newData) => { setResult(newData); setIsDirty(true); }} />
                  ) : result ? (
                    <>
                      <header className="text-center pb-6 border-b border-outline-variant/15">
                        <h1 className="text-3xl font-extrabold font-display mb-3 text-on-surface tracking-tight leading-tight">{currentTitle}</h1>
                    <div className="flex justify-center gap-3 text-xs text-on-surface-variant flex-wrap font-display">
                      <span className="flex items-center gap-1 font-semibold px-2.5 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">category</span> {subject}</span>
                      <span className="flex items-center gap-1 font-semibold px-2.5 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">group</span> Class {className}</span>
                      <span className="flex items-center gap-1 font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-md"><span className="material-symbols-outlined text-sm">schedule</span> {lessonDuration || 60} mins</span>
                    </div>
                  </header>

                  {/* Curriculum Alignment */}
                  <section className="space-y-3">
                    <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">bookmark</span>
                      Curriculum Alignment
                    </h2>
                    <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-xl font-body leading-relaxed text-on-surface text-sm">
                      {currentAlignment}
                    </div>
                  </section>

                  {/* Learning Objectives */}
                  <section className="space-y-3">
                    <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">task_alt</span>
                      Learning Objectives
                    </h2>
                    <ul className="space-y-2.5 font-body pl-2 text-sm sm:text-base text-on-surface-variant list-none">
                      {currentObjectives.map((obj, oIdx) => (
                        <li key={oIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                          <span>{obj.objective}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Materials Needed */}
                  <section className="space-y-3">
                    <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">shopping_bag</span>
                      Materials Needed
                    </h2>
                    <div className="flex flex-wrap gap-2 pt-1 font-display">
                      {currentMaterials.map((mat, mIdx) => (
                        <span key={mIdx} className="bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Introduction Hook */}
                  <section className="space-y-3">
                    <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">waving_hand</span>
                      Introduction (The Hook)
                    </h2>
                    <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 border-l-4 border-primary p-5 rounded-r-2xl font-body leading-relaxed text-on-surface-variant text-sm sm:text-base shadow-sm">
                      {currentIntro}
                    </div>
                  </section>

                  {/* Detailed Timeline Activities */}
                  <section className="space-y-4">
                    <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">hourglass_empty</span>
                      Instructional Activities Timeline
                    </h2>
                    <div className="space-y-4 pt-1">
                      {currentActivities.map((act, aIdx) => (
                        <div key={aIdx} className="flex gap-4 items-start font-body">
                          <div className="bg-primary text-white text-xs font-bold font-display px-2 py-1.5 rounded-lg shadow-sm whitespace-nowrap min-w-[70px] text-center">
                            {act.duration}
                          </div>
                          <div className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm flex-1 space-y-1.5">
                            <h4 className="font-display font-bold text-sm text-on-surface">{act.activity_title}</h4>
                            <p className="text-on-surface-variant leading-relaxed text-xs sm:text-sm">{act.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Conclusion */}
                  <section className="space-y-3">
                    <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">door_open</span>
                      Conclusion (Wrap-Up)
                    </h2>
                    <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-xl font-body leading-relaxed text-on-surface-variant text-sm">
                      {currentConclusion}
                    </div>
                  </section>

                  {/* AI Driven Assessments */}
                  <section className="space-y-4 border-t border-outline-variant/10 pt-6">
                    <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">insights</span>
                      AI-Driven Assessments
                    </h2>
                    <div className="space-y-3 font-body pt-1">
                      {currentAssessments.map((as, asIdx) => (
                        <div key={asIdx} className="p-4 border-l-4 border-emerald-500 bg-emerald-50/20 rounded-r-lg space-y-1 shadow-sm">
                          <span className="text-2xs font-extrabold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded uppercase font-display tracking-wider">
                            {as.assessment_type}
                          </span>
                          <p className="text-on-surface-variant leading-relaxed text-xs sm:text-sm pt-1">{as.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  </>
                  ) : (
                    <>
                      <header className="text-center pb-6 border-b border-outline-variant/15">
                        <h1 className="text-3xl font-extrabold font-display mb-3 text-on-surface tracking-tight leading-tight">{currentTitle}</h1>
                        <div className="flex justify-center gap-3 text-xs text-on-surface-variant flex-wrap font-display">
                          <span className="flex items-center gap-1 font-semibold px-2.5 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">category</span> {subject}</span>
                          <span className="flex items-center gap-1 font-semibold px-2.5 py-1 bg-surface-container-high rounded-md"><span className="material-symbols-outlined text-sm">group</span> Class {className}</span>
                          <span className="flex items-center gap-1 font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-md"><span className="material-symbols-outlined text-sm">schedule</span> {lessonDuration || 60} mins</span>
                        </div>
                      </header>

                      {/* Curriculum Alignment */}
                      <section className="space-y-3">
                        <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">bookmark</span>
                          Curriculum Alignment
                        </h2>
                        <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-xl font-body leading-relaxed text-on-surface text-sm">
                          {currentAlignment}
                        </div>
                      </section>

                      {/* Learning Objectives */}
                      <section className="space-y-3">
                        <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">task_alt</span>
                          Learning Objectives
                        </h2>
                        <ul className="space-y-2.5 font-body pl-2 text-sm sm:text-base text-on-surface-variant list-none">
                          {currentObjectives.map((obj, oIdx) => (
                            <li key={oIdx} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                              <span>{obj.objective}</span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      {/* Materials Needed */}
                      <section className="space-y-3">
                        <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">shopping_bag</span>
                          Materials Needed
                        </h2>
                        <div className="flex flex-wrap gap-2 pt-1 font-display">
                          {currentMaterials.map((mat, mIdx) => (
                            <span key={mIdx} className="bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                              {mat}
                            </span>
                          ))}
                        </div>
                      </section>

                      {/* Introduction Hook */}
                      <section className="space-y-3">
                        <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">waving_hand</span>
                          Introduction (The Hook)
                        </h2>
                        <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 border-l-4 border-primary p-5 rounded-r-2xl font-body leading-relaxed text-on-surface-variant text-sm sm:text-base shadow-sm">
                          {currentIntro}
                        </div>
                      </section>

                      {/* Detailed Timeline Activities */}
                      <section className="space-y-4">
                        <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">hourglass_empty</span>
                          Instructional Activities Timeline
                        </h2>
                        <div className="space-y-4 pt-1">
                          {currentActivities.map((act, aIdx) => (
                            <div key={aIdx} className="flex gap-4 items-start font-body">
                              <div className="bg-primary text-white text-xs font-bold font-display px-2 py-1.5 rounded-lg shadow-sm whitespace-nowrap min-w-[70px] text-center">
                                {act.duration}
                              </div>
                              <div className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm flex-1 space-y-1.5">
                                <h4 className="font-display font-bold text-sm text-on-surface">{act.activity_title}</h4>
                                <p className="text-on-surface-variant leading-relaxed text-xs sm:text-sm">{act.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Conclusion */}
                      <section className="space-y-3">
                        <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">door_open</span>
                          Conclusion (Wrap-Up)
                        </h2>
                        <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-xl font-body leading-relaxed text-on-surface-variant text-sm">
                          {currentConclusion}
                        </div>
                      </section>

                      {/* AI Driven Assessments */}
                      <section className="space-y-4 border-t border-outline-variant/10 pt-6">
                        <h2 className="text-lg font-bold font-display text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined rounded-md bg-primary/10 p-1 text-primary text-sm">insights</span>
                          AI-Driven Assessments
                        </h2>
                        <div className="space-y-3 font-body pt-1">
                          {currentAssessments.map((as, asIdx) => (
                            <div key={asIdx} className="p-4 border-l-4 border-emerald-500 bg-emerald-50/20 rounded-r-lg space-y-1 shadow-sm">
                              <span className="text-2xs font-extrabold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded uppercase font-display tracking-wider">
                                {as.assessment_type}
                              </span>
                              <p className="text-on-surface-variant leading-relaxed text-xs sm:text-sm pt-1">{as.description}</p>
                            </div>
                          ))}
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
                    toolName="Lesson Plan" 
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

export default AIToolWorkspaceLessonPlan;
