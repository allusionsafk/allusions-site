// Prospective fee arithmetic, never a payout receipt, price decision or revenue forecast.
export function feeScenario({ totalCents, taxCents = 0, rateBps = 500, fixedCents = 50, otherCents = 0 }) {
  for (const v of [totalCents, taxCents, rateBps, fixedCents, otherCents])
    if (!Number.isSafeInteger(v) || v < 0 || v > 100000000) throw new Error('Invalid scenario amount');
  if (taxCents > totalCents || rateBps > 10000) throw new Error('Invalid scenario rate/tax');
  const estimatedFeeCents = Math.round(totalCents * rateBps / 10000) + fixedCents + otherCents;
  return { classification: 'scenario-only', currency: 'USD', totalCents, taxCents,
    estimatedFeeCents, estimatedProceedsCents: totalCents - taxCents - estimatedFeeCents,
    limitation: 'Illustrative rounding; excludes unknown support, refunds, disputes, payout/FX and income-tax costs. Not actual revenue.' };
}
