"use client";

export type InputProps<T extends string> = {
  id: T;
  label: string;
  type: "text" | "email";
  placeholder: string;
  value: string;
  error?: string;
  onChange: (name: T, value: string) => void;
};

export function Input<T extends string>({
  id,
  label,
  type,
  placeholder,
  value,
  error,
  onChange,
}: Readonly<InputProps<T>>) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(id, event.target.value)}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
          error
            ? "border-red-300 bg-red-50 text-red-950 focus:border-red-400 dark:border-red-500/60 dark:bg-red-950/40 dark:text-red-100 dark:focus:border-red-400"
            : "border-slate-200 bg-white text-slate-950 focus:border-sky-400 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-500"
        }`}
      />
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
