type PayoutWithAdjustments = {
  amount: number;
  adjustments: { amount: number }[];
};

export function finalPayoutAmount(payout: PayoutWithAdjustments) {
  return payout.amount + payout.adjustments.reduce((sum, a) => sum + a.amount, 0);
}
