import Link from "next/link";
import ReturnResult from "./return-result";

type ReturnPageProps = {
  searchParams: Promise<{
    orderId?: string | string[];
    email?: string | string[];
  }>;
};

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function ReturnPage({ searchParams }: ReturnPageProps) {
  const params = await searchParams;
  const orderId = getSingleValue(params.orderId);
  const customerEmail = getSingleValue(params.email);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl px-6 py-16">
      <section className="mx-auto w-full max-w-2xl rounded-[28px] border border-white/60 bg-[var(--card-background)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-sky-700 transition hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
        >
          Back to form
        </Link>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400">
            Return Result
          </p>
        </div>

        <div className="mt-8">
          <ReturnResult
            key={`${orderId}:${customerEmail.toLowerCase()}`}
            orderId={orderId}
            customerEmail={customerEmail}
          />
        </div>
      </section>
    </main>
  );
}
