import { planEnvChanges, formatPlanReport, planToJson } from "./envPlanner";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("planEnvChanges", () => {
  it("detects added keys", () => {
    const current = makeMap({ A: "1" });
    const target = makeMap({ A: "1", B: "2" });
    const plan = planEnvChanges(current, target);
    expect(plan.addCount).toBe(1);
    const added = plan.entries.find((e) => e.key === "B");
    expect(added?.action).toBe("add");
    expect(added?.targetValue).toBe("2");
  });

  it("detects removed keys", () => {
    const current = makeMap({ A: "1", B: "2" });
    const target = makeMap({ A: "1" });
    const plan = planEnvChanges(current, target);
    expect(plan.removeCount).toBe(1);
    const removed = plan.entries.find((e) => e.key === "B");
    expect(removed?.action).toBe("remove");
    expect(removed?.currentValue).toBe("2");
  });

  it("detects updated keys", () => {
    const current = makeMap({ A: "old" });
    const target = makeMap({ A: "new" });
    const plan = planEnvChanges(current, target);
    expect(plan.updateCount).toBe(1);
    const updated = plan.entries.find((e) => e.key === "A");
    expect(updated?.action).toBe("update");
    expect(updated?.currentValue).toBe("old");
    expect(updated?.targetValue).toBe("new");
  });

  it("detects kept keys", () => {
    const current = makeMap({ A: "1", B: "2" });
    const target = makeMap({ A: "1", B: "2" });
    const plan = planEnvChanges(current, target);
    expect(plan.keepCount).toBe(2);
    expect(plan.addCount).toBe(0);
    expect(plan.removeCount).toBe(0);
    expect(plan.updateCount).toBe(0);
  });

  it("sorts entries by key", () => {
    const current = makeMap({ Z: "1", A: "1" });
    const target = makeMap({ Z: "1", A: "2", M: "3" });
    const plan = planEnvChanges(current, target);
    const keys = plan.entries.map((e) => e.key);
    expect(keys).toEqual(["A", "M", "Z"]);
  });
});

describe("formatPlanReport", () => {
  it("includes summary line", () => {
    const current = makeMap({ A: "1" });
    const target = makeMap({ B: "2" });
    const plan = planEnvChanges(current, target);
    const report = formatPlanReport(plan);
    expect(report).toContain("+1 add");
    expect(report).toContain("-1 remove");
  });

  it("shows add/remove/update/keep symbols", () => {
    const current = makeMap({ A: "old", C: "3" });
    const target = makeMap({ A: "new", B: "2" });
    const plan = planEnvChanges(current, target);
    const report = formatPlanReport(plan);
    expect(report).toContain("+ B=2");
    expect(report).toContain("- C=3");
    expect(report).toContain("~ A: old -> new");
  });
});

describe("planToJson", () => {
  it("returns summary and entries", () => {
    const current = makeMap({ A: "1" });
    const target = makeMap({ A: "1", B: "2" });
    const plan = planEnvChanges(current, target);
    const json = planToJson(plan) as any;
    expect(json.summary.add).toBe(1);
    expect(json.summary.keep).toBe(1);
    expect(json.entries).toHaveLength(2);
  });
});
