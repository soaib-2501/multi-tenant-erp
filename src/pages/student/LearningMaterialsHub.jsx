import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

export default function LearningMaterialsHub() {
  return (
    <MainLayout title="Learning Materials">
      <div className="px-8 mt-8 max-w-screen-2xl mx-auto space-y-8">

<section>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 relative overflow-hidden rounded-lg primary-gradient p-8 text-white flex flex-col justify-between min-h-[320px]">
<div className="relative z-10 max-w-lg">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined" style={{ fontVariationSettings: `&apos` }}>auto_awesome</span>
<span className="font-manrope font-semibold text-sm uppercase tracking-widest text-blue-100">AI Personalized Pick</span>
</div>
<h2 className="font-manrope font-extrabold text-4xl mb-4 leading-tight">Mastering Neural Networks: A Visual Guide</h2>
<p className="text-blue-50 text-lg mb-8 leading-relaxed">Based on your recent interest in Computer Science and your performance in the AI Quiz, this deep-dive worksheet will help you visualize backpropagation logic.</p>
<div className="flex items-center gap-4">
<Link to="/student/materials/view" className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform inline-block">Start Learning</Link>
<span className="text-sm font-medium text-blue-200">Recommended for your Grade 11 CS Advanced track</span>
</div>
</div>

<div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"/>
<div className="absolute top-0 right-0 p-8">
<img alt="Abstract Data Visualization" className="w-48 h-48 rounded-2xl object-cover shadow-2xl rotate-3" data-alt="Intricate glowing data visualization of a neural network with nodes and pathways on a dark blue background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBc9o_HIq3_43SqR1ZUcDmM0Fesn56_QYNSayVrmxEBZZNUfv6HXIQHaopkO5_p16PVCwn7fexnj73TJ5rY4H9pDSyP9RJQQj-y_lGs3xcm7M_IFO63slVwFf7MV0lnIRtWc0Liq_JgakddPX13xHNuP6pAyrJX3xP0AN0mE82-YDjwO6jqTx_3PrhrrX1jsFpaQIfAaHvpjFZWjH4uPsV4xalkXIAyx6GimDy09VeWZ4MJQ663YMNYDjJevUQKCswlipcxF3cqOA"/>
</div>
</div>
<div className="bg-surface-container-lowest rounded-lg p-6 flex flex-col justify-between">
<div>
<h3 className="font-manrope font-bold text-xl mb-6 flex items-center gap-2 text-on-surface">
<span className="material-symbols-outlined text-tertiary">history</span>
                                Recently Viewed
                            </h3>
<div className="space-y-4">
<div className="flex items-center gap-4 group cursor-pointer">
<div className="w-12 h-12 rounded-md bg-red-100 flex items-center justify-center text-red-600">
<span className="material-symbols-outlined">picture_as_pdf</span>
</div>
<div className="flex-1">
<p className="font-semibold text-sm group-hover:text-primary transition-colors">Quantum Mechanics basics.pdf</p>
<p className="text-xs text-slate-500">Physics &#x2022; 2 hours ago</p>
</div>
</div>
<div className="flex items-center gap-4 group cursor-pointer">
<div className="w-12 h-12 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
<span className="material-symbols-outlined">play_circle</span>
</div>
<div className="flex-1">
<p className="font-semibold text-sm group-hover:text-primary transition-colors">Integration by Parts Video</p>
<p className="text-xs text-slate-500">Mathematics &#x2022; 5 hours ago</p>
</div>
</div>
<div className="flex items-center gap-4 group cursor-pointer">
<div className="w-12 h-12 rounded-md bg-amber-100 flex items-center justify-center text-amber-600">
<span className="material-symbols-outlined">slideshow</span>
</div>
<div className="flex-1">
<p className="font-semibold text-sm group-hover:text-primary transition-colors">The Great Gatsby Analysis</p>
<p className="text-xs text-slate-500">Literature &#x2022; Yesterday</p>
</div>
</div>
</div>
</div>
<button className="w-full text-center text-sm font-semibold text-primary py-3 hover:bg-surface-container-low rounded-xl transition-colors">View All Activity</button>
</div>
</div>
</section>

<section className="space-y-6">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface-container-low p-6 rounded-lg">
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
<div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Subject</label>
<select className="w-full bg-surface-container-lowest border-none rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20">
<option>All Subjects</option>
<option>Computer Science</option>
<option>Mathematics</option>
<option>Physics</option>
<option>History</option>
</select>
</div>
<div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Topic</label>
<select className="w-full bg-surface-container-lowest border-none rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20">
<option>All Topics</option>
<option>Algebra</option>
<option>Web Development</option>
<option>Organic Chemistry</option>
</select>
</div>
<div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Material Type</label>
<select className="w-full bg-surface-container-lowest border-none rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20">
<option>All Types</option>
<option>Video Lessons</option>
<option>PDF Guides</option>
<option>Lecture Slides</option>
<option>Worksheets</option>
</select>
</div>
<div className="space-y-2">
<label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Difficulty</label>
<select className="w-full bg-surface-container-lowest border-none rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20">
<option>All Levels</option>
<option>Beginner</option>
<option>Intermediate</option>
<option>Advanced</option>
</select>
</div>
</div>
<button className="bg-primary text-white px-8 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap h-fit self-end mb-1">
                        Apply Filters
                    </button>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

<div className="bg-surface-container-lowest rounded-lg overflow-hidden group hover:shadow-[0px_12px_32px_rgba(11,28,48,0.06)] transition-all flex flex-col">
<div className="relative h-48 overflow-hidden">
<img alt="Programming material" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Professional workspace with a laptop showing lines of code, soft coffee mug, and warm morning light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8G7aQhtU6lxaxqtdKXo10rs43y-G4S-q5FMdYz5iu599cxOur34VrhPLI47_PmJz4whcl4uaGuxBMg2m2jyOop4RkX799adLr0B6n_XEWwyzhrku-dFOrXQ0Ataj6V4_vTWpDIYs37YJyuubDcMlur_eyHvKgXT6kxw7JqyUWE0YXeZsYZYbRqN0m6L8drCpI1fFBwAHHvDhXT6cV1LYZzj2yk5lu6Mx2ODWbcgUhHu1zpoeHtvWRgCzFBHxBiiGEDkJQwfNwHg"/>
<div className="absolute top-3 left-3 flex gap-2">
<span className="bg-blue-600/90 text-white text-2xs font-bold px-2 py-1 rounded uppercase tracking-wide backdrop-blur-sm">Video</span>
<span className="bg-surface-container-lowest/90 text-on-surface text-2xs font-bold px-2 py-1 rounded uppercase tracking-wide backdrop-blur-sm">Beginner</span>
</div>
</div>
<div className="p-6 flex-1 flex flex-col">
<div className="flex items-center gap-2 mb-2">
<span className="text-xs font-bold text-primary uppercase">Computer Science</span>
<span className="w-1 h-1 bg-slate-300 rounded-full"/>
<span className="text-xs font-medium text-slate-500">Data Structures</span>
</div>
<h4 className="font-manrope font-bold text-lg mb-3 leading-tight group-hover:text-primary transition-colors">Arrays and Linked Lists: Fundamental Building Blocks</h4>
<div className="mt-auto flex items-center justify-between">
<div className="flex items-center gap-2 text-slate-500">
<span className="material-symbols-outlined text-sm">schedule</span>
<span className="text-xs font-medium">45 mins</span>
</div>
<button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                                    Open Material <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-lg overflow-hidden group hover:shadow-[0px_12px_32px_rgba(11,28,48,0.06)] transition-all flex flex-col">
<div className="relative h-48 overflow-hidden">
<img alt="Physics Material" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Digital illustration of magnetic fields and atomic particles in glowing purple and blue tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUnxkL0ZbuHjMz8Ov_x0RrwpdaSCENWhPmr0yKlsu18fVUKmQreQDwx3i_GQkfQvS6j2ZxdybkJJ87Ctcf939ALNkP-eec46HgsURqfbcuqY9P733w-giFd3SV_RLCeos-rSJj-cQ3BJ_TQPQdaYRqHjXn_DTbuD-aWar8Kin-YyjbANnuxq0WRom6X8V8YU4urEYaS5k76dUFHiU5RjOZJp3QHp8BFUaMIKvAiJUB2K9JZ8F3UFKREoM8d3rimlwlUlKEOWY4Eg"/>
<div className="absolute top-3 left-3 flex gap-2">
<span className="bg-red-600/90 text-white text-2xs font-bold px-2 py-1 rounded uppercase tracking-wide backdrop-blur-sm">PDF Guide</span>
<span className="bg-surface-container-lowest/90 text-on-surface text-2xs font-bold px-2 py-1 rounded uppercase tracking-wide backdrop-blur-sm">Advanced</span>
</div>
</div>
<div className="p-6 flex-1 flex flex-col">
<div className="flex items-center gap-2 mb-2">
<span className="text-xs font-bold text-primary uppercase">Physics</span>
<span className="w-1 h-1 bg-slate-300 rounded-full"/>
<span className="text-xs font-medium text-slate-500">Quantum Theory</span>
</div>
<h4 className="font-manrope font-bold text-lg mb-3 leading-tight group-hover:text-primary transition-colors">The Particle-Wave Duality and Uncertainty Principle</h4>
<div className="mt-auto flex items-center justify-between">
<div className="flex items-center gap-2 text-slate-500">
<span className="material-symbols-outlined text-sm">schedule</span>
<span className="text-xs font-medium">1.5 hours</span>
</div>
<button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                                    Open Material <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-lg overflow-hidden group hover:shadow-[0px_12px_32px_rgba(11,28,48,0.06)] transition-all flex flex-col">
<div className="relative h-48 overflow-hidden">
<img alt="Mathematics material" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Chalkboard filled with complex mathematical equations, calculus, and geometry diagrams in a soft-focus classroom setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOzR-OFqqfDiWAyakLs9Ad4qu2NkcOfIDky53h0QrZ7638HwIDa6LEXVku1tbtvGCjcyBk94Q3Vf7QSrM8eYTapsk782R72Wo7kRMi59yj41GxQNBeEKBs6DgQIa3UwWZD3XpV2cYmfCD57YO7J1WZrqEhHOphRfBwq2e8qZ9qVB2k2beFHK5PIw98cAWDepjFVZTi49_wLWhKfb50Nl4ZmZemF_E6vNPcZGWCi_9pGM1Z2FHFjZVq4U4NmWKTBTDbD6SaIW5lgw"/>
<div className="absolute top-3 left-3 flex gap-2">
<span className="bg-amber-500/90 text-white text-2xs font-bold px-2 py-1 rounded uppercase tracking-wide backdrop-blur-sm">Slides</span>
<span className="bg-surface-container-lowest/90 text-on-surface text-2xs font-bold px-2 py-1 rounded uppercase tracking-wide backdrop-blur-sm">Intermediate</span>
</div>
</div>
<div className="p-6 flex-1 flex flex-col">
<div className="flex items-center gap-2 mb-2">
<span className="text-xs font-bold text-primary uppercase">Mathematics</span>
<span className="w-1 h-1 bg-slate-300 rounded-full"/>
<span className="text-xs font-medium text-slate-500">Calculus II</span>
</div>
<h4 className="font-manrope font-bold text-lg mb-3 leading-tight group-hover:text-primary transition-colors">Integration Techniques: Parts, Trig Sub, and Partial Fractions</h4>
<div className="mt-auto flex items-center justify-between">
<div className="flex items-center gap-2 text-slate-500">
<span className="material-symbols-outlined text-sm">schedule</span>
<span className="text-xs font-medium">30 mins</span>
</div>
<button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                                    Open Material <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-lg overflow-hidden group hover:shadow-[0px_12px_32px_rgba(11,28,48,0.06)] transition-all flex flex-col">
<div className="relative h-48 overflow-hidden">
<img alt="Web Development material" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Modern high-resolution code editor screen showing clean HTML and CSS structure with dark theme" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFMfhNboRYR7hV6ZUlMZYf7f71c2f95PercxhFn-hx_YBhMtvYTL6JOkQJjFk590Zsl3nlFdZ1nJAHm0bAL9Tpy7c6p4iWBvMVqeETtAWaXyAu6w9Akhv5yFaTWSOXDnw4d8lL-Fb7cDAD1x2eWlY4fd83X0ltBUyGSKxdSYuzNaSkSWmdaQcFHSJ2tvNgu8Cy5Ys9Q_BxjLjW1Hq2wlJDxdfaxjstwV1zWCTW-qy5Ao8zsdFl6dD8-U8Ih8i6UICr_91YiIXcyA"/>
<div className="absolute top-3 left-3 flex gap-2">
<span className="bg-emerald-600/90 text-white text-2xs font-bold px-2 py-1 rounded uppercase tracking-wide backdrop-blur-sm">Worksheet</span>
<span className="bg-surface-container-lowest/90 text-on-surface text-2xs font-bold px-2 py-1 rounded uppercase tracking-wide backdrop-blur-sm">Intermediate</span>
</div>
</div>
<div className="p-6 flex-1 flex flex-col">
<div className="flex items-center gap-2 mb-2">
<span className="text-xs font-bold text-primary uppercase">Web Dev</span>
<span className="w-1 h-1 bg-slate-300 rounded-full"/>
<span className="text-xs font-medium text-slate-500">CSS Architecture</span>
</div>
<h4 className="font-manrope font-bold text-lg mb-3 leading-tight group-hover:text-primary transition-colors">Tailwind CSS vs. BEM: Styling Modern Web Interfaces</h4>
<div className="mt-auto flex items-center justify-between">
<div className="flex items-center gap-2 text-slate-500">
<span className="material-symbols-outlined text-sm">schedule</span>
<span className="text-xs font-medium">20 mins</span>
</div>
<button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                                    Open Material <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
</section>
</div>

    </MainLayout>
  );
}

