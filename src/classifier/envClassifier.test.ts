import { classifyKey, classifyEnvMap, formatClassificationReport, ClassificationResult } from "./envClassifier";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("classifyKey", () => {
  it("classifies database keys", () => {
    expect(classifyKey("DB_HOST")).toBe("database");
    expect(classifyKey("POSTGRES_USER")).toBe("database");
    expect(classifyKey("REDIS_URL")).toBe("database");
  });

  it("classifies auth keys", () => {
    expect(classifyKey("JWT_SECRET")).toBe("auth");
    expect(classifyKey("API_KEY")).toBe("auth");
    expect(classifyKey("AUTH_TOKEN")).toBe("auth");
  });

  it("classifies network keys", () => {
    expect(classifyKey("HOST")).toBe("network");
    expect(classifyKey("PORT")).toBe("network");
    expect(classifyKey("BASE_URL")).toBe("network");
  });

  it("classifies feature flags", () => {
    expect(classifyKey("FEATURE_DARK_MODE")).toBe("feature_flag");
    expect(classifyKey("FF_NEW_UI")).toBe("feature_flag");
    expect(classifyKey("ENABLE_BETA")).toBe("feature_flag");
  });

  it("classifies logging keys", () => {
    expect(classifyKey("LOG_LEVEL")).toBe("logging");
    expect(classifyKey("DEBUG")).toBe("logging");
  });

  it("classifies storage keys", () => {
    expect(classifyKey("S3_BUCKET")).toBe("storage");
    expect(classifyKey("GCS_PROJECT")).toBe("storage");
  });

  it("classifies email keys", () => {
    expect(classifyKey("SMTP_HOST")).toBe("email");
    expect(classifyKey("SENDGRID_API_KEY")).toBe("email");
  });

  it("returns unknown for unrecognized keys", () => {
    expect(classifyKey("APP_NAME")).toBe("unknown");
    expect(classifyKey("FOOBAR")).toBe("unknown");
  });
});

describe("classifyEnvMap", () => {
  it("classifies all entries and counts categories", () => {
    const map = makeMap({
      DB_HOST: "localhost",
      JWT_SECRET: "abc",
      LOG_LEVEL: "info",
      APP_NAME: "myapp",
    });
    const result = classifyEnvMap(map);
    expect(result.entries).toHaveLength(4);
    expect(result.categoryCounts.database).toBe(1);
    expect(result.categoryCounts.auth).toBe(1);
    expect(result.categoryCounts.logging).toBe(1);
    expect(result.categoryCounts.unknown).toBe(1);
  });

  it("returns zero counts for empty map", () => {
    const result = classifyEnvMap(new Map());
    expect(result.entries).toHaveLength(0);
    expect(result.categoryCounts.database).toBe(0);
  });
});

describe("formatClassificationReport", () => {
  it("formats report with category headers", () => {
    const map = makeMap({ DB_HOST: "localhost", APP_NAME: "myapp" });
    const result = classifyEnvMap(map);
    const report = formatClassificationReport(result);
    expect(report).toContain("Classification Report");
    expect(report).toContain("DATABASE");
    expect(report).toContain("DB_HOST");
    expect(report).toContain("Total keys: 2");
  });
});
