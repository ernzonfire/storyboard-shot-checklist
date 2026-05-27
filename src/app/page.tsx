"use client";

import {
  CheckCircle2,
  Circle,
  Download,
  Printer,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { storyboardShots } from "@/data/storyboard";

type Filter = "all" | "pending" | "done";

const STORAGE_KEY = "storyboard-shot-checklist:v1";

export default function Home() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return {};
    }

    try {
      return JSON.parse(saved);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return {};
    }
  });
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const completedCount = storyboardShots.filter((shot) => completed[shot.id]).length;
  const totalCount = storyboardShots.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  const visibleShots = useMemo(() => {
    const pending = storyboardShots.filter((shot) => !completed[shot.id]);
    const done = storyboardShots.filter((shot) => completed[shot.id]);
    const ordered = [...pending, ...done];

    if (filter === "pending") {
      return pending;
    }

    if (filter === "done") {
      return done;
    }

    return ordered;
  }, [completed, filter]);

  function toggleShot(id: string) {
    setCompleted((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function resetChecklist() {
    const confirmed = window.confirm(
      "Reset the storyboard checklist? This will clear all completed shots.",
    );

    if (confirmed) {
      setCompleted({});
      window.localStorage.removeItem(STORAGE_KEY);
      setFilter("all");
    }
  }

  function exportChecklist() {
    const payload = storyboardShots.map((shot) => ({
      ...shot,
      done: Boolean(completed[shot.id]),
    }));
    const file = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "storyboard-shot-checklist.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f4f7f6] text-[#132120]">
      <section className="sticky top-0 z-20 border-b border-[#d8e1de] bg-[#f4f7f6]/95 backdrop-blur no-print">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#54706a]">
                Agent Assist storyboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#10201e] sm:text-3xl">
                Storyboard Shot Checklist
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <ActionButton onClick={exportChecklist} label="Export JSON" icon={Download} />
              <ActionButton onClick={() => window.print()} label="Print" icon={Printer} />
              <ActionButton onClick={resetChecklist} label="Reset" icon={RotateCcw} />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="rounded-lg border border-[#d8e1de] bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-[#304844]">
                  {completedCount} / {totalCount} shots completed
                </p>
                <p className="font-mono text-sm font-semibold text-[#0f5d58]">
                  {progress}%
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dbe5e2]">
                <div
                  className="h-full rounded-full bg-[#0f766e] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 rounded-lg border border-[#d8e1de] bg-white p-1 shadow-sm">
              {(["all", "pending", "done"] as Filter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${
                    filter === option
                      ? "bg-[#10201e] text-white"
                      : "text-[#526a65] hover:bg-[#eef4f2] hover:text-[#10201e]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#54706a]">
            Showing {visibleShots.length} {visibleShots.length === 1 ? "shot" : "shots"}
          </p>
          <p className="text-sm text-[#6a7d79]">
            Pending shots stay first; completed shots keep their storyboard order below.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {visibleShots.map((shot) => {
            const isDone = Boolean(completed[shot.id]);

            return (
              <article
                key={shot.id}
                className={`print-break-inside-avoid rounded-lg border bg-white p-4 shadow-sm transition sm:p-5 ${
                  isDone
                    ? "border-[#dde4e1] opacity-60"
                    : "border-[#c8d8d4] shadow-[#d5dfdc]/60"
                }`}
              >
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => toggleShot(shot.id)}
                    className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#cbd9d5] text-[#0f766e] transition hover:bg-[#ecf5f3] focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:ring-offset-2 no-print"
                    aria-label={
                      isDone
                        ? `Mark frame ${shot.frame} as pending`
                        : `Mark frame ${shot.frame} as done`
                    }
                  >
                    {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                          Frame {shot.frame}
                        </p>
                        <h2 className="mt-1 text-xl font-semibold text-[#10201e]">
                          {shot.title}
                        </h2>
                      </div>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          isDone
                            ? "bg-[#e8eeee] text-[#61716d]"
                            : "bg-[#dff3ef] text-[#0f5d58]"
                        }`}
                      >
                        {isDone ? "Done" : "Pending"}
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-4">
                      <InfoRow label="Scene" value={shot.scene} />
                      <InfoRow label="Setup" value={shot.setup} />
                      <InfoList label="Preparation" items={shot.preparation} />
                      <InfoList label="Shots to capture" items={shot.capture} />
                      <InfoRow label="Estimated duration" value={shot.estimatedDuration} />
                      <InfoRow label="Notes" value={shot.notes} />
                    </dl>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Download;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c7d6d2] bg-white px-3 text-sm font-medium text-[#203431] shadow-sm transition hover:bg-[#eef4f2] focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:ring-offset-2"
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7f7a]">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 text-[#263936]">{value}</dd>
    </div>
  );
}

function InfoList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7f7a]">
        {label}
      </dt>
      <dd className="mt-2">
        <ul className="grid gap-1.5 text-sm leading-6 text-[#263936]">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#0f766e]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}
