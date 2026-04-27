import { squashEnvMaps, formatSquashReport } from "./envSquasher";
import { EnvMap } from "../parser/envParser";

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe("squashEnvMaps", () => {
  it("merges non-conflicting keys from multiple maps", () => {
    const a = makeMap({ FOO: "1", BAR: "2" });
    const b = makeMap({ BAZ: "3" });
    const { squashed, overrides, skipped } = squashEnvMaps([a, b]);
    expect(squashed.get("FOO")).toBe("1");
    expect(squashed.get("BAR")).toBe("2");
    expect(squashed.get("BAZ")).toBe("3");
    expect(Object.keys(overrides)).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });

  it("prefers last value by default on conflict", () => {
    const a = makeMap({ FOO: "first" });
    const b = makeMap({ FOO: "second" });
    const { squashed, overrides } = squashEnvMaps([a, b]);
    expect(squashed.get("FOO")).toBe("second");
    expect(overrides["FOO"]).toHaveLength(1);
    expect(overrides["FOO"][0].from).toBe("first");
    expect(overrides["FOO"][0].to).toBe("second");
  });

  it("prefers first value when preferLast is false", () => {
    const a = makeMap({ FOO: "first" });
    const b = makeMap({ FOO: "second" });
    const { squashed } = squashEnvMaps([a, b], { preferLast: false });
    expect(squashed.get("FOO")).toBe("first");
  });

  it("skips empty values when ignoreEmpty is true", () => {
    const a = makeMap({ FOO: "" });
    const b = makeMap({ BAR: "value" });
    const { squashed, skipped } = squashEnvMaps([a, b], { ignoreEmpty: true });
    expect(squashed.has("FOO")).toBe(false);
    expect(skipped).toContain("FOO");
    expect(squashed.get("BAR")).toBe("value");
  });

  it("handles empty maps array", () => {
    const { squashed, overrides, skipped } = squashEnvMaps([]);
    expect(squashed.size).toBe(0);
    expect(Object.keys(overrides)).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });

  it("tracks source index in overrides", () => {
    const a = makeMap({ KEY: "v1" });
    const b = makeMap({ KEY: "v2" });
    const c = makeMap({ KEY: "v3" });
    const { overrides } = squashEnvMaps([a, b, c]);
    expect(overrides["KEY"]).toHaveLength(2);
    expect(overrides["KEY"][1].source).toBe(2);
  });
});

describe("formatSquashReport", () => {
  it("reports squashed count", () => {
    const a = makeMap({ A: "1", B: "2" });
    const result = squashEnvMaps([a]);
    const report = formatSquashReport(result);
    expect(report).toContain("Squashed keys: 2");
  });

  it("reports overrides", () => {
    const a = makeMap({ FOO: "old" });
    const b = makeMap({ FOO: "new" });
    const result = squashEnvMaps([a, b]);
    const report = formatSquashReport(result);
    expect(report).toContain("Overrides");
    expect(report).toContain("old");
    expect(report).toContain("new");
  });

  it("reports skipped keys", () => {
    const a = makeMap({ EMPTY: "" });
    const result = squashEnvMaps([a], { ignoreEmpty: true });
    const report = formatSquashReport(result);
    expect(report).toContain("Skipped empty keys");
    expect(report).toContain("EMPTY");
  });
});
