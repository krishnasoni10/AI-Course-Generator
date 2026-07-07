import React, { useRef, useState } from "react";
import { IoMdDownload } from "react-icons/io";
import {
  BookOpenCheck,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Video,
  XCircle,
} from "lucide-react";

function ChapterContent({
  chapter,
  chapterIndex = 0,
  completedSections = {},
  onToggleSectionDone,
}) {
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const pdfExportRef = useRef(null);
  const currentOrigin = window.location.origin;

  const handleDownloadPdf = async () => {
    const element = pdfExportRef.current;
    if (!element) return;

    setLoading(true);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] =
        await Promise.all([import("html2canvas"), import("jspdf")]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const styles = clonedDoc.querySelectorAll(
            'style, link[rel="stylesheet"]',
          );
          styles.forEach((s) => s.remove());

          const exportArea = clonedDoc.getElementById("pdf-export-safe-area");
          if (!exportArea) return;

          exportArea.style.background = "#ffffff";
          exportArea.style.color = "#1e293b";
          exportArea.style.fontFamily = "Arial, sans-serif";
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const pdfWidth = 210; // A4 width
      const imgProps = new Image();
      imgProps.src = imgData;

      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [pdfWidth, imgHeight],
      });

      const margin = 10;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        pdfWidth - margin * 2,
        imgHeight,
      );

      const fileName =
        chapter?.chapterName?.replace(/[^a-z0-9]/gi, "_").toLowerCase() ||
        "lesson";

      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("PDF export failed.");
    } finally {
      setLoading(false);
    }
  };

  const escapeHtml = (text = "") =>
    String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const stripCodeWrapper = (code = "") =>
    String(code)
      .replace(/<\/?pre[^>]*>/gi, "")
      .replace(/<\/?code[^>]*>/gi, "");

  const formatCode = (code) => {
    if (!code) return "";

    return stripCodeWrapper(code)
      .replace(/;/g, ";\n")
      .replace(/{/g, "{\n")
      .replace(/}/g, "\n}\n")
      .replace(/\n\s*\n/g, "\n")
      .trim();
  };

  const formatTextForPdf = (text = "") => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let html = "";
    let listBuffer = [];

    lines.forEach((line) => {
      if (/^\d+\./.test(line)) {
        listBuffer.push(escapeHtml(line.replace(/^\d+\.\s*/, "")));
      } else {
        if (listBuffer.length) {
          html += `<ol>${listBuffer.map((i) => `<li>${i}</li>`).join("")}</ol>`;
          listBuffer = [];
        }
        html += `<p style="margin-bottom:12px;">${escapeHtml(line)}</p>`;
      }
    });

    if (listBuffer.length) {
      html += `<ol>${listBuffer.map((i) => `<li>${i}</li>`).join("")}</ol>`;
    }

    return html
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /\b(int|double|boolean|char|Scanner)\b/g,
        "<code style='background:#e2e8f0;padding:2px 6px;border-radius:4px;'>$1</code>",
      );
  };

  const selectAnswer = (sectionIndex, questionIndex, option) => {
    setSelectedAnswers((current) => ({
      ...current,
      [`${sectionIndex}-${questionIndex}`]: option,
    }));
  };

  const isCorrectAnswer = (selected, answer) =>
    selected &&
    answer &&
    selected.trim().toLowerCase() === answer.trim().toLowerCase();

  const compactText = (value = "", maxLength = 150) => {
    const text = String(value)
      .replace(/_QQ_MARK_\d+[\s\S]*$/i, "")
      .replace(/(?:_#){3,}[\s\S]*$/i, "")
      .replace(/#_#_#_[\s\S]*$/i, "")
      .replace(/_QQ_MARK_\d+/gi, "")
      .replace(/(?:_#)+/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  };

  const hasVideos = chapter?.videos && chapter.videos.length > 0;
  const hasContent = chapter?.content && chapter.content.length > 0;
  const totalSections = chapter?.content?.length || 0;
  const doneSections = Array.from({ length: totalSections }).filter(
    (_, sectionIndex) => completedSections[`${chapterIndex}-${sectionIndex}`],
  ).length;
  const donePercent = totalSections
    ? Math.round((doneSections / totalSections) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-teal-300/10 dark:bg-slate-900/80 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800 dark:bg-teal-300/10 dark:text-teal-200">
            <BookOpenCheck className="h-4 w-4" />
            Study Materials
          </div>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">
            {chapter?.chapterName}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Notes, video resources, and quiz practice for this chapter.
          </p>
          {totalSections > 0 && (
            <div className="mt-4 max-w-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Chapter progress</span>
                <span>{donePercent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${donePercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          disabled={loading || !hasContent}
          onClick={handleDownloadPdf}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95 disabled:bg-slate-300 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <IoMdDownload className="text-2xl" />
          )}
          <span className="font-bold">
            {loading ? "Exporting..." : "Download PDF"}
          </span>
        </button>
        </div>
      </div>

      {!hasContent && !hasVideos && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-cyan-300/10 dark:bg-slate-900/70">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
            <Video className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">
            This chapter is waiting for content.
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Go back to the course layout and click Generate Lessons. If YouTube
            is unavailable, the app will still save AI notes and quizzes.
          </p>
        </div>
      )}

      <div>
        {hasVideos && (
          <div className="mb-10">
            <h3 className="mb-6 border-l-4 border-indigo-600 pl-4 text-2xl font-bold italic text-gray-700 dark:text-slate-200">
              Lecture Videos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {chapter.videos.filter(Boolean).map((videoId) => (
                <div
                  key={videoId}
                  className="rounded-2xl overflow-hidden shadow-xl aspect-video bg-black"
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?origin=${currentOrigin}`}
                    width="100%"
                    height="100%"
                    title="Video Player"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasContent && (
          <div className="space-y-12">
            <h3 className="border-b-2 border-gray-100 pb-3 text-2xl font-bold text-gray-800 dark:border-white/10 dark:text-white">
              Chapter Summary & Notes
            </h3>
            {chapter.content.map((item, index) => (
              <div key={index} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-teal-300/10 dark:bg-slate-900/80">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {item.title && (
                    <h4 className="text-2xl font-black text-slate-950 dark:text-white">
                      {item.title}
                    </h4>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleSectionDone?.(chapterIndex, index)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                      completedSections[`${chapterIndex}-${index}`]
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-teal-300/10"
                    }`}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    {completedSections[`${chapterIndex}-${index}`]
                      ? "Done"
                      : "Mark as done"}
                  </button>
                </div>
                {item.description && (
                  <p className="text-base leading-8 text-gray-700 dark:text-slate-300 md:text-lg">
                    <span className="dark:text-slate-300">{item.description}</span>
                  </p>
                )}
                {item.objectives?.length > 0 && (
                  <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-400/10">
                    <h5 className="font-semibold text-indigo-800 dark:text-indigo-200">
                      Learning Objectives
                    </h5>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 dark:text-slate-300">
                      {item.objectives.map((objective, objectiveIndex) => (
                        <li key={objectiveIndex}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.keyTopics?.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-slate-200">Key Topics</h5>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.keyTopics.map((topic, topicIndex) => (
                        <span
                          key={topicIndex}
                          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-white/10 dark:text-slate-200"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {item.codeExample && (
                  <div className="relative">
                    <div className="absolute top-0 right-0 bg-gray-800 text-white px-3 py-1 text-xs rounded-bl-lg uppercase font-mono z-10">
                      Code
                    </div>

                    <pre
                      className="bg-gray-900 text-green-400 p-6 rounded-2xl 
                 font-mono text-sm border-l-[6px] border-green-500 
                 shadow-inner overflow-x-hidden"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: "1.7",
                      }}
                    >
                      <code>{formatCode(item.codeExample)}</code>
                    </pre>
                  </div>
                )}
                {item.readings?.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-slate-200">
                      Suggested Readings
                    </h5>
                    <ul className="mt-2 space-y-2 text-blue-700">
                      {item.readings.map((reading, readingIndex) => (
                        <li key={readingIndex}>
                          {reading.url ? (
                            <a
                              href={reading.url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {reading.title || reading.url}
                            </a>
                          ) : (
                            <span>{reading.title}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.quiz?.length > 0 && (
                  <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-5 dark:border-teal-300/20 dark:bg-teal-300/10">
                    <h5 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                      Quick Quiz
                    </h5>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Pick an answer to reveal instant feedback.
                    </p>
                    <div className="mt-5 space-y-5">
                      {item.quiz.map((question, questionIndex) => (
                        <div
                          key={questionIndex}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-teal-300/10 dark:bg-slate-950/90"
                        >
                          <p className="text-base font-black leading-7 text-slate-950 dark:text-white">
                            {questionIndex + 1}.{" "}
                            {compactText(question.question, 145)}
                          </p>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {question.options?.map((option, optionIndex) => {
                              const key = `${index}-${questionIndex}`;
                              const selected = selectedAnswers[key];
                              const isSelected = selected === option;
                              const isCorrect = isCorrectAnswer(
                                option,
                                question.answer,
                              );
                              const hasAnswered = Boolean(selected);

                              return (
                                <button
                                  type="button"
                                  key={optionIndex}
                                  onClick={() =>
                                    selectAnswer(index, questionIndex, option)
                                  }
                                  className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                                    isSelected && isCorrect
                                      ? "border-green-400 bg-green-50 text-green-800 dark:bg-green-400/10 dark:text-green-200"
                                      : isSelected
                                        ? "border-red-400 bg-red-50 text-red-800 dark:bg-red-400/10 dark:text-red-200"
                                        : hasAnswered && isCorrect
                                          ? "border-green-300 bg-green-50/70 text-green-800 dark:bg-green-400/10 dark:text-green-200"
                                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                                  }`}
                                >
                                  {hasAnswered && isCorrect ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                  ) : isSelected ? (
                                    <XCircle className="h-4 w-4 shrink-0" />
                                  ) : (
                                    <Circle className="h-4 w-4 shrink-0" />
                                  )}
                                  {compactText(option, 80)}
                                </button>
                              );
                            })}
                          </div>

                          {selectedAnswers[`${index}-${questionIndex}`] && (
                            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-300">
                              <p className="font-bold">
                                {isCorrectAnswer(
                                  selectedAnswers[`${index}-${questionIndex}`],
                                  question.answer,
                                )
                                  ? "Correct!"
                                  : `Correct answer: ${question.answer}`}
                              </p>
                              {question.explanation && (
                                <p className="mt-1">
                                  {compactText(question.explanation, 120)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div
          ref={pdfExportRef}
          id="pdf-export-safe-area"
          style={{
            width: "800px",
            padding: "50px",
            backgroundColor: "#ffffff",
            margin: "0 auto",
          }}
        >
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#1e293b",
                borderBottom: "5px solid #2563eb",
                paddingBottom: "15px",
                marginBottom: "30px",
              }}
            >
              {chapter?.chapterName}
            </h1>

            {chapter?.videos && chapter.videos.length > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: "#475569",
                    marginBottom: "20px",
                    borderLeft: "5px solid #3b82f6",
                    paddingLeft: "15px",
                  }}
                >
                  Lecture Videos
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "25px",
                  }}
                >
                  {chapter.videos.filter(Boolean).map((videoId) => (
                    <div
                      key={videoId}
                      style={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt="Thumbnail"
                        style={{ width: "100%", display: "block" }}
                      />
                      <div
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontSize: "12px",
                          color: "#2563eb",
                          fontWeight: "bold",
                        }}
                      >
                        Scan/Click to Watch: https://youtu.be/{videoId}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: "40px" }}
            >
              {chapter?.content?.map((item, index) => (
                <div
                  key={index}
                  style={{ pageBreakInside: "avoid", marginBottom: "50px" }}
                >
                  {item.title && (
                    <h2
                      style={{
                        fontSize: "26px",
                        color: "#1d4ed8",
                        fontWeight: "bold",
                        marginBottom: "15px",
                      }}
                    >
                      {item.title}
                    </h2>
                  )}
                  {item.description && (
                    <p
                      style={{
                        fontSize: "16px",
                        color: "#334155",
                        lineHeight: "1.8",
                        marginBottom: "22px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: formatTextForPdf(item.description),
                      }}
                    />
                  )}

                  {item.objectives?.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ fontSize: "18px", color: "#1d4ed8" }}>
                        Learning Objectives
                      </h3>
                      <ul>
                        {item.objectives.map((objective, objectiveIndex) => (
                          <li key={objectiveIndex}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.codeExample && (
                    <div
                      style={{
                        backgroundColor: "#0f172a",
                        padding: "24px",
                        borderRadius: "16px",
                        borderLeft: "6px solid #22c55e",
                        overflowX: "hidden",
                      }}
                    >
                      <pre
                        style={{
                          color: "#4ade80",
                          fontFamily: "Courier New, monospace",
                          fontSize: "14px",
                          lineHeight: "1.8",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          margin: 0,
                        }}
                      >
                        <code>{formatCode(item.codeExample)}</code>
                      </pre>
                    </div>
                  )}

                  {item.quiz?.length > 0 && (
                    <div style={{ marginTop: "24px" }}>
                      <h3 style={{ fontSize: "18px", color: "#1e293b" }}>
                        Quick Quiz
                      </h3>
                      {item.quiz.map((question, questionIndex) => (
                        <div key={questionIndex} style={{ marginTop: "12px" }}>
                          <p style={{ fontWeight: "bold" }}>
                            {questionIndex + 1}. {question.question}
                          </p>
                          <p>Answer: {question.answer}</p>
                          {question.explanation && (
                            <p>{question.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "50px",
                textAlign: "center",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "20px",
                color: "#94a3b8",
                fontSize: "12px",
              }}
            >
              Generated via AI Course Generator - {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterContent;
