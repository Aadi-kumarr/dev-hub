import { AnimatePresence, motion } from "framer-motion";
import { Power } from "lucide-react";
import { useAppStatus } from "../lib/appStatus";

/** Shown when this tab has outlived start-all. Every app looks offline then, and the fix is
 *  to start the launcher again, not to look for a problem in each app. */
export function LauncherDown() {
  const { launcherUp } = useAppStatus();

  return (
    <AnimatePresence>
      {!launcherUp && (
        <motion.div
          role="status"
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-lg border border-line-strong bg-raised px-4 py-3 text-sm shadow-2xl shadow-black/60"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
        >
          <Power size={16} className="shrink-0 text-down" />
          <p>
            <span className="font-medium">start-all isn't running.</span>{" "}
            <span className="text-muted">Double-click start-all.bat and this page will reconnect.</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
