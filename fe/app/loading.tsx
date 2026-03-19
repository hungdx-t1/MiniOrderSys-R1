export default function Loading() {
  return (
    <main className="app-shell flex flex-1 flex-col gap-3 px-4 pb-14 pt-6 sm:px-6 sm:pt-8">
      <div className="glass-card h-40 animate-pulse rounded-3xl" />
      <div className="glass-card h-64 animate-pulse rounded-3xl" />
      <div className="glass-card h-72 animate-pulse rounded-3xl" />
      <div className="glass-card h-28 animate-pulse rounded-3xl" />
    </main>
  );
}
