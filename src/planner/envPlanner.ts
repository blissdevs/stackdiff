import { EnvMap } from "../parser/envParser";

export type PlanAction = "add" | "remove" | "update" | "keep";

export interface PlanEntry {
  key: string;
  action: PlanAction;
  currentValue?: string;
  targetValue?: string;
}

export interface EnvPlan {
  entries: PlanEntry[];
  addCount: number;
  removeCount: number;
  updateCount: number;
  keepCount: number;
}

/**
 * Computes the diff between a current and target environment variable map.
 * Returns a plan describing what actions are needed to transition from current to target.
 */
export function planEnvChanges(current: EnvMap, target: EnvMap): EnvPlan {
  const entries: PlanEntry[] = [];
  const allKeys = new Set([...current.keys(), ...target.keys()]);

  for (const key of allKeys) {
    const currentValue = current.get(key);
    const targetValue = target.get(key);

    if (currentValue === undefined && targetValue !== undefined) {
      entries.push({ key, action: "add", targetValue });
    } else if (currentValue !== undefined && targetValue === undefined) {
      entries.push({ key, action: "remove", currentValue });
    } else if (currentValue !== targetValue) {
      entries.push({ key, action: "update", currentValue, targetValue });
    } else {
      entries.push({ key, action: "keep", currentValue });
    }
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    entries,
    addCount: entries.filter((e) => e.action === "add").length,
    removeCount: entries.filter((e) => e.action === "remove").length,
    updateCount: entries.filter((e) => e.action === "update").length,
    keepCount: entries.filter((e) => e.action === "keep").length,
  };
}

/**
 * Formats a human-readable summary of the plan, listing each entry with its action symbol.
 */
export function formatPlanReport(plan: EnvPlan): string {
  const lines: string[] = [];
  lines.push(`Plan: +${plan.addCount} add, -${plan.removeCount} remove, ~${plan.updateCount} update, =${plan.keepCount} keep`);
  lines.push("");

  for (const entry of plan.entries) {
    if (entry.action === "add") {
      lines.push(`  + ${entry.key}=${entry.targetValue}`);
    } else if (entry.action === "remove") {
      lines.push(`  - ${entry.key}=${entry.currentValue}`);
    } else if (entry.action === "update") {
      lines.push(`  ~ ${entry.key}: ${entry.currentValue} -> ${entry.targetValue}`);
    } else {
      lines.push(`  = ${entry.key}=${entry.currentValue}`);
    }
  }

  return lines.join("\n");
}

export function planToJson(plan: EnvPlan): object {
  return {
    summary: {
      add: plan.addCount,
      remove: plan.removeCount,
      update: plan.updateCount,
      keep: plan.keepCount,
    },
    entries: plan.entries,
  };
}

/**
 * Returns true if the plan requires no changes (i.e. all entries are "keep").
 */
export function isNoop(plan: EnvPlan): boolean {
  return plan.addCount === 0 && plan.removeCount === 0 && plan.updateCount === 0;
}
