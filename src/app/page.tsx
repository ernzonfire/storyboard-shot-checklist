"use client";

import {
  Download,
  Plus,
  Printer,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { storyboardShots, type StoryboardShot } from "@/data/storyboard";

type Filter = "all" | "pending" | "done";
type SavedChecklist = {
  shots: StoryboardShot[];
  completed: Record<string, boolean>;
};

const STORAGE_KEY = "storyboard-shot-checklist:v2";
const LEGACY_STORAGE_KEY = "storyboard-shot-checklist:v1";

function getInitialChecklist(): SavedChecklist {
  if (typeof window === "undefined") {
    return {
      shots: storyboardShots,
      completed: {},
    };
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Partial<SavedChecklist>;

      if (Array.isArray(parsed.shots)) {
        return {
          shots: parsed.shots,
          completed: parsed.completed ?? {},
        };
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const legacyCompleted = window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (legacyCompleted) {
    try {
      return {
        shots: storyboardShots,
        completed: JSON.parse(legacyCompleted),
      };
    } catch {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }

  return {
    shots: storyboardShots,
    completed: {},
  };
}

export default function Home() {
  const [{ shots, completed }, setChecklist] =
    useState<SavedChecklist>(getInitialChecklist);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        shots,
        completed,
      }),
    );
  }, [shots, completed]);

  const completedCount = shots.filter((shot) => completed[shot.id]).length;
  const totalCount = shots.length;
  const progress = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const visibleShots = useMemo(() => {
    const pending = shots.filter((shot) => !completed[shot.id]);
    const done = shots.filter((shot) => completed[shot.id]);

    if (filter === "pending") {
      return pending;
    }

    if (filter === "done") {
      return done;
    }

    return [...pending, ...done];
  }, [completed, filter, shots]);

  function updateShot(
    id: string,
    field: keyof Omit<StoryboardShot, "id">,
    value: string | string[],
  ) {
    setChecklist((current) => ({
      ...current,
      shots: current.shots.map((shot) =>
        shot.id === id
          ? {
              ...shot,
              [field]: value,
            }
          : shot,
      ),
    }));
  }

  function toggleShot(id: string) {
    setChecklist((current) => ({
      ...current,
      completed: {
        ...current.completed,
        [id]: !current.completed[id],
      },
    }));
  }

  function addFrame() {
    const nextNumber = String(shots.length + 1).padStart(2, "0");
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `frame-${Date.now()}`;

    setChecklist((current) => ({
      ...current,
      shots: [
        ...current.shots,
        {
          id,
          frame: nextNumber,
          title: "New Frame",
          scene: "",
          setup: "",
          script: "",
          preparation: [""],
          capture: [""],
          estimatedDuration: "",
          notes: "",
        },
      ],
    }));

    setFilter("all");
  }

  function resetChecklist() {
    const confirmed = window.confirm(
      "Reset the storyboard checklist? This will restore the original frames and clear completed shots.",
    );

    if (confirmed) {
      setChecklist({
        shots: storyboardShots,
        completed: {},
      });
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      setFilter("all");
    }
  }

  function exportChecklist() {
    const payload = shots.map((shot) => ({
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
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#54706a]">
                Agent Assist storyboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[#10201e] sm:text-3xl">
                Storyboard Shot Checklist
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <ActionButton onClick={addFrame} label="New frame" icon={Plus} />
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

      <section className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#54706a]">
            Showing {visibleShots.length} {visibleShots.length === 1 ? "shot" : "shots"}
          </p>
          <p className="text-sm text-[#6a7d79]">
            Editable table. Pending rows stay first; completed rows keep their frame order below.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#c8d8d4] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
              <thead className="sticky top-[186px] z-10 bg-[#eaf2ef] text-xs uppercase tracking-[0.12em] text-[#49635e]">
                <tr>
                  <Th className="w-24">Done</Th>
                  <Th className="w-24">Frame</Th>
                  <Th className="w-44">Title</Th>
                  <Th className="w-52">Scene</Th>
                  <Th className="w-64">Setup</Th>
                  <Th className="w-80">VO / Script</Th>
                  <Th className="w-72">Preparation</Th>
                  <Th className="w-72">Shots to capture</Th>
                  <Th className="w-36">Duration</Th>
                  <Th className="w-72">Notes</Th>
                </tr>
              </thead>
              <tbody>
                {visibleShots.map((shot) => {
                  const isDone = Boolean(completed[shot.id]);

                  return (
                    <tr
                      key={shot.id}
                      className={`border-t border-[#dde7e4] align-top transition ${
                        isDone ? "bg-[#f3f5f4] text-[#71827e]" : "bg-white"
                      }`}
                    >
                      <td className="p-3">
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-[#304844]">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggleShot(shot.id)}
                            className="size-5 accent-[#0f766e]"
                            aria-label={`Mark frame ${shot.frame} ${isDone ? "pending" : "done"}`}
                          />
                          <span>{isDone ? "Done" : "Pending"}</span>
                        </label>
                      </td>
                      <td className="p-3">
                        <EditableInput
                          value={shot.frame}
                          label={`Frame number for ${shot.title}`}
                          onChange={(value) => updateShot(shot.id, "frame", value)}
                        />
                      </td>
                      <td className="p-3">
                        <EditableInput
                          value={shot.title}
                          label={`Title for frame ${shot.frame}`}
                          onChange={(value) => updateShot(shot.id, "title", value)}
                        />
                      </td>
                      <td className="p-3">
                        <EditableTextarea
                          value={shot.scene}
                          label={`Scene for frame ${shot.frame}`}
                          onChange={(value) => updateShot(shot.id, "scene", value)}
                          rows={3}
                        />
                      </td>
                      <td className="p-3">
                        <EditableTextarea
                          value={shot.setup}
                          label={`Setup for frame ${shot.frame}`}
                          onChange={(value) => updateShot(shot.id, "setup", value)}
                          rows={3}
                        />
                      </td>
                      <td className="p-3">
                        <EditableTextarea
                          value={shot.script}
                          label={`VO script for frame ${shot.frame}`}
                          onChange={(value) => updateShot(shot.id, "script", value)}
                          rows={5}
                        />
                      </td>
                      <td className="p-3">
                        <EditableTextarea
                          value={shot.preparation.join("\n")}
                          label={`Preparation for frame ${shot.frame}`}
                          onChange={(value) =>
                            updateShot(shot.id, "preparation", splitLines(value))
                          }
                          rows={5}
                        />
                      </td>
                      <td className="p-3">
                        <EditableTextarea
                          value={shot.capture.join("\n")}
                          label={`Shots to capture for frame ${shot.frame}`}
                          onChange={(value) =>
                            updateShot(shot.id, "capture", splitLines(value))
                          }
                          rows={5}
                        />
                      </td>
                      <td className="p-3">
                        <EditableInput
                          value={shot.estimatedDuration}
                          label={`Duration for frame ${shot.frame}`}
                          onChange={(value) =>
                            updateShot(shot.id, "estimatedDuration", value)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <EditableTextarea
                          value={shot.notes}
                          label={`Notes for frame ${shot.frame}`}
                          onChange={(value) => updateShot(shot.id, "notes", value)}
                          rows={5}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function splitLines(value: string) {
  return value.split("\n");
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
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

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`border-r border-[#d3dfdc] px-3 py-3 font-semibold ${className}`}>
      {children}
    </th>
  );
}

function EditableInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-10 w-full rounded-md border border-[#cbd9d5] bg-white px-3 py-2 text-sm text-[#203431] shadow-inner outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#bfe3dc]"
    />
  );
}

function EditableTextarea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <textarea
      aria-label={label}
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-y rounded-md border border-[#cbd9d5] bg-white px-3 py-2 text-sm leading-5 text-[#203431] shadow-inner outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#bfe3dc]"
    />
  );
}
