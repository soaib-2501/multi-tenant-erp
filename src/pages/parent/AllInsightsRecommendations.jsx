import React from 'react';
import DashboardLayout from "../../components/erp/parent/DashboardLayout";
const AIInsightsRecommendations = () => {
  return (
    <DashboardLayout>
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-tertiary font-bold">
            <span className="material-symbols-outlined text-sm" data-icon="auto_awesome" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-xs tracking-widest uppercase">Intelligent Analysis</span>
          </div>
          <h2 className="text-4xl font-extrabold text-on-surface font-headline leading-tight">AI Academic Insights</h2>
          <p className="text-on-surface-variant max-w-xl">Deep-dive into Alex Rivera's cognitive progression and learning patterns powered by Academic Architect AI.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-low px-4 py-3 rounded-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
              <img alt="Alex Rivera" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjK8BFKgzhoOCnqjKRgAX9vgGvr0nm6JxfKzzcl4Rbxhm-VsdR1rdpKbcb58wwmijqlbSWdRsVfZNIVfttIRfkd_ZWQdbHKHbISpIFDgnj0USQvVte09Qmav0BPmE-JoXLapcra4TR8p6mJo5HBQ8GonRoUXwXLaaBbI0wWIo9dJocM1u1WGMQBF-ffUJOyp927fJf4MMl9ajDLyAi3rRldNsml-TWaXfxz_rFVhko5D5VFQDlNN3NuHHy3_xvcKxqYAawew_3sw"/>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Alex Rivera</p>
              <p className="text-2xs text-on-surface-variant font-medium uppercase tracking-tighter">Grade 8 • Section B</p>
            </div>
          </div>
          <button className="bg-gradient-to-r from-primary to-primary-container text-white px-5 py-3 rounded-md flex items-center gap-2 font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm" data-icon="download">download</span>
            Full Report
          </button>
        </div>
      </header>

      {/* Insights Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        
        {/* Learning Efficiency */}
        <div className="md:col-span-4 bg-surface-container-lowest p-6 rounded-lg flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-primary" data-icon="speed">speed</span>
              <span className="bg-green-100 text-green-700 text-2xs px-2 py-1 rounded font-bold">+12% vs last month</span>
            </div>
            <h3 className="text-xl font-bold font-headline mb-1">Learning Efficiency</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Alex is absorbing concepts faster during morning sessions. Information retention in STEM subjects has peaked at 88%.</p>
          </div>
          <div className="mt-6 flex items-end gap-1">
            <div className="w-full bg-slate-100 h-24 rounded-sm relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full bg-primary h-[88%] opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
            </div>
          </div>
        </div>

        {/* Concept Mastery */}
        <div className="md:col-span-8 bg-surface-container-lowest p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold font-headline">Concept Mastery</h3>
              <p className="text-sm text-on-surface-variant">Subject-wise depth of understanding based on active assessment.</p>
            </div>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="w-3 h-3 rounded-full bg-surface-variant"></span>
              <span className="w-3 h-3 rounded-full bg-surface-variant"></span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span>Mathematics: Algebra &amp; Geometry</span>
                <span className="text-primary">94%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "94%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span>Science: Molecular Biology</span>
                <span className="text-primary">72%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "72%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span>Literature: Comparative Analysis</span>
                <span className="text-primary">81%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "81%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Behavioral Insights */}
        <div className="md:col-span-5 bg-primary-container text-white p-8 rounded-lg relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-2xs font-bold uppercase mb-4">Sentiment Analysis</div>
            <h3 className="text-2xl font-bold font-headline mb-4">Behavioral Insights</h3>
            <p className="opacity-90 leading-relaxed mb-6">AI notes a high level of collaborative initiative. Alex frequently assists peers in group projects, showing strong leadership potential and emotional intelligence.</p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-primary-container bg-surface-variant"></div>
                <div className="w-8 h-8 rounded-full border-2 border-primary-container bg-secondary"></div>
                <div className="w-8 h-8 rounded-full border-2 border-primary-container bg-tertiary"></div>
              </div>
              <span className="text-xs font-medium">Top Collaborator this week</span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-9xl pointer-events-none" data-icon="psychology" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>

        {/* Personalized Study Roadmap */}
        <div className="md:col-span-7 bg-surface-container-lowest p-6 rounded-lg relative shadow-sm">
          <h3 className="text-xl font-bold font-headline mb-6">Personalized Study Roadmap</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-md">
              <div className="text-primary bg-white p-2 rounded-md shadow-sm">
                <span className="material-symbols-outlined" data-icon="auto_stories">auto_stories</span>
              </div>
              <div>
                <p className="text-sm font-bold">Focus: Science (Advanced Chemistry)</p>
                <p className="text-xs text-on-surface-variant">Bridge the gap between current mastery and semester goal.</p>
              </div>
              <span className="ml-auto text-2xs font-bold text-tertiary">NEXT WEEK</span>
            </div>
            <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-md">
              <div className="text-primary bg-white p-2 rounded-md shadow-sm">
                <span className="material-symbols-outlined" data-icon="edit_note">edit_note</span>
              </div>
              <div>
                <p className="text-sm font-bold">Creative Writing Workshop</p>
                <p className="text-xs text-on-surface-variant">Optional AI-recommended module to boost literacy scores.</p>
              </div>
              <span className="ml-auto text-2xs font-bold text-primary">ENROLLING</span>
            </div>
          </div>
        </div>

      </div>

      {/* AI Recommendations Section */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-tertiary" data-icon="lightbulb" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          <h3 className="text-2xl font-bold font-headline">AI Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-surface-container-lowest p-1 rounded-lg shadow-sm">
            <div className="p-5">
              <div className="w-full h-40 rounded-md mb-4 bg-slate-200 overflow-hidden">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhsxlPX4h1LN4O48l5h8-XaX6_vCa0611qXiX7hQvm45VDXAQmuASxrMqsqROy9wazsQIq1Yrl-l_VM9iLodM_p5zypoub6lYOnw_QbQ0gmeIPOsTmEhcnDtWI7ETvtVfuzM6PokeGVXkjlpHEQ0b4GQNaNv6X7viVQld-IpwC4lr9dYP5u8_fKnseY77fVH_IIMqyXQAV7viaZiWDFC2gLGUQBGO5x-P7oE2xF0pMO2tX4ivDI8cPnccr3RYjRm5mSTDp_wUE8A" alt="Math" />
              </div>
              <p className="text-xs font-bold text-primary uppercase tracking-tighter mb-1">Skill Enhancement</p>
              <h4 className="font-bold text-lg mb-2">Advance Mathematical Logic</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Based on Alex's quick grasp of Algebra, we suggest the 'Introduction to Calculus' bridge course starting next month.</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-1 rounded-lg shadow-sm">
            <div className="p-5">
              <div className="w-full h-40 rounded-md mb-4 bg-slate-200 overflow-hidden">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYc-hSp3GBC3kaWnYALUBIR-OqfzMA1CwI9eWRdGN0QSoOoBqJO2ONs9iqF2O4KUqxuRyPhRhN45WAdIyOcQLs5204RFRWlAJstjP7jNSWL_KTPmfL09lrQ4NIf187t9mU8RKnCsi4vaeGgRoIfEY2OLw9qNk4aUb_2mCFVsrEYQkqSU61oCHGvGEj6-8CVV0_1XI-9FHgJp0q2Mv_WtuswYiPxfaqMD151UmZlnU9Ckhs3UwaM7qy2hSYu8vrghHCulOHvsdCcw" alt="Nature" />
              </div>
              <p className="text-xs font-bold text-tertiary uppercase tracking-tighter mb-1">Wellness &amp; Balance</p>
              <h4 className="font-bold text-lg mb-2">Rest Pattern Adjustment</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Concentration levels dip on Wednesdays. Consider reducing extracurricular load mid-week to sustain high performance.</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-1 rounded-lg shadow-sm">
            <div className="p-5">
              <div className="w-full h-40 rounded-md mb-4 bg-slate-200 overflow-hidden">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAinRwCn3yxeHNlt72_xBhcYZJSZse53elr_STwuQaTJmnlmRVkJIR04aLAHmyi9J75e5DtVfolnJlrhIossddxU6noRttA3WRzC1uV1btjUvpUwXAJ0tuqLonuSlcuNQUv1uSUAGM6RK20sTxvQfi5_5Vodu8s0qSezG4LtE4AbTIuxV2NXC7bjC92jLx6sieOgJx2S_m1asBNKksAazTmsQtWM5wXdAW5CcGzVfC1w86S6NFlZ65coE1TC5J3r45UPawieAyhMA" alt="Students" />
              </div>
              <p className="text-xs font-bold text-secondary uppercase tracking-tighter mb-1">Social Growth</p>
              <h4 className="font-bold text-lg mb-2">Peer Mentorship Role</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Alex is ready to lead. We recommend the 'Junior Lab Assistant' program to build confidence and communication skills.</p>
            </div>
          </div>

        </div>
      </section>
    </div>
    </DashboardLayout>
  );
};

export default AIInsightsRecommendations;
