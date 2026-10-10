type ClassValue = string | false | null | undefined;

// Une clases condicionales: cn("a", isActive && "b").
export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}
