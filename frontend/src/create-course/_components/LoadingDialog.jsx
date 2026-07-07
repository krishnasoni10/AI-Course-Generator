import React from "react";
import { BookOpenCheck, Loader2, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

function LoadingDialog({ loading, title = "Creating study material", description, progress }) {
  return (
    <AlertDialog open={loading}>
      <AlertDialogContent className="w-[92vw] max-w-sm rounded-3xl border-sky-100 bg-white p-6 text-center shadow-2xl dark:border-teal-300/10 dark:bg-slate-950 dark:shadow-[0_0_45px_rgba(45,212,191,0.12)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="sr-only">Loading</AlertDialogTitle>

          <div className="flex flex-col items-center gap-5 py-3">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 text-sky-700 dark:bg-teal-300/10 dark:text-teal-200">
              <BookOpenCheck className="h-9 w-9" />
              <Loader2 className="absolute -right-1 -top-1 h-6 w-6 animate-spin text-teal-500" />
            </div>

            <div>
              <p className="text-lg font-black text-slate-950 dark:text-white">
                {title}
              </p>
              {progress && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              )}
            </div>

            <AlertDialogDescription className="text-center text-sm text-slate-600 dark:text-slate-300">
              {description ||
                "AI is preparing notes, quizzes, and video resources for your course."}
            </AlertDialogDescription>

            {progress?.label && (
              <p className="rounded-2xl bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-800 dark:bg-teal-300/10 dark:text-teal-200">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                {progress.label}
              </p>
            )}
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LoadingDialog;
