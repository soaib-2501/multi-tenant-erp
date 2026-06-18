import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

export default function ActiveQuiz() {
  return (
    <MainLayout title={<Link to="/student/quiz" className="flex items-center gap-2 text-primary hover:text-primary-container transition-colors border border-primary/30 bg-primary/5 px-4 py-1.5 rounded-full"><span className="material-symbols-outlined text-lg">arrow_back</span> <span className="text-sm font-bold">Back to Practice &amp; Quiz</span></Link>}>
      <div className="px-6 py-4 max-w-4xl mx-auto">

{/* Header */}
<div className="flex justify-between items-end mb-3">
<div>
<span className="text-xs font-bold text-primary uppercase tracking-widest font-label">Calculus I</span>
<h2 className="text-xl font-extrabold font-headline text-on-background mt-0.5">Mid-Term Assessment</h2>
</div>
<div className="text-right">
<span className="text-xs font-medium text-on-surface-variant font-label">Question <span className="text-on-surface font-bold text-base">2</span> of 10</span>
</div>
</div>

{/* Progress bar */}
<div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-6">
<div className="h-full bg-primary primary-gradient rounded-full w-[20%] transition-all duration-500"/>
</div>

{/* Question Card */}
<div className="bg-surface-container-lowest rounded-lg p-6 shadow-[0px_8px_24px_rgba(11,28,48,0.04)] relative overflow-hidden mb-4">
<div className="absolute top-0 left-0 w-1 h-full bg-primary"/>
<div className="flex gap-4">
<div className="hidden sm:flex flex-col items-center gap-1.5">
<div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-sm font-bold font-headline">2</div>
<div className="w-px h-full bg-outline-variant/20"/>
</div>
<div className="flex-1">
<p className="text-lg font-semibold font-headline text-on-surface mb-5 leading-relaxed">
                                What is the derivative of x<sup>2</sup> with respect to x?
                            </p>

<div className="space-y-3">

<label className="group relative flex items-center p-3.5 rounded-lg border border-transparent bg-surface-container-low hover:bg-surface-container hover:shadow-sm cursor-pointer transition-all active:scale-[0.99]">
<input className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-offset-0 bg-white" name="quiz_option" type="radio"/>
<div className="ml-3 flex-1">
<span className="block text-xs font-bold text-on-surface-variant mb-0.5 uppercase tracking-tight">Option A</span>
<span className="text-base font-medium font-body text-on-surface">2x</span>
</div>
<span className="material-symbols-outlined text-outline-variant text-xl opacity-0 group-hover:opacity-100 transition-opacity">check_circle</span>
</label>

<label className="group relative flex items-center p-3.5 rounded-lg border-2 border-primary bg-white shadow-md cursor-pointer transition-all active:scale-[0.99]">
<input defaultChecked className="w-4 h-4 text-primary border-primary focus:ring-primary focus:ring-offset-0" name="quiz_option" type="radio"/>
<div className="ml-3 flex-1">
<span className="block text-xs font-bold text-primary mb-0.5 uppercase tracking-tight">Option B</span>
<span className="text-base font-bold font-body text-on-surface">x</span>
</div>
<span className="material-symbols-outlined text-primary text-xl" data-weight="fill">check_circle</span>
</label>

<label className="group relative flex items-center p-3.5 rounded-lg border border-transparent bg-surface-container-low hover:bg-surface-container hover:shadow-sm cursor-pointer transition-all active:scale-[0.99]">
<input className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-offset-0 bg-white" name="quiz_option" type="radio"/>
<div className="ml-3 flex-1">
<span className="block text-xs font-bold text-on-surface-variant mb-0.5 uppercase tracking-tight">Option C</span>
<span className="text-base font-medium font-body text-on-surface">x<sup>2</sup></span>
</div>
<span className="material-symbols-outlined text-outline-variant text-xl opacity-0 group-hover:opacity-100 transition-opacity">check_circle</span>
</label>

<label className="group relative flex items-center p-3.5 rounded-lg border border-transparent bg-surface-container-low hover:bg-surface-container hover:shadow-sm cursor-pointer transition-all active:scale-[0.99]">
<input className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-offset-0 bg-white" name="quiz_option" type="radio"/>
<div className="ml-3 flex-1">
<span className="block text-xs font-bold text-on-surface-variant mb-0.5 uppercase tracking-tight">Option D</span>
<span className="text-base font-medium font-body text-on-surface">1</span>
</div>
<span className="material-symbols-outlined text-outline-variant text-xl opacity-0 group-hover:opacity-100 transition-opacity">check_circle</span>
</label>
</div>
</div>
</div>
</div>

{/* AI Hint */}
<div className="bg-tertiary-fixed/30 rounded-lg p-4 flex items-start gap-3 border-l-4 border-tertiary mb-6">
<span className="material-symbols-outlined text-tertiary text-xl">psychology</span>
<div className="flex-1">
<h4 className="font-headline font-bold text-sm text-on-tertiary-fixed-variant leading-tight">AI Hint Available</h4>
<p className="text-xs text-on-tertiary-fixed-variant/80 font-body mt-0.5">Remember the power rule: d/dx [x<sup>n</sup>] = nx<sup>n-1</sup>. This might help you solve the current question faster.</p>
</div>
<button className="ml-auto text-2xs font-bold bg-tertiary-container text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity uppercase tracking-wider whitespace-nowrap">Use Hint</button>
</div>

{/* Footer Navigation */}
<footer className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/10">
<div className="flex gap-3 w-full md:w-auto">
<button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg font-bold text-sm font-label bg-surface-container-high text-primary hover:bg-surface-container-highest transition-all active:scale-95">
<span className="material-symbols-outlined text-lg">chevron_left</span>
                        Previous question
                    </button>
<button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg font-bold text-sm font-label bg-surface-container-high text-primary hover:bg-surface-container-highest transition-all active:scale-95">
                        Next question
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
</button>
</div>
<div className="flex items-center gap-3 w-full md:w-auto">
<Link to="/student/quiz/result" className="w-full md:w-auto px-6 py-2.5 rounded-lg font-bold text-sm font-label primary-gradient text-white shadow-lg hover:shadow-primary/25 hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-2">
                        Submit Quiz
                        <span className="material-symbols-outlined text-lg">task_alt</span>
</Link>
</div>
</footer>
</div>

    </MainLayout>
  );
}

