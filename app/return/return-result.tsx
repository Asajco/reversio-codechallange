"use client";

import { useEffect, useState } from "react";
import { LabeledBlock } from "@/app/components/labeled-block";
import { ReturnDetailsCard } from "@/app/components/return-details-card";
import type {
  CachedResponse,
  ResultState,
  ReturnApiResponse,
  ReturnResultProps,
} from "@/lib/types/return-result";
import {
  type ReturnRequestFieldErrors,
  validateReturnRequest,
} from "@/lib/validation";

const inflightByKey = new Map<string, Promise<CachedResponse>>();

const BAD_FORM = "The submitted values are invalid. Go back and fix the form.";

function validationErrorResponse(
  fieldErrors: ReturnRequestFieldErrors,
): ReturnApiResponse {
  return {
    success: false,
    message: BAD_FORM,
    details: { fieldErrors },
  };
}

function toResultState(cached: ReturnApiResponse): ResultState {
  return {
    status: cached.success ? "success" : "error",
    result: cached,
  };
}

function cacheKey(orderId: string, email: string) {
  return `shopify-return:${orderId}:${email.toLowerCase()}`;
}

async function fetchReturn(
  orderId: string,
  customerEmail: string,
): Promise<CachedResponse> {
  const res = await fetch("/api/returns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, customerEmail }),
  });

  let body: ReturnApiResponse;
  try {
    body = (await res.json()) as ReturnApiResponse;
  } catch {
    body = {
      success: false,
      message: "The API route returned an unreadable response.",
    };
  }

  return { status: res.status, body };
}

export default function ReturnResult({
  orderId,
  customerEmail,
}: ReturnResultProps) {
  const validation = validateReturnRequest({ orderId, customerEmail });

  const [fetchState, setFetchState] = useState<ResultState>(() =>
    validation.success
      ? { status: "loading", result: null }
      : {
          status: "error",
          result: validationErrorResponse(validation.fieldErrors),
        },
  );

  const [retryCount, setRetryCount] = useState(0);

  const displayedResult: ReturnApiResponse | null = validation.success
    ? fetchState.status === "loading"
      ? null
      : fetchState.result
    : validationErrorResponse(validation.fieldErrors);

  const showLoading = validation.success && fetchState.status === "loading";

  useEffect(() => {
    const v = validateReturnRequest({ orderId, customerEmail });
    if (!v.success) return;

    let alive = true;
    const key = cacheKey(v.data.normalizedOrderId, v.data.customerEmail);

    let pending = inflightByKey.get(key);
    if (!pending) {
      pending = fetchReturn(v.data.orderId, v.data.customerEmail);
      inflightByKey.set(key, pending);
    }

    pending
      .then((response) => {
        inflightByKey.delete(key);
        if (!alive) return;
        setFetchState(toResultState(response.body));
      })
      .catch(() => {
        inflightByKey.delete(key);
        if (!alive) return;
        setFetchState(
          toResultState({
            success: false,
            message: "The browser could not reach the local API route.",
          }),
        );
      });

    return () => {
      alive = false;
    };
  }, [orderId, customerEmail, retryCount]);

  function handleRetry() {
    const v = validateReturnRequest({ orderId, customerEmail });
    if (!v.success) return;

    const key = cacheKey(v.data.normalizedOrderId, v.data.customerEmail);
    inflightByKey.delete(key);
    setFetchState({ status: "loading", result: null });
    setRetryCount((n) => n + 1);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm sm:grid-cols-2 dark:border-slate-600/60 dark:bg-slate-800/40">
        <LabeledBlock label="Order ID">{orderId || "Missing"}</LabeledBlock>
        <LabeledBlock label="Customer Email">
          {customerEmail || "Missing"}
        </LabeledBlock>
      </div>

      {showLoading ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100">
          Creating the Shopify return...
        </div>
      ) : null}

      {displayedResult ? (
        <ReturnDetailsCard result={displayedResult} onRetry={handleRetry} />
      ) : null}
    </div>
  );
}
