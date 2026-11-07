// Runs before `npm start`. Makes sure MongoDB accepts connections, and tries to start
// the Windows service if it doesn't. This only opens a TCP socket: it never logs in to
// MongoDB or reads or writes any database.
import { spawnSync } from "node:child_process";
import net from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const HOST = "127.0.0.1";
const PORT = 27017;
const SERVICE = "MongoDB";

function isListening() {
  return new Promise((resolve) => {
    const socket = net.connect({ host: HOST, port: PORT });
    const finish = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(1500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

if (await isListening()) {
  console.log(`MongoDB is running on ${HOST}:${PORT}.`);
  process.exit(0);
}

console.log(`MongoDB is not responding on ${HOST}:${PORT}. Starting the "${SERVICE}" service...`);
const started = spawnSync("net", ["start", SERVICE], { encoding: "utf8" });

for (let attempt = 0; attempt < 10; attempt += 1) {
  if (await isListening()) {
    console.log("MongoDB started.");
    process.exit(0);
  }
  await sleep(1000);
}

const detail = `${started.stdout ?? ""}${started.stderr ?? ""}`.trim();
console.error(`
MongoDB could not be started, so nothing else was launched.
${detail ? `\n  ${detail.replace(/\s*\n\s*/g, "\n  ")}\n` : ""}
Starting a service needs administrator rights. To fix this, either:
  - open Services, find "${SERVICE}" and click Start, or
  - run this in an administrator terminal: net start ${SERVICE}
Then run start-all again.
`);
process.exit(1);
