import React from "react";
import logoMark from "../assets/logo-square.png";

function BrandLogo({ compact = false, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-200/70 bg-white shadow-sm shadow-cyan-100 dark:border-cyan-300/20 dark:bg-slate-900 dark:shadow-[0_0_28px_rgba(34,211,238,0.22)]">
        <img
          src={logoMark}
          alt="AI Course Generator"
          className="h-10 w-10 object-contain"
        />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="text-base font-black tracking-normal text-slate-950 dark:text-white">
            AI Course
          </p>
          <p className="text-xs font-bold uppercase tracking-normal text-cyan-700 dark:text-cyan-300">
            Generator
          </p>
        </div>
      )}
    </div>
  );
}

export default BrandLogo;
