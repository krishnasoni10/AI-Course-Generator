import React from "react";
import { Mail, Phone, Sparkles } from "lucide-react";

function Footer() {
  return (
    <footer className="mt-20 bg-slate-950 py-12 text-white dark:border-t dark:border-white/10">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1 text-sm text-blue-200">
              <Sparkles className="h-4 w-4" />
              Built for focused learning
            </div>
            <h2 className="text-2xl font-bold">AI Course Generator</h2>
            <p className="mt-2 max-w-xs text-gray-400">
              Turn any topic into a structured, motivating study path with
              notes, videos, quizzes, and PDF exports.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-2 text-lg font-semibold">Contact</h3>
            <p className="text-gray-300">
              Created by:{" "}
              <span className="font-medium text-white">Krishna Soni</span>
            </p>
            <p className="mt-2 flex items-center gap-2 text-gray-300">
              <Mail className="h-4 w-4 text-blue-300" />
              <a
                href="mailto:thekrishnasoni1210@gmail.com"
                className="hover:underline"
              >
                thekrishnasoni1210@gmail.com
              </a>
            </p>
            <p className="mt-2 flex items-center gap-2 text-gray-300">
              <Phone className="h-4 w-4 text-blue-300" />
              <a href="tel:+919461354040" className="hover:underline">
                9461354040
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} AI Course Generator - All Rights
          Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
