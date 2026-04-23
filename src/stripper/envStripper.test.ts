import { describe, it, expect } from "vitest";
import {
  shouldStrip,
  stripEnvMap,
  formatStripReport,
} from "./envStripper";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("shouldStrip", () => {
  it("returns true for explicit key match", () => {
    expect(shouldStrip("SECRET", { keys: ["SECRET"] })).toBe(true);
  });

  it("returns true for prefix match", () => {
    expect(shouldStrip("INTERNAL_TOKEN", { prefixes: ["INTERNAL_"] })).toBe(true);
  });

  it("returns true for pattern match", () => {
    expect(shouldStrip("DB_PASS", { patterns: [/_PASS$/] })).toBe(true);
  });

  it("returns false when no criteria match", () => {
    expect(shouldStrip("APP_NAME", { keys: ["SECRET"], prefixes: ["INTERNAL_"] })).toBe(false);
  });

  it("returns false with empty options", () => {
    expect(shouldStrip("ANY_KEY", {})).toBe(false);
  });
});

describe("stripEnvMap", () => {
  it("removes keys matching explicit list", () => {
    const env = makeMap({ A: "1", B: "2", C: "3" });
    const { stripped, removed } = stripEnvMap(env, { keys: ["B"] });
    expect(stripped.has("B")).toBe(false);
    expect(removed.has("B")).toBe(true);
    expect(stripped.size).toBe(2);
  });

  it("removes keys matching prefix", () => {
    const env = makeMap({ PROD_HOST: "a", PROD_PORT: "b", DEV_HOST: "c" });
    const { stripped, removed } = stripEnvMap(env, { prefixes: ["PROD_"] });
    expect(removed.size).toBe(2);
    expect(stripped.size).toBe(1);
  });

  it("removes keys matching regex pattern", () => {
    const env = makeMap({ DB_PASSWORD: "x", DB_HOST: "y", API_SECRET: "z" });
    const { stripped, removed } = stripEnvMap(env, { patterns: [/PASSWORD|SECRET/] });
    expect(removed.size).toBe(2);
    expect(stripped.has("DB_HOST")).toBe(true);
  });

  it("returns all keys in stripped when no criteria match", () => {
    const env = makeMap({ A: "1", B: "2" });
    const { stripped, removed } = stripEnvMap(env, {});
    expect(stripped.size).toBe(2);
    expect(removed.size).toBe(0);
  });
});

describe("formatStripReport", () => {
  it("includes counts and removed keys", () => {
    const env = makeMap({ SECRET: "s", HOST: "h" });
    const result = stripEnvMap(env, { keys: ["SECRET"] });
    const report = formatStripReport(result);
    expect(report).toContain("Stripped 1 key(s)");
    expect(report).toContain("SECRET");
  });

  it("omits removed section when nothing was removed", () => {
    const env = makeMap({ A: "1" });
    const result = stripEnvMap(env, {});
    const report = formatStripReport(result);
    expect(report).not.toContain("Removed keys");
  });
});
