'use client'

import { useEffect, useState } from 'react'

type Coin = {
  symbol: string
  price: number
  change: number
}

export default function MarketTicker() {
  const [coins, setCoins] = useState<Coin[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,chainlink,ripple&vs_currencies=usd&include_24hr_change=true'
      )

      const data = await res.json()

      setCoins([
        {
          symbol: 'BTC',
          price: data.bitcoin.usd,
          change: data.bitcoin.usd_24h_change,
        },
        {
          symbol: 'ETH',
          price: data.ethereum.usd,
          change: data.ethereum.usd_24h_change,
        },
        {
          symbol: 'SOL',
          price: data.solana.usd,
          change: data.solana.usd_24h_change,
        },
        {
          symbol: 'LINK',
          price: data.chainlink.usd,
          change: data.chainlink.usd_24h_change,
        },
        {
          symbol: 'XRP',
          price: data.ripple.usd,
          change: data.ripple.usd_24h_change,
        },
      ])
    }

    load()
    const interval = setInterval(load, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="overflow-hidden border-b border-zinc-800 bg-zinc-950 py-2">
      <div className="animate-marquee whitespace-nowrap">
        {[...coins, ...coins].map((coin, i) => (
          <span key={i} className="mx-8 inline-block">
            {coin.symbol} ${coin.price?.toLocaleString()}
            <span
              className={
                coin.change >= 0
                  ? 'ml-2 text-green-400'
                  : 'ml-2 text-red-400'
              }
            >
              {coin.change >= 0 ? '▲' : '▼'}
              {Math.abs(coin.change).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
