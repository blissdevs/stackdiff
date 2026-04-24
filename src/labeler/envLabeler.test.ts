import { describe, it, expect } from "vitest";
import {
  labelEnvMap,
  filterByLabel,
  buildLabelReport,
  formatLabelReport,
  LabelRule,
} from "./envLabeler";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("labelEnvMap", () => {
  it("assigns labels based on default rules", () => {
    const env = makeMap({
      DB_HOST: "localhost",
      API_KEY: "abc123",
      PORT: "3000",
      APP_NAME: "myapp",
    });
    const entries = labelEnvMap(env);
    const db = entries.find((e) => e.key === "DB_HOST");
    expect(db?.labels).toContain("database");
    const api = entries.find((e) => e.key === "API_KEY");
    expect(api?.labels).toContain("secret");
    const port = entries.find((e) => e.key === "PORT");
    expect(port?.labels).toContain("network");
    const app = entries.find((e) => e.key === "APP_NAME");
    expect(app?.labels).toHaveLength(0);
  });

  it("applies custom rules", () => {
    const env = makeMap({ FEATURE_FLAG: "true", OTHER: "val" });
    const rules: LabelRule[] = [{ pattern: /^FEATURE_/, label: "feature" }];
    const entries = labelEnvMap(env, rules);
    const ff = entries.find((e) => e.key === "FEATURE_FLAG");
    expect(ff?.labels).toContain("feature");
    const other = entries.find((e) => e.key === "OTHER");
    expect(other?.labels).toHaveLength(0);
  });

  it("deduplicates labels when multiple rules match", () => {
    const env = makeMap({ DB_HOST: "localhost" });
    const rules: LabelRule[] = [
      { pattern: /^DB_/, label: "database" },
      { pattern: /HOST/, label: "database" },
    ];
    const entries = labelEnvMap(env, rules);
    expect(entries[0].labels.filter((l) => l === "database")).toHaveLength(1);
  });
});

describe("filterByLabel", () => {
  it("returns only entries with the given label", () => {
    const env = makeMap({ AWS_REGION: "us-east-1", LOG_LEVEL: "info", PORT: "8080" });
    const entries = labelEnvMap(env);
    const cloud = filterByLabel(entries, "cloud");
    expect(cloud.map((e) => e.key)).toContain("AWS_REGION");
    expect(cloud.map((e) => e.key)).not.toContain("LOG_LEVEL");
  });
});

describe("buildLabelReport", () => {
  it("counts labels correctly", () => {
    const env = makeMap({ AWS_KEY: "x", AWS_SECRET: "y", DB_PASS: "z", PLAIN: "v" });
    const report = buildLabelReport(env);
    expect(report.labelCounts["cloud"]).toBeGreaterThanOrEqual(1);
    expect(report.labelCounts["secret"]).toBeGreaterThanOrEqual(1);
    expect(report.unlabeled).not.toContain("AWS_KEY");
  });

  it("tracks unlabeled keys", () => {
    const env = makeMap({ PLAIN_VAR: "hello" });
    const report = buildLabelReport(env);
    expect(report.unlabeled).toContain("PLAIN_VAR");
  });
});

describe("formatLabelReport", () => {
  it("produces a non-empty string report", () => {
    const env = makeMap({ PORT: "3000", SECRET_KEY: "abc" });
    const report = buildLabelReport(env);
    const text = formatLabelReport(report);
    expect(text).toContain("Label Report");
    expect(text).toContain("network");
  });
});
