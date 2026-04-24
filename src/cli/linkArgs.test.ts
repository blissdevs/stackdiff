import { describe, it, expect } from "vitest";
import { parseLinkArgs, hasLinkOptions } from "./linkArgs";

describe("parseLinkArgs", () => {
  it("parses --link-source", () => {
    const args = parseLinkArgs(["--link-source", ".env.staging"]);
    expect(args.source).toBe(".env.staging");
  });

  it("parses multiple --link-map entries", () => {
    const args = parseLinkArgs([
      "--link-map", "prod=.env.prod",
      "--link-map", "base=.env.base",
    ]);
    expect(args.maps["prod"]).toBe(".env.prod");
    expect(args.maps["base"]).toBe(".env.base");
  });

  it("parses --link-apply flag", () => {
    const args = parseLinkArgs(["--link-apply"]);
    expect(args.apply).toBe(true);
  });

  it("defaults apply to false", () => {
    const args = parseLinkArgs([]);
    expect(args.apply).toBe(false);
  });

  it("parses --link-output json", () => {
    const args = parseLinkArgs(["--link-output", "json"]);
    expect(args.output).toBe("json");
  });

  it("defaults output to text", () => {
    const args = parseLinkArgs([]);
    expect(args.output).toBe("text");
  });

  it("ignores malformed --link-map entries", () => {
    const args = parseLinkArgs(["--link-map", "noequalssign"]);
    expect(Object.keys(args.maps)).toHaveLength(0);
  });
});

describe("hasLinkOptions", () => {
  it("returns true when source is set", () => {
    expect(hasLinkOptions({ source: ".env", maps: {}, apply: false, output: "text" })).toBe(true);
  });

  it("returns true when maps are set", () => {
    expect(hasLinkOptions({ source: undefined, maps: { prod: ".env.prod" }, apply: false, output: "text" })).toBe(true);
  });

  it("returns false when nothing is set", () => {
    expect(hasLinkOptions({ source: undefined, maps: {}, apply: false, output: "text" })).toBe(false);
  });
});
