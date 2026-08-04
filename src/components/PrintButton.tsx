"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "印刷する" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white"
    >
      <Printer size={15} />
      {label}
    </button>
  );
}
