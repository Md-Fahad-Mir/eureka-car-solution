import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Hairline-bordered surface with an 20px radius and an optional restrained hover lift. */
export function Card({
  interactive,
  tone = "light",
  className,
  ...props
}: ComponentProps<"div"> & { interactive?: boolean; tone?: "light" | "plain" | "dark" }) {
  return (
    <div
      className={cn(
        "rounded-card border",
        tone === "light" && "border-line bg-bg-alt",
        tone === "plain" && "border-line bg-transparent",
        tone === "dark" && "on-dark border-line-on-dark bg-white/[0.03] text-on-dark",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_18px_40px_-24px_rgba(22,26,22,0.35)]",
        className,
      )}
      {...props}
    />
  );
}
