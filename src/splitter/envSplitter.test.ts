import { splitEnvMap, splitByPredicate, splitByPrefix, formatSplitReport } from "./envSplitter";

const makeMap = (entries: Record<string, string>) => new Map(Object.entries(entries));

describe("splitEnvMap", () => {
  it("splits into equal chunks", () => {
    const env = makeMap({ A: "1", B: "2", C: "3", D: "4" });
    const chunks = splitEnvMap(env, 2);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].size).toBe(2);
    expect(chunks[1].size).toBe(2);
  });

  it("handles remainder chunk", () => {
    const env = makeMap({ A: "1", B: "2", C: "3" });
    const chunks = splitEnvMap(env, 2);
    expect(chunks).toHaveLength(2);
    expect(chunks[1].size).toBe(1);
  });

  it("throws on invalid chunkSize", () => {
    expect(() => splitEnvMap(new Map(), 0)).toThrow();
  });
});

describe("splitByPredicate", () => {
  it("splits matched and unmatched", () => {
    const env = makeMap({ DB_HOST: "localhost", APP_NAME: "test", DB_PORT: "5432" });
    const [matched, unmatched] = splitByPredicate(env, (k) => k.startsWith("DB_"));
    expect(matched.size).toBe(2);
    expect(unmatched.size).toBe(1);
    expect(matched.has("DB_HOST")).toBe(true);
    expect(unmatched.has("APP_NAME")).toBe(true);
  });
});

describe("splitByPrefix", () => {
  it("groups keys by prefix", () => {
    const env = makeMap({ DB_HOST: "h", DB_PORT: "5432", APP_ENV: "prod", SECRET: "x" });
    const result = splitByPrefix(env, ["DB_", "APP_"]);
    expect(result["DB_"].size).toBe(2);
    expect(result["APP_"].size).toBe(1);
    expect(result["_other"].size).toBe(1);
    expect(result["_other"].has("SECRET")).toBe(true);
  });
});

describe("formatSplitReport", () => {
  it("formats report string", () => {
    const env = makeMap({ A: "1", B: "2", C: "3" });
    const chunks = splitEnvMap(env, 2);
    const report = formatSplitReport({ chunks, chunkSize: 2, total: 3 });
    expect(report).toContain("Total keys : 3");
    expect(report).toContain("Chunks     : 2");
  });
});
