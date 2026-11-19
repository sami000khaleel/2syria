import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Brand from "../components/Brand/Brand";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import { PrivacyContent } from "../components/Privacy/PrivacyPolicy";

const Privacy = () => {
  const navigate = useNavigate();
  return (
    <main className="relative min-h-screen bg-sand-50 px-6 pb-16 pt-24 text-ink-900 dark:bg-ink-950 dark:text-ink-50">
      <Brand className="absolute left-6 top-6" />
      <ThemeToggle className="absolute right-6 top-5" />
      <article className="mx-auto max-w-2xl animate-fade-up rounded-3xl border border-sand-200 bg-white p-8 shadow-xl dark:border-ink-700 dark:bg-ink-900">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-content-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
            <ShieldCheck size={26} />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">privacy policy</h1>
        </div>
        <div className="no-caps">
          <PrivacyContent />
        </div>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-8">go back</button>
      </article>
    </main>
  );
};

export default Privacy;
