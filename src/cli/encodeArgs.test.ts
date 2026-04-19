import { parseEncodeArgs, hasEncodeOptions } from "./encodeArgs";

describe("parseEncodeArgs", () => {
  it("defaults to base64 format", () => {
    const args = parseEncodeArgs([]);
    expect(args.format).toBe("base64");
    expect(args.decode).toBe(false);
    expect(args.keys).toEqual([]);
  });

  it("parses --format flag", () => {
    const args = parseEncodeArgs(["--format", "hex"]);
    expect(args.format).toBe("hex");
  });

  it("parses -f shorthand", () => {
    const args = parseEncodeArgs(["-f", "uri"]);
    expect(args.format).toBe("uri");
  });

  it("ignores unknown format values", () => {
    const args = parseEncodeArgs(["--format", "rot13"]);
    expect(args.format).toBe("base64");
  });

  it("parses multiple --key flags", () => {
    const args = parseEncodeArgs(["--key", "FOO", "-k", "BAR"]);
    expect(args.keys).toEqual(["FOO", "BAR"]);
  });

  it("parses --decode flag", () => {
    const args = parseEncodeArgs(["--decode"]);
    expect(args.decode).toBe(true);
  });

  it("parses -d shorthand", () => {
    const args = parseEncodeArgs(["-d"]);
    expect(args.decode).toBe(true);
  });
});

describe("hasEncodeOptions", () => {
  it("returns false when no keys and not decoding", () => {
    expect(hasEncodeOptions({ format: "base64", keys: [], decode: false })).toBe(false);
  });

  it("returns true when keys present", () => {
    expect(hasEncodeOptions({ format: "base64", keys: ["FOO"], decode: false })).toBe(true);
  });

  it("returns true when decode is set", () => {
    expect(hasEncodeOptions({ format: "base64", keys: [], decode: true })).toBe(true);
  });
});
