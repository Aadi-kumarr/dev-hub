import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, House, RotateCw, Search, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apps, type HubApp } from "../apps.config";

type CommandItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  accent?: string;
  shortcut?: string;
  run: () => void;
};

type CommandPaletteProps = {
  open: boolean;
  activeApp: HubApp | undefined;
  onClose: () => void;
  onReload: (app: HubApp) => void;
};

export function CommandPalette({ open, activeApp, onClose, onReload }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      { id: "home", label: "Go to Home", icon: House, shortcut: "H", run: () => navigate("/") },
      ...apps.map((app, index) => ({
        id: app.id,
        label: `Open ${app.name}`,
        icon: app.icon,
        accent: app.accent,
        shortcut: String(index + 1),
        run: () => navigate(`/${app.id}`),
      })),
    ];
    if (activeApp) {
      items.push(
        {
          id: "reload",
          label: `Reload ${activeApp.name}`,
          icon: RotateCw,
          run: () => onReload(activeApp),
        },
        {
          id: "new-tab",
          label: `Open ${activeApp.name} in a new tab`,
          icon: ExternalLink,
          run: () => window.open(activeApp.url, "_blank", "noreferrer"),
        },
      );
    }
    return items;
  }, [activeApp, navigate, onReload]);

  const matches = commands.filter((command) =>
    command.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
    }
  }, [open]);

  const run = (command: CommandItem | undefined) => {
    if (!command) return;
    onClose();
    command.run();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown" && matches.length) {
      event.preventDefault();
      setSelected((selected + 1) % matches.length);
    } else if (event.key === "ArrowUp" && matches.length) {
      event.preventDefault();
      setSelected((selected - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(matches[selected]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[16vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Commands"
            className="w-full max-w-md overflow-hidden rounded-xl border border-line-strong bg-raised shadow-2xl shadow-black/60"
            initial={{ y: -8, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={16} className="shrink-0 text-muted" />
              <input
                ref={input}
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelected(0);
                }}
                placeholder="Type a command"
                aria-label="Type a command"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
              <span className="key-cap">Esc</span>
            </div>

            <ul className="max-h-72 overflow-y-auto p-1.5">
              {matches.map((command, index) => {
                const Icon = command.icon;
                return (
                  <li key={command.id}>
                    <button
                      type="button"
                      onClick={() => run(command)}
                      onMouseMove={() => setSelected(index)}
                      className={`flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-2.5 text-left text-sm ${
                        index === selected ? "bg-white/8" : ""
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.75} style={{ color: command.accent }} />
                      <span className="flex-1 truncate">{command.label}</span>
                      {command.shortcut && <span className="key-cap">{command.shortcut}</span>}
                    </button>
                  </li>
                );
              })}
              {matches.length === 0 && (
                <li className="px-2.5 py-3 text-sm text-muted">No matching commands.</li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
