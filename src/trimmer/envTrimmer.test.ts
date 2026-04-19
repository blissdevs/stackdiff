import { trimEnvMap, trimKey, trimValue, formatTrimReport } from "./envTrimmer";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("trimKey", () => {
  it("trims whitespace from key", () => {
    expect(trimKey("  FOO  ")).toBe("FOO");
  });
  it("leaves clean key unchanged", () => {
    expect(trimKey("BAR")).toBe("BAR");
  });
});

describe("trimValue", () => {
  it("trims whitespace from value", () => {
    expect(trimValue("  hello  ")).toBe("hello");
  });
  it("leaves clean value unchanged", () => {
    expect(trimValue("world")).toBe("world");
  });
});

describe("trimEnvMap", () => {
  it("trims keys and values by default", () => {
    const env = makeMap({ "  FOO  ": "  bar  ", BAZ: "qux" });
    const { trimmed, modifiedKeys } = trimEnvMap(env);
    expect(trimmed.get("FOO")).toBe("bar");
    expect(trimmed.get("BAZ")).toBe("qux");
    expect(modifiedKeys).toContain("FOO");
  });

  it("removes empty keys when removeEmptyKeys is true", () => {
    const env = makeMap({ "   ": "value", KEY: "val" });
    const { trimmed, removedKeys } = trimEnvMap(env, { removeEmptyKeys: true });
    expect(trimmed.has("")).toBe(false);
    expect(removedKeys.length).toBe(1);
  });

  it("removes empty values when removeEmptyValues is true", () => {
    const env = makeMap({ KEY: "  ", OTHER: "val" });
    const { trimmed, removedKeys } = trimEnvMap(env, { removeEmptyValues: true });
    expect(trimmed.has("KEY")).toBe(false);
    expect(removedKeys).toContain("KEY");
  });

  it("reports no changes when env is already clean", () => {
    const env = makeMap({ FOO: "bar", BAZ: "qux" });
    const { modifiedKeys, removedKeys } = trimEnvMap(env);
    expect(modifiedKeys).toHaveLength(0);
    expect(removedKeys).toHaveLength(0);
  });
});

describe("formatTrimReport", () => {
  it("reports no changes when nothing changed", () => {
    const env = makeMap({ FOO: "bar" });
    const report = trimEnvMap(env);
    expect(formatTrimReport(report)).toContain("No changes.");
  });

  it("reports modified and removed keys", () => {
    const env = makeMap({ "  A  ": "  val  ", "  ": "empty" });
    const report = trimEnvMap(env, { removeEmptyKeys: true });
    const output = formatTrimReport(report);
    expect(output).toContain("Modified");
    expect(output).toContain("Removed");
  });
});
