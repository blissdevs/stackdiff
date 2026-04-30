import { swapEnvKeys, formatSwapReport, swapResultToJson, SwapPair } from "./envSwapper";
import { EnvMap } from "../parser/envParser";

function makeMap(entries: Record<string, string>): EnvMap {
  return new Map(Object.entries(entries));
}

describe("swapEnvKeys", () => {
  it("swaps a single key", () => {
    const env = makeMap({ OLD_KEY: "value1", OTHER: "value2" });
    const pairs: SwapPair[] = [{ from: "OLD_KEY", to: "NEW_KEY" }];
    const result = swapEnvKeys(env, pairs);

    expect(result.swapped.has("NEW_KEY")).toBe(true);
    expect(result.swapped.get("NEW_KEY")).toBe("value1");
    expect(result.swapped.has("OLD_KEY")).toBe(false);
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
  });

  it("records skipped pairs when key is missing", () => {
    const env = makeMap({ EXISTING: "yes" });
    const pairs: SwapPair[] = [{ from: "MISSING", to: "TARGET" }];
    const result = swapEnvKeys(env, pairs);

    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].from).toBe("MISSING");
    expect(result.applied).toHaveLength(0);
    expect(result.swapped.has("TARGET")).toBe(false);
  });

  it("overwrites existing target key", () => {
    const env = makeMap({ A: "alpha", B: "beta" });
    const pairs: SwapPair[] = [{ from: "A", to: "B" }];
    const result = swapEnvKeys(env, pairs);

    expect(result.swapped.get("B")).toBe("alpha");
    expect(result.swapped.has("A")).toBe(false);
  });

  it("applies multiple pairs in order", () => {
    const env = makeMap({ X: "1", Y: "2", Z: "3" });
    const pairs: SwapPair[] = [
      { from: "X", to: "X_NEW" },
      { from: "Y", to: "Y_NEW" },
    ];
    const result = swapEnvKeys(env, pairs);

    expect(result.swapped.get("X_NEW")).toBe("1");
    expect(result.swapped.get("Y_NEW")).toBe("2");
    expect(result.swapped.get("Z")).toBe("3");
    expect(result.applied).toHaveLength(2);
  });

  it("does not mutate the original map", () => {
    const env = makeMap({ KEY: "val" });
    swapEnvKeys(env, [{ from: "KEY", to: "KEY2" }]);
    expect(env.has("KEY")).toBe(true);
  });
});

describe("formatSwapReport", () => {
  it("includes applied and skipped sections", () => {
    const env = makeMap({ A: "1" });
    const result = swapEnvKeys(env, [
      { from: "A", to: "B" },
      { from: "MISSING", to: "C" },
    ]);
    const report = formatSwapReport(result);
    expect(report).toContain("Applied");
    expect(report).toContain("A -> B");
    expect(report).toContain("Skipped");
    expect(report).toContain("MISSING -> C");
  });
});

describe("swapResultToJson", () => {
  it("serialises result to a plain object", () => {
    const env = makeMap({ FOO: "bar" });
    const result = swapEnvKeys(env, [{ from: "FOO", to: "BAZ" }]);
    const json = swapResultToJson(result) as any;
    expect(json.swapped["BAZ"]).toBe("bar");
    expect(json.applied[0]).toEqual({ from: "FOO", to: "BAZ" });
    expect(json.skipped).toHaveLength(0);
  });
});
