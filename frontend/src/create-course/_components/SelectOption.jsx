import React, { useContext } from "react";
import { UserInputContext } from "@/_context/UserInputContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, ListChecks, SlidersHorizontal } from "lucide-react";

function SelectOption() {
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
      <div className="mx-auto max-w-4xl rounded-3xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50 dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white md:text-3xl">
            Tune your course
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 md:text-base">
            Choose the learning level, duration, and number of chapters.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Difficulty level
            </label>
            <Select
              onValueChange={(value) => handleInputChange("level", value)}
              defaultValue={userCourseInput?.level}
            >
              <SelectTrigger className="h-12 rounded-xl border-slate-200 text-base dark:border-white/10 dark:bg-slate-950 dark:text-white">
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Clock className="h-4 w-4 text-blue-600" />
              Course duration
            </label>
            <Select
              onValueChange={(value) => handleInputChange("duration", value)}
              defaultValue={userCourseInput?.duration}
            >
              <SelectTrigger className="h-12 rounded-xl border-slate-200 text-base dark:border-white/10 dark:bg-slate-950 dark:text-white">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 Hour">1 Hour</SelectItem>
                <SelectItem value="2 Hours">2 Hours</SelectItem>
                <SelectItem value="More than 3 Hours">
                  More than 3 Hours
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <ListChecks className="h-4 w-4 text-blue-600" />
              Number of chapters
            </label>
            <Input
              type="number"
              min="1"
              max="12"
              className="h-12 rounded-xl border-slate-200 text-base dark:border-white/10 dark:bg-slate-950 dark:text-white"
              value={userCourseInput?.noOfChapters || ""}
              placeholder="Enter number of chapters"
              onChange={(event) =>
                handleInputChange("noOfChapters", event.target.value)
              }
            />
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-white/10 dark:text-slate-300">
          Tip: 3 to 6 chapters usually creates the cleanest course flow.
        </div>
      </div>
    </div>
  );
}

export default SelectOption;
