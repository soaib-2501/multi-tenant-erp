import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

export default function PracticeQuizHub() {
  return (
    <MainLayout title="Practice & Quiz">
      <div className="p-8 max-w-screen-2xl mx-auto w-full space-y-8">

<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 bg-gradient-to-br from-primary to-primary-container p-8 rounded-lg shadow-lg relative overflow-hidden group">
<div className="relative z-10 max-w-md">
<span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-2xs font-bold uppercase tracking-widest mb-4">Preparation Mode</span>
<h2 className="text-3xl font-bold font-manrope text-white mb-3">Master Your Subjects with AI-Powered Practice</h2>
<p className="text-blue-50 text-sm mb-6 leading-relaxed">Personalized question sets adapted to your learning speed. Track your progress and bridge knowledge gaps before exams.</p>
<div className="flex flex-wrap gap-4">
<Link to="/student/quiz/active" className="flex items-center justify-center bg-white text-primary px-6 py-3 rounded-md font-bold text-sm shadow-sm hover:bg-blue-50 active:scale-95 transition-all">Start Practice</Link>
<button className="bg-white/10 text-white backdrop-blur-md px-6 py-3 rounded-md font-bold text-sm border border-white/20 hover:bg-white/20 transition-all">Daily Challenge</button>
</div>
</div>
<div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"/>
<span className="material-symbols-outlined absolute right-12 top-1/2 -translate-y-1/2 text-white/10 text-9xl pointer-events-none">school</span>
</div>
<div className="bg-surface-container-high p-8 rounded-lg flex flex-col justify-center items-center text-center space-y-4">
<div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white shadow-lg mb-2">
<span className="material-symbols-outlined text-3xl">timer</span>
</div>
<h3 className="text-xl font-bold font-manrope text-on-surface">Live Exam Mode</h3>
<p className="text-slate-600 text-sm leading-relaxed px-4">Ready to test your limits? Enter the quiz chamber for a timed simulation of your finals.</p>
<button className="w-full bg-gradient-to-r from-secondary to-secondary-container text-white py-3 rounded-md font-bold text-sm shadow-md hover:opacity-90 active:scale-98 transition-all">Start Quiz Mode</button>
</div>
</section>

<section className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border-none flex flex-wrap items-center gap-6">
<div className="flex-1 min-w-[200px]">
<label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
<select className="w-full bg-surface-container-low border-none rounded-md py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20">
<option>Mathematics</option>
<option>Physics</option>
<option>Computer Science</option>
<option>Advanced Calculus</option>
</select>
</div>
<div className="flex-1 min-w-[200px]">
<label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-2">Difficulty</label>
<div className="flex bg-surface-container-low p-1 rounded-md">
<button className="flex-1 py-1.5 text-xs font-semibold rounded-sm bg-white shadow-sm text-primary">Easy</button>
<button className="flex-1 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">Medium</button>
<button className="flex-1 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">Hard</button>
</div>
</div>
<div className="flex-1 min-w-[200px]">
<label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-2">Topic</label>
<select className="w-full bg-surface-container-low border-none rounded-md py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20">
<option>All Topics</option>
<option>Polynomial Factorization</option>
<option>Projectile Motion</option>
<option>Integrals</option>
</select>
</div>
<div className="pt-6">
<button className="w-12 h-12 bg-primary-container text-white rounded-md flex items-center justify-center shadow-md hover:bg-primary transition-colors">
<span className="material-symbols-outlined">tune</span>
</button>
</div>
</section>

<section className="space-y-6">
<div className="flex justify-between items-end">
<div>
<h2 className="text-2xl font-bold font-manrope text-on-surface">Recommended for You</h2>
<p className="text-slate-500 text-sm">Based on your recent performance in Algebra and Mechanics</p>
</div>
<button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        View all resources <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

<div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border-none group hover:translate-y-[-4px] transition-all duration-300">
<div className="flex justify-between items-start mb-6">
<div className="p-3 bg-blue-50 rounded-xl text-primary">
<span className="material-symbols-outlined">functions</span>
</div>
<span className="px-3 py-1 bg-surface-container-highest text-primary text-2xs font-bold rounded-full uppercase">Mathematics</span>
</div>
<h3 className="text-lg font-bold font-manrope text-slate-900 mb-2">Polynomial Factorization</h3>
<p className="text-slate-500 text-sm mb-6 line-clamp-2">Master the techniques of grouping, difference of squares, and synthetic division for complex polynomials.</p>
<div className="flex items-center gap-6 mb-8 text-xs font-medium text-slate-400">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm text-secondary">signal_cellular_alt</span> Medium
                            </div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm text-tertiary">schedule</span> 15 min
                            </div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm text-primary">checklist</span> 12 Questions
                            </div>
</div>
<div className="flex items-center gap-3">
<Link to="/student/quiz/active" className="flex-1 text-center bg-primary text-white py-2.5 rounded-md font-bold text-sm hover:bg-primary-container transition-all">Start Practice</Link>
<button className="px-4 py-2.5 border border-outline-variant/30 rounded-md text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">View Solution</button>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border-none group hover:translate-y-[-4px] transition-all duration-300">
<div className="flex justify-between items-start mb-6">
<div className="p-3 bg-purple-50 rounded-xl text-secondary">
<span className="material-symbols-outlined">architecture</span>
</div>
<span className="px-3 py-1 bg-surface-container-highest text-secondary text-2xs font-bold rounded-full uppercase">Physics</span>
</div>
<h3 className="text-lg font-bold font-manrope text-slate-900 mb-2">Projectile Motion</h3>
<p className="text-slate-500 text-sm mb-6 line-clamp-2">In-depth analysis of kinematic equations in two dimensions including air resistance considerations.</p>
<div className="flex items-center gap-6 mb-8 text-xs font-medium text-slate-400">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm text-error">signal_cellular_alt</span> Hard
                            </div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm text-tertiary">schedule</span> 20 min
                            </div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm text-primary">checklist</span> 8 Questions
                            </div>
</div>
<div className="flex items-center gap-3">
<Link to="/student/quiz/active" className="flex-1 text-center bg-primary text-white py-2.5 rounded-md font-bold text-sm hover:bg-primary-container transition-all">Start Practice</Link>
<button className="px-4 py-2.5 border border-outline-variant/30 rounded-md text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">View Solution</button>
</div>
</div>
</div>
</section>

<section className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12">
<div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between">
<div>
<h4 className="text-slate-400 text-2xs font-bold uppercase tracking-widest mb-1">Weekly Progress</h4>
<div className="flex items-end gap-2">
<span className="text-3xl font-bold font-manrope">84%</span>
<span className="text-success text-xs font-bold text-green-600 mb-1.5 flex items-center">
<span className="material-symbols-outlined text-sm">trending_up</span> +12%
                            </span>
</div>
</div>
<div className="h-24 flex items-end gap-2 mt-4">
<div className="flex-1 bg-slate-100 rounded-t-sm h-[40%]"/>
<div className="flex-1 bg-slate-100 rounded-t-sm h-[60%]"/>
<div className="flex-1 bg-slate-100 rounded-t-sm h-[30%]"/>
<div className="flex-1 bg-primary rounded-t-sm h-[80%]"/>
<div className="flex-1 bg-slate-100 rounded-t-sm h-[50%]"/>
<div className="flex-1 bg-slate-100 rounded-t-sm h-[70%]"/>
<div className="flex-1 bg-slate-100 rounded-t-sm h-[45%]"/>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-lg shadow-sm border-none flex flex-col items-center text-center justify-center">
<span className="material-symbols-outlined text-tertiary-container text-4xl mb-2">stars</span>
<p className="text-2xl font-bold font-manrope">1,240</p>
<p className="text-xs text-slate-500 font-medium">Practice Points</p>
</div>
<div className="bg-surface-container-low p-6 rounded-lg shadow-sm border-none flex flex-col items-center text-center justify-center">
<span className="material-symbols-outlined text-secondary text-4xl mb-2" style={{ fontVariationSettings: `&apos` }}>bolt</span>
<p className="text-2xl font-bold font-manrope">5 Days</p>
<p className="text-xs text-slate-500 font-medium">Study Streak</p>
</div>
</section>
</div>

    </MainLayout>
  );
}

