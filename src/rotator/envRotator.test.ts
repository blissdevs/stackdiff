import { rotateEnvMap, formatRotateReport, rotateResultsToJson } from "./envRotator";
import { EnvMap } from "../parser/envParser";

function makeMap(obj: Record<string, string>): EnvMap {
  return new Map(Object.entries(obj));
}

describe("rotateEnvMap", () => {
  it("rotates all keys by default", () => {
    const env = makeMap({ API_KEY: "old1", DB_PASS: "old2" });
    const { rotated, results } = rotateEnvMap(env);
    expect(rotated.get("API_KEY")).not.toBe("old1");
    expect(rotated.get("DB_PASS")).not.toBe("old2");
    expect(results.every((r) => r.rotated)).toBe(true);
  });

  it("rotates only specified keys", () => {
    const env = makeMap({ API_KEY: "old1", DB_PASS: "old2", PORT: "3000" });
    const { rotated, results } = rotateEnvMap(env, { keys: ["API_KEY"] });
    expect(rotated.get("API_KEY")).not.toBe("old1");
    expect(rotated.get("DB_PASS")).toBe("old2");
    expect(rotated.get("PORT")).toBe("3000");
    const rotatedResults = results.filter((r) => r.rotated);
    expect(rotatedResults).toHaveLength(1);
    expect(rotatedResults[0].key).toBe("API_KEY");
  });

  it("uses custom generator", () => {
    const env = makeMap({ SECRET: "abc" });
    const { rotated } = rotateEnvMap(env, {
      generator: (key) => `new-${key}-value`,
    });
    expect(rotated.get("SECRET")).toBe("new-SECRET-value");
  });

  it("dry run does not modify values", () => {
    const env = makeMap({ TOKEN: "original" });
    const { rotated, results } = rotateEnvMap(env, { dryRun: true });
    expect(rotated.get("TOKEN")).toBe("original");
    expect(results[0].rotated).toBe(false);
    expect(results[0].newValue).not.toBe("original");
  });

  it("returns empty results for empty map", () => {
    const { rotated, results } = rotateEnvMap(new Map());
    expect(rotated.size).toBe(0);
    expect(results).toHaveLength(0);
  });
});

describe("formatRotateReport", () => {
  it("includes rotated and skipped counts", () => {
    const env = makeMap({ A: "1", B: "2", C: "3" });
    const { results } = rotateEnvMap(env, { keys: ["A", "B"] });
    const report = formatRotateReport(results);
    expect(report).toContain("Rotated : 2");
    expect(report).toContain("Skipped : 1");
    expect(report).toContain("[rotated] A");
    expect(report).toContain("[skipped] C");
  });
});

describe("rotateResultsToJson", () => {
  it("serializes results to JSON without values", () => {
    const env = makeMap({ KEY: "val" });
    const { results } = rotateEnvMap(env);
    const json = JSON.parse(rotateResultsToJson(results));
    expect(json[0]).toHaveProperty("key", "KEY");
    expect(json[0]).toHaveProperty("rotated");
    expect(json[0]).not.toHaveProperty("oldValue");
  });
});
