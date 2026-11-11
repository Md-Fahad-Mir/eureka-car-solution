import { useId, type ReactElement, cloneElement, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Hover/focus tooltip. The trigger gets `aria-describedby`, so the text is
 * announced; it should supplement, never replace, a visible or aria label.
 */
export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: string;
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  side?: "top" | "bottom";
}) {
  const id = useId();
  return (
    <span className="group/tt relative inline-flex">
      {cloneElement(children, { "aria-describedby": id })}
      <span
        role="tooltip"
        id={id}
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 w-max max-w-56 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs text-bg-alt opacity-0 shadow-lg transition-opacity duration-150",
          "group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {content}
      </span>
    </span>
  );
}
