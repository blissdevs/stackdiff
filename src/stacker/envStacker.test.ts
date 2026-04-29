import { describe, it, expect } from "vitest";
import {
  stackEnvMaps,
  formatStackReport,
  stackResultToJson,
  EnvMap,
} from "./envStacker";

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe("stackEnvMaps", () => {
  it("returns all keys from a single map", () => {
    const result = stackEnvMaps([
      { name: "base", env: makeMap({ A: "1", B: "2" }) },
    ]);
    expect(result.resolved.get("A")).toBe("1");
    expect(result.resolved.get("B")).toBe("2");
    expect(result.overrides).toHaveLength(0);
  });

  it("later map overrides earlier map", () => {
    const result = stackEnvMaps([
      { name: "base", env: makeMap({ A: "base", B: "shared" }) },
      { name: "prod", env: makeMap({ A: "prod" }) },
    ]);
    expect(result.resolved.get("A")).toBe("prod");
    expect(result.resolved.get("B")).toBe("shared");
    expect(result.overrides).toHaveLength(1);
    expect(result.overrides[0].key).toBe("A");
    expect(result.overrides[0].source).toBe("base");
    expect(result.overrides[0].overriddenBy).toBe("prod");
  });

  it("tracks provenance correctly", () => {
    const result = stackEnvMaps([
      { name: "defaults", env: makeMap({ X: "default" }) },
      { name: "overrides", env: makeMap({ X: "override", Y: "new" }) },
    ]);
    expect(result.provenance.get("X")?.source).toBe("overrides");
    expect(result.provenance.get("Y")?.source).toBe("overrides");
  });

  it("handles empty maps gracefully", () => {
    const result = stackEnvMaps([
      { name: "a", env: makeMap({}) },
      { name: "b", env: makeMap({ K: "v" }) },
    ]);
    expect(result.resolved.size).toBe(1);
    expect(result.overrides).toHaveLength(0);
  });
});

describe("formatStackReport", () => {
  it("includes resolved key count and override count", () => {
    const result = stackEnvMaps([
      { name: "base", env: makeMap({ A: "1" }) },
      { name: "prod", env: makeMap({ A: "2" }) },
    ]);
    const report = formatStackReport(result);
    expect(report).toContain("Resolved keys: 1");
    expect(report).toContain("Override events: 1");
    expect(report).toContain("overridden by [prod]");
  });
});

describe("stackResultToJson", () => {
  it("serializes result to a plain object", () => {
    const result = stackEnvMaps([
      { name: "a", env: makeMap({ FOO: "bar" }) },
    ]);
    const json = stackResultToJson(result) as any;
    expect(json.resolvedCount).toBe(1);
    expect(json.resolved.FOO).toBe("bar");
    expect(json.provenance.FOO).toBe("a");
  });
});
