export default function Charts(){

return(

<div className="grid lg:grid-cols-3 gap-8">

{/* growth chart */}

<div className="lg:col-span-2 bg-white p-8 rounded-xl">

<div className="flex justify-between items-center mb-8">

<div>

<h3 className="text-lg font-semibold text-[#0b1c30]">
Institution Growth
</h3>

<p className="text-sm text-gray-500 mt-1">
School onboarding velocity over the last 12 months
</p>

</div>


<div className="flex gap-2">

<button className="px-4 py-1.5 bg-[#e9effc] text-[#2563eb] text-xs font-semibold rounded-md">
YEAR
</button>

<button className="px-4 py-1.5 text-gray-400 text-xs font-semibold">
QUARTER
</button>

</div>

</div>


{/* graph container */}

<div className="w-full h-[220px] overflow-hidden">

<svg
viewBox="0 0 100 30"
className="w-full h-full"
preserveAspectRatio="none"
>

<defs>

<linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">

<stop offset="0%" stopColor="#9dbaf2"/>

<stop offset="100%" stopColor="#1e5ec9"/>

</linearGradient>

</defs>


{/* smoother professional curve */}

<path
d="M0 24 
C 15 20, 25 10, 35 14
S 55 20, 65 16
S 80 4, 100 10"
fill="none"
stroke="url(#lineGradient)"
strokeWidth="3"
strokeLinecap="round"
/>

</svg>

</div>

</div>



{/* pie chart */}

<div className="bg-white p-8 rounded-xl">

<h3 className="text-lg font-semibold text-[#0b1c30]">
Revenue Split
</h3>

<p className="text-sm text-gray-500 mt-1 mb-6">
Breakdown by subscription tier
</p>


<div className="relative w-[160px] h-[160px] mx-auto mb-6">

<div className="absolute inset-0 rounded-full border-[12px] border-[#2563eb]"></div>

<div
className="absolute inset-0 rounded-full border-[12px] border-[#7c3aed]"
style={{
clipPath:"polygon(50% 50%,0% 55%,0% 0%,50% 0%)"
}}
></div>


<div className="absolute inset-4 flex items-center justify-center">

<div className="text-center">

<h2 className="text-2xl font-semibold">
112
</h2>

<p className="text-xs text-gray-400 tracking-widest">
ACTIVE
</p>

</div>

</div>

</div>


<div className="space-y-2 text-sm">

<div className="flex justify-between">

<div className="flex items-center gap-2">

<div className="w-3 h-3 bg-[#2563eb] rounded-full"></div>

Premium Enterprise

</div>

68%

</div>


<div className="flex justify-between">

<div className="flex items-center gap-2">

<div className="w-3 h-3 bg-[#7c3aed] rounded-full"></div>

Advanced Academic

</div>

32%

</div>

</div>

</div>

</div>

)

}