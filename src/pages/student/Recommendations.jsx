import React from 'react';
import MainLayout from '../../layouts/MainLayout';

export default function Recommendations() {
  return (
    <MainLayout title="Recommendations">
      <div className="p-8 max-w-screen-2xl mx-auto space-y-8">

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

<div className="lg:col-span-2 bg-white rounded-lg p-8 shadow-[0px_12px_32px_rgba(11,28,48,0.04)] relative overflow-hidden">
<div className="absolute top-0 right-0 p-4">
<span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Academic Overview</span>
</div>
<h3 className="font-headline text-2xl font-bold mb-4">Strong in Mathematics, improvement needed in Physics.</h3>
<p className="text-on-surface-variant font-body mb-8">Your recent quiz scores show a 94% proficiency in Calculus, but kinematics concepts in Physics require more focused practice.</p>
<div className="space-y-6">
<div>
<div className="flex justify-between items-center mb-2">
<span className="text-sm font-medium text-slate-600">Mathematics Mastery</span>
<span className="text-sm font-bold text-blue-700">94%</span>
</div>
<div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `94%` }}/>
</div>
</div>
<div>
<div className="flex justify-between items-center mb-2">
<span className="text-sm font-medium text-slate-600">Physics Application</span>
<span className="text-sm font-bold text-blue-700">62%</span>
</div>
<div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `62%` }}/>
</div>
</div>
</div>
</div>

<div className="bg-primary text-white rounded-lg p-8 relative overflow-hidden">
<div className="absolute -right-8 -bottom-8 opacity-10">
<span className="material-symbols-outlined text-[120px]">psychology</span>
</div>
<div className="flex items-center gap-2 mb-6">
<span className="material-symbols-outlined text-tertiary-fixed">auto_awesome</span>
<span className="font-headline font-bold uppercase tracking-widest text-xs opacity-80">AI Analysis</span>
</div>
<h4 className="font-headline text-xl font-bold mb-4">You perform better in visual learning topics.</h4>
<p className="text-blue-100 font-body text-sm leading-relaxed mb-6">Based on your interaction with video modules vs reading materials, we&apos;ve adjusted your path to include more interactive visualizations.</p>
<button className="bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-bold py-3 px-6 rounded-md backdrop-blur-md border border-white/20">
                        View Detailed Insights
                    </button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

<div className="lg:col-span-2 bg-white rounded-lg p-8 shadow-[0px_12px_32px_rgba(11,28,48,0.04)]">
<h4 className="font-headline text-lg font-bold mb-8">Personalized Learning Path</h4>
<div className="space-y-0">

<div className="flex gap-6 group">
<div className="flex flex-col items-center">
<div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm z-10">1</div>
<div className="w-0.5 h-16 bg-blue-100 group-last:hidden"/>
</div>
<div className="pb-8">
<h5 className="font-semibold text-slate-900 mb-1">Revise algebra basics</h5>
<p className="text-sm text-slate-500">Foundation for quadratic equations module.</p>
</div>
</div>

<div className="flex gap-6 group">
<div className="flex flex-col items-center">
<div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm z-10">2</div>
<div className="w-0.5 h-16 bg-blue-100 group-last:hidden"/>
</div>
<div className="pb-8">
<h5 className="font-semibold text-slate-900 mb-1">Practice quadratic equations</h5>
<p className="text-sm text-slate-500">Solve 15 problem sets with varying difficulty.</p>
</div>
</div>

<div className="flex gap-6 group">
<div className="flex flex-col items-center">
<div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm z-10">3</div>
<div className="w-0.5 h-16 bg-blue-100 group-last:hidden"/>
</div>
<div className="pb-4">
<h5 className="font-semibold text-slate-900 mb-1">Attempt advanced quiz</h5>
<p className="text-sm text-slate-500">Test your mastery with high-difficulty questions.</p>
</div>
</div>
</div>
</div>

