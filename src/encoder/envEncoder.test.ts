import { encodeValue, decodeValue, encodeEnvMap, decodeEnvMap, formatEncodeReport } from "./envEncoder";

type EnvMap = Map<string, string>;
const makeMap = (obj: Record<string, string>): EnvMap => new Map(Object.entries(obj));

describe("encodeValue / decodeValue", () => {
  it("encodes and decodes base64", () => {
    const encoded = encodeValue("hello", "base64");
    expect(encoded).toBe("aGVsbG8=");
    expect(decodeValue(encoded, "base64")).toBe("hello");
  });

  it("encodes and decodes hex", () => {
    const encoded = encodeValue("abc", "hex");
    expect(encoded).toBe("616263");
    expect(decodeValue(encoded, "hex")).toBe("abc");
  });

  it("encodes and decodes uri", () => {
    const encoded = encodeValue("hello world", "uri");
    expect(encoded).toBe("hello%20world");
    expect(decodeValue(encoded, "uri")).toBe("hello world");
  });
});

describe("encodeEnvMap", () => {
  it("encodes all keys when none specified", () => {
    const map = makeMap({ FOO: "bar", BAZ: "qux" });
    const { encoded, encodedKeys } = encodeEnvMap(map, { format: "base64" });
    expect(encodedKeys).toHaveLength(2);
    expect(encoded.get("FOO")).toBe(Buffer.from("bar").toString("base64"));
  });

  it("encodes only specified keys", () => {
    const map = makeMap({ FOO: "bar", BAZ: "qux" });
    const { encoded, encodedKeys } = encodeEnvMap(map, { format: "hex", keys: ["FOO"] });
    expect(encodedKeys).toEqual(["FOO"]);
    expect(encoded.get("BAZ")).toBe("qux");
  });

  it("ignores missing keys", () => {
    const map = makeMap({ FOO: "bar" });
    const { encodedKeys } = encodeEnvMap(map, { format: "base64", keys: ["MISSING"] });
    expect(encodedKeys).toHaveLength(0);
  });
});

describe("decodeEnvMap", () => {
  it("decodes all keys", () => {
    const map = makeMap({ FOO: Buffer.from("bar").toString("base64") });
    const decoded = decodeEnvMap(map, { format: "base64" });
    expect(decoded.get("FOO")).toBe("bar");
  });
});

describe("formatEncodeReport", () => {
  it("returns a summary string", () => {
    const map = makeMap({ FOO: "YmFy" });
    const result = { encoded: map, encodedKeys: ["FOO"] };
    const report = formatEncodeReport(result, "base64");
    expect(report).toContain("1 key(s)");
    expect(report).toContain("base64");
    expect(report).toContain("FOO");
  });
});
