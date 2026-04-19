import {
  groupByPrefix,
  getGroup,
  listGroupNames,
  formatGroupReport,
  flattenGroup,
} from "./envGrouper";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("groupByPrefix", () => {
  it("groups keys by prefix", () => {
    const env = makeMap({
      DB_HOST: "localhost",
      DB_PORT: "5432",
      APP_NAME: "test",
      PORT: "3000",
    });
    const groups = groupByPrefix(env);
    expect(groups.has("DB")).toBe(true);
    expect(groups.get("DB")!.keys).toContain("DB_HOST");
    expect(groups.get("DB")!.keys).toContain("DB_PORT");
    expect(groups.has("APP")).toBe(true);
    expect(groups.has("__ungrouped__")).toBe(true);
  });

  it("places keys without delimiter into __ungrouped__", () => {
    const env = makeMap({ PORT: "8080", HOST: "0.0.0.0" });
    const groups = groupByPrefix(env);
    expect(groups.get("__ungrouped__")!.keys).toEqual(
      expect.arrayContaining(["PORT", "HOST"])
    );
  });
});

describe("getGroup", () => {
  it("returns the group by name", () => {
    const env = makeMap({ DB_HOST: "localhost" });
    const groups = groupByPrefix(env);
    const group = getGroup(groups, "DB");
    expect(group).toBeDefined();
    expect(group!.name).toBe("DB");
  });

  it("returns undefined for missing group", () => {
    const groups = groupByPrefix(new Map());
    expect(getGroup(groups, "MISSING")).toBeUndefined();
  });
});

describe("listGroupNames", () => {
  it("returns sorted group names", () => {
    const env = makeMap({ Z_KEY: "1", A_KEY: "2", M_KEY: "3" });
    const names = listGroupNames(groupByPrefix(env));
    expect(names).toEqual(["A", "M", "Z"]);
  });
});

describe("formatGroupReport", () => {
  it("formats a readable report", () => {
    const env = makeMap({ DB_HOST: "localhost", DB_PORT: "5432" });
    const report = formatGroupReport(groupByPrefix(env));
    expect(report).toContain("[DB]");
    expect(report).toContain("DB_HOST=localhost");
  });
});

describe("flattenGroup", () => {
  it("returns a Map from group entries", () => {
    const env = makeMap({ DB_HOST: "localhost" });
    const groups = groupByPrefix(env);
    const flat = flattenGroup(groups.get("DB")!);
    expect(flat.get("DB_HOST")).toBe("localhost");
  });
});
