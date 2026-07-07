import React, { useContext } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserInputContext } from "@/_context/UserInputContext";
import { Lightbulb, PenLine } from "lucide-react";

function TopicDescription() {
  const { userCourseInput, setUserCourseInput } =
    useContext(UserInputContext);

  const handleInputChange = (fieldName, value) => {
    setUserCourseInput((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return (
    <div className="px-3 py-6 sm:px-6 sm:py-10 md:px-10">
      <div className="mx-auto max-w-3xl space-y-7 rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50 dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <Lightbulb className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white md:text-3xl">
            What do you want to learn?
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 md:text-base">
            Add a topic and a little context so the AI can build a sharper
            learning path.
          </p>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:text-base">
            <PenLine className="h-4 w-4 text-blue-600" />
            Course topic
          </label>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Examples: Python for beginners, yoga basics, React hooks, DSA.
          </p>
          <Input
            className="h-12 rounded-xl border-slate-200 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            placeholder="Enter your course topic"
            defaultValue={userCourseInput?.topic}
            onChange={(e) => handleInputChange("topic", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200 sm:text-base">
            Description or goal
          </label>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Mention projects, examples, learning goals, or anything you want
            included.
          </p>
          <Textarea
            className="min-h-[130px] rounded-xl border-slate-200 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            rows={4}
            placeholder="Describe your course idea"
            defaultValue={userCourseInput?.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </div>

        <div className="rounded-2xl bg-blue-50 p-4 text-center text-sm font-medium text-blue-700">
          More context means better lessons, quizzes, and video suggestions.
        </div>
      </div>
    </div>
  );
}

export default TopicDescription;
