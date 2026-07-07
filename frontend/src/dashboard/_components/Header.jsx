import React from "react";
import ThemeToggle from "@/_components/ThemeToggle";
import BrandLogo from "@/_components/BrandLogo";

function Header() {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-xl dark:border-cyan-300/10 dark:bg-slate-950/85 dark:shadow-[0_0_35px_rgba(34,211,238,0.08)]">
      <BrandLogo />
      <ThemeToggle />
    </div>
  );
}

export default Header;
