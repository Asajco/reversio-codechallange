"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/app/components/input";
import {
  type ReturnRequestFieldErrors,
  validateReturnRequest,
} from "@/lib/validation";

type FormValues = {
  orderId: string;
  customerEmail: string;
};

const INITIAL_VALUES: FormValues = {
  orderId: "",
  customerEmail: "",
};

type FieldName = keyof FormValues;

function getReturnUrl(values: FormValues) {
  const params = new URLSearchParams({
    orderId: values.orderId.trim(),
    email: values.customerEmail.trim(),
  });

  return `/return?${params.toString()}`;
}

export default function HomePage() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ReturnRequestFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(name: FieldName, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      return {
        ...current,
        [name]: undefined,
      };
    });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateReturnRequest(values);

    if (!result.success) {
      setErrors(result.fieldErrors);
      return;
    }

    setIsSubmitting(true);
    router.push(getReturnUrl(values));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-[28px] border border-white/60 bg-[var(--card-background)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">
            Reversio Code Challenge
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input<FieldName>
            id="orderId"
            label="Order ID"
            type="text"
            placeholder="1234567890 or gid://shopify/Order/1234567890"
            value={values.orderId}
            error={errors.orderId}
            onChange={handleChange}
          />
          <Input<FieldName>
            id="customerEmail"
            label="Customer Email"
            type="email"
            placeholder="customer@example.com"
            value={values.customerEmail}
            error={errors.customerEmail}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500 dark:bg-sky-600 dark:hover:bg-sky-500 dark:disabled:bg-slate-600"
          >
            {isSubmitting ? "Opening return page..." : "Continue"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-600/60 dark:bg-slate-800/50 dark:text-slate-300">
          This demo expects a numeric Shopify order ID or a full{" "}
          <code>gid://shopify/Order/...</code> value.
        </div>
      </section>
    </main>
  );
}
