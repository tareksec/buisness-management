import { describe, expect, it } from "vitest";
import { needsPin } from "@/lib/approvals";

describe("PIN rule", () => {
  it("payouts and fund transfers always need a PIN", () => {
    expect(needsPin({ kind: "payout", amount: 1000 })).toBe(true);
    expect(needsPin({ kind: "transfer", amount: 1000 })).toBe(true);
  });
  it("vouchers need a PIN only above ৳ 1,00,000", () => {
    expect(needsPin({ kind: "voucher", amount: 100000 })).toBe(false);
    expect(needsPin({ kind: "voucher", amount: 100001 })).toBe(true);
  });
  it("other items do not need a PIN", () => {
    expect(needsPin({ kind: "kyc" })).toBe(false);
    expect(needsPin({ kind: "dispatch", amount: 500000 })).toBe(false);
  });
});
