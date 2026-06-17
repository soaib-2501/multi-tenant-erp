import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

export default function QuizResult() {
  return (
    <MainLayout title={<Link to="/student/quiz" className="flex items-center gap-2 text-primary hover:text-primary-container transition-colors border border-primary/30 bg-primary/5 px-4 py-1.5 rounded-full"><span className="material-symbols-outlined text-lg">arrow_back</span> <span className="text-sm font-bold">Back to Practice &amp; Quiz</span></Link>}>
      <section className="flex-1 space-y-8">



<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
<div className="relative w-40 h-40 flex items-center justify-center">
<svg className="w-full h-full -rotate-90">
<circle className="text-surface-container-low" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"/>
<circle className="text-primary" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" stroke-dasharray="440" stroke-dashoffset="66" strokeWidth="12"/>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-4xl font-extrabold font-headline">85%</span>
<span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Score</span>
</div>
</div>
<div className="flex-1 space-y-4 text-center md:text-left">
<h3 className="text-2xl font-bold font-headline text-primary">Excellent Work, Alex!</h3>
<p className="text-on-surface-variant">You&apos;ve surpassed 92% of your cohort in this specific module. Your grasp of derivative applications is notably sharp.</p>
<div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
<div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
<span className="material-symbols-outlined text-primary text-sm">check_circle</span>
<span className="text-sm font-semibold">8/10 Correct</span>
</div>
<div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
<span className="material-symbols-outlined text-error text-sm">cancel</span>
<span className="text-sm font-semibold">2 Wrong</span>
</div>
</div>
</div>
</div>

<div className="bg-primary text-on-primary rounded-xl p-8 flex flex-col justify-between items-center text-center">
<span className="material-symbols-outlined text-4xl mb-4">timer</span>
<div>
<div className="text-4xl font-extrabold font-headline">12m 40s</div>
<p className="text-primary-fixed-dim text-sm mt-1">Completion Time</p>
</div>
<div className="mt-4 text-xs font-label bg-white/20 px-3 py-1 rounded-full">Fast Learner Pace</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-8 space-y-6">
<div className="flex items-center gap-3">
<div className="p-2 bg-tertiary/10 rounded-lg">
<span className="material-symbols-outlined text-tertiary">psychology</span>
</div>
<h2 className="text-2xl font-bold font-headline">AI Performance Analysis</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

<div className="space-y-4">
<h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-emerald-500"/>
              Core Strengths
            </h4>
<div className="bg-surface-container-low p-4 rounded-lg border-l-4 border-emerald-500">
<p className="font-bold text-on-surface">Calculus: Differentiation</p>
<p className="text-sm text-on-surface-variant mt-1">Perfect accuracy in chain rule and implicit differentiation problems. You solved these 15% faster than your average.</p>
</div>
</div>

<div className="space-y-4">
<h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-amber-500"/>
              Growth Areas
            </h4>
<div className="bg-surface-container-low p-4 rounded-lg border-l-4 border-amber-500">
<p className="font-bold text-on-surface">Trigonometry: Identities</p>
<p className="text-sm text-on-surface-variant mt-1">Both incorrect answers were related to Double-Angle formulas. Reviewing these could boost your score to 95%+.</p>
</div>
</div>
</div>
<div className="pt-4 border-t border-outline-variant/10">
<p className="text-on-surface-variant italic">&quot;Alex, you&apos;re consistently performing at an Advanced Level. Focusing on trigonometric proofs will be the key to mastering this semester&apos;s finals.&quot;</p>
</div>
</div>
</section>
<aside className="w-full lg:w-96 space-y-6">

<div className="bg-primary-container text-white rounded-xl p-8 space-y-6 relative overflow-hidden">
<div className="relative z-10">
<h3 className="text-xl font-bold font-headline mb-4">Recommended Next Step</h3>
<div className="space-y-4">
<div className="bg-white/10 p-4 rounded-lg backdrop-blur-md">
<span className="text-xs font-bold uppercase tracking-widest opacity-80">Practice Quiz</span>
<p className="font-bold text-lg leading-tight mt-1">Integral Calculus Basics</p>
<button className="mt-4 w-full bg-white text-primary font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                Start Now
              </button>
</div>
<div className="bg-white/10 p-4 rounded-lg backdrop-blur-md">
<span className="text-xs font-bold uppercase tracking-widest opacity-80">Quick Revision</span>
<p className="font-bold text-lg leading-tight mt-1">Trigonometric Identities</p>
<button className="mt-4 w-full border border-white/30 text-white font-bold py-2 rounded-lg text-sm hover:bg-white/10 transition-colors">
                Open Resource
              </button>
</div>
</div>
</div>

<div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"/>
</div>

<div className="bg-surface-container-low rounded-xl p-6 space-y-4">
<h3 className="font-bold font-headline">Weekly Progress</h3>
<div className="space-y-3">
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">Last Quiz</span>
<span className="font-bold">78%</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full" style={{ width: `85%` }}/>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed">You&apos;ve improved by <span className="text-primary font-bold">7%</span> since your last attempt on Monday. Keep up the consistency!</p>
</div>
</div>

<div className="bg-tertiary-fixed rounded-xl p-6 border border-tertiary/10">
<div className="flex gap-3">
<span className="material-symbols-outlined text-tertiary">auto_awesome</span>
<div>
<h4 className="font-bold text-on-tertiary-fixed leading-tight">Generate custom study plan?</h4>
<p className="text-sm text-on-tertiary-fixed-variant mt-2">I can curate a 3-day roadmap based on your results to master Trigonometry.</p>
<button className="mt-4 text-sm font-bold text-tertiary-container hover:underline">
              Yes, create plan &#x2192;
            </button>
</div>
</div>
</div>
</aside>

    </MainLayout>
  );
}

