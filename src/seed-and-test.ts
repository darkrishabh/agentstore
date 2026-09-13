import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

import { AgentStore } from "./store.js";
import type { PutObjectInput } from "./types.js";

const databasePath = resolve(process.cwd(), "data", "demo.sqlite");
if (existsSync(databasePath)) unlinkSync(databasePath);

const store = new AgentStore(databasePath);

const seeds: PutObjectInput[] = [
  object("mike-plumber-contact", "reference", "Mike is the plumber who repaired the kitchen faucet. His number is 415-555-0123.", ["contact", "mike", "plumber", "contractor", "phone"], "chatgpt"),
  object("agentstore-search-design", "note", "Agent storage should keep natural-language interpretation in the agent and deterministic structured queries in the store.", ["agentstore", "architecture", "search"], "chatgpt"),
  object("postgres-lexical-search", "note", "Postgres full-text search and trigram indexes are possible hosted-service backends after the SQLite proof of concept.", ["postgres", "search", "database"], "claude"),
  object("conference-talk-outline", "note", "Conference talk outline: motivate cross-agent portability, show deterministic retrieval, then demonstrate known lexical limits.", ["conference", "talk", "agentstore"], "codex"),
  object("visa-document-checklist", "todo", "Collect passport scan, invitation letter, travel dates, and proof of accommodation for the visa application.", ["travel", "visa", "documents"], "gemini", false, "2026-09-12T17:00:00Z"),
  object("dentist-appointment", "calendar", "Dentist appointment for a routine cleaning on September 18 at 2:30 PM.", ["dentist", "health", "appointment"], "chatgpt", null, null, "2026-09-18T21:30:00Z"),
  object("submit-expense-report", "todo", "Submit the August travel expense report with hotel and train receipts.", ["work", "expenses", "finance"], "claude", false, "2026-09-04T23:59:00Z"),
  object("take-bins-out", "reminder", "Take the recycling and compost bins to the curb Thursday evening.", ["home", "chores", "trash"], "gemini", false, "2026-09-03T19:00:00Z"),
  object("maya-email", "reference", "Maya Chen's project email address is maya.chen@example.com.", ["contact", "maya", "email", "project"], "chatgpt"),
  object("pasta-recipe-link", "reference", "Weeknight pasta recipe: https://example.com/recipes/quick-pasta", ["recipe", "food", "url"], "claude"),
  object("router-reset-steps", "note", "Home router recovery: unplug power for 30 seconds, reconnect, then wait two minutes before testing.", ["home", "wifi", "troubleshooting"], "codex"),
  object("school-pickup-change", "reminder", "Friday school pickup is at 1:15 PM because of the early dismissal schedule.", ["family", "school", "pickup"], "chatgpt", false, "2026-09-04T20:15:00Z"),
  object("library-books-return", "todo", "Return the two library books and the audiobook before the renewal limit.", ["library", "errand", "books"], "gemini", false, "2026-09-08T18:00:00Z"),
  object("team-retro-notes", "note", "Retro: smaller pull requests reduced review time; release ownership still needs clarification.", ["work", "retro", "team"], "claude"),
  object("flight-confirmation", "reference", "Flight confirmation Q7DEMO leaves SFO at 8:10 AM and arrives in Seattle at 10:20 AM.", ["travel", "flight", "confirmation"], "chatgpt"),
  object("hotel-checkin", "calendar", "Hotel check-in at Harbor Hotel after 3 PM on September 22.", ["travel", "hotel", "seattle"], "gemini", null, null, "2026-09-22T22:00:00Z"),
  object("call-insurance", "reminder", "Call the insurance office about the corrected mailing address.", ["insurance", "phone", "admin"], "claude", true, "2026-08-29T18:00:00Z"),
  object("garden-watering", "reminder", "Water the balcony herbs before the afternoon heat.", ["home", "garden", "plants"], "gemini", false, "2026-09-02T15:00:00Z"),
  object("api-pagination-decision", "note", "Prefer cursor pagination for a hosted API so inserts do not shift later pages.", ["api", "pagination", "architecture"], "codex"),
  object("sqlite-fts-trigger-note", "note", "Use insert, update, and delete triggers to keep the SQLite FTS5 external-content table synchronized.", ["sqlite", "fts5", "search"], "codex"),
  object("book-recommendation", "reference", "Recommended book: The Design of Everyday Things for a practical view of affordances and feedback.", ["book", "design", "reading"], "chatgpt"),
  object("groceries-weekend", "todo", "Buy oat milk, tomatoes, rice, yogurt, lemons, and coffee beans.", ["home", "groceries", "shopping"], "gemini", false, "2026-09-05T18:00:00Z"),
  object("renew-domain", "reminder", "Review renewal settings for the project domain before it renews.", ["domain", "admin", "website"], "claude", false, "2026-09-20T16:00:00Z"),
  object("design-review", "calendar", "AgentStore design review with the API team on September 9 at 11 AM Pacific.", ["agentstore", "meeting", "design"], "codex", null, null, "2026-09-09T18:00:00Z"),
  object("mcp-adapter-rule", "note", "MCP is an adapter over the storage core, not AgentStore's canonical protocol or business-logic layer.", ["mcp", "adapter", "architecture"], "chatgpt"),
  object("open-source-license", "todo", "Compare Apache-2.0 and MIT for the open-source AgentStore core.", ["open-source", "license", "agentstore"], "claude", false),
  object("vet-phone", "reference", "The neighborhood veterinary clinic can be reached at +1 (415) 555-0188.", ["pet", "vet", "phone", "contact"], "gemini"),
  object("mechanic-email", "reference", "Send vehicle photos to service@example.org before requesting a repair estimate.", ["car", "mechanic", "email"], "chatgpt"),
  object("mcp-spec-link", "reference", "Official Model Context Protocol documentation: https://modelcontextprotocol.io/docs", ["mcp", "documentation", "url"], "codex"),
  object("packing-list", "todo", "Pack rain jacket, USB-C charger, headphones, walking shoes, and medication.", ["travel", "packing", "seattle"], "gemini", true),
  object("quarterly-goals", "note", "Quarterly goals: validate object retrieval, interview five agent builders, and publish the minimal protocol contract.", ["goals", "agentstore", "research"], "chatgpt"),
  object("coffee-chat", "calendar", "Coffee with Jordan at the downtown cafe on September 11 at 9:30 AM.", ["coffee", "jordan", "meeting"], "claude", null, null, "2026-09-11T16:30:00Z"),
  object("laundry-reminder", "reminder", "Move the laundry to the dryer after the wash cycle finishes.", ["home", "laundry", "chores"], "gemini", true),
  object("backup-photos", "todo", "Copy the summer photos to the external drive and verify a sample opens.", ["photos", "backup", "home"], "codex", false, "2026-09-13T20:00:00Z"),
  object("retrieval-success-criterion", "note", "Success means one agent writes a structured object and another recovers it without knowing the original key or exact labels.", ["agentstore", "retrieval", "success"], "chatgpt"),
  object("ttl-design", "note", "Expired objects should be hidden from get, list, and search; physical cleanup can happen later.", ["ttl", "expiration", "architecture"], "codex"),
  object("pick-up-prescription", "reminder", "Pick up the prescription from the pharmacy before closing.", ["health", "pharmacy", "errand"], "claude", false, "2026-09-01T23:00:00Z"),
  object("client-portability", "note", "The user's objects must remain portable between ChatGPT, Claude, Codex, Gemini, and future agents.", ["portability", "cross-agent", "ownership"], "gemini"),
  object("bike-lock-code-hint", "other", "The bike lock hint is the year of the first apartment, not the actual code.", ["bike", "hint", "personal"], "chatgpt"),
  object("demo-script", "todo", "Demo: save in one MCP client, search from a second client, inspect the match explanation, then fetch the full value.", ["demo", "mcp", "agentstore"], "codex", false),
  object("feature-boundary", "note", "Do not add embeddings, RAG, workflows, automatic taxonomy, reminders execution, or a polished notes UI to the MVP.", ["scope", "mvp", "agentstore"], "claude"),
  object("tax-document-folder", "reference", "The 2026 estimated-tax documents are in the blue folder beside the filing cabinet.", ["tax", "documents", "home"], "gemini"),
];

