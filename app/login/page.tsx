export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded">
        <h1 className="text-2xl font-bold mb-4">
          Client Login
        </h1>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
        />

        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Password"
        />

        <button className="w-full bg-black text-white p-2 rounded">
          Login
        </button>
      </div>
    </main>
  );
}
