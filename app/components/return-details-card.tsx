import Link from "next/link";
import type { ReturnApiResponse } from "@/lib/types/return-result";
import { LabeledBlock } from "@/app/components/labeled-block";

export function ReturnDetailsCard({
  result,
  onRetry,
}: Readonly<{
  result: ReturnApiResponse;
  onRetry: () => void;
}>) {
  const ok = result.success;

  return (
    <div
      className={
        ok
          ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/35"
          : "rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/35"
      }
    >
      <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
        {ok ? "Return created" : "Return failed"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
        {result.message}
      </p>

      <div className="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
        <LabeledBlock label="Order">{result.orderName ?? "Unavailable"}</LabeledBlock>
        <LabeledBlock label="Matched Email">
          {result.matchedEmail ?? "Unavailable"}
        </LabeledBlock>
        <LabeledBlock label="Return ID">
          {result.returnId ?? "Unavailable"}
        </LabeledBlock>
        <LabeledBlock label="Return Name">
          {result.returnName ?? "Unavailable"}
        </LabeledBlock>
        <LabeledBlock label="Status">{result.status ?? "Unavailable"}</LabeledBlock>
      </div>

      {result.selectedLineItem ? (
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/70 p-4 text-sm text-slate-700 dark:border-slate-600/60 dark:bg-slate-900/50 dark:text-slate-300">
          <p className="font-medium text-slate-500 dark:text-slate-400">
            Selected line item
          </p>
          <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
            {result.selectedLineItem.name}
          </p>
          <p className="mt-1 break-all">
            Fulfillment line item:{" "}
            {result.selectedLineItem.fulfillmentLineItemId}
          </p>
          <p className="mt-1">
            Available quantity:{" "}
            {result.selectedLineItem.availableQuantity}
          </p>
        </div>
      ) : null}

      {result.userErrors && result.userErrors.length > 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/70 p-4 text-sm text-slate-700 dark:border-slate-600/60 dark:bg-slate-900/50 dark:text-slate-300">
          <p className="font-medium text-slate-500 dark:text-slate-400">
            Shopify user errors
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {result.userErrors.map((err, i) => (
              <li key={`${err.message}-${i}`}>{err.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.details ? (
        <details className="mt-4 rounded-xl border border-slate-200/70 bg-white/70 p-4 text-sm text-slate-700 dark:border-slate-600/60 dark:bg-slate-900/50 dark:text-slate-300">
          <summary className="cursor-pointer font-medium text-slate-900 dark:text-slate-100">
            Raw details
          </summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-700 dark:text-slate-400">
            {JSON.stringify(result.details, null, 2)}
          </pre>
        </details>
      ) : null}

      {!ok ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
          >
            Edit inputs
          </Link>
        </div>
      ) : null}
    </div>
  );
}
