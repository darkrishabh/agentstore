import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { bindHost, databasePath, portNumber } from "../src/config.js";

describe("adapter configuration", () => {
  it("uses the same persistent SQLite default and resolves a custom file", () => {
    expect(databasePath({})).toBe(resolve("data/agentstore.sqlite"));
    expect(databasePath({ AGENTSTORE_DB_PATH: "custom/store.sqlite" })).toBe(resolve("custom/store.sqlite"));
  });

  it.each(["", " ", ":memory:", "postgresql://user:password@localhost/db", "postgres://localhost/db", "sqlite:///tmp/db"])(
    "rejects unsupported database configuration %s without echoing credentials", (value) => {
      expect(() => databasePath({ AGENTSTORE_DB_PATH: value })).toThrow("persistent SQLite file path");
      try { databasePath({ AGENTSTORE_DB_PATH: value }); } catch (error) {
        expect(String(error)).not.toContain("password");
      }
    },
  );

  it.each(["", "12junk", "-1", "65536", "1.2", "1e3", " "])("rejects invalid port %s", (value) => {
    expect(() => portNumber(value, 4311)).toThrow();
  });

  it("supports ephemeral ports for tests and explicit container binding", () => {
    expect(portNumber(undefined, 4311)).toBe(4311);
    expect(portNumber("0", 4311)).toBe(0);
    expect(portNumber("65535", 4311)).toBe(65535);
    expect(bindHost(undefined)).toBe("127.0.0.1");
    expect(bindHost("0.0.0.0")).toBe("0.0.0.0");
    expect(() => bindHost("untrusted.example")).toThrow();
  });
});
