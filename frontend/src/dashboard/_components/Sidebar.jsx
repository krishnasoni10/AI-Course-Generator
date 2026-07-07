import React from "react";
import { AiOutlineHome } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "@/_components/ThemeToggle";
import BrandLogo from "@/_components/BrandLogo";
const Sidebar = () => {
  const Menu = [
    { id: 1, name: "Home", icon: <AiOutlineHome />, path: "/dashboard" },
  ];

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="fixed h-full border-r border-slate-200 bg-white p-5 shadow-md md:w-64 dark:border-cyan-300/10 dark:bg-slate-950 dark:shadow-[0_0_35px_rgba(34,211,238,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <BrandLogo compact />
        <ThemeToggle />
      </div>
      <hr className="my-5 border-slate-200 dark:border-white/10" />
      <ul>
        {Menu.map((item) => (
          <li key={item.id}>
            <Link
              to={item.path}
              className={`flex cursor-pointer items-center gap-2 rounded-xl p-3 text-slate-600 transition
                hover:bg-cyan-50 hover:text-cyan-800 dark:text-slate-300 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-200
                ${
                  currentPath === item.path
                    ? "bg-cyan-50 text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-200"
                    : ""
                }`}
            >
              <div className="text-2xl">{item.icon}</div>
              <h2 className="text-lg font-medium">{item.name}</h2>
            </Link>
          </li>
        ))}
      </ul>
  
    </div>
  );
};

export default Sidebar;
