import { countEnvMap, formatCountReport, countToJson } from "./envCounter";

function makeMap(entries: Record<string, string>): Record<string, string> {
  return entries;
}

describe("countEnvMap", () => {
  it("counts total, empty and nonEmpty keys", () => {
    const env = makeMap({
      APP_NAME: "myapp",
      APP_VERSION: "",
      DB_HOST: "localhost",
      DB_PORT: "5432",
      SECRET: "",
    });
    const report = countEnvMap(env, "test");
    expect(report.result.total).toBe(5);
    expect(report.result.empty).toBe(2);
    expect(report.result.nonEmpty).toBe(3);
  });

  it("groups keys by prefix", () => {
    const env = makeMap({
      APP_NAME: "myapp",
      APP_ENV: "prod",
      DB_HOST: "localhost",
      NOPREFIXKEY: "value",
    });
    const report = countEnvMap(env, "prefix-test");
    expect(report.result.byPrefix["APP"]).toBe(2);
    expect(report.result.byPrefix["DB"]).toBe(1);
    expect(report.result.byPrefix["(none)"]).toBeUndefined();
  });

  it("handles keys without underscores as (none) prefix", () => {
    const env = makeMap({ NOPREFIX: "val" });
    const report = countEnvMap(env);
    expect(report.result.byPrefix["(none)"]).toBe(1);
  });

  it("returns zero counts for empty map", () => {
    const report = countEnvMap({});
    expect(report.result.total).toBe(0);
    expect(report.result.empty).toBe(0);
    expect(report.result.nonEmpty).toBe(0);
  });
});

describe("formatCountReport", () => {
  it("returns a string containing key stats", () => {
    const env = makeMap({ APP_NAME: "x", APP_PORT: "" });
    const report = countEnvMap(env, "demo");
    const output = formatCountReport(report);
    expect(output).toContain("demo");
    expect(output).toContain("Total");
    expect(output).toContain("APP: 2");
  });
});

describe("countToJson", () => {
  it("serializes the report to JSON", () => {
    const env = makeMap({ X_A: "1", X_B: "" });
    const report = countEnvMap(env, "json-test");
    const json = JSON.parse(countToJson(report));
    expect(json.label).toBe("json-test");
    expect(json.total).toBe(2);
    expect(json.empty).toBe(1);
    expect(json.nonEmpty).toBe(1);
  });
});
