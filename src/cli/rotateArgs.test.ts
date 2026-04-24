import { parseRotateArgs, hasRotateOptions } from "./rotateArgs";

describe("parseRotateArgs", () => {
  it("parses single key", () => {
    const args = parseRotateArgs(["--key", "API_KEY"]);
    expect(args.keys).toEqual(["API_KEY"]);
  });

  it("parses multiple keys via comma", () => {
    const args = parseRotateArgs(["--key", "API_KEY,DB_PASS"]);
    expect(args.keys).toEqual(["API_KEY", "DB_PASS"]);
  });

  it("parses multiple --key flags", () => {
    const args = parseRotateArgs(["-k", "TOKEN", "-k", "SECRET"]);
    expect(args.keys).toEqual(["TOKEN", "SECRET"]);
  });

  it("parses --dry-run flag", () => {
    const args = parseRotateArgs(["--dry-run"]);
    expect(args.dryRun).toBe(true);
  });

  it("parses --format json", () => {
    const args = parseRotateArgs(["--format", "json"]);
    expect(args.format).toBe("json");
  });

  it("defaults format to text", () => {
    const args = parseRotateArgs([]);
    expect(args.format).toBe("text");
  });

  it("parses --output path", () => {
    const args = parseRotateArgs(["--output", "/tmp/out.env"]);
    expect(args.output).toBe("/tmp/out.env");
  });

  it("returns empty keys when none provided", () => {
    const args = parseRotateArgs([]);
    expect(args.keys).toEqual([]);
  });
});

describe("hasRotateOptions", () => {
  it("returns true when keys are specified", () => {
    const args = parseRotateArgs(["--key", "SECRET"]);
    expect(hasRotateOptions(args)).toBe(true);
  });

  it("returns true when dry-run is set", () => {
    const args = parseRotateArgs(["--dry-run"]);
    expect(hasRotateOptions(args)).toBe(true);
  });

  it("returns false when no options set", () => {
    const args = parseRotateArgs([]);
    expect(hasRotateOptions(args)).toBe(false);
  });
});
