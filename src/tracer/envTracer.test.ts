import { traceEnvMaps, traceKey, formatTraceReport } from "./envTracer";

const makeMap = (obj: Record<string, string>) => new Map(Object.entries(obj));

describe("traceEnvMaps", () => {
  it("returns single source entries", () => {
    const sources = [{ name: ".env", map: makeMap({ FOO: "bar" }) }];
    const report = traceEnvMaps(sources);
    expect(report.entries).toHaveLength(1);
    expect(report.entries[0]).toMatchObject({ key: "FOO", source: ".env", value: "bar" });
    expect(report.overrides).toEqual({});
  });

  it("detects overrides across sources", () => {
    const sources = [
      { name: ".env", map: makeMap({ FOO: "base", BAR: "keep" }) },
      { name: ".env.prod", map: makeMap({ FOO: "prod" }) },
    ];
    const report = traceEnvMaps(sources);
    const foo = report.entries.find((e) => e.key === "FOO")!;
    expect(foo.value).toBe("prod");
    expect(foo.source).toBe(".env.prod");
    expect(report.overrides["FOO"]).toEqual([".env", ".env.prod"]);
  });

  it("sorts entries by key", () => {
    const sources = [{ name: "a", map: makeMap({ Z: "1", A: "2", M: "3" }) }];
    const report = traceEnvMaps(sources);
    expect(report.entries.map((e) => e.key)).toEqual(["A", "M", "Z"]);
  });

  it("handles empty sources", () => {
    const report = traceEnvMaps([]);
    expect(report.entries).toHaveLength(0);
    expect(report.overrides).toEqual({});
  });
});

describe("traceKey", () => {
  it("returns all sources containing the key", () => {
    const sources = [
      { name: ".env", map: makeMap({ FOO: "a" }) },
      { name: ".env.prod", map: makeMap({ FOO: "b", BAR: "x" }) },
    ];
    const trace = traceKey("FOO", sources);
    expect(trace).toHaveLength(2);
    expect(trace[0]).toMatchObject({ source: ".env", value: "a" });
    expect(trace[1]).toMatchObject({ source: ".env.prod", value: "b" });
  });

  it("returns empty array if key not found", () => {
    const sources = [{ name: ".env", map: makeMap({ BAR: "1" }) }];
    expect(traceKey("FOO", sources)).toHaveLength(0);
  });
});

describe("formatTraceReport", () => {
  it("formats report with overrides", () => {
    const sources = [
      { name: ".env", map: makeMap({ FOO: "base" }) },
      { name: ".env.prod", map: makeMap({ FOO: "prod" }) },
    ];
    const report = traceEnvMaps(sources);
    const output = formatTraceReport(report);
    expect(output).toContain("FOO");
    expect(output).toContain(".env.prod");
    expect(output).toContain("overrides");
    expect(output).toContain("Overridden: 1");
  });
});
