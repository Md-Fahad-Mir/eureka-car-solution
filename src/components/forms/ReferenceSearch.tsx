"use client";

import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** "Enter your reference" search used by finance status and service tracking. */
export function ReferenceSearch({
  id,
  label,
  hint,
  placeholder,
  submitLabel,
  value,
  onSearch,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  placeholder: string;
  submitLabel: string;
  /** The reference currently shown (from the URL); the field follows it. */
  value: string;
  onSearch: (reference: string) => void;
}) {
  const [input, setInput] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (lastValue !== value) {
    setLastValue(value);
    setInput(value);
  }

  return (
    <form
      role="search"
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const ref = input.trim().toUpperCase();
        if (ref) onSearch(ref);
      }}
    >
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="uppercase"
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      <Button type="submit" icon={<Search aria-hidden className="size-4" />}>
        {submitLabel}
      </Button>
    </form>
  );
}
