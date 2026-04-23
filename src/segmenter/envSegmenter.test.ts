import {
  segmentEnvMap,
  getSegment,
  formatSegmentReport,
  SegmentRule,
} from "./envSegmenter";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

const rules: SegmentRule[] = [
  { name: "secrets", match: (k) => k.includes("SECRET") || k.includes("TOKEN") },
  { name: "database", match: (k) => k.startsWith("DB_") },
  { name: "feature-flags", match: (_k, v) => v === "true" || v === "false" },
];

describe("segmentEnvMap", () => {
  it("places keys into correct segments", () => {
    const env = makeMap({
      DB_HOST: "localhost",
      DB_PORT: "5432",
      API_SECRET: "abc123",
      FEATURE_X: "true",
      APP_NAME: "myapp",
    });

    const segments = segmentEnvMap(env, rules);
    const db = segments.find((s) => s.name === "database");
    const secrets = segments.find((s) => s.name === "secrets");
    const flags = segments.find((s) => s.name === "feature-flags");
    const def = segments.find((s) => s.name === "default");

    expect(db?.keys.has("DB_HOST")).toBe(true);
    expect(db?.keys.has("DB_PORT")).toBe(true);
    expect(secrets?.keys.has("API_SECRET")).toBe(true);
    expect(flags?.keys.has("FEATURE_X")).toBe(true);
    expect(def?.keys.has("APP_NAME")).toBe(true);
  });

  it("returns default segment for unmatched keys", () => {
    const env = makeMap({ FOO: "bar", BAZ: "qux" });
    const segments = segmentEnvMap(env, rules);
    const def = segments.find((s) => s.name === "default");
    expect(def?.keys.size).toBe(2);
  });

  it("handles empty env map", () => {
    const segments = segmentEnvMap(new Map(), rules);
    const nonEmpty = segments.filter((s) => s.keys.size > 0);
    expect(nonEmpty.length).toBe(0);
  });

  it("respects rule priority (first match wins)", () => {
    const env = makeMap({ DB_TOKEN: "secret" });
    const segments = segmentEnvMap(env, rules);
    // DB_TOKEN matches "secrets" first (TOKEN), not "database"
    const secrets = segments.find((s) => s.name === "secrets");
    const db = segments.find((s) => s.name === "database");
    expect(secrets?.keys.has("DB_TOKEN")).toBe(true);
    expect(db?.keys.has("DB_TOKEN")).toBe(false);
  });
});

describe("getSegment", () => {
  it("returns the named segment", () => {
    const env = makeMap({ DB_HOST: "localhost" });
    const segments = segmentEnvMap(env, rules);
    const seg = getSegment(segments, "database");
    expect(seg).toBeDefined();
    expect(seg?.keys.has("DB_HOST")).toBe(true);
  });

  it("returns undefined for unknown segment name", () => {
    const segments = segmentEnvMap(new Map(), rules);
    expect(getSegment(segments, "nonexistent")).toBeUndefined();
  });
});

describe("formatSegmentReport", () => {
  it("includes segment names and keys", () => {
    const env = makeMap({ DB_HOST: "localhost", APP_NAME: "myapp" });
    const segments = segmentEnvMap(env, rules);
    const report = formatSegmentReport(segments);
    expect(report).toContain("Segment Report");
    expect(report).toContain("database");
    expect(report).toContain("DB_HOST=localhost");
  });
});
