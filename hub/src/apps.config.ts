import { ChartCandlestick, Wallet, type LucideIcon } from "lucide-react";

export type HubApp = {
  /** Also the hub route: id "fintra" opens at /fintra. */
  id: string;
  name: string;
  tagline: string;
  /** What the iframe loads and the status dot pings. Use localhost, not 127.0.0.1. */
  url: string;
  port: number;
  /** Hex colour for this app's glow, active state and icon. */
  accent: string;
  icon: LucideIcon;
};

export const hub = {
  name: "Hub",
  userName: "Aditya",
};

/** The order here sets the keyboard shortcuts: the first app is 1, the second is 2, and so on. */
export const apps: HubApp[] = [
  {
    id: "fintra",
    name: "Fintra",
    tagline: "Spending, savings and cash flow, month by month.",
    url: "http://localhost:3000",
    port: 3000,
    accent: "#34d399",
    icon: Wallet,
  },
  {
    id: "nivesh",
    name: "Nivesh",
    tagline: "Holdings, returns and allocation in one control room.",
    // The Vite UI. Don't point this at the API on 8000: every request there runs its
    // daily snapshot code, and the status dot pings this URL.
    url: "http://localhost:5173",
    port: 5173,
    accent: "#f5b544",
    icon: ChartCandlestick,
  },
];
