'use client'

import { useEffect, useState } from 'react'

export default function CryptoWidget() {
  const [btc, setBtc] = useState<number | null>(null)

  useEffect(() => {
    fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    )
      .then((r) => r.json())
      .then((d) => setBtc(d.bitcoin.usd))
  }, [])

  return (
    <div className="rounded-xl border border-zinc-800 p-4">
      <h2 className="font-bold mb-2">Bitcoin</h2>
      <p className="text-3xl">
        ${btc ?? 'Loading...'}
      </p>
    </div>
  )
}
