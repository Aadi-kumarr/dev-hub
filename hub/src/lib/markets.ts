// Market hours are worked out from the clock alone, with no API. Exchange holidays and
// special sessions are ignored, so a market can show OPEN on a day it is actually shut.

export type Market = {
  id: string;
  name: string;
  timeZone: string;
  /** Minutes after local midnight. */
  open: number;
  close: number;
};

export type MarketStatus = {
  isOpen: boolean;
  /** "closes in 2h 5m" or "opens in 14h 30m". */
  detail: string;
};

export const markets: Market[] = [
  { id: "nse", name: "NSE", timeZone: "Asia/Kolkata", open: 9 * 60 + 15, close: 15 * 60 + 30 },
  { id: "nyse", name: "NYSE", timeZone: "America/New_York", open: 9 * 60 + 30, close: 16 * 60 },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      weekday: "short",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

function wallClock(date: Date, timeZone: string) {
  const parts: Record<string, string> = {};
  for (const { type, value } of formatterFor(timeZone).formatToParts(date)) parts[type] = value;
  return {
    weekday: WEEKDAYS.indexOf(parts.weekday),
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function utcOffsetMs(date: Date, timeZone: string) {
  const t = wallClock(date, timeZone);
  const asUtc = Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute, t.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant a wall-clock time happens in a zone. Going through UTC keeps the countdown
 *  right across a daylight saving change. */
function zonedInstant(year: number, month: number, day: number, minutes: number, timeZone: string) {
  const wall = Date.UTC(year, month - 1, day, 0, minutes);
  let instant = wall;
  for (let pass = 0; pass < 2; pass += 1) {
    instant = wall - utcOffsetMs(new Date(instant), timeZone);
  }
  return instant;
}

function formatCountdown(ms: number) {
  const minutes = Math.ceil(ms / 60_000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function getMarketStatus(market: Market, now: Date): MarketStatus {
  const t = wallClock(now, market.timeZone);
  const minuteOfDay = t.hour * 60 + t.minute;
  const isWeekday = t.weekday >= 1 && t.weekday <= 5;

  if (isWeekday && minuteOfDay >= market.open && minuteOfDay < market.close) {
    const closesAt = zonedInstant(t.year, t.month, t.day, market.close, market.timeZone);
    return { isOpen: true, detail: `closes in ${formatCountdown(closesAt - now.getTime())}` };
  }

  for (let offset = 0; offset <= 7; offset += 1) {
    const weekday = (t.weekday + offset) % 7;
    if (weekday === 0 || weekday === 6) continue;
    const day = new Date(Date.UTC(t.year, t.month - 1, t.day + offset));
    const opensAt = zonedInstant(
      day.getUTCFullYear(),
      day.getUTCMonth() + 1,
      day.getUTCDate(),
      market.open,
      market.timeZone,
    );
    if (opensAt > now.getTime()) {
      return { isOpen: false, detail: `opens in ${formatCountdown(opensAt - now.getTime())}` };
    }
  }
  return { isOpen: false, detail: "" }; // Unreachable: a weekday always falls within 7 days.
}
