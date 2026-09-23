import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pkg = readJson("package.json");
const portable = readJson("plugins/agentstore/plugin.json");
const codex = readJson("plugins/agentstore/.codex-plugin/plugin.json");
const claude = readJson("plugins/agentstore/.claude-plugin/plugin.json");
const claudeMarketplace = readJson(".claude-plugin/marketplace.json");
const requiredFiles = [
  "LICENSE",
  "README.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "docs/GETTING_STARTED.md",
  "docs/COMPATIBILITY.md",
  "docs/DATABASE_OPERATIONS.md",
  "plugins/agentstore/skills/agentstore-routing/SKILL.md",
];

assert(pkg.license === "Apache-2.0", "package.json must declare Apache-2.0");
assert(pkg.repository?.url === "git+https://github.com/darkrishabh/agentstore.git", "repository URL is missing");
for (const [name, manifest] of Object.entries({ portable, codex, claude })) {
  assert(manifest.name === "agentstore", `${name} manifest has the wrong name`);
  assert(manifest.version === pkg.version, `${name} version ${manifest.version} does not match core ${pkg.version}`);
}
const marketplacePlugin = claudeMarketplace.plugins?.find((plugin) => plugin.name === "agentstore");
assert(marketplacePlugin?.version === pkg.version, "Claude marketplace version does not match core");
for (const file of requiredFiles) assert(existsSync(file), `missing required distribution file: ${file}`);

const skill = readFileSync("plugins/agentstore/skills/agentstore-routing/SKILL.md", "utf8");
assert(/^---\n[\s\S]*?^name:\s*agentstore-routing\s*$/m.test(skill), "routing skill frontmatter is invalid");
assert(/^description:\s*\S+/m.test(skill), "routing skill description is missing");

function sourceFiles(directory = ".") {
  const skippedDirectories = new Set([".git", "dist", "node_modules"]);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name).replace(/^\.\//, "");
    if (entry.isDirectory()) return skippedDirectories.has(entry.name) ? [] : sourceFiles(path);
    if (!entry.isFile()) return [];
    if (/^(?:\.env(?:\..*)?|\.DS_Store)$/.test(entry.name) && entry.name !== ".env.example") return [];
    if (/\.(?:sqlite(?:-shm|-wal)?|db(?:-shm|-wal)?|log|tgz)$/i.test(entry.name)) return [];
    return [path];
  });
}

let files;
try {
  execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
  files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    encoding: "utf8",
  }).split("\0").filter(Boolean);
} catch {
  files = sourceFiles();
}
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}|AKIA[A-Z0-9]{16})\b/,
];
const flagged = [];
for (const file of files) {
  if (/\.(?:png|jpg|jpeg|gif|webp|sqlite|db)$/i.test(file)) continue;
  const content = readFileSync(file, "utf8");
  const macHomePrefix = ["", "Users", ""].join("/");
  if (content.includes(macHomePrefix) || secretPatterns.some((pattern) => pattern.test(content))) flagged.push(file);
}
assert(flagged.length === 0, `possible private data in: ${flagged.join(", ")}`);

console.log(`Distribution validation passed (${files.length} files scanned).`);
