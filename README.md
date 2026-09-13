# AgentStore

AgentStore is a deliberately simple, user-owned object store for information that should remain portable across AI agents. One agent can save a structured object and another can discover and retrieve it later.

> Natural-language interpretation belongs in the calling agent. Deterministic query execution belongs in the store.

## What this is

AgentStore is a small persistence and retrieval layer with five operations: `put`, `get`, `list`, `search`, and `delete`.

Its core model is:

```text
key      = identity
kind     = behavioral intent
labels   = semantic hints
value    = user payload
metadata = deterministic retrieval information
```

Objects have a stable key, a small standardized kind, free-form labels, an arbitrary JSON value, timestamps, a version, optional source client, optional behavioral fields, and optional logical expiration.

## What this is not

AgentStore is not AI memory, RAG, a vector database, a knowledge graph, a notes app, a calendar, a reminder engine, or a workflow system. It makes no LLM calls and does no automatic classification.

MCP is one adapter over the core storage service, not the canonical AgentStore protocol. SQLite is the MVP persistence layer, not a permanent product constraint.

## MVP retrieval

Search combines deterministic structured filters with three inspectable, bounded retrieval paths:

1. weighted prefix-aware SQLite FTS5 over key, labels, description, and searchable text;
2. an indexed normalized-label table for exact filters and label prefixes;
3. indexed shape flags for phone numbers, email addresses, and URLs.

Search returns lightweight candidates with scores, matched fields, and snippets. It intentionally omits full JSON values. Call `get` after choosing a candidate.

Retrieval queries never load the full active table into application memory. Candidate queries are bounded, and `list` uses opaque cursor pagination so a caller can traverse every object without an arbitrary 5,000-row or 100-row ceiling.

The seed experiment includes a deliberate vocabulary mismatch—`the guy who fixed the sink` versus `the plumber who repaired the kitchen faucet`—so lexical retrieval limits remain visible rather than being hidden by embeddings.

## Run locally

Requires Node.js 22 or later.

```bash
npm install
npm test
npm run seed
npm run dashboard
npm run mcp
npm run mcp:http
```

`npm run seed` recreates `data/demo.sqlite`, inserts 42 realistic objects, and prints lexical and structured retrieval results.

By default the MCP server persists to `data/agentstore.sqlite`. Set `AGENTSTORE_DB_PATH` to use another SQLite file.

## Dashboard

Run `npm run dashboard`, then open `http://127.0.0.1:4310`. The dashboard and MCP adapter both use `data/agentstore.sqlite` by default, so objects written through an agent appear in the dashboard. Set `AGENTSTORE_DB_PATH` on both processes to use another SQLite file.

The dashboard provides store metrics, keyword and structured filtering, compact ranked candidates, full-object inspection, JSON copying, object creation/update, and deletion. Its HTTP endpoints are a local UI adapter over the same storage core; they are not a new canonical AgentStore protocol.

## Connect from Claude Code

For the local Streamable HTTP server, first run `npm run mcp:http`, then register it for all Claude Code projects:

```bash
claude mcp add --transport http --scope user agentstore http://127.0.0.1:4311/mcp
```

The original stdio option remains available from this repository with `claude mcp add agentstore -- npm run mcp`.

The adapter exposes exactly these tools:

```text
store_object
get_object
search_objects
list_objects
delete_object
```

## Connect from Codex

For the local Streamable HTTP server, first run `npm run mcp:http`, then register it once:

```bash
codex mcp add agentstore --url http://127.0.0.1:4311/mcp
```

The original stdio registration remains available:

```bash
codex mcp add agentstore \
  --env AGENTSTORE_DB_PATH="$PWD/data/agentstore.sqlite" \
  -- npm --prefix "$PWD" run mcp
```

Run `codex mcp list` to confirm it was saved, then restart the Codex app or CLI session. The ChatGPT desktop app, Codex CLI, and Codex IDE extension share this local Codex MCP configuration.

The HTTP endpoint is intentionally bound only to `127.0.0.1`; “remote MCP” here describes the transport, not public Internet access. Both clients must run on the same machine, and `npm run mcp:http` must remain running. The MCP adapter and dashboard share `data/agentstore.sqlite` by default.

Set `AGENTSTORE_MCP_TOKEN` to require a bearer token on `/mcp`. This is mandatory before forwarding the endpoint through a public HTTPS tunnel. The `/health` endpoint remains unauthenticated for local monitoring.

For remote access, configure your own Cloudflare tunnel and HTTPS hostname pointing to the server's `/mcp` endpoint. Copy `.env.example` to the gitignored `.env.local`, set a long bearer token and your own tunnel ID, then run the server and tunnel as separate processes:

```bash
npm run mcp:http
npm run mcp:tunnel
```

The bearer token is stored in the gitignored `.env.local` file for the local server. Codex and Claude must send the same token in an `Authorization: Bearer ...` header.

## Save behavior

The MCP adapter publishes server instructions and a strongly worded `store_object` description telling clients to call the tool whenever the user explicitly asks to save, remember, preserve, or keep something, and never to claim success unless the call succeeds.

The optional routing plugin in `plugins/agentstore` reinforces this behavior and teaches Codex and Claude to paginate complete list requests, use search then get, include named entities in shape queries, and retry thin lexical searches with shorter terms or close synonyms. A skill improves routing consistency; it cannot guarantee that every model will invoke a tool.

The plugin deliberately does not bundle the current bearer-token tunnel. Install or register the MCP connection separately, so a private development credential is never embedded in a distributable package.

### Test the plugin in Codex

The repository contains a local marketplace at `.agents/plugins/marketplace.json` and a portable Agent Plugins manifest.

```bash
codex plugin marketplace add "$PWD"
```

Restart the ChatGPT desktop app, choose the `personal` marketplace source, and install AgentStore. Keep the separately registered `agentstore` MCP server enabled.

### Install the plugin in Claude Code

The repository also contains a Claude Code marketplace and compatibility manifest:

```bash
claude plugin marketplace add "$PWD"
claude plugin install agentstore@agentstore-local --scope user
```

For development without installing, run `claude --plugin-dir "$PWD/plugins/agentstore"` from the repository root. Then invoke `/agentstore:agentstore-routing` explicitly once, or make a natural request such as “save this to my todos.” The separately registered `agentstore` MCP server must remain enabled.

## Tests

```bash
npm run check
npm test
npm run build
npm audit --omit=dev
```

The test suite covers CRUD and versioning, FTS synchronization, prefix and label retrieval, structured filters, TTL, indexed shape matching, legacy-database migration, complete cursor traversal, statistics beyond one page, MCP pagination, authentication, and a label-only target beyond 5,000 records.

The neutral comparison harness lives in the sibling `agentstore-bench` workspace. It records raw JSON, provenance hashes, per-query ranks, local latency, scale behavior, and capability checks for both implementations.

## Open-source readiness

See `OSS_READINESS.md` for the release checklist and the remaining security, licensing, CI, hosted-service, and benchmark-review work. The local MVP is testable, but the development tunnel is not a production or public-plugin deployment.

## Scope boundary

The MVP intentionally excludes hosted infrastructure, multi-user authentication, embeddings, RAG, background jobs, queues, reminder execution, and automatic taxonomy management. The open-source core can later sit behind HTTP and a managed service without moving agent interpretation into the store.
