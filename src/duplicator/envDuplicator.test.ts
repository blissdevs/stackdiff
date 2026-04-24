import {
  findDuplicates,
  buildDuplicateReport,
  formatDuplicateReport,
} from "./envDuplicator";
import { EnvMap } from "../parser/envParser";

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe("findDuplicates", () => {
  it("returns empty array when no duplicates exist", () => {
    const maps = {
      a: makeMap({ FOO: "1" }),
      b: makeMap({ BAR: "2" }),
    };
    expect(findDuplicates(maps)).toEqual([]);
  });

  it("detects a key with the same value across two sources", () => {
    const maps = {
      a: makeMap({ FOO: "bar" }),
      b: makeMap({ FOO: "bar" }),
    };
    const result = findDuplicates(maps);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("FOO");
    expect(result[0].value).toBe("bar");
    expect(result[0].sources).toEqual(["a", "b"]);
  });

  it("does not flag keys with the same name but different values", () => {
    const maps = {
      a: makeMap({ FOO: "1" }),
      b: makeMap({ FOO: "2" }),
    };
    expect(findDuplicates(maps)).toEqual([]);
  });

  it("handles three sources with partial overlap", () => {
    const maps = {
      a: makeMap({ FOO: "same", BAR: "x" }),
      b: makeMap({ FOO: "same", BAR: "y" }),
      c: makeMap({ FOO: "same" }),
    };
    const result = findDuplicates(maps);
    expect(result).toHaveLength(1);
    expect(result[0].sources).toEqual(["a", "b", "c"]);
  });
});

describe("buildDuplicateReport", () => {
  it("returns zero count when no duplicates", () => {
    const maps = { a: makeMap({ A: "1" }), b: makeMap({ B: "2" }) };
    const report = buildDuplicateReport(maps);
    expect(report.totalDuplicates).toBe(0);
    expect(report.affectedSources).toEqual([]);
  });

  it("lists affected sources correctly", () => {
    const maps = {
      prod: makeMap({ SECRET: "abc" }),
      staging: makeMap({ SECRET: "abc" }),
    };
    const report = buildDuplicateReport(maps);
    expect(report.totalDuplicates).toBe(1);
    expect(report.affectedSources).toContain("prod");
    expect(report.affectedSources).toContain("staging");
  });
});

describe("formatDuplicateReport", () => {
  it("returns no-duplicate message when clean", () => {
    const report = { duplicates: [], totalDuplicates: 0, affectedSources: [] };
    expect(formatDuplicateReport(report)).toMatch(/No duplicate/);
  });

  it("formats duplicates with key, value, and sources", () => {
    const report = {
      duplicates: [{ key: "API_KEY", value: "secret", sources: ["a", "b"] }],
      totalDuplicates: 1,
      affectedSources: ["a", "b"],
    };
    const output = formatDuplicateReport(report);
    expect(output).toContain("API_KEY");
    expect(output).toContain("secret");
    expect(output).toContain("a, b");
  });
});
