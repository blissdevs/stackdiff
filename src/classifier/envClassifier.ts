import { EnvMap } from "../parser/envParser";

export type EnvCategory =
  | "database"
  | "auth"
  | "network"
  | "feature_flag"
  | "logging"
  | "storage"
  | "email"
  | "unknown";

export interface ClassifiedEntry {
  key: string;
  value: string;
  category: EnvCategory;
}

export interface ClassificationResult {
  entries: ClassifiedEntry[];
  categoryCounts: Record<EnvCategory, number>;
}

const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: EnvCategory }> = [
  { pattern: /^(DB_|DATABASE_|POSTGRES_|MYSQL_|MONGO_|REDIS_)/i, category: "database" },
  { pattern: /^(AUTH_|JWT_|OAUTH_|SECRET_|API_KEY|TOKEN|PASSWORD|PASS_)/i, category: "auth" },
  { pattern: /^(HOST|PORT|URL|ENDPOINT|BASE_URL|API_URL|DOMAIN)/i, category: "network" },
  { pattern: /^(FEATURE_|FF_|FLAG_|ENABLE_|DISABLE_)/i, category: "feature_flag" },
  { pattern: /^(LOG_|LOGGING_|DEBUG|VERBOSE|TRACE_)/i, category: "logging" },
  { pattern: /^(S3_|STORAGE_|BUCKET_|GCS_|AZURE_BLOB)/i, category: "storage" },
  { pattern: /^(SMTP_|EMAIL_|MAIL_|SENDGRID_|MAILGUN_)/i, category: "email" },
];

export function classifyKey(key: string): EnvCategory {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(key)) return category;
  }
  return "unknown";
}

export function classifyEnvMap(envMap: EnvMap): ClassificationResult {
  const entries: ClassifiedEntry[] = [];
  const categoryCounts: Record<EnvCategory, number> = {
    database: 0,
    auth: 0,
    network: 0,
    feature_flag: 0,
    logging: 0,
    storage: 0,
    email: 0,
    unknown: 0,
  };

  for (const [key, value] of envMap.entries()) {
    const category = classifyKey(key);
    entries.push({ key, value, category });
    categoryCounts[category]++;
  }

  return { entries, categoryCounts };
}

export function formatClassificationReport(result: ClassificationResult): string {
  const lines: string[] = ["=== ENV Classification Report ==="];
  const grouped: Partial<Record<EnvCategory, ClassifiedEntry[]>> = {};

  for (const entry of result.entries) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category]!.push(entry);
  }

  for (const [category, entries] of Object.entries(grouped)) {
    lines.push(`\n[${category.toUpperCase()}] (${entries!.length})`);
    for (const e of entries!) {
      lines.push(`  ${e.key}`);
    }
  }

  lines.push(`\nTotal keys: ${result.entries.length}`);
  return lines.join("\n");
}
