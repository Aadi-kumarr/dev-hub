import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { apps, hub, type HubApp } from "../apps.config";
import { useAppStatus } from "../lib/appStatus";
import { getMarketStatus, markets, type Market } from "../lib/markets";
import { STATUS_LABELS, StatusDot } from "./StatusDot";

const IST = "Asia/Kolkata";
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const hourFormat = new Intl.DateTimeFormat("en-GB", { timeZone: IST, hour: "numeric", hourCycle: "h23" });

function greeting(now: Date) {
  const hour = Number(hourFormat.format(now));
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

const rise = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

function MarketPanel({ market, now }: { market: Market; now: Date }) {
  const { isOpen, detail } = getMarketStatus(market, now);
  return (
    <div className="flex items-center justify-between gap-4 bg-panel px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <span className="numeric text-sm font-semibold tracking-wide">{market.name}</span>
        <span
          className={`numeric rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wider ${
            isOpen ? "bg-live/15 text-live" : "bg-white/6 text-muted"
          }`}
        >
          {isOpen ? "OPEN" : "CLOSED"}
        </span>
      </div>
      <span className="numeric text-xs text-muted">{detail}</span>
    </div>
  );
}

function AppCard({ app, index }: { app: HubApp; index: number }) {
  const { statuses } = useAppStatus();
  const status = statuses[app.id];
  const Icon = app.icon;

  return (
    <motion.div className="h-full" variants={rise} whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
      <Link
        to={`/${app.id}`}
        className="app-card group relative flex h-full min-h-64 flex-col overflow-hidden rounded-xl p-6 sm:min-h-72 sm:p-8"
        style={{ "--accent": app.accent } as CSSProperties}
      >
        <span aria-hidden className="card-glow pointer-events-none absolute inset-0" />

        <div className="relative flex items-start justify-between">
          <span className="icon-tile grid size-12 place-items-center rounded-lg">
            <Icon size={22} strokeWidth={1.75} />
          </span>
          <span className="label flex items-center gap-2">
            <StatusDot status={status} />
            {STATUS_LABELS[status]}
          </span>
        </div>

        <div className="relative mt-auto pt-10">
          <h2 className="text-4xl font-semibold tracking-tight">{app.name}</h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">{app.tagline}</p>
        </div>

        <div className="relative mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="label">
            Port <span className="numeric text-fg">{app.port}</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="key-cap">{index + 1}</span>
            <ArrowUpRight
              size={18}
              className="text-muted transition-colors group-hover:text-(--accent) motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function Home({ onOpenPalette }: { onOpenPalette: () => void }) {
  const now = useNow();

  return (
    <>
      <div aria-hidden className="backdrop" />
      <motion.div
        className="relative mx-auto flex min-h-full max-w-6xl flex-col px-4 py-8 sm:px-8 sm:py-12"
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="label">{hub.name}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {greeting(now)}, {hub.userName}
            </h1>
          </div>
          <div className="sm:text-right">
            <p className="numeric text-3xl font-medium tracking-tight sm:text-4xl">
              {timeFormat.format(now)}
              <span className="label ml-2">IST</span>
            </p>
            <p className="mt-1 text-sm text-muted">{dateFormat.format(now)}</p>
          </div>
        </motion.header>

        <motion.section
          variants={rise}
          aria-label="Market hours"
          className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:mt-10 sm:grid-cols-2"
        >
          {markets.map((market) => (
            <MarketPanel key={market.id} market={market} now={now} />
          ))}
        </motion.section>

        <section aria-label="Apps" className="mt-5 grid flex-1 gap-5 md:max-h-[34rem] md:grid-cols-2">
          {apps.map((app, index) => (
            <AppCard key={app.id} app={app} index={index} />
          ))}
        </section>

        <motion.footer
          variants={rise}
          className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-xs text-muted"
        >
          <span className="flex items-center gap-1.5">
            {apps.map((app, index) => (
              <span key={app.id} className="key-cap">
                {index + 1}
              </span>
            ))}
            Open an app
          </span>
          <span className="flex items-center gap-1.5">
            <span className="key-cap">H</span>
            Home
          </span>
          <button
            type="button"
            onClick={onOpenPalette}
            className="flex cursor-pointer items-center gap-1.5 hover:text-fg"
          >
            <span className="key-cap">Ctrl K</span>
            Commands
          </button>
          <span className="sm:ml-auto">Market hours ignore exchange holidays.</span>
        </motion.footer>
      </motion.div>
    </>
  );
}
