import { shrinkEnvMap, formatShrinkReport, isPlaceholder } from "./envShrinker";

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

describe("isPlaceholder", () => {
  it("detects default placeholders case-insensitively", () => {
    expect(isPlaceholder("CHANGEME")).toBe(true);
    expect(isPlaceholder("todo")).toBe(true);
    expect(isPlaceholder("placeholder")).toBe(true);
    expect(isPlaceholder("actual-value")).toBe(false);
  });

  it("detects custom placeholders", () => {
    expect(isPlaceholder("MYPLACEHOLDER", ["MYPLACEHOLDER"])).toBe(true);
    expect(isPlaceholder("real", ["MYPLACEHOLDER"])).toBe(false);
  });
});

describe("shrinkEnvMap", () => {
  it("removes empty values by default", () => {
    const env = makeMap({ KEY1: "value", KEY2: "", KEY3: "  " });
    const { shrunk, removed } = shrinkEnvMap(env);
    expect(shrunk.has("KEY1")).toBe(true);
    expect(removed.has("KEY2")).toBe(true);
    expect(removed.has("KEY3")).toBe(true);
  });

  it("removes placeholder values by default", () => {
    const env = makeMap({ KEY1: "real", KEY2: "CHANGEME", KEY3: "TODO" });
    const { shrunk, removed } = shrinkEnvMap(env);
    expect(shrunk.size).toBe(1);
    expect(removed.size).toBe(2);
  });

  it("respects removeEmpty: false", () => {
    const env = makeMap({ KEY1: "", KEY2: "value" });
    const { shrunk } = shrinkEnvMap(env, { removeEmpty: false });
    expect(shrunk.has("KEY1")).toBe(true);
  });

  it("respects removePlaceholders: false", () => {
    const env = makeMap({ KEY1: "CHANGEME", KEY2: "value" });
    const { shrunk } = shrinkEnvMap(env, { removePlaceholders: false });
    expect(shrunk.has("KEY1")).toBe(true);
  });

  it("respects custom placeholders", () => {
    const env = makeMap({ KEY1: "CUSTOM", KEY2: "value" });
    const { removed } = shrinkEnvMap(env, { customPlaceholders: ["CUSTOM"] });
    expect(removed.has("KEY1")).toBe(true);
  });

  it("returns correct removedKeys list", () => {
    const env = makeMap({ A: "", B: "CHANGEME", C: "real" });
    const { removedKeys } = shrinkEnvMap(env);
    expect(removedKeys).toContain("A");
    expect(removedKeys).toContain("B");
    expect(removedKeys).not.toContain("C");
  });
});

describe("formatShrinkReport", () => {
  it("formats a report with removed keys", () => {
    const env = makeMap({ A: "", B: "real" });
    const result = shrinkEnvMap(env);
    const report = formatShrinkReport(result);
    expect(report).toContain("Shrink Report");
    expect(report).toContain("Retained : 1");
    expect(report).toContain("Removed  : 1");
    expect(report).toContain("- A (empty)");
  });

  it("labels placeholder removals correctly", () => {
    const env = makeMap({ X: "CHANGEME" });
    const result = shrinkEnvMap(env);
    const report = formatShrinkReport(result);
    expect(report).toContain("- X (placeholder)");
  });
});
