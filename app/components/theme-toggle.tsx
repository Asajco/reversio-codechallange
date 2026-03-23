"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "reversio-theme";

function subscribe(onStoreChange: () => void) {
  const el = document.documentElement;
  const observer = new MutationObserver(onStoreChange);
  observer.observe(el, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("storage", onStoreChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((nextDark: boolean) => {
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem(STORAGE_KEY, nextDark ? "dark" : "light");
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(!dark)}
      className="fixed top-4 right-4 z-100 inline-flex h-10 w-17 items-center rounded-full border border-slate-300/80 bg-white/90 p-1 shadow-sm backdrop-blur-sm transition hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900/90 dark:hover:border-slate-500"
    >
      <span className="sr-only">
        {dark ? "Dark mode on" : "Light mode on"}. Click to switch theme.
      </span>
      <span
        aria-hidden
        className={`pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition-transform duration-200 ease-out dark:bg-slate-700 dark:text-slate-200 ${
          dark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {dark ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </span>
    </button>
  );
}
