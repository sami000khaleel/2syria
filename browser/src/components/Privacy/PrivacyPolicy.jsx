import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, X } from "lucide-react";

// The policy text, shared by the modal and the /privacy page
export const PrivacyContent = () => (
  <div className="space-y-5 text-[15px] leading-relaxed text-ink-600 dark:text-ink-200">
    <section>
      <h3 className="mb-1.5 text-base font-bold text-ink-900 dark:text-white">Demo accounts</h3>
      <p>
        When you log in with a demo account, the only thing we save is the <b>date and time you logged in</b>.
        We don't ask for your name or email, and the app doesn't record your IP address or location.
      </p>
      <p className="mt-2">
        Demo accounts are shared. Anything you post with one (for example a review) is saved under that demo
        account and other visitors can see it, so please don't write anything personal.
      </p>
    </section>
    <section>
      <h3 className="mb-1.5 text-base font-bold text-ink-900 dark:text-white">Your own account</h3>
      <p>
        If you sign up, we keep what you need to log in: your username, your email (only used to send password
        reset codes) and your password, which is stored encrypted. We also save the date you last logged in and
        the reviews you write. Nothing else.
      </p>
    </section>
    <section>
      <h3 className="mb-1.5 text-base font-bold text-ink-900 dark:text-white">Your location</h3>
      <p>
        Only if you allow it, your browser asks a location service (geojs.io, or ipapi.co as a backup) for your
        approximate location based on your internet connection, to center the map near you. It stays on your
        device and is <b>never saved</b> by us.
      </p>
    </section>
    <section>
      <h3 className="mb-1.5 text-base font-bold text-ink-900 dark:text-white">Cookies & photos</h3>
      <p>
        We use a cookie to keep you logged in, and your browser's storage remembers choices like dark mode.
        Photos you upload for “search by photo” are only used to find the place and are not stored.
      </p>
    </section>
    <section>
      <h3 className="mb-1.5 text-base font-bold text-ink-900 dark:text-white">Other services</h3>
      <p>
        Map tiles come from OpenStreetMap and fonts from Google Fonts. Like any website, they receive the
        technical details your browser sends when loading them. Our hosting provider may keep standard server logs.
      </p>
    </section>
    <p className="text-sm text-ink-400">We don't sell or share your data, and we don't use ads or tracking.</p>
  </div>
);

const PrivacyPolicy = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="privacy policy" className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden onClick={onClose} className="absolute inset-0 animate-[fade-in_250ms_ease-out] bg-ink-950/50 backdrop-blur-sm" />
      <div className="relative flex max-h-[88dvh] w-full max-w-lg animate-sheet-up flex-col overflow-hidden rounded-t-3xl border border-sand-200 bg-white text-ink-900 shadow-2xl dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50 sm:animate-scale-in sm:rounded-3xl">
        <header className="flex items-center gap-3 border-b border-sand-200 px-6 py-4 dark:border-ink-700">
          <span className="grid h-10 w-10 place-content-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
            <ShieldCheck size={22} />
          </span>
          <h2 className="flex-1 text-lg font-extrabold tracking-tight">privacy policy</h2>
          <button
            type="button"
            aria-label="close"
            onClick={onClose}
            className="grid h-9 w-9 place-content-center rounded-full text-ink-400 transition hover:rotate-90 hover:bg-ink-900/5 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </header>
        <div className="no-caps nice-scroll overflow-y-auto px-6 py-5">
          <PrivacyContent />
        </div>
        <footer className="border-t border-sand-200 px-6 py-4 dark:border-ink-700">
          <button type="button" onClick={onClose} className="btn-primary">got it</button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default PrivacyPolicy;
