import React from "react";
import { Clock } from "lucide-react";
import EditChapters from "./EditChapters";

function ChapterList({ course, onCourseUpdated }) {
  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-cyan-300/10 dark:bg-slate-900/70 sm:p-6">
      <h2 className="mb-4 text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">
        Edit Course Chapters
      </h2>

      <div className="space-y-4">
        {course?.courseOutput?.chapters?.map((chapter, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/60 p-4 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-cyan-300/30 dark:hover:bg-cyan-300/10 sm:flex-row"
          >
            <div className="flex items-start sm:items-center">
              <h2
                className="bg-blue-500 h-9 w-9 sm:h-10 sm:w-10 text-white rounded-full
                           flex items-center justify-center font-bold flex-shrink-0"
              >
                {index + 1}
              </h2>
            </div>

            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">
                  {chapter.chapterName}
                </h3>

                <EditChapters
                  course={course}
                  index={index}
                  onCourseUpdated={onCourseUpdated}
                />
              </div>

              <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                {chapter.about}
              </p>

              <div className="flex items-center gap-1 text-blue-500 text-xs sm:text-sm mt-2">
                <Clock className="h-4 w-4" />
                <span>{chapter.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChapterList;
