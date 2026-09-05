export default function Dashboard() {
  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border p-6 rounded">
          <h2>Portfolio Value</h2>
          <p className="text-3xl font-bold">$10,000</p>
        </div>

        <div className="border p-6 rounded">
          <h2>Performance</h2>
          <p className="text-3xl font-bold text-green-600">+12.4%</p>
        </div>

        <div className="border p-6 rounded">
          <h2>Assets</h2>
          <p className="text-3xl font-bold">4</p>
        </div>
      </div>
    </main>
  );
}
