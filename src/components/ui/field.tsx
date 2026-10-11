import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
  hint?: string;
};

// Campo de formulario: etiqueta + input + ayuda o error.
export function Field({ label, error, hint, className, id, name, ...inputProps }: FieldProps) {
  const inputId = id ?? name;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={message ? messageId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-11 rounded-md border border-line bg-surface px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
          error && "border-accent focus:border-accent focus:ring-accent/20",
          className,
        )}
        id={inputId}
        name={name}
        {...inputProps}
      />
      {message ? (
        <p className={cn("text-xs", error ? "text-accent" : "text-muted")} id={messageId}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
