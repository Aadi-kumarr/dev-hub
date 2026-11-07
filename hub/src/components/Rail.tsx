import { motion } from "framer-motion";
import {
  Command,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCw,
  type LucideIcon,
} from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { apps, hub, type HubApp } from "../apps.config";
import { useAppStatus } from "../lib/appStatus";
import { StatusDot } from "./StatusDot";

const STORAGE_KEY = "hub.rail.expanded";
const COLLAPSED = 56;
const EXPANDED = 208;

function readExpanded() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveExpanded(expanded: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(expanded));
  } catch {
    // Only a convenience: the rail just starts collapsed next time.
  }
}

const ITEM = "flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm whitespace-nowrap";

function ItemLabel({ expanded, children }: { expanded: boolean; children: ReactNode }) {
  return expanded ? <span className="truncate">{children}</span> : null;
}

type ToolProps = {
  icon: LucideIcon;
  label: string;
  expanded: boolean;
  onClick?: () => void;
  href?: string;
};

function Tool({ icon: Icon, label, expanded, onClick, href }: ToolProps) {
  const className = `${ITEM} text-muted transition-colors hover:bg-white/6 hover:text-fg`;
  const content = (
    <>
      <Icon size={18} strokeWidth={1.75} className="shrink-0" />
      <ItemLabel expanded={expanded}>{label}</ItemLabel>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" title={label} aria-label={label} className={className}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={className}>
      {content}
    </button>
  );
}

type RailProps = {
  activeApp: HubApp;
  onReload: (app: HubApp) => void;
  onOpenPalette: () => void;
};

export function Rail({ activeApp, onReload, onOpenPalette }: RailProps) {
  const { statuses } = useAppStatus();
  const [expanded, setExpanded] = useState(readExpanded);

  const toggle = () => {
    setExpanded(!expanded);
    saveExpanded(!expanded);
  };

  return (
    <motion.nav
      aria-label="Hub"
      className="z-20 flex shrink-0 flex-col gap-1 overflow-hidden border-r border-line bg-panel p-2"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: expanded ? EXPANDED : COLLAPSED, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link to="/" title="Home" aria-label="Home" className={`${ITEM} font-semibold hover:bg-white/6`}>
        <img src="/favicon.svg" alt="" className="size-[18px] shrink-0" />
        <ItemLabel expanded={expanded}>{hub.name}</ItemLabel>
      </Link>

      <div className="my-1 h-px shrink-0 bg-line" />

      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <NavLink
            key={app.id}
            to={`/${app.id}`}
            title={app.name}
            aria-label={app.name}
            style={{ "--accent": app.accent } as CSSProperties}
            className={({ isActive }) =>
              `${ITEM} relative transition-colors ${
                isActive
                  ? "bg-(--accent)/12 text-(--accent)"
                  : "text-muted hover:bg-white/6 hover:text-fg"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="rail-active"
                    className="absolute inset-y-2 -left-2 w-0.5 rounded-r bg-(--accent)"
                  />
                )}
                <span className="relative shrink-0">
                  <Icon size={18} strokeWidth={1.75} />
                  <StatusDot
                    status={statuses[app.id]}
                    className="absolute -top-0.5 -right-1 size-1.5! ring-2 ring-panel [animation:none]!"
                  />
                </span>
                <ItemLabel expanded={expanded}>{app.name}</ItemLabel>
              </>
            )}
          </NavLink>
        );
      })}

      <div className="mt-auto flex flex-col gap-1">
        <Tool
          icon={RotateCw}
          label={`Reload ${activeApp.name}`}
          expanded={expanded}
          onClick={() => onReload(activeApp)}
        />
        <Tool icon={ExternalLink} label="Open in new tab" expanded={expanded} href={activeApp.url} />
        <Tool icon={Command} label="Commands" expanded={expanded} onClick={onOpenPalette} />
        <div className="my-1 h-px shrink-0 bg-line" />
        <Tool
          icon={expanded ? PanelLeftClose : PanelLeftOpen}
          label={expanded ? "Collapse" : "Expand"}
          expanded={expanded}
          onClick={toggle}
        />
      </div>
    </motion.nav>
  );
}
