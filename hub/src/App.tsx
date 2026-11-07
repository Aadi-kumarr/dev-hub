import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { apps, hub, type HubApp } from "./apps.config";
import { AppFrame } from "./components/AppFrame";
import { CommandPalette } from "./components/CommandPalette";
import { Home } from "./components/Home";
import { Rail } from "./components/Rail";
import { useShortcuts } from "./lib/useShortcuts";

export default function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const path = pathname.replace(/\/+$/, "");
  const activeApp = apps.find((app) => `/${app.id}` === path);

  // An app's iframe is created on the first visit and then kept, so switching between
  // apps doesn't reload them or lose what's on screen.
  const [visited, setVisited] = useState<HubApp[]>([]);
  const [reloads, setReloads] = useState<Record<string, number>>({});
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (activeApp) {
      setVisited((list) => (list.includes(activeApp) ? list : [...list, activeApp]));
    }
    document.title = activeApp ? `${activeApp.name} · ${hub.name}` : hub.name;
  }, [activeApp]);

  const reload = useCallback((app: HubApp) => {
    setReloads((counts) => ({ ...counts, [app.id]: (counts[app.id] ?? 0) + 1 }));
  }, []);

  useShortcuts({
    paused: paletteOpen,
    onHome: () => navigate("/"),
    onPalette: () => setPaletteOpen((open) => !open),
    onApp: (index) => {
      if (apps[index]) navigate(`/${apps[index].id}`);
    },
  });

  if (path !== "" && !activeApp) return <Navigate to="/" replace />;

  return (
    <div className="flex h-dvh overflow-hidden">
      <AnimatePresence initial={false}>
        {activeApp && (
          <Rail
            key="rail"
            activeApp={activeApp}
            onReload={reload}
            onOpenPalette={() => setPaletteOpen(true)}
          />
        )}
      </AnimatePresence>

      <main className="relative min-w-0 flex-1">
        {visited.map((app) => (
          <AppFrame key={app.id} app={app} active={app === activeApp} reloadCount={reloads[app.id] ?? 0} />
        ))}

        <AnimatePresence initial={false}>
          {!activeApp && (
            <motion.div
              key="home"
              className="absolute inset-0 z-10 overflow-y-auto bg-ink"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Home onOpenPalette={() => setPaletteOpen(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CommandPalette
        open={paletteOpen}
        activeApp={activeApp}
        onClose={() => setPaletteOpen(false)}
        onReload={reload}
      />
    </div>
  );
}
