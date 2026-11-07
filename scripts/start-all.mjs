// Starts every service in one window and copies each one's output to logs/<service>.log,
// so you can still see why an app died after the window is closed. Each run replaces the
// previous run's logs.
import { closeSync, mkdirSync, openSync, writeSync } from "node:fs";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";

const MIN_NODE_MAJOR = 22;
const LOG_DIR = "logs";

const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < MIN_NODE_MAJOR) {
  console.error(
    `Node ${process.versions.node} is too old: the launcher needs Node ${MIN_NODE_MAJOR} or newer.\n` +
      "Use start-all.bat, which picks fnm's default Node, or switch with: fnm use default",
  );
  process.exit(1);
}

// Imported here, after the version check, because this package needs a recent Node.
const { default: concurrently } = await import("concurrently");

const services = [
  { name: "FINTRA", log: "fintra", script: "app:fintra", prefixColor: "green.bold" },
  { name: "NIVESH-API", log: "nivesh-api", script: "app:nivesh-api", prefixColor: "yellow.bold" },
  { name: "NIVESH-UI", log: "nivesh-ui", script: "app:nivesh-ui", prefixColor: "yellow.bold" },
  { name: "HUB", log: "hub", script: "app:hub", prefixColor: "cyan.bold" },
  { name: "READY", log: "ready", script: "open-when-ready", prefixColor: "gray" },
];

mkdirSync(LOG_DIR, { recursive: true });

const { commands, result } = concurrently(
  services.map(({ name, script, prefixColor }) => ({ name, prefixColor, command: `npm:${script}` })),
  { prefix: "[{name}]", padPrefix: true },
);

commands.forEach((command, index) => {
  const service = services[index];
  // Written synchronously, so the last lines survive if the launcher itself is killed.
  const file = openSync(path.join(LOG_DIR, `${service.log}.log`), "w");
  const write = (text) => writeSync(file, stripVTControlCharacters(text));

  write(`=== ${service.name} started ${new Date().toISOString()} on Node ${process.versions.node}\n`);
  command.stdout.subscribe((chunk) => write(chunk.toString()));
  command.stderr.subscribe((chunk) => write(chunk.toString()));
  command.error.subscribe((error) => write(`\n=== Could not start: ${error}\n`));
  command.close.subscribe(({ exitCode, killed }) => {
    write(`\n=== Exited with code ${exitCode}${killed ? " (stopped by the launcher)" : ""} ${new Date().toISOString()}\n`);
    closeSync(file);
  });
});

console.log(`Logs: ${path.resolve(LOG_DIR)}`);

// Ctrl+C makes this reject. That's a normal way to stop, not a failure.
await result.catch(() => {});
