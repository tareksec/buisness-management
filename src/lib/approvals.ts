import type { Approval } from "@/data/mock";

export const PIN_VOUCHER_THRESHOLD = 100000;

/** Money items need the PIN: payout batches, fund transfers, vouchers above ৳ 1,00,000. */
export function needsPin(a: Pick<Approval, "kind" | "amount">): boolean {
  if (a.kind === "payout" || a.kind === "transfer") return true;
  if (a.kind === "voucher") return (a.amount ?? 0) > PIN_VOUCHER_THRESHOLD;
  return false;
}

export const DEMO_PIN = "1234";
