import { describe, expect, it } from "vitest";
import { groupLakh, toLangDigits } from "@/lib/app-state";

describe("money formatting", () => {
  it("uses lakh grouping", () => {
    expect(groupLakh(1250000)).toBe("12,50,000");
    expect(groupLakh(85000)).toBe("85,000");
  });
  it("shows Bangla digits in Bangla mode", () => {
    expect(toLangDigits("12,50,000", "bn")).toBe("১২,৫০,০০০");
  });
});
