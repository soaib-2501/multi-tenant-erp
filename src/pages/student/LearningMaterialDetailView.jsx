import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

export default function LearningMaterialDetailView() {
  return (
    <MainLayout title={<Link to="/student/materials" className="flex items-center gap-2 text-primary hover:text-primary-container transition-colors border border-primary/30 bg-primary/5 px-4 py-1.5 rounded-full"><span className="material-symbols-outlined text-lg">arrow_back</span> <span className="text-sm font-bold">Back to Learning Materials</span></Link>}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 space-y-4">
<div className="flex flex-wrap gap-2">
<span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">Video Lesson</span>
<span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-medium rounded-full">Difficulty: Intermediate</span>
</div>
<h2 className="text-4xl font-extrabold font-manrope text-on-surface leading-tight tracking-tight">Advanced Neural Architectures &amp; Backpropagation</h2>
<div className="flex items-center gap-6 text-on-surface-variant font-medium text-sm">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-lg">subject</span>
                            Computer Science
                        </div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-lg">topic</span>
                            Artificial Intelligence
                        </div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-lg">schedule</span>
                            45 mins
                        </div>
</div>
</div>
<div className="flex items-end justify-end gap-3 lg:pb-2">
<button className="px-6 py-3 bg-white border-outline-variant/20 border text-primary rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
<span className="material-symbols-outlined">download</span>
                        Download
                    </button>
<button className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
<span className="material-symbols-outlined" style={{ fontVariationSettings: `&apos` }}>bookmark</span>
                        Save
                    </button>
</div>
</div>

<div className="flex flex-col xl:flex-row gap-8">

<div className="flex-1 space-y-6">

<div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group">
<img alt="Video content thumbnail" className="w-full h-full object-cover opacity-80" data-alt="Abstract cinematic 3D rendering of complex glowing neural network connections in a dark digital space with blue and purple highlights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7MDKKowi3x4dX_eeFzM9_BxuC0as7uktPgnQDqxyFMRw9wPZyi89mYWuSSVWgbnkbSoIX1Tcn5D8Uj7OCGxobUl5COU5FP_yOHlRpx9xgBH4Og0D2tGAdX-1lMA2XTDWmwlv6ufXxYokiwq69KfuaQYgp2rlPdvbEN1CjHFil936ySn3RHxknB0NyW-oymA3gwk4JWXVQkX-XYbc6iBswEDdH3649ktclFBI3RQDwfr6XqVxjzcEKW6LXRqkocF10yO880iXaQA"/>

<div className="absolute inset-0 flex items-center justify-center">
<button className="w-20 h-20 bg-primary/90 text-on-primary rounded-full flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110 shadow-xl group-hover:bg-primary">
<span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: `&apos` }}>play_arrow</span>
</button>
</div>
<div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
<div className="h-1.5 w-full bg-white/20 rounded-full mb-4">
<div className="h-full w-1/3 bg-primary rounded-full relative">
<div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"/>
</div>
</div>
<div className="flex justify-between text-white text-xs font-medium">
<span>15:20 / 45:00</span>
<div className="flex gap-4">
<span className="material-symbols-outlined text-lg cursor-pointer">volume_up</span>
<span className="material-symbols-outlined text-lg cursor-pointer">settings</span>
<span className="material-symbols-outlined text-lg cursor-pointer">fullscreen</span>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-8 rounded-2xl space-y-4">
<h3 className="text-xl font-bold text-on-surface">About this lesson</h3>
<p className="text-on-surface-variant leading-relaxed font-body">
                            In this deep dive, we explore the mathematical foundations of modern neural networks. We&apos;ll cover the transition from simple perceptrons to multi-layer perceptrons, explaining how gradient descent drives learning through backpropagation. Essential for Grade 11 Computer Science students specializing in AI.
                        </p>
</div>
</div>

<aside className="w-full xl:w-96 space-y-6">
<div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-sm border border-outline-variant/10 space-y-6">
<div className="flex items-center gap-2 text-tertiary">
<span className="material-symbols-outlined" style={{ fontVariationSettings: `&apos` }}>auto_awesome</span>
<h3 className="font-bold text-lg">AI Smart Summary</h3>
</div>
<div className="space-y-4">
<div className="p-4 bg-slate-50 rounded-xl">
<p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Key Concepts</p>
<ul className="space-y-3">
<li className="flex items-start gap-3 text-sm text-on-surface font-medium">
<div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"/>
                                        Gradient Descent as an optimization engine.
                                    </li>
<li className="flex items-start gap-3 text-sm text-on-surface font-medium">
<div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"/>
                                        The Chain Rule in multi-layer calculus.
                                    </li>
<li className="flex items-start gap-3 text-sm text-on-surface font-medium">
<div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"/>
                                        Weight initialization strategies.
                                    </li>
</ul>
</div>
</div>
<button className="w-full py-4 bg-secondary text-on-secondary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-secondary/20">
<span className="material-symbols-outlined">psychology</span>
                            Explain simply
                        </button>
<div className="pt-6 border-t border-slate-100">
<p className="text-sm font-semibold text-on-surface mb-4">Confused? Ask the AI Tutor</p>
<div className="flex gap-2">
<input className="flex-1 bg-surface-container-low border-none rounded-lg text-sm px-4 focus:ring-2 focus:ring-primary/20" placeholder="Ask a question..." type="text"/>
<button className="p-2 bg-primary text-white rounded-lg">
<span className="material-symbols-outlined">send</span>
</button>
</div>
</div>
</div>

