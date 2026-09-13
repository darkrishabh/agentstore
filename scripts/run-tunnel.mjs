import { spawn } from "node:child_process";

const tunnelId = process.env.AGENTSTORE_TUNNEL_ID?.trim();
if (!tunnelId) {
  console.error("AGENTSTORE_TUNNEL_ID is required. Set it in .env.local or the environment.");
  process.exit(1);
}

const child = spawn(
  "cloudflared",
  [
    "--config", "/dev/null",
    "tunnel", "--no-autoupdate",
    "--url", "http://127.0.0.1:4311",
    "--http-host-header", "localhost",
    "run", tunnelId,
  ],
  { stdio: "inherit" },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error(`Failed to start cloudflared: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
