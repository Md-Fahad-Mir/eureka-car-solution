import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("rounded-xl bg-ink/[0.07] [animation:skeleton-pulse_1.6s_ease-in-out_infinite]", className)}
      {...props}
    />
  );
}
