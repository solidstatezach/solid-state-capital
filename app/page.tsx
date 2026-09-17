import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-bold mb-4">
          Solid State Capital
        </h1>

        <p className="text-gray-500 mb-8">
          AI-assisted investment platform
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="border px-4 py-2 rounded"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="border px-4 py-2 rounded"
          >
            Login
          </Link>

          <Link
            href="/dashboard"
            className="border px-4 py-2 rounded"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
