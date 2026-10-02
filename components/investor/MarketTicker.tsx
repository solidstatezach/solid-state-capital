'use client'

import { useEffect, useState } from 'react'

export default function MarketTicker() {
  const [btc, setBtc] = useState<number | null>(null)
  const [eth, setEth] = useState<number | null>(null)

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd')
      .then(r => r.json())
      .then(data => {
        setBtc(data.bitcoin.usd)
        setEth(data.ethereum.usd)
      })
  }, [])

  return (
    <div className="flex gap-4 text-sm">
      <div>BTC: ${btc?.toLocaleString()}</div>
      <div>ETH: ${eth?.toLocaleString()}</div>
    </div>
  )
}
