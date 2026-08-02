import React from "react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] pt-28 px-6 md:px-12 selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header Node */}
        <div className="border-b border-zinc-800/60 pb-6 mb-8">
          <span className="text-[9px] font-black tracking-[0.2em] bg-zinc-900 border border-zinc-800 text-[#CCFF00] px-2.5 py-1 uppercase">
            System Console Active
          </span>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mt-4">
            CORE CONTROL PIPELINE
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
            Administrative terminal matrix for the Fitpass synchronized network distribution ecosystem.
          </p>
        </div>

        {/* Dashboard Grid Placeholder Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["User Matrix Enforcements", "Studio Cluster Deployments", "Schedule Session Droppers"].map((module, i) => (
            <div key={i} className="bg-zinc-950/40 border border-zinc-800/60 p-6 rounded-2xl shadow-xl backdrop-blur-xl">
              <h3 className="text-xs font-bold tracking-widest text-gray-300 uppercase mb-2">{module}</h3>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide leading-relaxed">
                System operational state normal. Waiting for metric collection subroutines to attach.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
