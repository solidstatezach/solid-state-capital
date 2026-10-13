'use client'

import { useState } from 'react'

export default function RecordSnapshotButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function record() {
    setLoading(true)
    setStatus(null)

    const res = await fetch('/api/admin/snapshots', {
      method: 'POST',
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setStatus(`Error: ${data.error || 'failed'}`)
      return
    }

    setStatus(
      `Recorded ${data.recorded} snapshot${data.recorded === 1 ? '' : 's'}.`
    )
    setTimeout(() => location.reload(), 1200)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={record}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Recording…' : 'Record Snapshot'}
      </button>

      {status && (
        <span
          className={`text-sm ${
            status.startsWith('Error')
              ? 'text-red-400'
              : 'text-green-400'
          }`}
        >
          {status}
        </span>
      )}
    </div>
  )
}
