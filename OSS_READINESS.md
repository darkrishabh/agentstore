# Open-source readiness

This is an evidence-based release checklist, not a claim that the repository is already production-ready.

## Implemented in the MVP

- A small typed core with `put`, `get`, `list`, `search`, and `delete`.
- SQLite migrations for indexed labels and deterministic phone, email, and URL shape fields.
- Bounded FTS5 and index-driven candidate retrieval with no full-table application scan.
- Opaque cursor pagination and complete traversal through the core, MCP, and dashboard API.
- Streamable HTTP and stdio MCP adapters with input validation and safety annotations.
- A clean CRUD dashboard over the same database used by MCP.
- Codex portable/compatibility and Claude compatibility manifests with a shared routing skill.
- Automated TypeScript, core, MCP, HTTP-authentication, migration, scale-boundary, and pagination tests.
- A separate neutral comparison harness with raw machine-readable reports and source hashes.

## Required before the first public source release

- Choose and add a license. MIT versus Apache-2.0 is still a project-owner decision.
- Add the real repository URL, issue templates, contribution guidelines, a code of conduct, and security-reporting instructions.
- Add CI for type checking, tests, build, dependency audit, plugin validation, and a small reproducible benchmark smoke test.
- Define supported Node.js and SQLite versions and a backward-compatible database migration policy.
- Document backup, restore, export, import, database locking, and corruption-recovery procedures.
- Review dependencies and generated artifacts for licensing, secrets, personal data, and machine-specific paths. Tunnel IDs and bearer tokens are already environment-only.
- Independently review the benchmark relevance labels before using scores in public comparative claims.

## Required before a hosted managed service or public MCP plugin

- Replace the development Cloudflare tunnel with a stable production HTTPS deployment.
- Implement OAuth 2.1 or another supported per-user authorization flow; do not distribute the shared bearer token.
- Isolate every user's objects and enforce authorization inside every tool handler.
- Add rate limits, request timeouts, quotas, audit logging, metrics, alerting, backups, and disaster recovery.
- Define retention and deletion guarantees, privacy terms, security policy, and an incident-response process.
- Run MCP Inspector plus direct, indirect, edge-case, destructive-action, and cross-client routing evaluations against the deployed endpoint.
- Load-test concurrent writers/readers and large stores on the intended hosted database rather than extrapolating local SQLite latency.

## Retrieval work after the MVP

- Expand the versioned query evaluation set with real user paraphrases, typos, abbreviations, multilingual queries, and hard negatives.
- Measure query-rewrite and fallback policies separately from store ranking so agent routing is not confused with retrieval quality.
- Add result-quality telemetry that does not log private object values.
- Consider spelling correction or optional client-side expansion only with explicit evaluation evidence. Keep embeddings and semantic interpretation out of the deterministic core unless the product boundary is intentionally changed.
