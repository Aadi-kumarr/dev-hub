import type { AppStatus } from "../lib/appStatus";

const COLOURS: Record<AppStatus, string> = {
  checking: "text-muted bg-muted",
  online: "text-live bg-live pulse",
  offline: "text-down bg-down",
};

export const STATUS_LABELS: Record<AppStatus, string> = {
  checking: "Checking",
  online: "Live",
  offline: "Offline",
};

export function StatusDot({ status, className = "" }: { status: AppStatus; className?: string }) {
  return <span aria-hidden className={`block size-2 rounded-full ${COLOURS[status]} ${className}`} />;
}
