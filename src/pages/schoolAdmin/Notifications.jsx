import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useState } from "react";

export default function Notifications(){

const [filter,setFilter]=useState("all");

const notifications=[
{
id:1,
type:"student",
title:"New Student Registered",
desc:"Emma Wilson has been added to Grade 8-A",
time:"2 min ago",
read:false,
icon:"school",
color:"bg-[#e5eeff] text-[#0058be]"
},

{
id:2,
type:"teacher",
title:"Teacher Assigned",
desc:"Dr. Robert Miller assigned to Physics",
time:"1 hour ago",
read:false,
icon:"person",
color:"bg-[#e9ddff] text-[#6b38d4]"
},

{
id:3,
type:"alert",
title:"Attendance Alert",
desc:"High absence rate detected in Class 9-B",
time:"3 hours ago",
read:true,
icon:"warning",
color:"bg-[#ffdad6] text-[#ba1a1a]"
},

{
id:4,
type:"system",
title:"System Update",
desc:"New grading feature added",
time:"Yesterday",
read:true,
icon:"settings",
color:"bg-[#eff4ff] text-[#0058be]"
},

{
id:5,
type:"mapping",
title:"Parent Mapping Complete",
desc:"Parent linked successfully with student",
time:"Yesterday",
read:false,
icon:"diversity_1",
color:"bg-[#e5eeff] text-[#0058be]"
}

];

const filtered=
filter==="all"
?notifications
:notifications.filter(n=>
filter==="unread"
?!n.read
:n.type==="alert"
);

return(

<SchoolLayout title="Notifications">

<div className="max-w-5xl mx-auto">


{/* header */}

<div className="flex justify-between items-center mb-8">

<div>

<h1 className="text-3xl font-bold mb-1">
Notifications
</h1>

<p className="text-[#6b7280]">
Track system alerts and updates
</p>

</div>



<button className="text-sm font-semibold text-[#0058be]">
Mark all as read
</button>

</div>



{/* filters */}

<div className="flex gap-4 mb-8">

{[
{key:"all",label:"All"},
{key:"unread",label:"Unread"},
{key:"alert",label:"Alerts"}
].map(item=>(

<button
key={item.key}
onClick={()=>setFilter(item.key)}
className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
filter===item.key
?"bg-[#0058be] text-white"
:"bg-[#eff4ff] text-[#0b1c30]"
}`}>

{item.label}

</button>

))}

</div>



{/* list */}

<div className="space-y-4">


{filtered.map(n=>(

<div
key={n.id}
className={`bg-white p-5 rounded-lg shadow-sm flex gap-4 items-start border ${
!n.read?"border-[#0058be]/30":"border-transparent"
}`}>

{/* icon */}

<div className={`w-10 h-10 rounded-md flex items-center justify-center ${n.color}`}>

<span className="material-symbols-outlined text-lg">
{n.icon}
</span>

</div>



{/* content */}

<div className="flex-1">

<p className="font-semibold text-[#0b1c30]">
{n.title}
</p>

<p className="text-sm text-[#6b7280] mt-1">
{n.desc}
</p>

<p className="text-xs text-[#9aa1b1] mt-2">
{n.time}
</p>

</div>



{/* status */}

{!n.read && (

<div className="w-2 h-2 bg-[#0058be] rounded-full mt-2"></div>

)}

</div>

))}


</div>

</div>

</SchoolLayout>

);

}