import React, { useContext } from "react";
import { UserInputContext } from "@/_context/UserInputContext";
import CategoryList from "@/_shared/CategoryList";

function SelectCategory() {
  const { userCourseInput, setUserCourseInput } =
    useContext(UserInputContext);

  const handleCategoryChange = (Category) => {
    setUserCourseInput((prev) => ({
      ...prev,
      Category,
    }));
  };

  return (
    <div className="py-8 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <h2 className="mb-2 text-center text-2xl font-black text-slate-950 dark:text-white md:text-3xl">
          Choose your course category
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-slate-500 dark:text-slate-400">
          Pick the area you want to learn, then AI will shape the roadmap.
        </p>

        <div className="flex justify-center">
          <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:max-w-2xl sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
            {CategoryList.map((item) => {
              const isSelected = userCourseInput?.Category === item.name;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleCategoryChange(item.name)}
                  className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border bg-white p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg active:scale-95 dark:bg-white/5 dark:hover:bg-white/10 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100 dark:bg-blue-400/10 dark:ring-blue-400/20"
                      : "border-gray-200 dark:border-white/10"
                  }`}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                  />
                  <span className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectCategory;
