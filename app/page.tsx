export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold">
        Solid State Capital
      </h1>

      <p className="mt-4 text-lg text-gray-500">
        Digital Asset Portfolio Tracking
      </p>

      <div className="mt-8 flex gap-4">
        <a
          href="/login"
          className="px-6 py-3 rounded bg-black text-white"
        >
          Client Login
        </a>

        <a
          href="/dashboard"
          className="px-6 py-3 rounded border"
        >
          Demo Dashboard
        </a>
      </div>
    </main>
  );
}