<div className="lg:col-span-2 bg-surface-container-low rounded-lg p-8">
<h4 className="font-headline text-lg font-bold mb-6">Focus Areas</h4>
<div className="space-y-4">
<div className="bg-white p-4 rounded-xl flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
<span className="material-symbols-outlined">speed</span>
</div>
<div>
<p className="font-semibold text-sm">Kinematics</p>
<p className="text-xs text-slate-400">Physics - Unit 2</p>
</div>
</div>
<span className="bg-red-50 text-red-700 text-2xs font-extrabold px-2 py-1 rounded uppercase">Hard</span>
</div>
<div className="bg-white p-4 rounded-xl flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
<span className="material-symbols-outlined">science</span>
</div>
<div>
<p className="font-semibold text-sm">Organic Chemistry</p>
<p className="text-xs text-slate-400">Chemistry - Unit 4</p>
</div>
</div>
<span className="bg-orange-50 text-orange-700 text-2xs font-extrabold px-2 py-1 rounded uppercase">Medium</span>
</div>
<div className="bg-white p-4 rounded-xl flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
<span className="material-symbols-outlined">functions</span>
</div>
<div>
<p className="font-semibold text-sm">Complex Numbers</p>
<p className="text-xs text-slate-400">Mathematics - Unit 1</p>
</div>
</div>
<span className="bg-blue-50 text-blue-700 text-2xs font-extrabold px-2 py-1 rounded uppercase">Review</span>
</div>
</div>
</div>
</div>

<section>
<div className="flex justify-between items-end mb-8">
<div>
<h4 className="font-headline text-2xl font-bold">Recommended Resources</h4>
<p className="text-on-surface-variant text-sm mt-1">Curated materials to help you bridge knowledge gaps.</p>
</div>
<button className="text-primary text-sm font-bold flex items-center gap-2">
                        View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

<div className="bg-white rounded-lg overflow-hidden group shadow-[0px_4px_12px_rgba(11,28,48,0.02)] transition-all hover:translate-y-[-4px] hover:shadow-[0px_12px_32px_rgba(11,28,48,0.08)]">
<div className="relative h-48">
<img alt="Wave Optics Visualization" className="w-full h-full object-cover" data-alt="Abstract cinematic visualization of light waves refracting through a prism with vibrant blue and purple streaks on a dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2cCQ6v9OseEwK_ameQbZCtB6NwqmWadO0HyfhQoQIKUnMRg70Q1GWBo0Rxio6I2nPWLrAfXrWb2vt8Vm8XFVqOEJ6WvBENRO1HFvaUq-f5HRx6kmrdfOI5DcKjDnni5oGrf_xvgqPHQtPrNF0uKfPhvZBcwbyD7fyP_RBP92S3ZggSVq5kirtP4dQ3Fs7_JAo-iALrs0RwA0_EVYtBb31imMj7-P4C6N8mlsrfpXH8cTJMsfelVwtq6HTMetKpqAHschvDL2Jow"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
<div className="absolute bottom-4 left-4 flex items-center gap-2">
<span className="bg-primary-container text-white p-1 rounded-full"><span className="material-symbols-outlined text-xs">play_arrow</span></span>
<span className="text-white text-xs font-bold">12:45 mins</span>
</div>
</div>
<div className="p-6">
<span className="text-2xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">Video Lesson</span>
<h5 className="font-headline font-bold text-slate-900 mb-2">Wave Optics</h5>
<p className="text-slate-500 text-xs mb-6 leading-relaxed">Advanced breakdown of interference patterns and wave theory.</p>
<button className="w-full py-3 bg-surface-container-high text-primary font-bold text-xs rounded-md group-hover:bg-primary group-hover:text-white transition-all">Start Learning</button>
</div>
</div>

