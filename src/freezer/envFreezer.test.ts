import {
  freezeEnvMap,
  unfreezeEnvMap,
  isFrozen,
  formatFreezeReport,
} from "./envFreezer";

const base = { API_KEY: "abc", DB_URL: "postgres://", PORT: "3000" };

describe("freezeEnvMap", () => {
  it("freezes all keys when no filter given", () => {
    const { frozen, frozenKeys } = freezeEnvMap(base);
    expect(frozenKeys).toHaveLength(3);
    expect(isFrozen(frozen)).toBe(true);
  });

  it("tracks only specified keys as frozen", () => {
    const { frozenKeys } = freezeEnvMap(base, ["API_KEY"]);
    expect(frozenKeys).toEqual(["API_KEY"]);
  });

  it("preserves all values regardless of filter", () => {
    const { frozen } = freezeEnvMap(base, ["API_KEY"]);
    expect(frozen["DB_URL"]).toBe("postgres://");
  });
});

describe("unfreezeEnvMap", () => {
  it("applies overrides to unfrozen copy", () => {
    const { frozen } = freezeEnvMap(base);
    const { unfrozen } = unfreezeEnvMap(frozen, { PORT: "4000" });
    expect(unfrozen["PORT"]).toBe("4000");
  });

  it("skips protected keys", () => {
    const { frozen } = freezeEnvMap(base);
    const { unfrozen, skippedKeys } = unfreezeEnvMap(
      frozen,
      { API_KEY: "new" },
      ["API_KEY"]
    );
    expect(unfrozen["API_KEY"]).toBe("abc");
    expect(skippedKeys).toContain("API_KEY");
  });
});

describe("formatFreezeReport", () => {
  it("lists frozen keys", () => {
    const result = freezeEnvMap(base, ["API_KEY", "PORT"]);
    const report = formatFreezeReport(result);
    expect(report).toContain("[frozen] API_KEY");
    expect(report).toContain("Frozen keys (2)");
  });
});
