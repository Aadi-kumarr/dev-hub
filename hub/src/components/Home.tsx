import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { apps, hub, type HubApp } from "../apps.config";
import { useAppStatus } from "../lib/appStatus";
import { getMarketStatus, markets, type Market } from "../lib/markets";
import { CursorGrid } from "./CursorGrid";
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
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

function MarketLine({ market, now }: { market: Market; now: Date }) {
  const { isOpen, detail } = getMarketStatus(market, now);
  return (
    <p className="flex items-center gap-2.5 text-sm">
      <span aria-hidden className={`size-1.5 rounded-full ${isOpen ? "bg-live" : "bg-white/25"}`} />
      <span className="font-medium">{market.name}</span>
      <span className="text-muted">
        {isOpen ? "Open" : "Closed"} · {detail}
      </span>
    </p>
  );
}

function AppCard({ app, index }: { app: HubApp; index: number }) {
  const { statuses } = useAppStatus();
  const status = statuses[app.id];
  const Icon = app.icon;

  return (
    <motion.div variants={rise}>
      <Link
        to={`/${app.id}`}
        className="app-card group flex items-center gap-4 rounded-2xl p-4 sm:gap-5 sm:p-5"
        style={{ "--accent": app.accent } as CSSProperties}
      >
        <span className="icon-tile grid size-12 shrink-0 place-items-center rounded-xl">
          <Icon size={21} strokeWidth={1.6} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-medium tracking-tight">{app.name}</span>
          <span className="mt-0.5 block text-sm leading-snug text-muted">{app.tagline}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="label flex items-center gap-2">
            <StatusDot status={status} />
            {STATUS_LABELS[status]}
          </span>
          <span className="label">
            Port <span className="numeric text-fg">{app.port}</span>
          </span>
        </span>
        <span className="hidden sm:block">
          <span className="key-cap">{index + 1}</span>
        </span>
        <ArrowUpRight
          size={18}
          className="hidden shrink-0 text-muted transition-colors group-hover:text-(--accent) sm:block motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
        />
      </Link>
    </motion.div>
  );
}

export function Home({ onOpenPalette }: { onOpenPalette: () => void }) {
  const now = useNow();

  return (
    <>
      <CursorGrid />
      <motion.div
        className="relative mx-auto flex min-h-full max-w-7xl flex-col px-4 py-6 sm:px-10 sm:py-8"
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.header variants={rise} className="flex items-center justify-between gap-6">
          <p className="text-sm font-medium tracking-tight">{hub.name}</p>
          <p className="numeric text-sm">
            {timeFormat.format(now)}
            <span className="ml-2 text-muted">IST</span>
          </p>
        </motion.header>

        <div aria-hidden className="min-h-14 flex-1" />

        <section className="text-center">
          <motion.h1 variants={rise} className="hero-title font-medium">
            {greeting(now)}, {hub.userName}
          </motion.h1>
          <motion.p variants={rise} className="mt-5 text-lg text-muted">
            {dateFormat.format(now)}
          </motion.p>
          <motion.div variants={rise} aria-label="Market hours" className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-1.5">
            {markets.map((market) => (
              <MarketLine key={market.id} market={market} now={now} />
            ))}
          </motion.div>
        </section>

        <div aria-hidden className="min-h-10 flex-1" />

        <section aria-label="Apps" className="grid gap-3 md:grid-cols-2 md:gap-4">
          {apps.map((app, index) => (
            <AppCard key={app.id} app={app} index={index} />
          ))}
        </section>

        <motion.footer
          variants={rise}
          className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 text-xs text-muted"
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
