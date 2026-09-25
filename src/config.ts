import { resolve } from "node:path";

/** One storage setting for every adapter. SQLite is the only implemented backend. */
export function databasePath(env: NodeJS.ProcessEnv = process.env, cwd = process.cwd()): string {
  const value = env.AGENTSTORE_DB_PATH ?? "data/agentstore.sqlite";
  if (!value.trim() || value === ":memory:" || /^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    throw new Error("AGENTSTORE_DB_PATH must be a persistent SQLite file path, not a connection URL or :memory:. PostgreSQL is not supported.");
  }
  return resolve(cwd, value);
}

export function portNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value) || Number(value) > 65_535) {
    throw new Error("Port must be an integer between 0 and 65535");
  }
  return Number(value);
}

export function bindHost(value: string | undefined): string {
  const host = value ?? "127.0.0.1";
  if (host !== "127.0.0.1" && host !== "0.0.0.0") {
    throw new Error("Bind host must be 127.0.0.1 (local) or 0.0.0.0 (container); publish container ports on loopback only.");
  }
  return host;
}
