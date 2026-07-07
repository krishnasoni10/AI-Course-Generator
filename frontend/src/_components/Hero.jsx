import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import robot from "../assets/robot.png";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  Trophy,
} from "lucide-react";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_18%_12%,#cffafe,transparent_26%),radial-gradient(circle_at_90%_18%,#f5d0fe,transparent_22%),linear-gradient(135deg,#ffffff,#f8fafc_58%,#ecfeff)] dark:bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(168,85,247,0.22),transparent_26%),linear-gradient(135deg,#020617,#0b1020_55%,#111827)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-70" />
      <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-screen-xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-semibold text-cyan-800 shadow-sm dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
            <Trophy className="h-4 w-4" />
            Learn faster with AI-built study paths
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
            Build a course from any topic.
            <span className="neon-text block">Study it like a game.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Generate chapters, focused notes, interactive quizzes, video
            resources, progress tracking, and printable PDFs in one learning
            workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="h-12 rounded-xl bg-slate-950 px-6 text-base font-bold text-white hover:bg-slate-800 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
            >
              Start Learning
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="h-12 rounded-xl border-cyan-200 bg-white/80 px-6 text-base font-bold hover:bg-cyan-50 dark:border-cyan-300/20 dark:bg-white/10 dark:text-white dark:hover:bg-cyan-300/10"
            >
              <PlayCircle className="h-5 w-5" />
              Continue Course
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Brain, label: "AI notes" },
              { icon: BookOpenCheck, label: "Quizzes" },
              { icon: PlayCircle, label: "Videos" },
            ].map((item) => (
              <div
                key={item.label}
                className="neon-panel flex items-center gap-3 rounded-2xl border border-white bg-white/75 p-4 backdrop-blur dark:border-cyan-300/10 dark:bg-white/10"
              >
                <item.icon className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute inset-x-8 bottom-8 h-24 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-400/20" />
          <div className="neon-panel relative rounded-[2rem] border border-white bg-white/75 p-6 backdrop-blur dark:border-cyan-300/10 dark:bg-white/10">
            <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200">
              <Sparkles className="h-6 w-6" />
            </div>
            <img
              src={robot}
              alt="AI Robot Illustration"
              className="animate-robot-float w-[320px] object-contain drop-shadow-2xl md:w-[440px]"
            />
            <div className="absolute -bottom-5 left-6 rounded-2xl border bg-white p-4 shadow-xl dark:border-cyan-300/10 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Today's quest
              </p>
              <p className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Finish 1 chapter
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
