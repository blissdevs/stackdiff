import { createHash } from "crypto";

export type DigestAlgorithm = "md5" | "sha1" | "sha256";

export interface EnvDigest {
  algorithm: DigestAlgorithm;
  hash: string;
  keyCount: number;
  keys: string[];
}

export function digestEnvMap(
  env: Map<string, string>,
  algorithm: DigestAlgorithm = "sha256"
): EnvDigest {
  const keys = Array.from(env.keys()).sort();
  const content = keys.map((k) => `${k}=${env.get(k)}`).join("\n");
  const hash = createHash(algorithm).update(content).digest("hex");
  return { algorithm, hash, keyCount: keys.length, keys };
}

export function digestsMatch(a: EnvDigest, b: EnvDigest): boolean {
  return a.algorithm === b.algorithm && a.hash === b.hash;
}

export function diffDigests(
  a: EnvDigest,
  b: EnvDigest
): { match: boolean; onlyInA: string[]; onlyInB: string[] } {
  const setA = new Set(a.keys);
  const setB = new Set(b.keys);
  return {
    match: digestsMatch(a, b),
    onlyInA: a.keys.filter((k) => !setB.has(k)),
    onlyInB: b.keys.filter((k) => !setA.has(k)),
  };
}

export function formatDigestReport(digest: EnvDigest, label = "env"): string {
  const lines: string[] = [
    `Digest [${label}]`,
    `  Algorithm : ${digest.algorithm}`,
    `  Hash      : ${digest.hash}`,
    `  Keys      : ${digest.keyCount}`,
  ];
  return lines.join("\n");
}
