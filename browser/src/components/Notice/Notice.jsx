import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

// Inline message under a form (replaces window.alert)
const Notice = ({ notice, className = "" }) => {
  if (!notice?.text) return null;
  const ok = notice.type === "success";
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`flex animate-fade-up items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
        ok
          ? "border-brand-500/20 bg-brand-500/10 text-brand-700 dark:text-brand-200"
          : "border-star-500/20 bg-star-500/10 text-star-600 dark:text-star-400"
      } ${className}`}
    >
      {ok ? <CheckCircle2 size={18} className="mt-px shrink-0" /> : <AlertCircle size={18} className="mt-px shrink-0" />}
      <span>{notice.text}</span>
    </p>
  );
};

export default Notice;
