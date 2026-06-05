import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import { generateStudyNotes } from '../../services/api';
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!className || !subject || !chapterName || !topic) { throw new Error('Please provide class_name, subject, chapter_name and topic'); }

      const payload = { class_name: String(className), subject: String(subject), chapter_name: String(chapterName), topic: String(topic) };
      const data = await generateStudyNotes(payload);
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
    <MainLayout title="Study Notes Generator">
      
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
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-on-surface mb-2">Study Notes Generator</h2>
          <p className="text-on-surface-variant font-medium font-body text-sm sm:text-base">Synthesize complex lectures and chapters into elegant, summarized study notes.</p>
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
                  <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider font-display">Topic</label>
                  <input value={topic} onChange={(e)=>setTopic(e.target.value)} className="bg-surface-container-low border-none rounded-md py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none font-body" placeholder="e.g., Ohm's Law" type="text" />
                </div>
                
                {/* Advanced options */}
                <div className="pt-4 space-y-4 border-t border-outline-variant/15">
                  <h4 className="text-xs font-black text-primary uppercase font-display">Advanced Options</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-on-surface font-body">Highlight Key Vocabs</span>
                      <input defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4 outline-none cursor-pointer" type="checkbox" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  {error && <p className="text-sm text-red-600 mb-2 font-body">{error}</p>}
                </div>
                <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-md font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4 hover:scale-[0.98] transition-all outline-none border-none cursor-pointer disabled:opacity-60 font-display" type="button">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  {loading ? 'Generating...' : 'Generate Study Notes'}
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
                Bullet point summaries enhance visual processing and conceptual memory indices by <span className="font-bold">40%</span>. Great for quick exam revisions!
              </p>
            </div>

          </div>

          {/* Output & Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Preview Panel */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] border border-outline-variant/10">
              <div className="bg-surface-container-high p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary block">menu_book</span>
                  <span className="font-bold font-display text-on-surface">Study Notes Preview</span>
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

              {/* Action Bar */}
              <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-md font-bold text-sm shadow-sm hover:opacity-90 transition-opacity border-none cursor-pointer outline-none w-full font-display">
                  <span className="material-symbols-outlined text-lg block" style={{fontVariationSettings: "'FILL' 1"}}>save</span>
                  Save Notes
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

export default AIToolWorkspaceStudyNotes;
