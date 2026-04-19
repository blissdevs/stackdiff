export interface Annotation {
  key: string;
  note: string;
  author?: string;
  createdAt: string;
}

export type AnnotationMap = Map<string, Annotation>;

export function annotateKey(
  key: string,
  note: string,
  author?: string
): Annotation {
  return {
    key,
    note,
    author,
    createdAt: new Date().toISOString(),
  };
}

export function applyAnnotations(
  envMap: Map<string, string>,
  annotations: AnnotationMap
): Map<string, Annotation> {
  const result = new Map<string, Annotation>();
  for (const [key] of envMap) {
    if (annotations.has(key)) {
      result.set(key, annotations.get(key)!);
    }
  }
  return result;
}

export function getUnannotatedKeys(
  envMap: Map<string, string>,
  annotations: AnnotationMap
): string[] {
  return [...envMap.keys()].filter((k) => !annotations.has(k));
}

export function formatAnnotationReport(
  envMap: Map<string, string>,
  annotations: AnnotationMap
): string {
  const lines: string[] = ["Annotation Report", "=================="];
  for (const [key] of envMap) {
    const ann = annotations.get(key);
    if (ann) {
      const author = ann.author ? ` (${ann.author})` : "";
      lines.push(`[${key}]${author}: ${ann.note}`);
    } else {
      lines.push(`[${key}]: (no annotation)`);
    }
  }
  const unannotated = getUnannotatedKeys(envMap, annotations);
  lines.push("");
  lines.push(`Total: ${envMap.size} keys, ${unannotated.length} unannotated`);
  return lines.join("\n");
}
