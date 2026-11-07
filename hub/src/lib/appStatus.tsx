import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apps, type HubApp } from "../apps.config";

export type AppStatus = "checking" | "online" | "offline";

const POLL_MS = 20_000;
const CONFIRM_MS = 2_000;
const TIMEOUT_MS = 8_000;

type StatusContextValue = {
  statuses: Record<string, AppStatus>;
  recheck: (app: HubApp) => Promise<void>;
};

const StatusContext = createContext<StatusContextValue | null>(null);

/** A no-cors HEAD request: it can only tell whether the server answered. The response is
 *  opaque to the hub, so no app data can be read this way. */
async function isReachable(app: HubApp) {
  try {
    await fetch(app.url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return true;
  } catch {
    return false;
  }
}

export function AppStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>(() =>
    Object.fromEntries(apps.map((app) => [app.id, "checking" as AppStatus])),
  );
  const current = useRef(statuses);
  current.current = statuses;

  const set = useCallback((id: string, status: AppStatus) => {
    setStatuses((previous) => (previous[id] === status ? previous : { ...previous, [id]: status }));
  }, []);

  const recheck = useCallback(
    async (app: HubApp) => {
      if (await isReachable(app)) {
        set(app.id, "online");
        return;
      }
      if (current.current[app.id] !== "online") {
        set(app.id, "offline");
        return;
      }
      // An open app loses its iframe when it goes offline, along with anything half typed.
      // One slow answer, such as a dev server compiling, mustn't cause that, so confirm first.
      await new Promise((resolve) => setTimeout(resolve, CONFIRM_MS));
      set(app.id, (await isReachable(app)) ? "online" : "offline");
    },
    [set],
  );

  useEffect(() => {
    const checkAll = () => {
      if (!document.hidden) apps.forEach((app) => void recheck(app));
    };
    checkAll();
    const timer = setInterval(checkAll, POLL_MS);
    document.addEventListener("visibilitychange", checkAll);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", checkAll);
    };
  }, [recheck]);

  const value = useMemo(() => ({ statuses, recheck }), [statuses, recheck]);
  return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>;
}

export function useAppStatus() {
  const value = useContext(StatusContext);
  if (!value) throw new Error("useAppStatus must be used inside AppStatusProvider");
  return value;
}
