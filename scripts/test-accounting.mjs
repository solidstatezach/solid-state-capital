// Accounting tests for the Solid State Capital MVP.
// Run: node scripts/test-accounting.mjs  (after `npm run build:lib-test`
// compiles lib/portfolio.ts — or run via the one-liner in package.json)
//
// Part 1 tests the real shipped code in lib/portfolio.ts.
// Part 2 is a line-by-line JS transcription of the accounting inside
// public.execute_trade() (supabase/migrations/20261010120000_audit_log_trading.sql).
// It cannot run the SQL without a database, but it pins the math model:
// weighted average cost, realized P/L, and balance updates.

import {
  positionValue,
  positionCost,
  positionUnrealized,
  summarizePositions,
  totalAccountValue,
} from '../tmp-test-build/portfolio.js'

let passed = 0
let failed = 0

function eq(actual, expected, name) {
  const ok = Math.abs(actual - expected) < 1e-9
  if (ok) {
    passed++
  } else {
    failed++
    console.error(`FAIL ${name}: expected ${expected}, got ${actual}`)
  }
}

function throws(fn, name) {
  try {
    fn()
    failed++
    console.error(`FAIL ${name}: expected throw, did not throw`)
  } catch {
    passed++
  }
}

// ── Part 1: lib/portfolio.ts ──────────────────────────────────────────

eq(positionValue({ quantity: 2, average_cost: 100, current_price: 150 }), 300, 'position value')
eq(positionCost({ quantity: 2, average_cost: 100, current_price: 150 }), 200, 'position cost')
eq(positionUnrealized({ quantity: 2, average_cost: 100, current_price: 150 }), 100, 'unrealized gain')
eq(positionUnrealized({ quantity: 2, average_cost: 100, current_price: 80 }), -40, 'unrealized loss')

const s = summarizePositions([
  { quantity: 2, average_cost: 100, current_price: 150 },
  { quantity: 1, average_cost: 50, current_price: 40 },
])
eq(s.value, 340, 'summary value')
eq(s.cost, 250, 'summary cost')
eq(s.unrealized, 90, 'summary unrealized')
eq(s.count, 2, 'summary count')

// Cash counted exactly once.
eq(totalAccountValue(1000, [
  { quantity: 2, average_cost: 100, current_price: 150 },
]), 1300, 'total = cash + positions (no double count)')
eq(totalAccountValue(0, []), 0, 'empty portfolio')
eq(totalAccountValue(null, null), 0, 'null-safe')

// ── Part 2: execute_trade() math model ────────────────────────────────
// Mirrors the SQL: buy debits cash and recomputes weighted average cost;
// sell credits cash, books realized P/L, deletes emptied positions.

function makeState() {
  return {
    balance: 10000,
    total_profit: 0,
    positions: new Map(), // asset -> {quantity, average_cost, current_price}
  }
}

function trade(state, side, asset, quantity, price) {
  if (side !== 'buy' && side !== 'sell')
    throw new Error('side must be buy or sell')
  if (!(quantity > 0) || !(price > 0))
    throw new Error('quantity and price must be positive')
  if (!asset || !asset.trim()) throw new Error('asset required')

  const pos = state.positions.get(asset)

  if (side === 'buy') {
    const cost = quantity * price
    if (state.balance < cost) throw new Error('insufficient cash balance')
    state.balance -= cost
    if (pos) {
      const newQty = pos.quantity + quantity
      pos.average_cost =
        (pos.quantity * pos.average_cost + cost) / newQty
      pos.quantity = newQty
      pos.current_price = price
    } else {
      state.positions.set(asset, {
        quantity,
        average_cost: price,
        current_price: price,
      })
    }
    return { realized_pnl: 0 }
  }

  // sell
  if (!pos || pos.quantity < quantity)
    throw new Error('insufficient position quantity')
  const realized = (price - pos.average_cost) * quantity
  state.balance += quantity * price
  state.total_profit += realized
  const newQty = pos.quantity - quantity
  if (newQty === 0) state.positions.delete(asset)
  else {
    pos.quantity = newQty
    pos.current_price = price
  }
  return { realized_pnl: realized }
}

// Buy exceeding cash throws (tested again below); affordable buy:
{
  const st = makeState()
  trade(st, 'buy', 'BTC', 0.1, 60000)
  eq(st.balance, 4000, 'buy debits cash')
  const p = st.positions.get('BTC')
  eq(p.quantity, 0.1, 'new position qty')
  eq(p.average_cost, 60000, 'new position avg cost')
}

// Buy more of existing: weighted average cost.
{
  const st = makeState()
  trade(st, 'buy', 'BTC', 0.1, 40000) // cost 4000
  trade(st, 'buy', 'BTC', 0.1, 60000) // cost 6000
  const p = st.positions.get('BTC')
  eq(p.quantity, 0.2, 'accumulated qty')
  eq(p.average_cost, 50000, 'weighted avg cost')
  eq(st.balance, 0, 'cash after two buys')
}

// Sell part: realized P/L booked, position shrinks.
{
  const st = makeState()
  trade(st, 'buy', 'BTC', 0.2, 50000) // cost 10000 -> balance 0
  const r = trade(st, 'sell', 'BTC', 0.1, 60000)
  eq(r.realized_pnl, 1000, 'realized pnl on partial sell')
  eq(st.total_profit, 1000, 'total_profit accumulates')
  eq(st.balance, 6000, 'sell credits cash')
  eq(st.positions.get('BTC').quantity, 0.1, 'position shrunk')
}

// Sell entire position: removed.
{
  const st = makeState()
  trade(st, 'buy', 'ETH', 1, 3000)
  trade(st, 'sell', 'ETH', 1, 3500)
  eq(st.positions.has('ETH') ? 1 : 0, 0, 'emptied position deleted')
  eq(st.total_profit, 500, 'full realized pnl')
  eq(st.balance, 10000 - 3000 + 3500, 'cash round-trip')
}

// Sell at a loss.
{
  const st = makeState()
  trade(st, 'buy', 'ETH', 1, 3000)
  const r = trade(st, 'sell', 'ETH', 1, 2500)
  eq(r.realized_pnl, -500, 'realized loss')
  eq(st.total_profit, -500, 'loss accumulates')
}

// Insufficient cash.
{
  const st = makeState()
  throws(() => trade(st, 'buy', 'BTC', 1, 60000), 'insufficient cash throws')
  eq(st.balance, 10000, 'balance untouched after failed buy')
}

// Insufficient quantity.
{
  const st = makeState()
  trade(st, 'buy', 'ETH', 1, 3000)
  throws(() => trade(st, 'sell', 'ETH', 2, 3500), 'oversell throws')
  throws(() => trade(st, 'sell', 'DOGE', 1, 1), 'sell nonexistent throws')
}

// Invalid inputs.
{
  const st = makeState()
  throws(() => trade(st, 'buy', 'BTC', 0, 100), 'zero qty throws')
  throws(() => trade(st, 'buy', 'BTC', -1, 100), 'negative qty throws')
  throws(() => trade(st, 'buy', 'BTC', 1, -100), 'negative price throws')
  throws(() => trade(st, 'buy', '', 1, 100), 'empty asset throws')
  throws(() => trade(st, 'hold', 'BTC', 1, 100), 'bad side throws')
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
