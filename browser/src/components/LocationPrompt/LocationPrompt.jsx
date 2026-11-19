import React from "react";
import { createPortal } from "react-dom";
import { MapPin, ShieldCheck } from "lucide-react";

// In-app permission card (replaces the browser's confirm() popup)
const LocationPrompt = ({ open, onAllow, onDeny }) => {
  if (!open) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="use your location" className="fixed inset-0 z-[85] flex items-end justify-center p-4 sm:items-center">
      <div aria-hidden onClick={onDeny} className="absolute inset-0 animate-[fade-in_250ms_ease-out] bg-ink-950/40 backdrop-blur-[3px]" />
      <div className="relative w-full max-w-sm animate-scale-in overflow-hidden rounded-3xl border border-sand-200 bg-white text-ink-900 shadow-2xl dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50">
        <div className="relative grid h-32 place-content-center overflow-hidden bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700">
          <span aria-hidden className="absolute h-40 w-40 animate-ping rounded-full bg-white/10 [animation-duration:2.4s]" />
          <span aria-hidden className="absolute h-24 w-24 rounded-full bg-white/15" />
          <span className="relative grid h-16 w-16 place-content-center rounded-2xl bg-white text-brand-600 shadow-xl">
            <MapPin size={30} strokeWidth={2.25} />
          </span>
        </div>
        <div className="p-6 pt-5">
          <h2 className="text-xl font-extrabold tracking-tight">show places near you?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            we'll use your approximate location to center the map and find places close to you.
          </p>
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-sand-100 px-3 py-2 text-xs font-medium text-ink-500 dark:bg-ink-850 dark:text-ink-300">
            <ShieldCheck size={16} className="shrink-0 text-brand-500" />
            it stays on your device and is never saved.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={onDeny} className="btn-secondary w-full justify-center py-3">not now</button>
            <button type="button" onClick={onAllow} className="btn-primary py-3">allow</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationPrompt;
