import React from "react";
import { Button } from "@/components/ui/button";
import { HiOutlinePuzzle } from "react-icons/hi";
import { Link } from "react-router-dom";
import EditCourseBasicinfo from "./EditCourseBasicinfo";

function CourseBasicInfo({ course, onCourseUpdated }) {
  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-cyan-300/10 dark:bg-slate-900/70 sm:p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h2 className="break-words text-xl font-black capitalize text-slate-950 dark:text-white sm:text-2xl lg:text-3xl">
              {course?.courseOutput?.courseName || "Untitled Course"}
            </h2>

            <EditCourseBasicinfo
              course={course}
              onCourseUpdated={onCourseUpdated}
            />
          </div>

          <p className="mt-3 text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
            {course?.courseOutput?.description || "No description available."}
          </p>

          <h2 className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-500 sm:text-base">
            <HiOutlinePuzzle className="flex-shrink-0" />
            {course?.category || "Uncategorized"}
          </h2>

          <Link to={`/create-course/${course?.courseId}/start`}>
            <Button className="mt-5 w-full rounded-xl bg-blue-600 px-8 hover:bg-blue-700 sm:w-auto">
              Start
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseBasicInfo;
