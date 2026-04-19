import { EnvMap } from "../parser/envParser";

export type EncodingFormat = "base64" | "hex" | "uri";

export interface EncodeOptions {
  format: EncodingFormat;
  keys?: string[];
}

export interface EncodeResult {
  encoded: EnvMap;
  encodedKeys: string[];
}

export function encodeValue(value: string, format: EncodingFormat): string {
  switch (format) {
    case "base64":
      return Buffer.from(value).toString("base64");
    case "hex":
      return Buffer.from(value).toString("hex");
    case "uri":
      return encodeURIComponent(value);
    default:
      return value;
  }
}

export function decodeValue(value: string, format: EncodingFormat): string {
  switch (format) {
    case "base64":
      return Buffer.from(value, "base64").toString("utf8");
    case "hex":
      return Buffer.from(value, "hex").toString("utf8");
    case "uri":
      return decodeURIComponent(value);
    default:
      return value;
  }
}

export function encodeEnvMap(map: EnvMap, options: EncodeOptions): EncodeResult {
  const encoded: EnvMap = new Map(map);
  const encodedKeys: string[] = [];
  const targets = options.keys ?? Array.from(map.keys());

  for (const key of targets) {
    if (map.has(key)) {
      encoded.set(key, encodeValue(map.get(key)!, options.format));
      encodedKeys.push(key);
    }
  }

  return { encoded, encodedKeys };
}

export function decodeEnvMap(map: EnvMap, options: EncodeOptions): EnvMap {
  const decoded: EnvMap = new Map(map);
  const targets = options.keys ?? Array.from(map.keys());

  for (const key of targets) {
    if (map.has(key)) {
      decoded.set(key, decodeValue(map.get(key)!, options.format));
    }
  }

  return decoded;
}

export function formatEncodeReport(result: EncodeResult, format: EncodingFormat): string {
  const lines: string[] = [`Encoded ${result.encodedKeys.length} key(s) using ${format}:`];
  for (const key of result.encodedKeys) {
    lines.push(`  ${key} => ${result.encoded.get(key)}`);
  }
  return lines.join("\n");
}
