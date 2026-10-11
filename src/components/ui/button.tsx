import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "outline";
};

const variants = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  outline: "border border-line bg-surface text-ink hover:bg-brand-soft",
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:opacity-60",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
