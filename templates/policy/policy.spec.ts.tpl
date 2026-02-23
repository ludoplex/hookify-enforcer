import { describe, it, expect } from "vitest";
import { {{NAME_CAMEL}}Policy } from "../src/policies/{{NAME_KEBAB}}";

describe("{{NAME_KEBAB}} policy", () => {
  it("no-op when disabled", () => {
    expect({{NAME_CAMEL}}Policy("echo ok", { enabled: false })).toBeUndefined();
  });
});
