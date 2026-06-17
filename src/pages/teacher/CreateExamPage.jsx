import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";


const CreateExamPage = () => {
  return (
    <MainLayout title="Create Exam">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section 1: Basic Information Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Core Form */}
          <Card className="md:col-span-2 p-8 shadow-sm">
            <h2 className="text-xl font-bold font-display mb-6 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Exam Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Exam Title</label>
                <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all outline-none" placeholder="e.g. Mid-Term Semester Examination 2024" type="text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Class</label>
                <select className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/40 outline-none">
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Section</label>
                <select className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/40 outline-none">
                  <option>Section A</option>
                  <option>Section B</option>
                  <option>Section C</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Subject</label>
                <select className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/40 outline-none">
                  <option>Advanced Mathematics</option>
                  <option>Quantum Physics</option>
                  <option>Organic Chemistry</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Exam Instructions</label>
                <textarea className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all outline-none resize-none" placeholder="Mention rules regarding calculators, rough sheets, etc." rows="4"></textarea>
              </div>
            </div>
          </Card>

          {/* Right: Schedule Card */}
          <div className="bg-gradient-to-br from-primary to-primary-container text-white rounded-lg p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">schedule</span>
                Schedule
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-1.5">Exam Date</label>
                  <input className="w-full bg-white/20 border-none rounded-md px-4 py-3 text-white placeholder-white/60 focus:ring-2 ring-white/40 outline-none" type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-1.5">Start Time</label>
                  <input className="w-full bg-white/20 border-none rounded-md px-4 py-3 text-white focus:ring-2 ring-white/40 outline-none" type="time" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium opacity-80 mb-1.5">Duration (min)</label>
                    <input className="w-full bg-white/20 border-none rounded-md px-4 py-3 text-white focus:ring-2 ring-white/40 outline-none" type="number" defaultValue="120" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium opacity-80 mb-1.5">Total Marks</label>
                    <input className="w-full bg-white/20 border-none rounded-md px-4 py-3 text-white focus:ring-2 ring-white/40 outline-none" type="number" defaultValue="100" />
                  </div>
                </div>
              </div>
            </div>
            {/* Aesthetic Generator Graphic */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Section 2: Question Paper Strategy */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Question Paper Upload/Entry */}
          <Card className="p-8 shadow-sm">
            <h2 className="text-xl font-bold font-display mb-6 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Question Paper
            </h2>
            <div className="flex gap-4 p-1 bg-surface-container-low rounded-md mb-8">
              <button className="flex-1 py-2 px-4 rounded-md bg-white text-primary font-semibold shadow-sm text-sm outline-none">Upload File</button>
              <button className="flex-1 py-2 px-4 rounded-md text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-colors outline-none block w-full border-none bg-transparent">Manual Entry</button>
            </div>
            <div className="border-2 border-dashed border-outline-variant/30 rounded-lg p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
              </div>
              <div>
                <p className="font-semibold text-on-surface">Click to upload or drag and drop</p>
                <p className="text-sm text-on-surface-variant">PDF, DOCX, or RTF (max. 10MB)</p>
              </div>
              <button className="bg-surface-container-high text-primary px-6 py-2 rounded-md font-semibold text-sm hover:bg-surface-variant transition-colors outline-none cursor-pointer border-none">Select File</button>
            </div>
          </Card>

          {/* Marks Distribution */}
          <Card className="p-8 shadow-sm">
            <h2 className="text-xl font-bold font-display mb-6 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Structure & Marks
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-md">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#6b38d4]">check_circle</span>
                  <div>
                    <p className="font-semibold text-sm text-on-surface">Section A: MCQ</p>
                    <p className="text-xs text-on-surface-variant">20 Questions</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold">20m</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-md">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#6b38d4]">subject</span>
                  <div>
                    <p className="font-semibold text-sm text-on-surface">Section B: Short Answer</p>
                    <p className="text-xs text-on-surface-variant">6 Questions</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold">30m</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-md">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#6b38d4]">article</span>
                  <div>
                    <p className="font-semibold text-sm text-on-surface">Section C: Long Answer</p>
                    <p className="text-xs text-on-surface-variant">2 Questions</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold">50m</span>
                </div>
              </div>
              <button className="w-full py-3 border-2 border-primary/20 bg-transparent text-primary font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors mt-4 outline-none cursor-pointer">
                <span className="material-symbols-outlined">add_circle</span>
                Adjust Distribution
              </button>
            </div>
          </Card>
        </section>

        {/* Section 3: AI Question Generator */}
        <section className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm relative border border-outline-variant/10">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
            <span className="material-symbols-outlined text-[120px]">auto_awesome</span>
          </div>
          <div className="p-8 border-b border-surface-container-low relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-[#924700]">psychology</span>
              <h2 className="text-xl font-bold font-display text-on-surface">AI Question Paper Generator</h2>
              <span className="px-2 py-0.5 bg-[#b75b00]/10 text-[#924700] text-2xs font-bold rounded uppercase tracking-wider">Beta</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-2xl">Use our intelligent engine to generate high-quality questions based on your curriculum and past paper trends.</p>
          </div>
          <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            
            {/* Generator Controls */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Focus Topic/Chapter</label>
                <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-[#924700]/40 outline-none" placeholder="e.g. Thermodynamics & Heat Transfer" type="text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Difficulty</label>
                  <select className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-[#924700]/40 outline-none">
                    <option>Standard</option>
                    <option>Advanced</option>
                    <option>Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">No. of Questions</label>
                  <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-[#924700]/40 outline-none" type="number" defaultValue="15" />
                </div>
              </div>
              <button className="w-full bg-gradient-to-br from-[#924700] to-[#b75b00] text-white py-4 rounded-md font-bold shadow-lg shadow-[#924700]/20 flex items-center justify-center gap-2 hover:scale-[0.98] transition-transform duration-150 outline-none border-none cursor-pointer">
                <span className="material-symbols-outlined">magic_button</span>
                Generate Question Paper
              </button>
            </div>

            {/* Preview Pane */}
            <div className="lg:col-span-8 bg-surface-container-low rounded-lg p-6 min-h-[300px] border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Generated Preview</span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white rounded-md transition-colors outline-none cursor-pointer border-none bg-transparent">
                    <span className="material-symbols-outlined text-sm block">refresh</span>
                  </button>
                  <button className="p-2 hover:bg-white rounded-md transition-colors outline-none cursor-pointer border-none bg-transparent">
                    <span className="material-symbols-outlined text-sm block">download</span>
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-white rounded-md shadow-sm border border-outline-variant/5">
                  <p className="text-xs font-bold text-[#924700] mb-1">Q1. MULTIPLE CHOICE [2m]</p>
                  <p className="text-sm font-medium text-on-surface mb-4">A Carnot engine operates between two reservoirs at temperatures of 500 K and 300 K. What is its efficiency?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 bg-surface-container-low rounded text-xs text-on-surface">A) 20%</div>
                    <div className="p-2 bg-surface-container-low rounded text-xs text-on-surface">B) 40%</div>
                    <div className="p-2 bg-surface-container-low rounded text-xs text-on-surface">C) 60%</div>
                    <div className="p-2 bg-surface-container-low rounded text-xs text-on-surface">D) 80%</div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-md shadow-sm opacity-50 select-none blur-[1px] border border-outline-variant/5">
                  <p className="text-xs font-bold text-[#924700] mb-1">Q2. SHORT ANSWER [5m]</p>
                  <p className="text-sm font-medium text-on-surface">Explain the Zeroth Law of Thermodynamics and its significance in temperature measurement...</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Actions */}
        <footer className="flex flex-col sm:flex-row items-center justify-end gap-4 py-8">
          <button className="w-full sm:w-auto px-8 py-3 bg-transparent text-on-surface-variant font-semibold hover:bg-surface-container-high rounded-md transition-colors outline-none border-none cursor-pointer">
            Cancel
          </button>
          <button className="w-full sm:w-auto px-8 py-3 bg-surface-container-high text-primary font-bold rounded-md hover:bg-surface-container-highest transition-colors outline-none border-none cursor-pointer">
            Save Draft
          </button>
          <button className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-md shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform outline-none border-none cursor-pointer">
            Publish Exam
          </button>
        </footer>

      </div>
    </MainLayout>
  );
};

export default CreateExamPage;
