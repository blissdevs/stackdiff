import { scopeEnvMap, listScopes, injectScope } from "./envScoper";

function makeMap(obj: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(obj));
}

describe("scopeEnvMap", () => {
  const env = makeMap({
    DB_HOST: "localhost",
    DB_PORT: "5432",
    APP_NAME: "myapp",
    APP_ENV: "production",
    SECRET: "abc",
  });

  it("extracts keys matching prefix", () => {
    const result = scopeEnvMap(env, { prefix: "DB_" });
    expect(result.size).toBe(2);
    expect(result.get("DB_HOST")).toBe("localhost");
    expect(result.get("DB_PORT")).toBe("5432");
  });

  it("strips prefix when stripPrefix is true", () => {
    const result = scopeEnvMap(env, { prefix: "DB_", stripPrefix: true });
    expect(result.has("HOST")).toBe(true);
    expect(result.has("PORT")).toBe(true);
    expect(result.has("DB_HOST")).toBe(false);
  });

  it("returns empty map when no keys match", () => {
    const result = scopeEnvMap(env, { prefix: "REDIS_" });
    expect(result.size).toBe(0);
  });

  it("is case-insensitive for prefix matching", () => {
    const result = scopeEnvMap(env, { prefix: "app_" });
    expect(result.size).toBe(2);
  });
});

describe("listScopes", () => {
  it("returns sorted unique prefixes", () => {
    const env = makeMap({
      DB_HOST: "x",
      DB_PORT: "y",
      APP_NAME: "z",
      NOSCOPE: "val",
    });
    const scopes = listScopes(env);
    expect(scopes).toEqual(["APP", "DB"]);
  });

  it("respects custom separator", () => {
    const env = makeMap({ "DB.HOST": "x", "APP.NAME": "y" });
    expect(listScopes(env, ".")).toEqual(["APP", "DB"]);
  });
});

describe("injectScope", () => {
  it("prepends prefix to all keys", () => {
    const env = makeMap({ HOST: "localhost", PORT: "5432" });
    const result = injectScope(env, "DB_");
    expect(result.has("DB_HOST")).toBe(true);
    expect(result.has("DB_PORT")).toBe(true);
    expect(result.size).toBe(2);
  });
});
