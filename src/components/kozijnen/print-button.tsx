"use client";

export function PrintFormButton() {
  return (
    <button type="button" className="h-12 border border-kg-navy px-4 text-[15px] font-medium" onClick={() => window.print()}>
      Deze pagina printen
    </button>
  );
}