<div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-2xl text-white shadow-xl">
<p className="text-xs font-medium opacity-80 mb-1">UP NEXT</p>
<h4 className="font-bold text-lg mb-4">Loss Functions &amp; Regularization</h4>
<button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                            Next Recommended
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</aside>
</div>

<section className="space-y-6 pt-4">
<div className="flex items-center justify-between">
<h3 className="text-2xl font-bold text-on-surface">Related Materials</h3>
<button className="text-primary font-bold text-sm hover:underline">View All Collection</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<div className="group cursor-pointer bg-surface-container-lowest p-5 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
<div className="aspect-video bg-slate-200 rounded-xl mb-4 overflow-hidden">
<img alt="Related PDF material thumbnail" className="w-full h-full object-cover" data-alt="A futuristic laboratory scene with blue digital screens and complex mathematical equations floating in the air, soft lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxKGn27W1wgEfOUZ2fO4DXe9tIPke-3GXU3ZF0qVHlA_Vcct4khJOS9I0iOsqW3knGMV5yzjZ_NaGiY1Bku2ZpeP_2w1k0zJQwvHjxsc9db0zxZaEXjWj4jGVetzPjSjLzFX4AFJNTcGBE5s5X1FhbTKUnS5NJXb9R46F6scXLnw6v-EiHy6UnI8p0_2hUUaILHuuXensX8kfdPXvuLlgoQjzR589hgjPq-ixmghi8SAMCWkRawDXyep7kcPPE7Y1fQWO5Nvi-2g"/>
</div>
<span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-2xs font-bold rounded uppercase">PDF Guide</span>
<h4 className="font-bold text-on-surface mt-2 group-hover:text-primary transition-colors">Calculus for Neural Nets</h4>
<p className="text-xs text-on-surface-variant mt-1">12 Pages &#x2022; Supplementary</p>
</div>

<div className="group cursor-pointer bg-surface-container-lowest p-5 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
<div className="aspect-video bg-slate-200 rounded-xl mb-4 overflow-hidden">
<img alt="Related Quiz material thumbnail" className="w-full h-full object-cover" data-alt="Digital motherboard background with glowing green circuitry and data pathways, high-tech aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbeihGZhAYvge6mgck7MaulRpj8fuSPFbafSecEtkXsZ14Kn9iokUh22pfvgm2VRMi9qF2gzrp66LkmiQ0HgrvgSxeSRYxjQy8-ETGazdnuG0qaNqqkGvavp7yrCPtXhl0FhO1FFoqPtBXiHzLPB1-RatdkYT_b69sLAn2JVg4oMX8xXc17VpbtzjY_233iR7BeUi1qnFpedA9XiSh_Cqe3BwkOFu65AC94XH-kdDLrEWw8m2_-KsKjKgD_9DA5aIVwUhrHVZLyw"/>
</div>
<span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed text-2xs font-bold rounded uppercase">Practice</span>
<h4 className="font-bold text-on-surface mt-2 group-hover:text-primary transition-colors">Activation Functions Quiz</h4>
<p className="text-xs text-on-surface-variant mt-1">10 Qs &#x2022; Self Assessment</p>
</div>

<div className="group cursor-pointer bg-surface-container-lowest p-5 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
<div className="aspect-video bg-slate-200 rounded-xl mb-4 overflow-hidden">
<img alt="Related Notebook thumbnail" className="w-full h-full object-cover" data-alt="Modern clean workspace with a laptop displaying code, a coffee cup, and a plant in soft morning sunlight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT7KkaZDpiMJ1X2Ht-CzouZIgTohzRtbAOGRrCAfXzjPWBV5wNsV5lpq50i_bHF89YDgqh51j-YbvPn8mlvbzdKqoX8JdS6uvHTOYl38Xi5AFQkyHhBCTTAe90GFs9QhkfoR1_fCsAhfBy4CfW0Aa1YfLEZqsrD05g9TUqlw0d61IxB-w_VepSHVO4WHCKTlIMHu6_qJ18j5USowPkDYNV9224M-vSXHRdSThRANMs8XAPtg_5gdTeo4xs943jZEy8rVdSYdcoIg"/>
</div>
<span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-2xs font-bold rounded uppercase">Notebook</span>
<h4 className="font-bold text-on-surface mt-2 group-hover:text-primary transition-colors">Python Implementation</h4>
<p className="text-xs text-on-surface-variant mt-1">Interactive &#x2022; Lab Work</p>
</div>

<div className="group cursor-pointer bg-surface-container-lowest p-5 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
<div className="aspect-video bg-slate-200 rounded-xl mb-4 overflow-hidden">
<img alt="Related Reading thumbnail" className="w-full h-full object-cover" data-alt="Satellite view of Earth at night with interconnected lines of light representing global internet traffic, cinematic blue glow" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfEedj-hbhvxP1gBlse9reeVxldxUM6taKjoUrMEzruwPIsF3NrEFa8qHrRD0gjDJR9jrTxLl8Yp-qV6-1DDrJEs07j00MofoJe1AVDccUPBmg-p-OXi3JT0BvL1NxeFAdc3XUoQq4bqO9qMzILTKnuXXx4k91hY128HThEyDLX6So53Bp09MGWRjTl6QJyRq4VNKfbFlIHx93PUVMS2LRXpPfRIhRg_VrevSqeNIpbBncOhrYfm0j15X-zChBeRrySbNfDx75KQ"/>
</div>
<span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-2xs font-bold rounded uppercase">Reading</span>
<h4 className="font-bold text-on-surface mt-2 group-hover:text-primary transition-colors">The History of Deep Learning</h4>
<p className="text-xs text-on-surface-variant mt-1">15 min read &#x2022; Context</p>
</div>
</div>
</section>
</div>

    </MainLayout>
  );
}

