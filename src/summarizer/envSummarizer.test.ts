import { summarizeEnvMap, formatSummaryReport, summaryToJson } from "./envSummarizer";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("summarizeEnvMap", () => {
  it("returns zeroed summary for empty map", () => {
    const result = summarizeEnvMap(new Map());
    expect(result.totalKeys).toBe(0);
    expect(result.emptyValues).toBe(0);
    expect(result.uniquePrefixes).toEqual([]);
    expect(result.longestKey).toBe("");
    expect(result.shortestKey).toBe("");
    expect(result.averageValueLength).toBe(0);
    expect(result.keysWithSpecialChars).toEqual([]);
  });

  it("counts total keys", () => {
    const env = makeMap({ A: "1", B: "2", C: "3" });
    expect(summarizeEnvMap(env).totalKeys).toBe(3);
  });

  it("counts empty values", () => {
    const env = makeMap({ A: "", B: "hello", C: "" });
    expect(summarizeEnvMap(env).emptyValues).toBe(2);
  });

  it("extracts unique prefixes from underscored keys", () => {
    const env = makeMap({ DB_HOST: "localhost", DB_PORT: "5432", APP_ENV: "prod" });
    const result = summarizeEnvMap(env);
    expect(result.uniquePrefixes).toContain("DB");
    expect(result.uniquePrefixes).toContain("APP");
    expect(result.uniquePrefixes).toHaveLength(2);
  });

  it("identifies longest and shortest keys", () => {
    const env = makeMap({ A: "1", LONG_KEY_NAME: "2", MED: "3" });
    const result = summarizeEnvMap(env);
    expect(result.longestKey).toBe("LONG_KEY_NAME");
    expect(result.shortestKey).toBe("A");
  });

  it("calculates average value length", () => {
    const env = makeMap({ A: "ab", B: "abcd" });
    expect(summarizeEnvMap(env).averageValueLength).toBe(3);
  });

  it("detects keys with special characters", () => {
    const env = makeMap({ VALID_KEY: "ok", "bad-key": "oops", another: "lower" });
    const result = summarizeEnvMap(env);
    expect(result.keysWithSpecialChars).toContain("bad-key");
    expect(result.keysWithSpecialChars).toContain("another");
  });
});

describe("formatSummaryReport", () => {
  it("returns a non-empty string report", () => {
    const env = makeMap({ DB_HOST: "localhost", PORT: "3000" });
    const summary = summarizeEnvMap(env);
    const report = formatSummaryReport(summary);
    expect(report).toContain("Total keys:");
    expect(report).toContain("DB");
  });
});

describe("summaryToJson", () => {
  it("returns valid JSON", () => {
    const env = makeMap({ X: "1" });
    const summary = summarizeEnvMap(env);
    const json = summaryToJson(summary);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json).totalKeys).toBe(1);
  });
});
