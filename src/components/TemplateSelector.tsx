"use client";

import type { TemplateId } from "@/types/invoice";

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
];

export default function TemplateSelector({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}) {
  return (
    <div className="inline-flex gap-1.5 rounded-xl border border-(--panel-border) bg-(--panel) p-1">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={value === t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold ${
            value === t.id
              ? "bg-(--accent) text-white"
              : "text-(--ink-soft) hover:text-(--accent-strong)"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
