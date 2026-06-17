import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar(){

const navigate = useNavigate();
const location = useLocation();

const path = location.pathname;


/* route groups */

const isDashboard =
path === "/global-admin";

const isSchoolsModule =
path.startsWith("/global-admin/schools") ||
path.startsWith("/global-admin/add-school");

const isDomainModule =
path.startsWith("/global-admin/domains") ||
path.startsWith("/global-admin/add-domain");

const isSubscriptionModule =
path.startsWith("/global-admin/subscriptions") ||
path.startsWith("/global-admin/create-plan");

const isSettingsModule =
path.startsWith("/global-admin/settings") ||
path.startsWith("/global-admin/ai-config") ||
path.startsWith("/global-admin/payment") ||
path.startsWith("/global-admin/email") ||
path.startsWith("/global-admin/security");



/* reusable class */

const navItem = (active) => `
flex items-center gap-3
px-4 py-3
rounded-lg
cursor-pointer
transition-all
duration-150

${active
? "bg-white text-[#0058be] font-semibold shadow-sm"
: "text-gray-600 hover:bg-blue-100/50"}
`;

const handleLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  navigate('/');
};


return(

<nav className="fixed left-0 top-0 h-screen w-64 p-4 bg-[#f3f6ff] border-r flex flex-col">

{/* logo */}

<div className="mb-8 px-2">

<h1 className="text-xl font-bold text-[#0058be]">
Academic Architect
</h1>

</div>



{/* menu */}

<div className="flex flex-col gap-2 flex-1">

{/* Dashboard */}

<div
onClick={()=>navigate("/global-admin")}
className={navItem(isDashboard)}
>

<span className="material-symbols-outlined">
dashboard
</span>

Dashboard

</div>



{/* Schools */}

<div
onClick={()=>navigate("/global-admin/schools")}
className={navItem(isSchoolsModule)}
>

<span className="material-symbols-outlined">
school
</span>

Schools

</div>



{/* Domains */}

<div
onClick={()=>navigate("/global-admin/domains")}
className={navItem(isDomainModule)}
>

<span className="material-symbols-outlined">
dns
</span>

Domains

</div>



{/* Subscriptions */}

<div
onClick={()=>navigate("/global-admin/subscriptions")}
className={navItem(isSubscriptionModule)}
>

<span className="material-symbols-outlined">
payments
</span>

Subscriptions

</div>



{/* Settings */}

<div
onClick={()=>navigate("/global-admin/settings")}
className={navItem(isSettingsModule)}
>

<span className="material-symbols-outlined">
settings
</span>

Settings

</div>


</div>



{/* user profile + logout */}

<div className="bg-white p-3 rounded-lg shadow-sm">
  <div className="flex items-center gap-3 mb-3">

    <div className="w-10 h-10 rounded-full bg-[#dce9ff] flex items-center justify-center">

      <span className="material-symbols-outlined text-[#0058be]">
      person
      </span>

    </div>

    <div>

      <p className="text-sm font-semibold">
      Global Admin
      </p>

      <p className="text-xs text-gray-500">
      System Admin
      </p>

    </div>

  </div>

  <button
    onClick={handleLogout}
    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-semibold"
  >
    <span className="material-symbols-outlined text-lg">logout</span>
    Log Out
  </button>
</div>



</nav>

);

}
