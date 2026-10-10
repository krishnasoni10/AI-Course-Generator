import React from "react";
import logoMark from "../assets/logo-square.png";

function BrandLogo({ compact = false, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
        <img
          src={logoMark}
          alt=""
          className="h-8 w-8 object-contain"
        />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-950">
            AI Course
          </p>
          <p className="text-[11px] font-medium text-slate-500">
            Generator
          </p>
        </div>
      )}
    </div>
  );
}

export default BrandLogo;
