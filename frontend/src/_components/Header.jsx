import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import BrandLogo from "./BrandLogo";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-5 py-3 shadow-sm backdrop-blur-xl dark:border-cyan-300/10 dark:bg-slate-950/85 dark:shadow-[0_0_35px_rgba(34,211,238,0.08)]">
      <BrandLogo />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="dark:text-slate-100 dark:hover:bg-white/10"
        >
          <LogIn className="h-4 w-4" />
          Login
        </Button>
        <Button
          onClick={() => navigate("/signup")}
          className="bg-slate-950 text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
        >
          <Sparkles className="h-4 w-4" />
          Get Started
        </Button>
      </div>
    </header>
  );
}

export default Header;
