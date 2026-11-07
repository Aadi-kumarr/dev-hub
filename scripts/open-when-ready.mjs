// Waits for every app to answer, then opens the hub in the default browser.
import { spawn } from "node:child_process";
import waitOn from "wait-on";

const HUB_URL = "http://localhost:4000";
const TIMEOUT_MS = 180_000;

// Port 8000 must stay a plain TCP check. Every HTTP request to the Nivesh API runs its
// daily snapshot code, so a readiness check shouldn't send one.
const resources = [
  "http-get://127.0.0.1:3000", // Fintra
  "tcp:127.0.0.1:8000", // Nivesh API
  "http-get://127.0.0.1:5173", // Nivesh UI
  "http-get://127.0.0.1:4000", // Hub
];

try {
  await waitOn({ resources, timeout: TIMEOUT_MS, interval: 500 });
} catch {
  console.error(
    `Not everything answered within ${TIMEOUT_MS / 1000} seconds. Check the logs above. ` +
      `Apps that did start keep running, and you can open ${HUB_URL} yourself.`,
  );
  process.exit(0); // Exit quietly: a slow app shouldn't take the others down.
}

console.log(`All apps are up. Opening ${HUB_URL}`);
spawn("cmd", ["/c", "start", "", HUB_URL], { detached: true, stdio: "ignore" }).unref();
