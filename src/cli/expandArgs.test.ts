import { parseExpandArgs, hasExpandOptions } from "./expandArgs";

describe("parseExpandArgs", () => {
  it("returns defaults when no args provided", () => {
    const args = parseExpandArgs([]);
    expect(args.inPlace).toBe(false);
    expect(args.reportOnly).toBe(false);
    expect(args.contextFile).toBeUndefined();
    expect(args.format).toBe("text");
  });

  it("parses --in-place flag", () => {
    const args = parseExpandArgs(["--in-place"]);
    expect(args.inPlace).toBe(true);
  });

  it("parses -i shorthand", () => {
    const args = parseExpandArgs(["-i"]);
    expect(args.inPlace).toBe(true);
  });

  it("parses --context with value", () => {
    const args = parseExpandArgs(["--context", ".env.base"]);
    expect(args.contextFile).toBe(".env.base");
  });

  it("parses -c shorthand", () => {
    const args = parseExpandArgs(["-c", ".env.shared"]);
    expect(args.contextFile).toBe(".env.shared");
  });

  it("parses --report-only flag", () => {
    const args = parseExpandArgs(["--report-only"]);
    expect(args.reportOnly).toBe(true);
  });

  it("parses --format json", () => {
    const args = parseExpandArgs(["--format", "json"]);
    expect(args.format).toBe("json");
  });

  it("ignores unknown --format value and keeps default", () => {
    const args = parseExpandArgs(["--format", "xml"]);
    expect(args.format).toBe("text");
  });

  it("parses combined flags", () => {
    const args = parseExpandArgs(["-i", "-c", ".env.ctx", "--format", "json"]);
    expect(args.inPlace).toBe(true);
    expect(args.contextFile).toBe(".env.ctx");
    expect(args.format).toBe("json");
  });
});

describe("hasExpandOptions", () => {
  it("returns false for default args", () => {
    expect(hasExpandOptions(parseExpandArgs([]))).toBe(false);
  });

  it("returns true when inPlace is set", () => {
    expect(hasExpandOptions(parseExpandArgs(["--in-place"]))).toBe(true);
  });

  it("returns true when contextFile is set", () => {
    expect(hasExpandOptions(parseExpandArgs(["--context", ".env"]))).toBe(true);
  });

  it("returns true when reportOnly is set", () => {
    expect(hasExpandOptions(parseExpandArgs(["--report-only"]))).toBe(true);
  });
});
