import {
  flattenNestedEnv,
  unflattenEnvMap,
  formatFlattenReport,
  buildFlattenReport,
} from "./envFlattener";

describe("flattenNestedEnv", () => {
  it("flattens a nested object", () => {
    const obj = { db: { host: "localhost", port: 5432 } };
    const result = flattenNestedEnv(obj);
    expect(result.get("DB__HOST")).toBe("localhost");
    expect(result.get("DB__PORT")).toBe("5432");
  });

  it("uses custom separator", () => {
    const obj = { app: { name: "stackdiff" } };
    const result = flattenNestedEnv(obj, { separator: "_" });
    expect(result.get("APP_NAME")).toBe("stackdiff");
  });

  it("applies prefix", () => {
    const obj = { host: "localhost" };
    const result = flattenNestedEnv(obj, { prefix: "DB" });
    expect(result.get("DB__HOST")).toBe("localhost");
  });

  it("handles arrays", () => {
    const obj = { hosts: ["a", "b"] };
    const result = flattenNestedEnv(obj);
    expect(result.get("HOSTS__0")).toBe("a");
    expect(result.get("HOSTS__1")).toBe("b");
  });

  it("skips null values", () => {
    const obj = { key: null };
    const result = flattenNestedEnv(obj);
    expect(result.size).toBe(0);
  });

  it("respects maxDepth", () => {
    const obj = { a: { b: { c: { d: "deep" } } } };
    const result = flattenNestedEnv(obj, { maxDepth: 2 });
    expect(result.has("A__B__C__D")).toBe(false);
  });
});

describe("unflattenEnvMap", () => {
  it("unflattens a map back to nested object", () => {
    const map = new Map([["DB__HOST", "localhost"]]);
    const result = unflattenEnvMap(map);
    expect((result["db"] as Record<string, unknown>)["host"]).toBe("localhost");
  });

  it("handles single-level keys", () => {
    const map = new Map([["PORT", "3000"]]);
    const result = unflattenEnvMap(map);
    expect(result["port"]).toBe("3000");
  });
});

describe("buildFlattenReport and formatFlattenReport", () => {
  it("builds and formats a report", () => {
    const obj = { db: { host: "localhost" } };
    const result = new Map([["DB__HOST", "localhost"]]);
    const report = buildFlattenReport(obj, result);
    expect(report.original).toBe(1);
    expect(report.flattened).toBe(1);
    const text = formatFlattenReport(report);
    expect(text).toContain("Flatten Report");
    expect(text).toContain("DB__HOST");
  });
});
