"use client";

import {
  ChevronDown,
  ChevronRight,
  Download,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  type LucideIcon,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

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

  function toggleExpanded(id: string) {
    setExpandedRows((current) => ({
      ...current,
      [id]: !current[id],
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

    setExpandedRows((current) => ({
      ...current,
      [id]: true,
    }));
    setFilter("all");
    setIsEditing(true);
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
      setExpandedRows({});
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      setFilter("all");
      setIsEditing(false);
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
              <ActionButton
                onClick={() => setIsEditing((current) => !current)}
                label={isEditing ? "Save" : "Edit"}
                icon={isEditing ? Save : Pencil}
              />
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
            {isEditing
              ? "Edit mode is on. Expand a row to edit script, prep, and capture details."
              : "View mode is on. Expand rows for details; long text has See more."}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#c8d8d4] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead className="bg-[#eaf2ef] text-xs uppercase tracking-[0.12em] text-[#49635e]">
                <tr>
                  <Th className="w-14" />
                  <Th className="w-36">Done</Th>
                  <Th className="w-24">Frame</Th>
                  <Th className="w-48">Title</Th>
                  <Th className="w-56">Scene</Th>
                  <Th className="w-72">Setup</Th>
                  <Th className="w-36">Duration</Th>
                  <Th>Notes</Th>
                </tr>
              </thead>
              <tbody>
                {visibleShots.map((shot) => {
                  const isDone = Boolean(completed[shot.id]);
                  const isExpanded = Boolean(expandedRows[shot.id]);

                  return (
                    <Fragment key={shot.id}>
                      <tr
                        className={`border-t border-[#dde7e4] align-top transition ${
                          isDone ? "bg-[#f3f5f4] text-[#71827e]" : "bg-white"
                        }`}
                      >
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(shot.id)}
                            className="flex size-9 items-center justify-center rounded-md border border-[#cbd9d5] text-[#0f766e] transition hover:bg-[#ecf5f3] focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:ring-offset-2"
                            aria-label={`${isExpanded ? "Collapse" : "Expand"} frame ${shot.frame}`}
                          >
                            {isExpanded ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </button>
                        </td>
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
                          <SummaryField
                            isEditing={isEditing}
                            value={shot.frame}
                            label={`Frame number for ${shot.title}`}
                            strong
                            onChange={(value) => updateShot(shot.id, "frame", value)}
                          />
                        </td>
                        <td className="p-3">
                          <SummaryField
                            isEditing={isEditing}
                            value={shot.title}
                            label={`Title for frame ${shot.frame}`}
                            strong
                            onChange={(value) => updateShot(shot.id, "title", value)}
                          />
                        </td>
                        <td className="p-3">
                          <SummaryField
                            isEditing={isEditing}
                            value={shot.scene}
                            label={`Scene for frame ${shot.frame}`}
                            onChange={(value) => updateShot(shot.id, "scene", value)}
                          />
                        </td>
                        <td className="p-3">
                          <SummaryField
                            isEditing={isEditing}
                            value={shot.setup}
                            label={`Setup for frame ${shot.frame}`}
                            multiline
                            onChange={(value) => updateShot(shot.id, "setup", value)}
                          />
                        </td>
                        <td className="p-3">
                          <SummaryField
                            isEditing={isEditing}
                            value={shot.estimatedDuration}
                            label={`Duration for frame ${shot.frame}`}
                            strong
                            onChange={(value) =>
                              updateShot(shot.id, "estimatedDuration", value)
                            }
                          />
                        </td>
                        <td className="p-3">
                          <SummaryField
                            isEditing={isEditing}
                            value={shot.notes}
                            label={`Notes for frame ${shot.frame}`}
                            multiline
                            onChange={(value) => updateShot(shot.id, "notes", value)}
                          />
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr
                          className={`border-t border-[#dde7e4] ${
                            isDone ? "bg-[#f7f8f7]" : "bg-[#fbfdfc]"
                          }`}
                        >
                          <td colSpan={8} className="p-4">
                            <div className="grid gap-4 lg:grid-cols-3">
                              <DetailSection
                                title="VO / Script"
                                isEditing={isEditing}
                                value={shot.script}
                                label={`VO script for frame ${shot.frame}`}
                                onChange={(value) => updateShot(shot.id, "script", value)}
                              />
                              <DetailSection
                                title="Preparation"
                                isEditing={isEditing}
                                value={shot.preparation.join("\n")}
                                label={`Preparation for frame ${shot.frame}`}
                                listItems={shot.preparation}
                                onChange={(value) =>
                                  updateShot(shot.id, "preparation", splitLines(value))
                                }
                              />
                              <DetailSection
                                title="Shots to capture"
                                isEditing={isEditing}
                                value={shot.capture.join("\n")}
                                label={`Shots to capture for frame ${shot.frame}`}
                                listItems={shot.capture}
                                onChange={(value) =>
                                  updateShot(shot.id, "capture", splitLines(value))
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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

function fieldRows(value: string, minimum: number) {
  const lineCount = value.split("\n").length;
  const softWrapCount = Math.ceil(value.length / 54);

  return Math.min(12, Math.max(minimum, lineCount, softWrapCount));
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
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`border-r border-[#d3dfdc] px-3 py-3 font-semibold ${className}`}>
      {children}
    </th>
  );
}

function SummaryField({
  isEditing,
  label,
  multiline = false,
  onChange,
  strong = false,
  value,
}: {
  isEditing: boolean;
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  strong?: boolean;
  value: string;
}) {
  if (isEditing && multiline) {
    return (
      <EditableTextarea
        value={value}
        label={label}
        onChange={onChange}
        rows={fieldRows(value, 3)}
      />
    );
  }

  if (isEditing) {
    return <EditableInput value={value} label={label} onChange={onChange} />;
  }

  return <ReadMore value={value} maxLength={strong ? 80 : 120} strong={strong} />;
}

function DetailSection({
  isEditing,
  label,
  listItems,
  onChange,
  title,
  value,
}: {
  isEditing: boolean;
  label: string;
  listItems?: string[];
  onChange: (value: string) => void;
  title: string;
  value: string;
}) {
  return (
    <section className="rounded-lg border border-[#d6e3df] bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f5d58]">
        {title}
      </h3>
      <div className="mt-3">
        {isEditing ? (
          <EditableTextarea
            value={value}
            label={label}
            onChange={onChange}
            rows={fieldRows(value, 6)}
          />
        ) : listItems ? (
          <ReadMoreList items={listItems} />
        ) : (
          <ReadMore value={value} maxLength={180} />
        )}
      </div>
    </section>
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
      className="min-h-11 w-full rounded-md border border-[#cbd9d5] bg-white px-3 py-2 text-sm text-[#203431] shadow-inner outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#bfe3dc]"
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

function ReadMore({
  maxLength,
  strong = false,
  value,
}: {
  maxLength: number;
  strong?: boolean;
  value: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const trimmed = value.trim();

  if (!trimmed) {
    return <span className="text-[#8a9b97]">-</span>;
  }

  const shouldTruncate = trimmed.length > maxLength;
  const visibleText =
    shouldTruncate && !isExpanded
      ? `${trimmed.slice(0, maxLength).trimEnd()}...`
      : trimmed;

  return (
    <div className={`leading-6 text-[#203431] ${strong ? "font-semibold" : ""}`}>
      <span className="whitespace-pre-wrap">{visibleText}</span>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="ml-2 font-medium text-[#0f766e] hover:text-[#0a4f4a]"
        >
          {isExpanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

function ReadMoreList({ items }: { items: string[] }) {
  const visibleItems = items.filter((item) => item.trim().length > 0);

  if (!visibleItems.length) {
    return <span className="text-[#8a9b97]">-</span>;
  }

  return (
    <ul className="grid gap-2 leading-6 text-[#203431]">
      {visibleItems.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#0f766e]" />
          <ReadMore value={item} maxLength={120} />
        </li>
      ))}
    </ul>
  );
}
