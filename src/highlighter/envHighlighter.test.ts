import { highlightEnvMap, formatHighlightReport, matchesRule, HighlightRule } from "./envHighlighter";

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

const rules: HighlightRule[] = [
  { pattern: /SECRET|PASSWORD|TOKEN/i, label: "sensitive", color: "red" },
  { pattern: "DEBUG", label: "debug", color: "yellow" },
  { pattern: /^DB_/, label: "database", color: "blue" },
];

describe("matchesRule", () => {
  it("matches regex pattern", () => {
    expect(matchesRule("API_SECRET", rules[0])).toBe(true);
    expect(matchesRule("API_KEY", rules[0])).toBe(false);
  });

  it("matches string pattern", () => {
    expect(matchesRule("DEBUG_MODE", rules[1])).toBe(true);
    expect(matchesRule("VERBOSE", rules[1])).toBe(false);
  });

  it("matches prefix regex", () => {
    expect(matchesRule("DB_HOST", rules[2])).toBe(true);
    expect(matchesRule("DATABASE_URL", rules[2])).toBe(false);
  });
});

describe("highlightEnvMap", () => {
  it("returns matched keys", () => {
    const env = makeMap({
      API_SECRET: "abc123",
      PORT: "3000",
      DB_HOST: "localhost",
      DEBUG_MODE: "true",
    });
    const report = highlightEnvMap(env, rules);
    expect(report.totalKeys).toBe(4);
    expect(report.totalHighlighted).toBe(3);
    const keys = report.matches.map((m) => m.key);
    expect(keys).toContain("API_SECRET");
    expect(keys).toContain("DB_HOST");
    expect(keys).toContain("DEBUG_MODE");
    expect(keys).not.toContain("PORT");
  });

  it("returns empty matches when no rules match", () => {
    const env = makeMap({ PORT: "3000", HOST: "localhost" });
    const report = highlightEnvMap(env, rules);
    expect(report.totalHighlighted).toBe(0);
    expect(report.matches).toHaveLength(0);
  });

  it("assigns correct labels to matches", () => {
    const env = makeMap({ DB_PASSWORD: "secret" });
    const report = highlightEnvMap(env, rules);
    expect(report.matches[0].matchedRules).toContain("sensitive");
    expect(report.matches[0].matchedRules).toContain("database");
  });
});

describe("formatHighlightReport", () => {
  it("includes key count summary", () => {
    const env = makeMap({ API_TOKEN: "tok", PORT: "80" });
    const report = highlightEnvMap(env, rules);
    const output = formatHighlightReport(report, rules, false);
    expect(output).toContain("1 / 2");
    expect(output).toContain("API_TOKEN");
  });

  it("includes label in output", () => {
    const env = makeMap({ DEBUG: "1" });
    const report = highlightEnvMap(env, rules);
    const output = formatHighlightReport(report, rules, false);
    expect(output).toContain("debug");
  });
});