<div className="bg-white rounded-lg overflow-hidden group shadow-[0px_4px_12px_rgba(11,28,48,0.02)] transition-all hover:translate-y-[-4px] hover:shadow-[0px_12px_32px_rgba(11,28,48,0.08)]">
<div className="relative h-48">
<img alt="Mathematical equations on blackboard" className="w-full h-full object-cover" data-alt="Detailed close-up of complex mathematical equations and handwritten formulas on a dark slate blackboard with chalk dust textures" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDr8Awejd_TBGc6I_SqvYpLRVoZY3PJWOtZ8_o9HVqKUgZ7gaTQiDPfjLxtqRM0uvkF9LHpOcPuaHLr7mi9qSP3dN3gSju2SDKdxZPZpdrE6QwJoxHrXXDniGJmOH2h_OdeNg4ni7sY7P4ZOzCmd2EAIhWsqoo-UVLVBHJAzcEyvJxTH1k51q5pGqKrODK_KVgR4h4XCQgwguQuNarrwM5HGOl6MvcOpwap00nHcpuW9i1oIurzAau2olcNE3HDJdrIEoD2uaAgFA"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
<div className="absolute bottom-4 left-4 flex items-center gap-2">
<span className="bg-orange-500 text-white p-1 rounded-full"><span className="material-symbols-outlined text-xs">edit_note</span></span>
<span className="text-white text-xs font-bold">25 Questions</span>
</div>
</div>
<div className="p-6">
<span className="text-2xs font-bold text-orange-600 uppercase tracking-widest mb-2 block">Worksheet</span>
<h5 className="font-headline font-bold text-slate-900 mb-2">Complex Numbers</h5>
<p className="text-slate-500 text-xs mb-6 leading-relaxed">Comprehensive practice set covering imaginary roots and Argand diagrams.</p>
<button className="w-full py-3 bg-surface-container-high text-primary font-bold text-xs rounded-md group-hover:bg-primary group-hover:text-white transition-all">Download PDF</button>
</div>
</div>

<div className="bg-white rounded-lg overflow-hidden group shadow-[0px_4px_12px_rgba(11,28,48,0.02)] transition-all hover:translate-y-[-4px] hover:shadow-[0px_12px_32px_rgba(11,28,48,0.08)]">
<div className="relative h-48">
<img alt="Modern Physics visualization" className="w-full h-full object-cover" data-alt="Digital art representing subatomic particles and network connections in glowing cyan and gold colors over deep space background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFB_a8S1fM0yBlJa7kSWlL67FGD1VyoMHO5fGowI2qOMyfi0bUR9G_LEKHNQoWv_tdK8WBO4xFk3WDkSwkRXGOahdOtIg2xuXmTriajP-Iu1Zu5P4Neord-jWuSX77fx33VfFHIyPchvkX4Y_XeQt8-TSlcuddDd82LUJqPKD8MHQwfVwkkVJnw-rzUJhT1q7T7M35sU1c0wSpnAENO5kVP-1BcWDFyUPn_XjxLV_9e_scbMkkYDvnRCa8vbI_svZdMcpM5pqw3A"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
<div className="absolute bottom-4 left-4 flex items-center gap-2">
<span className="bg-purple-500 text-white p-1 rounded-full"><span className="material-symbols-outlined text-xs">book_2</span></span>
<span className="text-white text-xs font-bold">8 min read</span>
</div>
</div>
<div className="p-6">
<span className="text-2xs font-bold text-purple-600 uppercase tracking-widest mb-2 block">Reading</span>
<h5 className="font-headline font-bold text-slate-900 mb-2">Modern Physics</h5>
<p className="text-slate-500 text-xs mb-6 leading-relaxed">Introduction to Quantum Mechanics and Special Relativity for Grade 11.</p>
<button className="w-full py-3 bg-surface-container-high text-primary font-bold text-xs rounded-md group-hover:bg-primary group-hover:text-white transition-all">Start Reading</button>
</div>
</div>
</div>
</section>

<div className="bg-white rounded-lg p-8 shadow-[0px_12px_32px_rgba(11,28,48,0.04)] flex flex-col md:flex-row items-center gap-12">
<div className="flex-1 w-full">
<h4 className="font-headline text-lg font-bold mb-6">Recommendation Impact</h4>
<div className="grid grid-cols-2 gap-8">
<div>
<p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Skill Improvement</p>
<div className="flex items-center gap-3">
<span className="text-2xl font-bold text-slate-900">+12%</span>
<span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold">&#x2191; This Month</span>
</div>
</div>
<div>
<p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Path Completion</p>
<div className="flex items-center gap-3">
<span className="text-2xl font-bold text-slate-900">45%</span>
<div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
<div className="h-full bg-blue-700" style={{ width: `45%` }}/>
</div>
</div>
</div>
</div>
</div>
<div className="w-full md:w-auto">
<button className="w-full md:w-auto bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-md font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                        Generate New Assessment
                    </button>
</div>
</div>
</div>

    </MainLayout>
  );
}

