import { scoreEnvMap, formatScoreReport } from "./envScorer";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("scoreEnvMap", () => {
  it("returns 100 for a clean env", () => {
    const env = makeMap({ APP_NAME: "myapp", APP_PORT: "3000" });
    const result = scoreEnvMap(env, { penalizeSensitiveExposed: false, bonusForPrefixConsistency: false });
    expect(result.score).toBe(100);
  });

  it("penalizes empty values", () => {
    const env = makeMap({ APP_NAME: "", APP_PORT: "" });
    const result = scoreEnvMap(env, { penalizeSensitiveExposed: false, bonusForPrefixConsistency: false });
    expect(result.breakdown["emptyValues"]).toBe(-10);
    expect(result.score).toBe(90);
  });

  it("penalizes exposed sensitive keys", () => {
    const env = makeMap({ DB_PASSWORD: "hunter2", APP_NAME: "test" });
    const result = scoreEnvMap(env, { penalizeEmpty: false, bonusForPrefixConsistency: false });
    expect(result.breakdown["sensitiveExposed"]).toBe(-10);
  });

  it("gives bonus for prefix consistency", () => {
    const env = makeMap({ APP_NAME: "x", APP_PORT: "80", APP_ENV: "prod" });
    const result = scoreEnvMap(env, { penalizeEmpty: false, penalizeSensitiveExposed: false });
    expect(result.breakdown["prefixConsistency"]).toBe(5);
  });

  it("score does not go below 0", () => {
    const env = makeMap(Object.fromEntries(
      Array.from({ length: 30 }, (_, i) => [`SECRET_${i}`, "val"])
    ));
    const result = scoreEnvMap(env);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("percent is calculated correctly", () => {
    const env = makeMap({ X: "y" });
    const result = scoreEnvMap(env, { penalizeEmpty: false, penalizeSensitiveExposed: false, bonusForPrefixConsistency: false });
    expect(result.percent).toBe(100);
  });
});

describe("formatScoreReport", () => {
  it("formats report with breakdown", () => {
    const result = { score: 85, maxScore: 100, percent: 85, breakdown: { emptyValues: -10, prefixConsistency: 5 } };
    const report = formatScoreReport(result);
    expect(report).toContain("85/100");
    expect(report).toContain("emptyValues: -10");
    expect(report).toContain("prefixConsistency: +5");
  });
});
