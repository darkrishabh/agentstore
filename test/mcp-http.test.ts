import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { afterEach, describe, expect, it } from "vitest";

import { startAgentStoreHttpServer, type RunningAgentStoreHttpServer } from "../src/mcp-http.js";

describe("Streamable HTTP MCP adapter", () => {
  const bearerToken = "integration-test-token";
  let client: Client | undefined;
  let running: RunningAgentStoreHttpServer | undefined;
  let directory: string | undefined;

  afterEach(async () => {
    await client?.close();
    await running?.close();
    if (directory) rmSync(directory, { recursive: true, force: true });
  });

  it("serves the five tools and persists through the shared object store", async () => {
    directory = mkdtempSync(join(tmpdir(), "agentstore-http-mcp-"));
    running = await startAgentStoreHttpServer({
      bearerToken,
      databasePath: join(directory, "test.sqlite"),
      port: 0,
    });

    client = new Client({ name: "agentstore-http-test", version: "0.1.0" });
    await client.connect(
      new StreamableHTTPClientTransport(new URL(running.url), {
        requestInit: { headers: { Authorization: `Bearer ${bearerToken}` } },
      }),
    );

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name).sort()).toEqual([
      "delete_object",
      "get_object",
      "list_objects",
      "search_objects",
      "store_object",
    ]);

    const stored = await client.callTool({
      name: "store_object",
      arguments: {
        key: "http-round-trip",
        kind: "note",
        value: { text: "Saved over Streamable HTTP." },
        searchable_text: "Saved over Streamable HTTP.",
        labels: ["transport-test"],
        source_client: "integration-test",
      },
    });
    expect(stored.isError).not.toBe(true);

    const found = await client.callTool({
      name: "get_object",
      arguments: { key: "http-round-trip" },
    });
    expect(JSON.stringify(found.structuredContent)).toContain("Saved over Streamable HTTP.");
  });

  it("rejects unauthenticated MCP requests when a bearer token is configured", async () => {
    directory = mkdtempSync(join(tmpdir(), "agentstore-http-auth-"));
    running = await startAgentStoreHttpServer({
      bearerToken,
      databasePath: join(directory, "test.sqlite"),
      port: 0,
    });

    const response = await fetch(running.url, { method: "POST" });
    expect(response.status).toBe(401);
  });
});
