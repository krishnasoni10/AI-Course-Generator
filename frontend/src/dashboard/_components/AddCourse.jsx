import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

function AddCourse() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseError, setCourseError] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("email");
    setUserName(name || "Learner");
    setEmail(storedEmail || "");
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!email) {
        setLoadingCourses(false);
        return;
      }

      try {
        const data = await apiFetch(
          `/course?createdBy=${encodeURIComponent(email)}`,
        );
        setCourses(data.data || []);
      } catch (error) {
        setCourseError(error.message || "Could not load saved courses.");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [email]);

  const totalChapters = useMemo(
    () =>
      courses.reduce(
        (count, course) =>
          count + (course.courseOutput?.chapters?.length || 0),
        0,
      ),
    [courses],
  );

  const stats = [
    { icon: BookOpen, label: "Courses", value: courses.length },
    { icon: Layers, label: "Chapters", value: totalChapters },
    { icon: Trophy, label: "Mode", value: "Focus" },
  ];

  return (
    <div className="space-y-8">
      <section className="neon-panel relative overflow-hidden rounded-3xl border border-cyan-100 bg-[radial-gradient(circle_at_14%_10%,#cffafe,transparent_26%),radial-gradient(circle_at_88%_14%,#f5d0fe,transparent_24%),linear-gradient(135deg,#ffffff,#f8fafc)] p-6 md:p-8 dark:border-cyan-300/10 dark:bg-[radial-gradient(circle_at_12%_10%,rgba(34,211,238,0.2),transparent_26%),radial-gradient(circle_at_88%_18%,rgba(168,85,247,0.18),transparent_24%),linear-gradient(135deg,#020617,#0f172a)]">
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-sm font-semibold text-cyan-800 shadow-sm dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Your learning cockpit
            </div>
            <h2 className="text-3xl font-black text-slate-950 md:text-5xl dark:text-white">
              Welcome, <span className="neon-text">{userName}</span>
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Create a course, generate lessons, answer quick quizzes, and
              track progress without leaving your study flow.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/create-course">
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-slate-950 px-6 font-bold text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
                >
                  Create AI Course
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <Zap className="h-4 w-4 text-violet-500" />
                Built for fast revision
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white bg-white/75 p-4 shadow-sm backdrop-blur dark:border-cyan-300/10 dark:bg-white/10"
              >
                <item.icon className="mb-3 h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                <p className="text-2xl font-black text-slate-950 dark:text-white">
                  {item.value}
                </p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              Your Courses
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Continue studying or update a generated outline.
            </p>
          </div>
        </div>

        {loadingCourses ? (
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
            Loading saved courses...
          </p>
        ) : courseError ? (
          <p className="mt-6 text-sm text-red-600">{courseError}</p>
        ) : courses.length === 0 ? (
          <div className="neon-panel mt-6 rounded-2xl border border-dashed border-cyan-200 bg-white p-8 text-center dark:border-cyan-300/20 dark:bg-white/5">
            <BookOpen className="mx-auto h-10 w-10 text-cyan-600 dark:text-cyan-300" />
            <h3 className="mt-3 font-bold text-slate-950 dark:text-white">
              No saved courses yet
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Create your first AI course and it will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.courseId}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl dark:border-cyan-300/10 dark:bg-white/5 dark:hover:border-cyan-300/30"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="line-clamp-2 text-lg font-bold text-slate-950 dark:text-white">
                  {course.courseOutput?.courseName || course.name}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                  {course.courseOutput?.description || "No description saved."}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    {course.courseOutput?.chapters?.length || 0} Chapters
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.courseOutput?.totalDurationSpecific || "N/A"}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link
                    to={`/create-course/${course.courseId}/start`}
                    className="w-full"
                  >
                    <Button className="w-full bg-cyan-700 text-white hover:bg-cyan-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">
                      <PlayCircle className="h-4 w-4" />
                      Start
                    </Button>
                  </Link>
                  <Link to={`/create-course/${course.courseId}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {[
          {
            icon: Target,
            title: "Give the topic",
            desc: "Choose category, level, duration, and chapter count.",
          },
          {
            icon: Sparkles,
            title: "Generate lessons",
            desc: "AI creates notes, quiz cards, videos, and a study path.",
          },
          {
            icon: CheckCircle2,
            title: "Track progress",
            desc: "Mark sections done and keep momentum visible.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-300/10 dark:bg-white/5"
          >
            <item.icon className="mb-4 h-6 w-6 text-violet-600 dark:text-violet-300" />
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {item.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default AddCourse;
