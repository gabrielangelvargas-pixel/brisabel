export type NavItem = {
  label: string;
  href: string;
};

// Enlaces del menú lateral. Se agregan a medida que existan las páginas.
export const mainNavigation: NavItem[] = [{ label: "Inicio", href: "/" }];
