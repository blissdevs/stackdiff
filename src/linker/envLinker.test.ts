import { describe, it, expect } from "vitest";
import {
  parseLinkDirective,
  linkEnvMaps,
  applyLinks,
  formatLinkReport,
  EnvMap,
} from "./envLinker";

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe("parseLinkDirective", () => {
  it("parses a valid directive", () => {
    expect(parseLinkDirective("@prod.DB_HOST")).toEqual({ mapName: "prod", key: "DB_HOST" });
  });

  it("returns null for plain values", () => {
    expect(parseLinkDirective("localhost")).toBeNull();
  });

  it("returns null for partial directives", () => {
    expect(parseLinkDirective("@prod")).toBeNull();
    expect(parseLinkDirective("@.KEY")).toBeNull();
  });
});

describe("linkEnvMaps", () => {
  const prod = makeMap({ DB_HOST: "prod-db.example.com", API_KEY: "secret" });
  const source = makeMap({
    DB_HOST: "@prod.DB_HOST",
    APP_NAME: "myapp",
    MISSING: "@prod.UNKNOWN",
  });

  it("resolves existing cross-references", () => {
    const report = linkEnvMaps(source, "staging", { prod });
    const dbLink = report.links.find((l) => l.key === "DB_HOST");
    expect(dbLink?.resolvedValue).toBe("prod-db.example.com");
    expect(dbLink?.targetMap).toBe("prod");
  });

  it("tracks unresolved references", () => {
    const report = linkEnvMaps(source, "staging", { prod });
    expect(report.unresolved).toContain("MISSING");
  });

  it("ignores non-directive values", () => {
    const report = linkEnvMaps(source, "staging", { prod });
    expect(report.links.map((l) => l.key)).not.toContain("APP_NAME");
  });

  it("returns correct total count", () => {
    const report = linkEnvMaps(source, "staging", { prod });
    expect(report.total).toBe(2);
  });
});

describe("applyLinks", () => {
  it("replaces directive values with resolved values", () => {
    const prod = makeMap({ DB_HOST: "prod-db" });
    const source = makeMap({ DB_HOST: "@prod.DB_HOST", APP: "app" });
    const report = linkEnvMaps(source, "staging", { prod });
    const result = applyLinks(source, report);
    expect(result.get("DB_HOST")).toBe("prod-db");
    expect(result.get("APP")).toBe("app");
  });

  it("leaves unresolved directives unchanged", () => {
    const source = makeMap({ X: "@missing.KEY" });
    const report = linkEnvMaps(source, "s", {});
    const result = applyLinks(source, report);
    expect(result.get("X")).toBe("@missing.KEY");
  });
});

describe("formatLinkReport", () => {
  it("includes resolved and unresolved info", () => {
    const prod = makeMap({ DB_HOST: "db" });
    const source = makeMap({ DB_HOST: "@prod.DB_HOST", BAD: "@prod.NOPE" });
    const report = linkEnvMaps(source, "staging", { prod });
    const text = formatLinkReport(report);
    expect(text).toContain("DB_HOST");
    expect(text).toContain("UNRESOLVED");
    expect(text).toContain("BAD");
  });
});
