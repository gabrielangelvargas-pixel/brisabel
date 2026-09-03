"use client";

type CategoryLevelSelectOption = {
  label: string;
  slug: string;
};

type CategoryLevelSelectProps = {
  currentLabel?: string;
  currentSlug?: string;
  options: CategoryLevelSelectOption[];
};

export function CategoryLevelSelect({
  currentLabel,
  currentSlug = "",
  options,
}: CategoryLevelSelectProps) {
  const currentText = currentLabel ? `Mostrar todo: ${currentLabel}` : "Mostrar todo";

  return (
    <form action="/catalogo" className="grid gap-2">
      <label
        className="text-sm font-semibold text-[#7f4f3a]"
        htmlFor="category-selector"
      >
        Categoria
      </label>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <select
          aria-label="Seleccionar categoria"
          className="h-12 w-full min-w-0 rounded-md border border-[#d8cbbd] bg-white px-4 text-base font-semibold text-[#1f2320] shadow-sm outline-none transition focus:border-[#7f4f3a] focus:ring-2 focus:ring-[#7f4f3a]/20"
          defaultValue={currentSlug}
          id="category-selector"
          name="categoria"
          onChange={(event) => {
            event.currentTarget.form?.requestSubmit();
          }}
        >
          <option value={currentSlug}>{currentText}</option>
          {options.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          className="h-12 rounded-md bg-[#7f4f3a] px-4 text-sm font-semibold text-white shadow-sm"
          type="submit"
        >
          Ver
        </button>
      </div>
    </form>
  );
}
