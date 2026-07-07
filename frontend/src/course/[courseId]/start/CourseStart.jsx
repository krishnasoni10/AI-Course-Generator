import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import { BrainCircuit, Menu } from "lucide-react";
import { apiFetch } from "@/lib/api";

function CourseStart() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedSections, setCompletedSections] = useState({});

  useEffect(() => {
    if (!courseId) return;
    const stored = localStorage.getItem(`course-progress-${courseId}`);
    setCompletedSections(stored ? JSON.parse(stored) : {});
  }, [courseId]);

  const toggleSectionDone = (chapterIndex, sectionIndex) => {
    const key = `${chapterIndex}-${sectionIndex}`;
    setCompletedSections((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem(`course-progress-${courseId}`, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await apiFetch(`/course/${courseId}`);

        if (data.success) {
          setCourse(data.data);
          if (data.data?.courseOutput?.chapters?.length > 0) {
            setSelectedChapter(data.data.courseOutput.chapters[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-slate-800 dark:bg-slate-950 dark:text-cyan-100">
        Loading your course...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 pt-[56px] transition-colors dark:bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.10),transparent_28%),#030712] md:pt-0">
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b bg-white p-4 dark:border-cyan-300/10 dark:bg-slate-950 md:hidden">
        <h2 className="truncate text-lg font-semibold dark:text-white">
          {course?.courseOutput?.courseName}
        </h2>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-md border p-2 dark:border-cyan-300/20 dark:text-white"
          aria-label="Open course chapters"
        >
          <Menu />
        </button>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:static z-50 md:z-auto
          top-0 left-0 h-full w-64
          border-r bg-white shadow-sm dark:border-teal-300/10 dark:bg-slate-950 dark:shadow-[0_0_35px_rgba(45,212,191,0.08)]
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="bg-[linear-gradient(135deg,#0f172a,#0f766e)] p-4 text-white dark:bg-[linear-gradient(135deg,#020617,#0f766e)] dark:shadow-[0_0_36px_rgba(45,212,191,0.14)]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl shadow-sm">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h2 className="line-clamp-3 text-xl font-black leading-snug">
            {course?.courseOutput?.courseName}
          </h2>
        </div>

        <div className="h-full overflow-y-auto">
          {course?.courseOutput?.chapters.map((chapter, index) => {
            const totalSections = chapter.content?.length || 0;
            const doneSections = Array.from({ length: totalSections }).filter(
              (_, sectionIndex) => completedSections[`${index}-${sectionIndex}`],
            ).length;

            return (
              <div
                key={chapter.chapterName}
                onClick={() => {
                  setSelectedChapter(chapter);
                  setIsSidebarOpen(false);
                }}
                className={`cursor-pointer transition-colors ${
                  selectedChapter?.chapterName === chapter?.chapterName
                    ? "bg-teal-600 text-white dark:bg-teal-300 dark:text-slate-950"
                    : "text-slate-800 hover:bg-teal-50 dark:text-slate-200 dark:hover:bg-teal-300/10"
                }`}
              >
                <ChapterListCard
                  chapter={chapter}
                  index={index}
                  doneSections={doneSections}
                  totalSections={totalSections}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`
          flex-1 overflow-y-auto bg-slate-50 p-4 transition-colors dark:bg-slate-950 md:p-6
          ${isSidebarOpen ? "hidden md:block" : "block"}
        `}
      >
        {selectedChapter ? (
          <ChapterContent
            chapter={selectedChapter}
            chapterIndex={course?.courseOutput?.chapters?.findIndex(
              (chapter) => chapter.chapterName === selectedChapter.chapterName,
            )}
            completedSections={completedSections}
            onToggleSectionDone={toggleSectionDone}
          />
        ) : (
          <p className="text-slate-700 dark:text-slate-200">
            Loading chapter content...
          </p>
        )}
      </div>
    </div>
  );
}

export default CourseStart;
