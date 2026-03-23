import type { ReactNode } from "react";

export function LabeledBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-all text-slate-900 dark:text-slate-100">
        {children}
      </p>
    </div>
  );
}
