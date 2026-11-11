"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { fieldBase } from "./Input";

export type ComboboxOption = { value: string; label: string; hint?: string; disabled?: boolean };

/**
 * Searchable single-select following the WAI-ARIA combobox (list autocomplete) pattern:
 * type to filter, ↑/↓ to move, Enter to choose, Esc to close.
 */
export function Combobox({
  id,
  options,
  value,
  onValueChange,
  placeholder,
  emptyText,
  invalid,
  describedBy,
  leading,
  className,
}: {
  id?: string;
  options: ComboboxOption[];
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  invalid?: boolean;
  describedBy?: string;
  leading?: ReactNode;
  className?: string;
}) {
  const t = useTranslations("a11y");
  const autoId = useId();
  const inputId = id ?? autoId;
  const listId = `${inputId}-list`;
  const selected = options.find((o) => o.value === value) ?? null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    return q ? options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const choose = (option: ComboboxOption) => {
    if (option.disabled) return;
    onValueChange(option.value);
    setQuery(null);
    setOpen(false);
  };

  const move = (delta: number) => {
    if (!open) setOpen(true);
    setActive((i) => {
      const next = Math.max(0, Math.min(filtered.length - 1, i + delta));
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
      return next;
    });
  };

  return (
    <div className={cn("relative", className)}>
      {leading ? (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">{leading}</span>
      ) : null}
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[active] ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        placeholder={placeholder}
        value={query ?? selected?.label ?? ""}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setQuery(null);
        }}
        onKeyDown={(e) => {
          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              move(1);
              break;
            case "ArrowUp":
              e.preventDefault();
              move(-1);
              break;
            case "Home":
            case "End":
              if (!open) return;
              e.preventDefault();
              setActive(e.key === "Home" ? 0 : filtered.length - 1);
              break;
            case "Enter":
              if (!open || !filtered[active]) return;
              e.preventDefault();
              choose(filtered[active]);
              break;
            case "Escape":
              setOpen(false);
              setQuery(null);
              break;
          }
        }}
        className={cn(fieldBase, "h-12 pr-10", leading ? "pl-10" : undefined)}
      />
      <ChevronDown
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted transition-transform",
          open && "rotate-180",
        )}
      />
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        hidden={!open}
        className="absolute z-40 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-bg-alt p-1.5 shadow-[0_24px_48px_-20px_rgba(22,26,22,0.35)]"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-2.5 text-sm text-muted" role="presentation">
            {emptyText ?? t("noResults")}
          </li>
        ) : (
          filtered.map((option, i) => (
            <li
              key={option.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(option)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm",
                i === active && "bg-ink/[0.06]",
                option.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <span className="flex flex-col">
                <span>{option.label}</span>
                {option.hint ? <span className="text-xs text-muted">{option.hint}</span> : null}
              </span>
              {option.value === value ? <Check aria-hidden className="size-4 text-accent-ink" /> : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
