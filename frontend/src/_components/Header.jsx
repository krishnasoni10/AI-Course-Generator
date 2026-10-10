import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import BrandLogo from "./BrandLogo";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-5 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
      <BrandLogo className="shrink-0" />
      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex" aria-label="Main navigation">
        <a href="#features" className="transition hover:text-slate-950">Features</a>
        <a href="#how-it-works" className="transition hover:text-slate-950">How it works</a>
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="text-slate-700 hover:bg-slate-100"
        >
          <LogIn className="hidden h-4 w-4 sm:block" />
          Sign in
        </Button>
        <Button
          onClick={() => navigate("/signup")}
          className="bg-[#635bff] text-white hover:bg-[#5145e5]"
        >
          Get started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      </div>
    </header>
  );
}

export default Header;
