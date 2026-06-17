import React from 'react';
import MainLayout from '../../layouts/MainLayout';

export default function HelpDesk() {
  return (
    <MainLayout title="Help Desk">
      <div className="p-8 max-w-6xl mx-auto space-y-12">

<section className="text-center space-y-6 pt-8 pb-4">
<h3 className="text-4xl md:text-5xl font-extrabold text-on-surface font-headline tracking-tight">How can we assist you today?</h3>
<p className="text-on-surface-variant max-w-2xl mx-auto text-lg">Search for articles, browse FAQs, or open a support ticket with our academic and technical teams.</p>
<div className="relative max-w-3xl mx-auto mt-10">
<div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
<span className="material-symbols-outlined text-outline" data-icon="search">search</span>
</div>
<input className="w-full bg-surface-container-low border-none rounded-xl py-5 pl-14 pr-6 text-on-surface focus:ring-2 focus:ring-surface-tint focus:bg-surface-container-lowest transition-all shadow-sm font-body" placeholder="Search for technical issues, academic policies, or billing..." type="text"/>
<div className="absolute inset-y-2 right-2">
<button className="h-full px-6 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">Search</button>
</div>
</div>
</section>
<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="group bg-surface-container-lowest p-8 rounded-lg shadow-sm border-none transition-transform hover:-translate-y-1">
<div className="w-14 h-14 bg-primary-fixed text-primary flex items-center justify-center rounded-xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
<span className="material-symbols-outlined text-[32px]" data-icon="school">school</span>
</div>
<h4 className="text-xl font-bold font-headline mb-3">Academics</h4>
<ul className="space-y-4 text-on-surface-variant text-sm">
<li className="hover:text-primary cursor-pointer flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span> Course Enrollment Procedures
              </li>
<li className="hover:text-primary cursor-pointer flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span> Grading System Explained
              </li>
<li className="hover:text-primary cursor-pointer flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span> Thesis Submission Guidelines
              </li>
</ul>
<button className="mt-8 text-primary font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              View All Academic Help <span className="material-symbols-outlined">trending_flat</span>
</button>
</div>

<div className="group bg-surface-container-lowest p-8 rounded-lg shadow-sm border-none transition-transform hover:-translate-y-1">
<div className="w-14 h-14 bg-secondary-fixed text-secondary flex items-center justify-center rounded-xl mb-6 group-hover:bg-secondary group-hover:text-white transition-colors">
<span className="material-symbols-outlined text-[32px]" data-icon="payments">payments</span>
</div>
<h4 className="text-xl font-bold font-headline mb-3">Finance</h4>
<ul className="space-y-4 text-on-surface-variant text-sm">
<li className="hover:text-primary cursor-pointer flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span> Tuition Payment Methods
              </li>
<li className="hover:text-primary cursor-pointer flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span> Scholarship Disbursement
              </li>
<li className="hover:text-primary cursor-pointer flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span> Tax Receipt Requests
              </li>
</ul>
<button className="mt-8 text-secondary font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              View All Finance Help <span className="material-symbols-outlined">trending_flat</span>
</button>
</div>

<div className="group bg-surface-container-lowest p-8 rounded-lg shadow-sm border-none transition-transform hover:-translate-y-1">
<div className="w-14 h-14 bg-tertiary-fixed text-tertiary flex items-center justify-center rounded-xl mb-6 group-hover:bg-tertiary group-hover:text-white transition-colors">
<span className="material-symbols-outlined text-[32px]" data-icon="computer">computer</span>
</div>
<h4 className="text-xl font-bold font-headline mb-3">Technical</h4>
<ul className="space-y-4 text-on-surface-variant text-sm">
<li className="hover:text-primary cursor-pointer flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span> Resetting Your Password
              </li>
<li className="hover:text-primary cursor-pointer flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span> LMS Access Issues
              </li>
<li className="hover:text-primary cursor-pointer flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">chevron_right</span> Mobile App Troubleshooting
              </li>
</ul>
<button className="mt-8 text-tertiary font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              View All Technical Help <span className="material-symbols-outlined">trending_flat</span>
</button>
</div>
</section>

<section className="grid grid-cols-1 lg:grid-cols-5 gap-10">

<div className="lg:col-span-3 bg-surface-container-lowest p-10 rounded-lg shadow-sm">
<h4 className="text-2xl font-bold font-headline mb-2 text-on-surface">Submit a Ticket</h4>
<p className="text-on-surface-variant mb-8">Can&apos;t find what you&apos;re looking for? Describe your issue and we&apos;ll get back to you within 24 hours.</p>
<form className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="text-sm font-semibold text-on-surface-variant ml-1">Category</label>
<select className="w-full bg-surface-container-low border-none rounded-md p-3 focus:ring-2 focus:ring-surface-tint">
<option>Select a category</option>
<option>Academic Issue</option>
<option>Financial Query</option>
<option>Technical Support</option>
<option>Other</option>
</select>
</div>
<div className="space-y-2">
<label className="text-sm font-semibold text-on-surface-variant ml-1">Priority</label>
<select className="w-full bg-surface-container-low border-none rounded-md p-3 focus:ring-2 focus:ring-surface-tint">
<option>Low</option>
<option>Medium</option>
<option>High (Urgent)</option>
</select>
</div>
</div>
<div className="space-y-2">
<label className="text-sm font-semibold text-on-surface-variant ml-1">Subject</label>
<input className="w-full bg-surface-container-low border-none rounded-md p-3 focus:ring-2 focus:ring-surface-tint" placeholder="Brief summary of the issue" type="text"/>
</div>
<div className="space-y-2">
<label className="text-sm font-semibold text-on-surface-variant ml-1">Detailed Description</label>
<textarea className="w-full bg-surface-container-low border-none rounded-md p-3 focus:ring-2 focus:ring-surface-tint" placeholder="Describe your problem in detail..." rows="4"/>
</div>
<div className="flex items-center justify-between pt-4">
<div className="flex items-center gap-2 text-sm text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="attach_file">attach_file</span>
<span>Attach screenshots (Optional)</span>
</div>
<button className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3 rounded-md font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20" type="submit">
                  Send Ticket
                </button>
</div>
</form>
</div>

<div className="lg:col-span-2 space-y-6">
<div className="relative overflow-hidden bg-primary p-8 rounded-lg text-white group">
<div className="absolute -right-10 -top-10 opacity-10 transition-transform group-hover:scale-125 duration-700">
<span className="material-symbols-outlined text-[200px]" data-icon="support_agent">support_agent</span>
</div>
<h4 className="text-2xl font-bold font-headline mb-4 relative z-10">Direct Support</h4>
<p className="text-primary-fixed mb-8 relative z-10">Our student support agents are available Mon-Fri, 9am - 6pm for live chat and phone assistance.</p>
<div className="space-y-4 relative z-10">
<button className="w-full glass-effect bg-white/20 text-white border border-white/30 py-4 rounded-md font-bold flex items-center justify-center gap-3 hover:bg-white/30 transition-all">
<span className="material-symbols-outlined" data-icon="chat">chat</span>
                  Start Live Chat
                </button>
<div className="flex items-center gap-4 bg-primary-container/30 p-4 rounded-lg">
<span className="material-symbols-outlined text-[24px]" data-icon="phone_in_talk">phone_in_talk</span>
<div>
<p className="text-xs text-primary-fixed uppercase tracking-widest font-bold">Call Center</p>
<p className="font-bold">+1 (800) ARCHITECT</p>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-high p-8 rounded-lg flex items-center justify-between">
<div>
<p className="text-3xl font-black font-headline text-primary">500+</p>
<p className="text-sm font-semibold text-on-surface-variant">Help Articles</p>
</div>
<div className="h-12 w-px bg-outline-variant"/>
<div className="text-right">
<p className="text-3xl font-black font-headline text-tertiary">98%</p>
<p className="text-sm font-semibold text-on-surface-variant">Satisfaction Rate</p>
</div>
</div>
</div>
</section>

<section className="bg-surface-container p-1 rounded-lg">
<div className="flex flex-col md:flex-row items-stretch bg-surface-container-lowest rounded-lg overflow-hidden">
<div className="md:w-1/3 min-h-[250px] relative">
<img alt="Digital Knowledge" className="absolute inset-0 w-full h-full object-cover" data-alt="conceptual 3D render of floating digital library books and glowing interface elements representing digital knowledge" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADyt9ZtlGnlpWSnrzWJZVW4hgzjKt71P0B0cwsy4EaIULnOdH6hY73h4t16xaq56w9At814REEylFdmQcHMHl1qSd1yl6Osw-TQjQzQsY4ShfEYFPC0bdp9Y7TsOHbMN8HaOu2UqzclAPpf6XYRrLGwzUER4a5KZg879MuuFpz9vhv4cf_7GLmzIzxsX2OKliTahO2w3EuT4tKhVkkma5YdVmzdhvRNd9Yc7auNLAr6K5pTtJwxnq-upevyJB2PIWqLrn23ZAUfQ"/>
<div className="absolute inset-0 bg-gradient-to-r from-on-surface/40 to-transparent"/>
<div className="absolute bottom-6 left-6 text-white">
<span className="bg-tertiary-container px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-widest">New Guide</span>
</div>
</div>
<div className="md:w-2/3 p-10 flex flex-col justify-center">
<h4 className="text-3xl font-bold font-headline mb-4 text-on-surface">Navigating the 2024 Academic Portal Upgrades</h4>
<p className="text-on-surface-variant text-lg mb-6 leading-relaxed">We&apos;ve introduced several new features to make your academic journey smoother. Learn about the new AI-powered schedule builder and integrated financial tracking tools.</p>
<a className="text-primary font-bold flex items-center gap-2 group" href="#">
                Read the Full Migration Guide 
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
</a>
</div>
</div>
</section>
</div>
<footer className="mt-12 px-8 py-8 border-t border-outline-variant/10 text-center">
<p className="text-xs text-on-surface-variant font-medium opacity-50">Academic Architect Help Desk &#xa9; 2024 &#x2022; Powered by The Intelligent Canvas</p>
</footer>

    </MainLayout>
  );
}

