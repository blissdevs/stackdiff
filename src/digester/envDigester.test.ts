import { digestEnvMap, digestsMatch, diffDigests, formatDigestReport } from "./envDigester";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("digestEnvMap", () => {
  it("produces a sha256 hash by default", () => {
    const d = digestEnvMap(makeMap({ A: "1", B: "2" }));
    expect(d.algorithm).toBe("sha256");
    expect(d.hash).toHaveLength(64);
    expect(d.keyCount).toBe(2);
  });

  it("is order-independent", () => {
    const d1 = digestEnvMap(makeMap({ A: "1", B: "2" }));
    const d2 = digestEnvMap(makeMap({ B: "2", A: "1" }));
    expect(d1.hash).toBe(d2.hash);
  });

  it("differs when values change", () => {
    const d1 = digestEnvMap(makeMap({ A: "1" }));
    const d2 = digestEnvMap(makeMap({ A: "2" }));
    expect(d1.hash).not.toBe(d2.hash);
  });

  it("supports md5 algorithm", () => {
    const d = digestEnvMap(makeMap({ X: "y" }), "md5");
    expect(d.algorithm).toBe("md5");
    expect(d.hash).toHaveLength(32);
  });
});

describe("digestsMatch", () => {
  it("returns true for identical envs", () => {
    const m = makeMap({ A: "1" });
    expect(digestsMatch(digestEnvMap(m), digestEnvMap(m))).toBe(true);
  });

  it("returns false for different envs", () => {
    const d1 = digestEnvMap(makeMap({ A: "1" }));
    const d2 = digestEnvMap(makeMap({ A: "2" }));
    expect(digestsMatch(d1, d2)).toBe(false);
  });
});

describe("diffDigests", () => {
  it("identifies keys only in each side", () => {
    const d1 = digestEnvMap(makeMap({ A: "1", B: "2" }));
    const d2 = digestEnvMap(makeMap({ B: "2", C: "3" }));
    const result = diffDigests(d1, d2);
    expect(result.onlyInA).toContain("A");
    expect(result.onlyInB).toContain("C");
    expect(result.match).toBe(false);
  });
});

describe("formatDigestReport", () => {
  it("includes label and hash", () => {
    const d = digestEnvMap(makeMap({ A: "1" }));
    const report = formatDigestReport(d, "prod");
    expect(report).toContain("prod");
    expect(report).toContain(d.hash);
  });
});
