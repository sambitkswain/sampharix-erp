
import { Link, useLocation } from "react-router-dom";
import { Box, LayoutDashboard, Users, Package, ShoppingCart, Settings, Receipt } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const role = localStorage.getItem("role") || "GUEST";

  // Define navigation links based on role
  const getLinks = () => {
    switch (role) {
      case "ADMIN":
        return [
          { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
          { name: "Network Users", path: "/admin/users", icon: Users },
        ];
      case "DISTRIBUTOR":
        return [
          { name: "Inventory", path: "/distributor", icon: Package },
          { name: "Retailer Orders", path: "/distributor/orders", icon: ShoppingCart },
        ];
      case "RETAILER":
        return [
          { name: "Operations", path: "/retailer", icon: LayoutDashboard },
          { name: "Invoices", path: "/retailer/invoices", icon: Receipt },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="w-[280px] h-screen bg-slate-900 text-slate-300 flex flex-col font-sans">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Box className="text-blue-500 w-8 h-8" />
          <h1 className="text-xl font-bold text-white tracking-wide">Sampharix</h1>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/50" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Settings / Footer */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-slate-800 hover:text-white w-full text-left">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;