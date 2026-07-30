import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-slate-900/95 backdrop-blur-md px-5 py-3 shadow-2xl shadow-emerald-400/10 animate-in">
        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
        <p className="text-sm font-medium text-white">{toast}</p>
      </div>
    </div>
  );
}