# Dev Hub

One launcher for Fintra and Nivesh Control Room. The hub only opens and embeds the apps:
it has no backend and never reads their data.

## Start

Double-click `start-all.bat`, or run this in this folder:

```powershell
npm start
```

It checks MongoDB, starts everything, waits for the apps to answer, then opens
http://localhost:4000. Press Ctrl+C to stop everything.

First time only, install the hub's packages (`start-all.bat` installs the launcher's own):

```powershell
cd hub
npm install
```

If MongoDB is stopped, the launcher tries to start the `MongoDB` service. That needs
administrator rights, so if it can't, run `net start MongoDB` in an administrator terminal.

## Ports

| Service    | Port  | Address                |
| ---------- | ----- | ---------------------- |
| Hub        | 4000  | http://localhost:4000  |
| Fintra     | 3000  | http://localhost:3000  |
| Nivesh UI  | 5173  | http://localhost:5173  |
| Nivesh API | 8000  | Used by the Nivesh UI  |
| MongoDB    | 27017 | Windows service        |

## Keyboard

| Key                 | Action                                     |
| ------------------- | ------------------------------------------ |
| `1`, `2`, and so on | Open an app, in the order of `apps.config` |
| `H`                 | Home                                       |
| `Ctrl+K`            | Command palette                            |

Browsers keep key presses inside an iframe, so these don't work while you're clicked into an
app. Use the left rail, which is always clickable.

## Add an app

1. Add an entry to `apps` in `hub/src/apps.config.ts`. Its `id` becomes the route, and it gets
   a card, a rail icon, a palette entry and a number key automatically:

   ```ts
   {
     id: "notes",
     name: "Notes",
     tagline: "One line about the app.",
     url: "http://localhost:5200",
     port: 5200,
     accent: "#60a5fa",
     icon: NotebookPen, // any lucide-react icon, imported at the top of the file
   },
   ```

2. To start it with everything else, edit the root `package.json`: add an `app:notes` script,
   then add `"npm:app:notes"` plus a name and colour to the `start` script.
3. Add the app to `resources` in `scripts/open-when-ready.mjs`.

Use `localhost` in `url`, not `127.0.0.1`. The app must also allow being shown in an iframe.

## Good to know

- **Nivesh API checks stay off HTTP.** Every HTTP request to port 8000 runs its daily snapshot
  code, so the launcher uses a TCP check there and the status dot pings only port 5173. If only
  the API stops, Nivesh's dot stays green and Nivesh shows its own error.
- **Fintra backs up on first load.** Opening the dashboard after each start writes one file to
  its `BACKUP_DIR`, which keeps the newest 30.
- **Market hours ignore exchange holidays.** The strip works from the clock alone.
- **Next.js warning.** Fintra prints `Next.js ignored package-lock.json` on start because of this
  folder's lockfile. It's harmless: Fintra stays rooted in its own folder.

## Restore from \_safety

`_safety/` holds manual backups and stays out of git. The restore tools are a separate install:

```powershell
winget install --id MongoDB.DatabaseTools --exact
```

If `mongorestore` isn't found afterwards, open a new terminal. If it's still missing, use the full
path, `& "C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe"`, in place of `mongorestore`.

Stop the apps first, then run these from this folder.

**Fintra:**

```powershell
mongorestore --uri="mongodb://127.0.0.1:27017" --nsInclude="fintra.*" --drop _safety\mongodump-2026-11-07
```

**Nivesh:**

```powershell
mongorestore --uri="mongodb://127.0.0.1:27017" --nsInclude="nivesh.*" --drop _safety\mongodump-2026-11-07
```

`--drop` deletes each collection in the dump and rebuilds it from the backup, so **anything added
since that backup is lost**. Without `--drop`, documents that still exist are left as they are and
only missing ones come back. Add `--dryRun` to either command to preview it without changing data.

Fintra's JSON copies in `_safety\fintra-backups-2026-11-07\` can be restored instead with
**Import Backup** in the app, which never removes anything.
