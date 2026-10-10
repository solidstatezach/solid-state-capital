// Single source of truth for portfolio math. Every page must use these
// helpers so "Portfolio Value", "Cost Basis" and "Unrealized P/L" mean
// the same thing everywhere.
//
// Definitions:
// - position value  = quantity × current_price
// - position cost   = quantity × average_cost
// - unrealized P/L  = value − cost
// - total value     = cash balance + Σ position values  (cash counted once)

type PositionLike = {
  quantity: number | string | null
  average_cost: number | string | null
  current_price: number | string | null
}

const n = (v: number | string | null | undefined) =>
  Number(v) || 0

export function positionValue(p: PositionLike): number {
  return n(p.quantity) * n(p.current_price)
}

export function positionCost(p: PositionLike): number {
  return n(p.quantity) * n(p.average_cost)
}

export function positionUnrealized(p: PositionLike): number {
  return positionValue(p) - positionCost(p)
}

export function summarizePositions(
  positions: PositionLike[] | null | undefined
): {
  value: number
  cost: number
  unrealized: number
  count: number
} {
  const list = positions || []
  let value = 0
  let cost = 0
  for (const p of list) {
    value += positionValue(p)
    cost += positionCost(p)
  }
  return {
    value,
    cost,
    unrealized: value - cost,
    count: list.length,
  }
}

export function totalAccountValue(
  cashBalance: number | string | null | undefined,
  positions: PositionLike[] | null | undefined
): number {
  return n(cashBalance) + summarizePositions(positions).value
}

export function formatMoney(
  v: number | string | null | undefined
): string {
  return `$${n(v).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`
}
