import { describe, it, expect } from "vitest";
import { a2aEnforcementPolicy } from "../src/policies/a2a-enforcement";

describe("a2a-enforcement policy", () => {
  it("no-op when disabled", () => {
    expect(a2aEnforcementPolicy("echo ok", { enabled: false })).toBeUndefined();
  });
});
