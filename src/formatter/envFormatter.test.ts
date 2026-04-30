import { describe, it, expect } from "vitest";
import {
  formatAsDotenv,
  formatAsExport,
  formatAsYaml,
  formatAsTable,
  formatEnvMap,
} from "./envFormatter";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("formatAsDotenv", () => {
  it("renders simple key=value pairs", () => {
    const result = formatAsDotenv(makeMap({ FOO: "bar", BAZ: "qux" }));
    expect(result).toContain("FOO=bar");
    expect(result).toContain("BAZ=qux");
  });

  it("quotes values with spaces", () => {
    const result = formatAsDotenv(makeMap({ MSG: "hello world" }));
    expect(result).toContain('MSG="hello world"');
  });

  it("includes comment header when requested", () => {
    const result = formatAsDotenv(makeMap({ A: "1" }), true);
    expect(result).toMatch(/^# Generated/);
  });
});

describe("formatAsExport", () => {
  it("prepends export keyword", () => {
    const result = formatAsExport(makeMap({ NODE_ENV: "production" }));
    expect(result).toBe("export NODE_ENV=production");
  });

  it("quotes values with equals sign", () => {
    const result = formatAsExport(makeMap({ CONN: "user=admin" }));
    expect(result).toContain('export CONN="user=admin"');
  });
});

describe("formatAsYaml", () => {
  it("wraps entries under env key", () => {
    const result = formatAsYaml(makeMap({ PORT: "3000" }));
    expect(result).toMatch(/^env:/);
    expect(result).toContain("  PORT: 3000");
  });

  it("quotes values with special yaml characters", () => {
    const result = formatAsYaml(makeMap({ URL: "http://x:80" }));
    expect(result).toContain('"http://x:80"');
  });
});

describe("formatAsTable", () => {
  it("renders a table with header", () => {
    const result = formatAsTable(makeMap({ A: "1", B: "2" }));
    expect(result).toContain("KEY");
    expect(result).toContain("VALUE");
    expect(result).toContain("A");
  });

  it("returns (empty) for empty map", () => {
    expect(formatAsTable(new Map())).toBe("(empty)");
  });
});

describe("formatEnvMap", () => {
  it("delegates to json format", () => {
    const result = formatEnvMap(makeMap({ X: "1" }), { style: "json" });
    expect(result.style).toBe("json");
    expect(JSON.parse(result.content)).toEqual({ X: "1" });
  });

  it("reports correct line count", () => {
    const result = formatEnvMap(makeMap({ A: "1", B: "2" }), { style: "dotenv" });
    expect(result.lineCount).toBe(2);
  });
});
