# Changelog

All notable changes to AgentStore are documented here. The project follows [Semantic Versioning](https://semver.org/) while recognizing that pre-1.0 releases may change the API.

## [Unreleased]

### Added

- Open-source governance, security, CI, operational, and release documentation.

## [0.2.0] - 2026-09-23

### Added

- Deterministic SQLite object-store core with `put`, `get`, `list`, `search`, and `delete`.
- Standard object metadata, versioning, logical TTL, and constrained object kinds.
- Bounded FTS5, indexed labels, shape retrieval, structured filters, and cursor pagination.
- Stdio and Streamable HTTP MCP adapters with five corresponding tools.
- Local CRUD dashboard over the same database.
- Optional routing plugins for Codex and Claude.
- Migration, scale-boundary, HTTP authentication, MCP, pagination, and CRUD tests.

### Security

- Loopback defaults, optional bearer-token authentication, environment-only tunnel configuration, and secret/data exclusions.

[Unreleased]: https://github.com/darkrishabh/agentstore/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/darkrishabh/agentstore/releases/tag/v0.2.0
