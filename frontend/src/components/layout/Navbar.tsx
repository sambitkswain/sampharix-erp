import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, UserCircle } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "User";
  const businessName = localStorage.getItem("name") || "System User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name"); // Clear the name on logout
    navigate("/login");
  };

  return (
    <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} Portal
        </h2>
        <p className="text-sm text-slate-500">Welcome back to Sampharix ERP</p>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-blue-600 transition-colors">
          <Bell size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        {/* Updated User Profile Section */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800">{businessName}</p>
            <p className="text-xs text-slate-500 font-semibold">{role}</p>
          </div>
          <UserCircle className="text-slate-300" size={36} />
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;