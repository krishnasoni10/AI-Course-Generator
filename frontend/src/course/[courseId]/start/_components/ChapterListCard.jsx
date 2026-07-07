import React from "react";
import { FaRegClock } from "react-icons/fa";
import { BookOpen, CheckCircle2, GraduationCap } from "lucide-react";

function ChapterListCard({ chapter, index, doneSections = 0, totalSections = 0 }) {
  const isDone = totalSections > 0 && doneSections === totalSections;
  const percent = totalSections > 0 ? Math.round((doneSections / totalSections) * 100) : 0;

  return (
    <div className="flex items-start gap-3 border-b border-slate-200 p-3 dark:border-white/10 sm:p-4">
      
      <div className="flex-shrink-0">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold shadow-sm ${
            isDone
              ? "bg-emerald-500 text-white"
              : "bg-white text-teal-700 dark:bg-teal-300/10 dark:text-teal-200"
          }`}
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : index === 0 ? (
            <GraduationCap className="h-5 w-5" />
          ) : (
            <BookOpen className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="truncate text-sm font-medium sm:text-base">
          {chapter.chapterName}
        </h2>

        <div className="flex items-center gap-2 text-xs sm:text-sm opacity-80 mt-1">
          <FaRegClock />
          <span>{chapter.duration}</span>
        </div>
        {totalSections > 0 && (
          <div className="mt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] opacity-75">
              {doneSections}/{totalSections} done
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChapterListCard;
