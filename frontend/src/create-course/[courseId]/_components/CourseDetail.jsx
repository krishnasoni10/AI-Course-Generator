import React from "react";
import { HiOutlineChartBar } from "react-icons/hi";
import { AiOutlineClockCircle } from "react-icons/ai";
import { IoBookOutline } from "react-icons/io5";
import { FaRegPlayCircle } from "react-icons/fa";

function CourseDetail({ course }) {
  return (
    <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-cyan-300/10 dark:bg-slate-900/70 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="flex items-center gap-3">
          <HiOutlineChartBar className="text-3xl sm:text-4xl text-blue-400 flex-shrink-0" />
          <div>
            <h2 className="text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
              Skill Level
            </h2>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
              {course?.level}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AiOutlineClockCircle className="text-3xl sm:text-4xl text-blue-400 flex-shrink-0" />
          <div>
            <h2 className="text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
              Duration
            </h2>
            <h2 className="break-words text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
              {course?.courseOutput?.totalDurationSpecific}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <IoBookOutline className="text-3xl sm:text-4xl text-blue-400 flex-shrink-0" />
          <div>
            <h2 className="text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
              No. of Chapters
            </h2>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
              {course?.courseOutput?.chapters?.length} Chapters
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FaRegPlayCircle className="text-3xl sm:text-4xl text-blue-400 flex-shrink-0" />
          <div>
            <h2 className="text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
              Video Included?
            </h2>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
              {course?.includeVideo ? "Yes" : "No"}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
