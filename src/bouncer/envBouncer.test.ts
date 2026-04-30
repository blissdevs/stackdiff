import { bounceEnvMap, formatBounceReport, getBlockedKeys, BounceRule } from "./envBouncer";
import { EnvMap } from "../parser/envParser";

function makeMap(entries: Record<string, string>): EnvMap {
  return entries;
}

const rules: BounceRule[] = [
  { key: "NODE_ENV", allowedValues: ["development", "production", "test"] },
  { key: "LOG_LEVEL", blockedValues: ["debug", "trace"] },
  { key: "PORT", pattern: /^\d+$/ },
];

describe("bounceEnvMap", () => {
  it("allows values that match allowed list", () => {
    const env = makeMap({ NODE_ENV: "production" });
    const report = bounceEnvMap(env, rules);
    expect(report.allowed).toBe(1);
    expect(report.blocked).toBe(0);
  });

  it("blocks values not in allowed list", () => {
    const env = makeMap({ NODE_ENV: "staging" });
    const report = bounceEnvMap(env, rules);
    expect(report.blocked).toBe(1);
    expect(report.results[0].reason).toContain("not in allowed list");
  });

  it("blocks values in blocked list", () => {
    const env = makeMap({ LOG_LEVEL: "debug" });
    const report = bounceEnvMap(env, rules);
    expect(report.blocked).toBe(1);
    expect(report.results[0].reason).toContain("is blocked");
  });

  it("allows values not in blocked list", () => {
    const env = makeMap({ LOG_LEVEL: "info" });
    const report = bounceEnvMap(env, rules);
    expect(report.allowed).toBe(1);
  });

  it("blocks values that do not match pattern", () => {
    const env = makeMap({ PORT: "abc" });
    const report = bounceEnvMap(env, rules);
    expect(report.blocked).toBe(1);
    expect(report.results[0].reason).toContain("does not match pattern");
  });

  it("allows values matching pattern", () => {
    const env = makeMap({ PORT: "3000" });
    const report = bounceEnvMap(env, rules);
    expect(report.allowed).toBe(1);
  });

  it("allows keys with no matching rule", () => {
    const env = makeMap({ UNKNOWN_KEY: "anything" });
    const report = bounceEnvMap(env, rules);
    expect(report.allowed).toBe(1);
  });
});

describe("getBlockedKeys", () => {
  it("returns only blocked key names", () => {
    const env = makeMap({ NODE_ENV: "staging", PORT: "3000" });
    const report = bounceEnvMap(env, rules);
    expect(getBlockedKeys(report)).toEqual(["NODE_ENV"]);
  });
});

describe("formatBounceReport", () => {
  it("includes summary line", () => {
    const env = makeMap({ NODE_ENV: "production", LOG_LEVEL: "trace" });
    const report = bounceEnvMap(env, rules);
    const text = formatBounceReport(report);
    expect(text).toContain("Bouncer Report");
    expect(text).toContain("✓");
    expect(text).toContain("✗");
  });
});
