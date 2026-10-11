import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

type FieldBaseProps = {
  label: string;
  error?: string;
  hint?: string;
};

const controlClass =
  "w-full rounded-md border border-line bg-surface px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const errorClass = "border-accent focus:border-accent focus:ring-accent/20";

// Etiqueta + control + ayuda o error, con los atributos ARIA conectados.
function FieldShell({
  label,
  error,
  hint,
  controlId,
  children,
}: FieldBaseProps & { controlId: string; children: (describedBy?: string) => ReactNode }) {
  const message = error ?? hint;
  const messageId = `${controlId}-message`;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={controlId}>
        {label}
      </label>
      {children(message ? messageId : undefined)}
      {message ? (
        <p className={cn("text-xs", error ? "text-accent" : "text-muted")} id={messageId}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function Field({ label, error, hint, className, id, name, ...props }: FieldBaseProps & ComponentProps<"input">) {
  const controlId = id ?? name ?? label;

  return (
    <FieldShell controlId={controlId} error={error} hint={hint} label={label}>
      {(describedBy) => (
        <input
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(controlClass, "h-11", error && errorClass, className)}
          id={controlId}
          name={name}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  className,
  id,
  name,
  ...props
}: FieldBaseProps & ComponentProps<"textarea">) {
  const controlId = id ?? name ?? label;

  return (
    <FieldShell controlId={controlId} error={error} hint={hint} label={label}>
      {(describedBy) => (
        <textarea
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(controlClass, "min-h-24 py-2", error && errorClass, className)}
          id={controlId}
          name={name}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  className,
  id,
  name,
  children,
  ...props
}: FieldBaseProps & ComponentProps<"select">) {
  const controlId = id ?? name ?? label;

  return (
    <FieldShell controlId={controlId} error={error} hint={hint} label={label}>
      {(describedBy) => (
        <select
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(controlClass, "h-11", error && errorClass, className)}
          id={controlId}
          name={name}
          {...props}
        >
          {children}
        </select>
      )}
    </FieldShell>
  );
}
