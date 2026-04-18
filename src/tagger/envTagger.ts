export type Tag = string;

export interface TaggedEnvMap {
  map: Map<string, string>;
  tags: Map<string, Tag[]>;
}

export function tagEnvMap(
  map: Map<string, string>,
  rules: Record<Tag, (key: string, value: string) => boolean>
): TaggedEnvMap {
  const tags = new Map<string, Tag[]>();
  for (const [key, value] of map.entries()) {
    const matched: Tag[] = [];
    for (const [tag, fn] of Object.entries(rules)) {
      if (fn(key, value)) matched.push(tag);
    }
    if (matched.length > 0) tags.set(key, matched);
  }
  return { map, tags };
}

export function filterByTag(tagged: TaggedEnvMap, tag: Tag): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, tags] of tagged.tags.entries()) {
    if (tags.includes(tag)) {
      const val = tagged.map.get(key);
      if (val !== undefined) result.set(key, val);
    }
  }
  return result;
}

export function formatTagReport(tagged: TaggedEnvMap): string {
  const lines: string[] = [];
  for (const [key, tags] of tagged.tags.entries()) {
    lines.push(`${key}: [${tags.join(', ')}]`);
  }
  return lines.length > 0 ? lines.join('\n') : '(no tags matched)';
}

export function getTagSummary(tagged: TaggedEnvMap): Record<Tag, number> {
  const summary: Record<Tag, number> = {};
  for (const tags of tagged.tags.values()) {
    for (const tag of tags) {
      summary[tag] = (summary[tag] ?? 0) + 1;
    }
  }
  return summary;
}