seeds.forEach((seed, index) => {
  const timestamp = new Date(Date.UTC(2026, 6, 20 + index, 12, 0, 0)).toISOString();
  store.put(seed, { now: timestamp });
});

console.log(`Seeded ${seeds.length} objects into ${databasePath}\n`);

for (const query of [
  "plumber",
  "mike",
  "which note has a phone number",
  "what email did I save",
  "agent storage",
  "postgres search",
  "the guy who fixed the sink",
  "conference talk",
]) {
  const results = store.search({ query, limit: 5 });
  console.log(`QUERY: ${query}`);
  if (results.length === 0) {
    console.log("  NO MATCH (lexical/metadata boundary exposed)");
  } else {
    for (const result of results) {
      console.log(`  ${result.key}  score=${result.match.score}  via=${result.match.matchedFields.join(",")}`);
    }
  }
}

const structured = [
  ["incomplete reminders", store.search({ kind: ["reminder"], completed: false, sort: "due_asc", limit: 50 })],
  ["todos due before Sep 10", store.search({ kind: ["todo"], dueBefore: "2026-09-10T00:00:00Z", sort: "due_asc", limit: 50 })],
  ["ChatGPT objects in August", store.search({ sourceClient: ["chatgpt"], createdAfter: "2026-08-01T00:00:00Z", createdBefore: "2026-09-01T00:00:00Z", sort: "created_desc", limit: 50 })],
  ["latest notes", store.search({ kind: ["note"], sort: "created_desc", limit: 5 })],
] as const;

console.log("\nSTRUCTURED RETRIEVAL");
for (const [name, results] of structured) {
  console.log(`  ${name}: ${results.map((result) => result.key).join(", ") || "NO MATCH"}`);
}

store.close();

function object(
  key: string,
  kind: PutObjectInput["kind"],
  text: string,
  labels: string[],
  sourceClient: string,
  completed: boolean | null = null,
  dueAt: string | null = null,
  startAt: string | null = null,
): PutObjectInput {
  return {
    key,
    kind,
    value: { text },
    searchableText: text,
    description: text.split(/[.!?]/)[0],
    labels,
    sourceClient,
    completed,
    dueAt,
    startAt,
  };
}
