import { describe, it, expect } from "vitest";
import { needsPin } from "@/lib/approvals";
describe("PIN rule", () => {
  it("payout needs PIN", () => expect(needsPin({ kind: "payout", amount: 1 })).toBe(true));
  it("transfer needs PIN", () => expect(needsPin({ kind: "transfer", amount: 1 })).toBe(true));
  it("voucher above 1,00,000 needs PIN", () => expect(needsPin({ kind: "voucher", amount: 100001 })).toBe(true));
  it("voucher of exactly 1,00,000 does not", () => expect(needsPin({ kind: "voucher", amount: 100000 })).toBe(false));
  it("dispatch does not", () => expect(needsPin({ kind: "dispatch", amount: 500000 })).toBe(false));
});
