import { combineEnvMaps, formatCombineReport } from "./envCombiner";
import { EnvMap } from "../parser/envParser";

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe("combineEnvMaps", () => {
  it("combines two maps with no overlap", () => {
    const a = makeMap({ FOO: "1", BAR: "2" });
    const b = makeMap({ BAZ: "3" });
    const result = combineEnvMaps([a, b]);
    expect(result.combined.get("FOO")).toBe("1");
    expect(result.combined.get("BAZ")).toBe("3");
    expect(result.totalKeys).toBe(3);
    expect(result.overwrittenKeys).toHaveLength(0);
    expect(result.skippedKeys).toHaveLength(0);
  });

  it("later map overwrites earlier map by default", () => {
    const a = makeMap({ FOO: "old" });
    const b = makeMap({ FOO: "new" });
    const result = combineEnvMaps([a, b]);
    expect(result.combined.get("FOO")).toBe("new");
    expect(result.overwrittenKeys).toContain("FOO");
  });

  it("respects overwrite: false option", () => {
    const a = makeMap({ FOO: "first" });
    const b = makeMap({ FOO: "second" });
    const result = combineEnvMaps([a, b], { overwrite: false });
    expect(result.combined.get("FOO")).toBe("first");
    expect(result.skippedKeys).toContain("FOO");
  });

  it("skips empty values when skipEmpty is true", () => {
    const a = makeMap({ FOO: "value", BAR: "" });
    const result = combineEnvMaps([a], { skipEmpty: true });
    expect(result.combined.has("BAR")).toBe(false);
    expect(result.skippedKeys).toContain("BAR");
  });

  it("applies prefix to all keys", () => {
    const a = makeMap({ FOO: "1" });
    const result = combineEnvMaps([a], { prefix: "APP_" });
    expect(result.combined.has("APP_FOO")).toBe(true);
    expect(result.combined.has("FOO")).toBe(false);
  });

  it("reports correct sources count", () => {
    const maps = [makeMap({ A: "1" }), makeMap({ B: "2" }), makeMap({ C: "3" })];
    const result = combineEnvMaps(maps);
    expect(result.sources).toBe(3);
  });

  it("handles empty maps gracefully", () => {
    const result = combineEnvMaps([]);
    expect(result.totalKeys).toBe(0);
    expect(result.sources).toBe(0);
  });
});

describe("formatCombineReport", () => {
  it("formats a basic report", () => {
    const a = makeMap({ FOO: "1" });
    const b = makeMap({ FOO: "2", BAR: "3" });
    const result = combineEnvMaps([a, b]);
    const report = formatCombineReport(result);
    expect(report).toContain("2 source(s)");
    expect(report).toContain("Overwritten keys");
    expect(report).toContain("FOO");
  });

  it("omits overwritten/skipped sections when none exist", () => {
    const a = makeMap({ FOO: "1" });
    const result = combineEnvMaps([a]);
    const report = formatCombineReport(result);
    expect(report).not.toContain("Overwritten");
    expect(report).not.toContain("Skipped");
  });
});
