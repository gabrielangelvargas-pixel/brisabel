// Mensaje de error general de un formulario.
export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="rounded-md border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-accent"
      role="alert"
    >
      {children}
    </p>
  );
}
