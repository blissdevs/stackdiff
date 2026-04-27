import { expandValue, expandEnvMap, applyExpansion, formatExpandReport } from "./envExpander";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("expandValue", () => {
  it("expands ${VAR} syntax", () => {
    const ctx = makeMap({ HOME: "/home/user" });
    expect(expandValue("${HOME}/bin", ctx)).toBe("/home/user/bin");
  });

  it("expands $VAR syntax", () => {
    const ctx = makeMap({ APP: "myapp" });
    expect(expandValue("$APP_config", ctx)).toBe("myapp_config");
  });

  it("leaves unresolved references intact", () => {
    const ctx = makeMap({});
    expect(expandValue("${MISSING}", ctx)).toBe("${MISSING}");
  });

  it("handles recursive expansion", () => {
    const ctx = makeMap({ BASE: "/opt", DIR: "${BASE}/app" });
    expect(expandValue("${DIR}/bin", ctx)).toBe("/opt/app/bin");
  });

  it("prevents circular expansion", () => {
    const ctx = makeMap({ A: "${B}", B: "${A}" });
    // Should not throw or loop infinitely
    const result = expandValue("${A}", ctx);
    expect(typeof result).toBe("string");
  });
});

describe("expandEnvMap", () => {
  it("returns correct expand counts", () => {
    const env = makeMap({
      BASE: "/opt",
      PATH: "${BASE}/bin",
      NAME: "static",
    });
    const report = expandEnvMap(env);
    expect(report.totalExpanded).toBe(1);
    expect(report.totalUnchanged).toBe(2);
  });

  it("uses external context when provided", () => {
    const env = makeMap({ FULL_PATH: "${ROOT}/app" });
    const ctx = makeMap({ ROOT: "/usr/local" });
    const report = expandEnvMap(env, ctx);
    expect(report.results[0].expandedValue).toBe("/usr/local/app");
  });
});

describe("applyExpansion", () => {
  it("builds a new map with expanded values", () => {
    const env = makeMap({ BASE: "/opt", PATH: "${BASE}/bin" });
    const report = expandEnvMap(env);
    const result = applyExpansion(report);
    expect(result.get("PATH")).toBe("/opt/bin");
    expect(result.get("BASE")).toBe("/opt");
  });
});

describe("formatExpandReport", () => {
  it("includes header and expanded marker", () => {
    const env = makeMap({ BASE: "/opt", PATH: "${BASE}/bin" });
    const report = expandEnvMap(env);
    const text = formatExpandReport(report);
    expect(text).toContain("Expansion Report");
    expect(text).toContain("[~] PATH");
    expect(text).toContain("[ ] BASE");
  });
});
