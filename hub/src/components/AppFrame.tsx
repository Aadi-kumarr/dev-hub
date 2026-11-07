import { motion } from "framer-motion";
import { PlugZap, RotateCw } from "lucide-react";
import { useState, type CSSProperties } from "react";
import type { HubApp } from "../apps.config";
import { useAppStatus } from "../lib/appStatus";

function Loading({ app }: { app: HubApp }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-ink">
      <p className="label">Loading {app.name}…</p>
    </div>
  );
}

function Offline({ app }: { app: HubApp }) {
  const { recheck } = useAppStatus();
  const [retrying, setRetrying] = useState(false);
  const Icon = app.icon;

  const retry = async () => {
    setRetrying(true);
    await recheck(app);
    setRetrying(false);
  };

  return (
    <div
      className="absolute inset-0 grid place-items-center bg-ink px-6"
      style={{ "--accent": app.accent } as CSSProperties}
    >
      <div className="max-w-sm text-center">
        <span className="icon-tile mx-auto grid size-14 place-items-center rounded-xl">
          <Icon size={24} strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">{app.name} isn't running</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Nothing answered on <span className="numeric text-fg">port {app.port}</span>. The{" "}
          <span className="numeric text-fg">logs</span> folder next to start-all.bat shows why.
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-60"
        >
          {retrying ? <RotateCw size={15} className="motion-safe:animate-spin" /> : <PlugZap size={15} />}
          {retrying ? "Checking…" : "Retry"}
        </button>
        <p className="mt-3 text-xs text-muted">The hub also keeps checking on its own.</p>
      </div>
    </div>
  );
}

function Frame({ app }: { app: HubApp }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <iframe
        src={app.url}
        title={app.name}
        className="absolute inset-0 size-full border-0 bg-ink"
        onLoad={() => setLoaded(true)}
      />
      {!loaded && <Loading app={app} />}
    </>
  );
}

type AppFrameProps = {
  app: HubApp;
  active: boolean;
  reloadCount: number;
};

export function AppFrame({ app, active, reloadCount }: AppFrameProps) {
  const { statuses } = useAppStatus();
  const status = statuses[app.id];

  return (
    <motion.div
      className="absolute inset-0"
      style={{ pointerEvents: active ? "auto" : "none" }}
      initial={{ opacity: 0 }}
      animate={
        active
          ? { opacity: 1, visibility: "visible" }
          : { opacity: 0, transitionEnd: { visibility: "hidden" } }
      }
      transition={{ duration: 0.18 }}
    >
      {status === "checking" && <Loading app={app} />}
      {status === "offline" && <Offline app={app} />}
      {/* A cross-origin iframe can't be told to reload, so a new key rebuilds it. */}
      {status === "online" && <Frame key={reloadCount} app={app} />}
    </motion.div>
  );
}
