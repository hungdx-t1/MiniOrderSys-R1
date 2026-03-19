"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-shell flex flex-1 items-center px-4 pb-14 pt-6 sm:px-6 sm:pt-8">
      <section className="glass-card w-full rounded-3xl p-6 text-center">
        <p className="font-display text-2xl text-ink">He thong dang bi gian doan</p>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Da xay ra loi khi tai giao dien. Ban co the thu tai lai ngay.
        </p>
        <button
          type="button"
          onClick={unstable_retry}
          className="mt-5 rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Thu lai
        </button>
      </section>
    </main>
  );
}
