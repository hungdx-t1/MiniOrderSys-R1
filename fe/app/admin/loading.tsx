export default function AdminLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
      <div className="glass-card h-36 animate-pulse rounded-3xl" />
      <div className="glass-card h-32 animate-pulse rounded-3xl" />
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="glass-card h-96 animate-pulse rounded-3xl" />
        <div className="glass-card h-96 animate-pulse rounded-3xl" />
      </div>
    </main>
  );
}
