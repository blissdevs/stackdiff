import { compareEnvMaps, formatCompareReport } from "./envComparer";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("compareEnvMaps", () => {
  it("detects matching keys", () => {
    const left = makeMap({ A: "1", B: "2" });
    const right = makeMap({ A: "1", B: "2" });
    const report = compareEnvMaps(left, right);
    expect(report.matchCount).toBe(2);
    expect(report.mismatchCount).toBe(0);
  });

  it("detects mismatched values", () => {
    const left = makeMap({ A: "1" });
    const right = makeMap({ A: "2" });
    const report = compareEnvMaps(left, right);
    expect(report.mismatchCount).toBe(1);
    expect(report.results[0].status).toBe("mismatch");
  });

  it("detects left-only keys", () => {
    const left = makeMap({ A: "1", B: "2" });
    const right = makeMap({ A: "1" });
    const report = compareEnvMaps(left, right);
    expect(report.leftOnlyCount).toBe(1);
    expect(report.results.find((r) => r.key === "B")?.status).toBe("left_only");
  });

  it("detects right-only keys", () => {
    const left = makeMap({ A: "1" });
    const right = makeMap({ A: "1", C: "3" });
    const report = compareEnvMaps(left, right);
    expect(report.rightOnlyCount).toBe(1);
    expect(report.results.find((r) => r.key === "C")?.status).toBe("right_only");
  });

  it("returns sorted results", () => {
    const left = makeMap({ Z: "1", A: "2" });
    const right = makeMap({ Z: "1", A: "2" });
    const report = compareEnvMaps(left, right);
    expect(report.results[0].key).toBe("A");
    expect(report.results[1].key).toBe("Z");
  });
});

describe("formatCompareReport", () => {
  it("includes summary line", () => {
    const left = makeMap({ A: "1" });
    const right = makeMap({ A: "1" });
    const report = compareEnvMaps(left, right);
    const text = formatCompareReport(report);
    expect(text).toContain("Summary:");
    expect(text).toContain("1 match");
  });

  it("marks mismatch with ~", () => {
    const left = makeMap({ X: "old" });
    const right = makeMap({ X: "new" });
    const report = compareEnvMaps(left, right);
    const text = formatCompareReport(report);
    expect(text).toContain("~ X");
  });
});
