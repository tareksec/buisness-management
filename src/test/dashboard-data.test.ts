import { describe, expect, it } from "vitest";
import { appInfo, businesses, dashboard } from "@/data/mock";
import { DEMO_PIN } from "@/lib/approvals";

describe("dashboard sample data", () => {
  it("has 12 months of profit paid for every business", () => {
    for (const b of businesses) expect(dashboard[b.id]?.profitByMonth).toHaveLength(12);
  });
  it("app lock uses demo PIN 1234 and app version v1.0.0 with update v1.1.0", () => {
    expect(DEMO_PIN).toBe("1234");
    expect(appInfo.version).toBe("1.0.0");
    expect(appInfo.latestVersion).toBe("1.1.0");
  });
});
