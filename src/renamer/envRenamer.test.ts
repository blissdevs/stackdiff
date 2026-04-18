import {
  renameEnvKeys,
  buildRenameMap,
  replaceKeyPrefix,
} from "./envRenamer";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("renameEnvKeys", () => {
  it("renames specified keys", () => {
    const env = makeMap({ OLD_KEY: "value", KEEP: "same" });
    const result = renameEnvKeys(env, { OLD_KEY: "NEW_KEY" });
    expect(result.renamed["NEW_KEY"]).toBe("value");
    expect(result.renamed["KEEP"]).toBe("same");
    expect(result.renamed["OLD_KEY"]).toBeUndefined();
  });

  it("tracks applied renames", () => {
    const env = makeMap({ A: "1", B: "2" });
    const result = renameEnvKeys(env, { A: "ALPHA" });
    expect(result.applied).toEqual({ A: "ALPHA" });
  });

  it("tracks skipped keys", () => {
    const env = makeMap({ A: "1", B: "2" });
    const result = renameEnvKeys(env, { A: "ALPHA" });
    expect(result.skipped).toContain("B");
    expect(result.skipped).not.toContain("A");
  });

  it("returns unchanged map when rename map is empty", () => {
    const env = makeMap({ FOO: "bar" });
    const result = renameEnvKeys(env, {});
    expect(result.renamed).toEqual({ FOO: "bar" });
    expect(result.applied).toEqual({});
  });
});

describe("buildRenameMap", () => {
  it("builds a map from parallel arrays", () => {
    const map = buildRenameMap(["A", "B"], ["ALPHA", "BETA"]);
    expect(map).toEqual({ A: "ALPHA", B: "BETA" });
  });

  it("throws when arrays differ in length", () => {
    expect(() => buildRenameMap(["A"], ["X", "Y"])).toThrow();
  });
});

describe("replaceKeyPrefix", () => {
  it("renames keys matching the old prefix", () => {
    const env = makeMap({ APP_HOST: "localhost", APP_PORT: "3000", OTHER: "x" });
    const result = replaceKeyPrefix(env, "APP_", "SVC_");
    expect(result.renamed["SVC_HOST"]).toBe("localhost");
    expect(result.renamed["SVC_PORT"]).toBe("3000");
    expect(result.renamed["OTHER"]).toBe("x");
  });

  it("leaves map unchanged when no keys match prefix", () => {
    const env = makeMap({ FOO: "1" });
    const result = replaceKeyPrefix(env, "BAR_", "BAZ_");
    expect(result.renamed).toEqual({ FOO: "1" });
    expect(result.applied).toEqual({});
  });
});
