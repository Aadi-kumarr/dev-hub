// Waits for every app to answer, then opens the hub in the default browser.
import { spawn } from "node:child_process";
import net from "node:net";
import waitOn from "wait-on";

const HUB_URL = "http://localhost:4000";
const TIMEOUT_MS = 120_000;

// Port 8000 must stay a plain TCP check. Every HTTP request to the Nivesh API runs its
// daily snapshot code, so a readiness check shouldn't send one.
const services = [
  { name: "Fintra", port: 3000, resource: "http-get://127.0.0.1:3000" },
  { name: "Nivesh API", port: 8000, resource: "tcp:127.0.0.1:8000" },
  { name: "Nivesh UI", port: 5173, resource: "http-get://127.0.0.1:5173" },
  { name: "Hub", port: 4000, resource: "http-get://127.0.0.1:4000" },
];

function isListening(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const finish = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
  });
}

try {
  await waitOn({
    resources: services.map((service) => service.resource),
    timeout: TIMEOUT_MS,
    interval: 500,
  });
  console.log(`All apps are up. Opening ${HUB_URL}`);
} catch {
  const up = await Promise.all(services.map((service) => isListening(service.port)));
  const missing = services.filter((_, index) => !up[index]).map((service) => service.name);
  console.error(
    `Still not answering after ${TIMEOUT_MS / 1000} seconds: ${missing.join(", ") || "unknown"}. ` +
      "See the logs folder for why. Opening the hub anyway.",
  );
}

spawn("cmd", ["/c", "start", "", HUB_URL], { detached: true, stdio: "ignore" }).unref();
