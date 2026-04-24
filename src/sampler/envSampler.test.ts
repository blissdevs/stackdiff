import { sampleEnvMap, formatSampleReport } from "./envSampler";
import { EnvMap } from "../parser/envParser";

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe("sampleEnvMap", () => {
  const env = makeMap({
    APP_NAME: "myapp",
    APP_ENV: "production",
    DB_HOST: "localhost",
    DB_PORT: "5432",
    DB_USER: "admin",
    SECRET_KEY: "abc123",
  });

  it("returns all keys when no options given", () => {
    const result = sampleEnvMap(env);
    expect(result.sampleSize).toBe(6);
    expect(result.total).toBe(6);
    expect(result.excluded.length).toBe(0);
  });

  it("samples by count", () => {
    const result = sampleEnvMap(env, { count: 3, seed: 1 });
    expect(result.sampleSize).toBe(3);
    expect(result.total).toBe(6);
    expect(result.excluded.length).toBe(3);
  });

  it("samples by percent", () => {
    const result = sampleEnvMap(env, { percent: 50, seed: 1 });
    expect(result.sampleSize).toBe(3);
    expect(result.total).toBe(6);
  });

  it("samples by explicit keys", () => {
    const result = sampleEnvMap(env, { keys: ["DB_HOST", "DB_PORT"] });
    expect(result.sampleSize).toBe(2);
    expect(result.sampled.has("DB_HOST")).toBe(true);
    expect(result.sampled.has("DB_PORT")).toBe(true);
    expect(result.excluded).toContain("APP_NAME");
  });

  it("is deterministic with same seed", () => {
    const r1 = sampleEnvMap(env, { count: 3, seed: 99 });
    const r2 = sampleEnvMap(env, { count: 3, seed: 99 });
    expect([...r1.sampled.keys()]).toEqual([...r2.sampled.keys()]);
  });

  it("clamps count to total", () => {
    const result = sampleEnvMap(env, { count: 100 });
    expect(result.sampleSize).toBe(6);
  });

  it("handles empty env map", () => {
    const result = sampleEnvMap(makeMap({}), { count: 3 });
    expect(result.sampleSize).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe("formatSampleReport", () => {
  it("includes sampled and excluded keys in report", () => {
    const env = makeMap({ A: "1", B: "2", C: "3" });
    const result = sampleEnvMap(env, { keys: ["A", "B"] });
    const report = formatSampleReport(result);
    expect(report).toContain("Sampled keys : 2");
    expect(report).toContain("A=1");
    expect(report).toContain("B=2");
    expect(report).toContain("Excluded Keys:");
    expect(report).toContain("C");
  });

  it("omits excluded section when nothing excluded", () => {
    const env = makeMap({ X: "10" });
    const result = sampleEnvMap(env);
    const report = formatSampleReport(result);
    expect(report).not.toContain("Excluded Keys:");
  });
});
