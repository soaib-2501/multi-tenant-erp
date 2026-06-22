import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { navItems, secondaryNavItems } from "./navigation";

const MobileNav = () => {

const location = useLocation();
const [isMenuOpen, setIsMenuOpen] = useState(false);


/* Safe quick links (no undefined index) */

const quickLinks = [
navItems.find(item => item.label === "Dashboard"),
navItems.find(item => item.label === "My Classes"),
navItems.find(item => item.label === "Assignments"),
navItems.find(item => item.label === "Analytics")
].filter(Boolean);


/* combine all navigation items safely */

const allItems = [...navItems, ...secondaryNavItems].filter(Boolean);


return (

<>

{/* Full Menu Drawer */}

{isMenuOpen && (

<div 
className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
onClick={() => setIsMenuOpen(false)}
>

<div 
className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-20 shadow-2xl max-h-[70vh] overflow-y-auto"
onClick={(e) => e.stopPropagation()}
>

<div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-slate-900 pb-4 border-b border-gray-100 dark:border-slate-800">

<h3 className="text-lg font-bold text-gray-800 dark:text-white">
Main Menu
</h3>


<button
onClick={() => setIsMenuOpen(false)}
className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
>

<span className="material-symbols-outlined">
close
</span>

</button>

</div>



<div className="grid grid-cols-3 gap-4">

{allItems.map((item) => {

const isActive =
location.pathname.startsWith(item.path);

return (

<Link
key={item.label}
to={item.path}
onClick={() => setIsMenuOpen(false)}
className="flex flex-col items-center gap-2"
>

<div
className={`w-14 h-14 rounded-xl flex items-center justify-center transition ${
isActive
? "bg-blue-600 text-white shadow-lg"
: "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
}`}
>

<span className="material-symbols-outlined text-xl">
{item.icon}
</span>

</div>


<span
className={`text-xs font-semibold text-center line-clamp-2 ${
isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-slate-400"
}`}
>

{item.label}

</span>

</Link>

);

})}

</div>

</div>

</div>

)}



{/* Bottom Mobile Bar */}

<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-around items-center py-2 shadow-lg z-50">

{quickLinks.map((item) => {

const isActive =
location.pathname.startsWith(item.path);

return (

<Link
key={item.label}
to={item.path}
className={`flex flex-col items-center text-xs transition ${
isActive
? "text-blue-600"
: "text-gray-400 dark:text-slate-400"
}`}
>

<span className="material-symbols-outlined text-xl">

{item.icon}

</span>


<span className="text-2xs">

{item.label}

</span>

</Link>

);

})}



<button
onClick={() => setIsMenuOpen(true)}
className="flex flex-col items-center text-gray-400 dark:text-slate-400"
>

<span className="material-symbols-outlined text-xl">
more_horiz
</span>

<span className="text-2xs">
More
</span>

</button>


</nav>

</>

);

};

export default MobileNav;