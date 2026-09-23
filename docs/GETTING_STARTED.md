# Connect your agents

AgentStore's dashboard and MCP adapter share `data/agentstore.sqlite` by default. Set `AGENTSTORE_DB_PATH` on both processes to use a different database. All clients must point to the same store for cross-agent retrieval.

## Local HTTP connection

Requires Node.js 22+. Install dependencies with `npm ci`, then run:

```bash
npm run mcp:http
```

The endpoint is `http://127.0.0.1:4311/mcp`. Keep this process running. Local HTTP clients must run on the same machine.

### Claude Code

```bash
claude mcp add --transport http --scope user agentstore http://127.0.0.1:4311/mcp
```

### Codex

```bash
codex mcp add agentstore --url http://127.0.0.1:4311/mcp
codex mcp list
```

Restart the Codex app or CLI session after registering the server.

## Stdio alternative

Run these commands from the repository root. The client launches the MCP process, so a separate HTTP server is not required.

### Claude Code

```bash
claude mcp add --scope user agentstore \
  --env AGENTSTORE_DB_PATH="$PWD/data/agentstore.sqlite" \
  -- npm --prefix "$PWD" run mcp
```

### Codex

```bash
codex mcp add agentstore \
  --env AGENTSTORE_DB_PATH="$PWD/data/agentstore.sqlite" \
  -- npm --prefix "$PWD" run mcp
```

Choose one transport for a server named `agentstore`; don't register both under the same name.

## Optional routing plugins

The routing skill reinforces explicit saves, search-then-get retrieval, exact cursor continuation, count-only queries, and lexical fallbacks. It cannot guarantee every model will call a tool or bypass write approvals.

The plugin deliberately does not bundle an MCP server or bearer token. Register the connection separately and keep it enabled.

### Codex

From the repository root:

```bash
codex plugin marketplace add "$PWD"
```

Restart Codex, select the `personal` marketplace source, and install AgentStore.

### Claude Code

From the repository root:

```bash
claude plugin marketplace add "$PWD"
claude plugin install agentstore@agentstore-local --scope user
```

For development without installing:

```bash
claude --plugin-dir "$PWD/plugins/agentstore"
```

Invoke `/agentstore:agentstore-routing` explicitly, or try an ordinary request such as “Save this to my notes: the launch checklist is ready.” Only treat it as saved when the tool succeeds.

## Dashboard

In a separate terminal, from the repository root:

```bash
npm run dashboard
```

Open `http://127.0.0.1:4310`. Browse metrics and objects, filter and search, inspect full JSON, and create, update, or delete objects. The dashboard is a local adapter over the same core store.

## Development HTTPS tunnel

Configure your own Cloudflare tunnel and HTTPS hostname pointing to `/mcp`. Copy `.env.example` to the gitignored `.env.local` and replace both placeholders:

```dotenv
AGENTSTORE_MCP_TOKEN=replace-with-a-long-random-token
AGENTSTORE_TUNNEL_ID=replace-with-your-cloudflare-tunnel-id
```

Run these as separate processes:

```bash
npm run mcp:http
```

```bash
npm run mcp:tunnel
```

Configure each client to use your HTTPS URL and send the same token in an `Authorization: Bearer ...` header. A token is mandatory before exposing the endpoint through a public tunnel. `/health` remains unauthenticated for monitoring.

This is development infrastructure, not a public managed service. See [OSS_READINESS.md](../OSS_READINESS.md) for production authorization, isolation, and operational requirements. Never commit or distribute `.env.local`.

## Tools and pagination

| Core operation | MCP tool |
| --- | --- |
| `put` | `store_object` |
| `get` | `get_object` |
| `list` | `list_objects` |
| `search` | `search_objects` |
| `delete` | `delete_object` |

`search_objects` returns lightweight candidates without full values. Select a key and call `get_object` for the full payload.

`list_objects` returns `results`, page `count`, `total_count`, and `next_cursor`. For complete lists, pass the exact returned cursor until it is null. For count-only questions, request one row and read `total_count`.

## Seed experiment and verification

```bash
npm run seed
```

This recreates the separate `data/demo.sqlite`, inserts example objects, and prints lexical and structured retrieval results. It does not seed the dashboard's default database. The examples deliberately include vocabulary mismatches to expose lexical search limits.

```bash
npm run check
npm test
npm run build
npm audit
```

The neutral comparison harness is maintained separately in the sibling `agentstore-bench` workspace; it is not bundled in this repository. Its reports include source hashes, per-query rankings, local latency, scale behavior, and individual capability checks.

← [Back to the README](../README.md)
