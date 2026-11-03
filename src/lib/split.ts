import type { Split } from "@/data/mock";

/** Move investor share; partner stays fixed; company takes the rest. Always sums to 100. */
export function adjustSplit(contract: Split, investors: number): Split {
  const max = 100 - contract.partner;
  const inv = Math.max(0, Math.min(max, Math.round(investors)));
  return { investors: inv, partner: contract.partner, company: max - inv };
}

/** Taka amounts per share; rounding remainder goes to company so totals match profit. */
export function splitAmounts(split: Split, profit: number) {
  const investors = Math.round((profit * split.investors) / 100);
  const partner = Math.round((profit * split.partner) / 100);
  return { investors, partner, company: Math.round(profit) - investors - partner };
}
