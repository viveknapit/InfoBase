import {
  Home,
  Plus,
  HelpCircle,
  Folder,
  Tags,
  Users,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function SideNavbar() {
  //const location = useLocation();

  const menu = [
    { label: "Home", icon: Home, to: "/" },
    { label: "Ask Question", icon: Plus, to: "/ask" },
    { label: "My Questions", icon: HelpCircle, to: "" },
    { label: "Categories", icon: Folder, to: "" },
    { label: "Tags", icon: Tags, to: "" },
    { label: "Users", icon: Users, to: "" },
    { label: "Settings", icon: Settings, to: "" },
  ];

  return (
    <div className="w-64 h-screen bg-white shadow-sm border-r px-4 py-6 flex flex-col gap-2">
      {menu.map((item) => {
        const Icon = item.icon;
       // const isActive = location.pathname === item.to;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-base">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}