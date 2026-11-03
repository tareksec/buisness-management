import { describe, expect, it } from "vitest";
import { adjustSplit, splitAmounts } from "@/lib/split";

const contract = { investors: 60, partner: 5, company: 35 };

describe("profit split", () => {
  it("keeps partner fixed and totals 100%", () => {
    expect(adjustSplit(contract, 70)).toEqual({ investors: 70, partner: 5, company: 25 });
  });
  it("clamps investors so company never goes negative", () => {
    expect(adjustSplit(contract, 120)).toEqual({ investors: 95, partner: 5, company: 0 });
  });
  it("amounts add up to the profit", () => {
    const a = splitAmounts(contract, 450000);
    expect(a).toEqual({ investors: 270000, partner: 22500, company: 157500 });
    const b = splitAmounts({ investors: 33, partner: 5, company: 62 }, 1001);
    expect(b.investors + b.partner + b.company).toBe(1001);
  });
});
