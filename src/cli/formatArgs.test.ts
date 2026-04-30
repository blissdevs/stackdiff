import { describe, it, expect } from "vitest";
import { parseFormatArgs, hasFormatOptions, formatArgsToOptions } from "./formatArgs";

describe("parseFormatArgs", () => {
  it("returns defaults with no args", () => {
    const args = parseFormatArgs([]);
    expect(args.style).toBe("dotenv");
    expect(args.indent).toBe(2);
    expect(args.includeComments).toBe(false);
    expect(args.output).toBeUndefined();
  });

  it("parses --style flag", () => {
    expect(parseFormatArgs(["--style", "yaml"]).style).toBe("yaml");
    expect(parseFormatArgs(["-s", "table"]).style).toBe("table");
  });

  it("throws on unknown style", () => {
    expect(() => parseFormatArgs(["--style", "xml"])).toThrow(/Unknown format style/);
  });

  it("parses --indent flag", () => {
    expect(parseFormatArgs(["--indent", "4"]).indent).toBe(4);
  });

  it("parses --comments flag", () => {
    expect(parseFormatArgs(["--comments"]).includeComments).toBe(true);
    expect(parseFormatArgs(["-c"]).includeComments).toBe(true);
  });

  it("parses --output flag", () => {
    expect(parseFormatArgs(["--output", "out.env"]).output).toBe("out.env");
    expect(parseFormatArgs(["-o", "result.yaml"]).output).toBe("result.yaml");
  });

  it("parses multiple flags together", () => {
    const args = parseFormatArgs(["-s", "json", "--indent", "4", "-o", "env.json"]);
    expect(args.style).toBe("json");
    expect(args.indent).toBe(4);
    expect(args.output).toBe("env.json");
  });
});

describe("hasFormatOptions", () => {
  it("returns false for defaults", () => {
    expect(hasFormatOptions(parseFormatArgs([]))).toBe(false);
  });

  it("returns true when style differs from dotenv", () => {
    expect(hasFormatOptions(parseFormatArgs(["--style", "yaml"]))).toBe(true);
  });

  it("returns true when comments enabled", () => {
    expect(hasFormatOptions(parseFormatArgs(["--comments"]))).toBe(true);
  });

  it("returns true when output is set", () => {
    expect(hasFormatOptions(parseFormatArgs(["-o", "out.env"]))).toBe(true);
  });
});

describe("formatArgsToOptions", () => {
  it("maps args to FormatOptions correctly", () => {
    const args = parseFormatArgs(["-s", "export", "--indent", "4", "--comments"]);
    const opts = formatArgsToOptions(args);
    expect(opts.style).toBe("export");
    expect(opts.indent).toBe(4);
    expect(opts.includeComments).toBe(true);
  });
});
