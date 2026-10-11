"use client";

import type { ComponentProps } from "react";

// Botón de envío que pide confirmación antes de enviar el formulario.
export function ConfirmSubmitButton({
  message,
  onClick,
  ...props
}: ComponentProps<"button"> & { message: string }) {
  return (
    <button
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      type="submit"
    />
  );
}
