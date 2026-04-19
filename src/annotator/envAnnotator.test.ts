import {
  annotateKey,
  applyAnnotations,
  getUnannotatedKeys,
  formatAnnotationReport,
  AnnotationMap,
} from "./envAnnotator";

function makeMap(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

function makeAnnotations(entries: Record<string, [string, string?]>): AnnotationMap {
  const map: AnnotationMap = new Map();
  for (const [key, [note, author]] of Object.entries(entries)) {
    map.set(key, annotateKey(key, note, author));
  }
  return map;
}

describe("annotateKey", () => {
  it("creates annotation with required fields", () => {
    const ann = annotateKey("API_KEY", "Primary API key", "alice");
    expect(ann.key).toBe("API_KEY");
    expect(ann.note).toBe("Primary API key");
    expect(ann.author).toBe("alice");
    expect(ann.createdAt).toBeTruthy();
  });

  it("creates annotation without author", () => {
    const ann = annotateKey("DB_URL", "Database connection");
    expect(ann.author).toBeUndefined();
  });
});

describe("applyAnnotations", () => {
  it("returns only annotations for keys in envMap", () => {
    const env = makeMap({ API_KEY: "abc", DB_URL: "postgres://" });
    const anns = makeAnnotations({ API_KEY: ["key note"], EXTRA: ["not in env"] });
    const result = applyAnnotations(env, anns);
    expect(result.has("API_KEY")).toBe(true);
    expect(result.has("EXTRA")).toBe(false);
    expect(result.has("DB_URL")).toBe(false);
  });
});

describe("getUnannotatedKeys", () => {
  it("returns keys without annotations", () => {
    const env = makeMap({ A: "1", B: "2", C: "3" });
    const anns = makeAnnotations({ A: ["note"] });
    const result = getUnannotatedKeys(env, anns);
    expect(result).toContain("B");
    expect(result).toContain("C");
    expect(result).not.toContain("A");
  });
});

describe("formatAnnotationReport", () => {
  it("includes annotated and unannotated keys", () => {
    const env = makeMap({ API_KEY: "x", SECRET: "y" });
    const anns = makeAnnotations({ API_KEY: ["main key", "bob"] });
    const report = formatAnnotationReport(env, anns);
    expect(report).toContain("API_KEY");
    expect(report).toContain("main key");
    expect(report).toContain("bob");
    expect(report).toContain("(no annotation)");
    expect(report).toContain("1 unannotated");
  });
});
