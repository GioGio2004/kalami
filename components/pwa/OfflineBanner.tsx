"use client";

import { AnimatePresence, motion } from "motion/react";
import { useOnline } from "./usePwa";

/** A strip across the top while the connection is gone; Convex reconnects by itself when it's back. */
export function OfflineBanner() {
  const online = useOnline();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          role="status"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="sticky top-0 z-50 bg-ink px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] text-center text-sm text-paper"
        >
          <span className="font-medium">You&apos;re offline.</span> Kalami needs a connection to load and save your work; it
          reconnects by itself.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
