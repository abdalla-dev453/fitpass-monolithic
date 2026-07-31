import React from "react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}) {
  return (
    <div
      className={`max-w-3xl flex flex-col ${
        align === "center" ? "mx-auto text-center items-center" : "items-start"
      } ${className} select-none`}
    >
      {/* INDUSTRIAL EYEBROW PROTOCOL BADGE */}
      {eyebrow && (
        <div className="inline-flex mb-2">
          <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 font-sans font-black tracking-widest text-[7px] uppercase px-3 py-1.5 transition-colors group-hover:border-zinc-700">
            {eyebrow.toUpperCase()}
          </span>
        </div>
      )}

      {/* COMPRESSED ATHLETIC TITLE HEADER */}
      <h2 className="mt-2 font-display font-black text-2xl sm:text-2xl text-white uppercase tracking-tighter leading-[0.95] text-balance">
        {title.toUpperCase()}
      </h2>

      {/* HIGH CONTRAST RUNTIME DATA SPECIFICATION */}
      {description && (
        <p className="mt-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400 max-w-xl leading-relaxed">
          {description.toUpperCase()}
        </p>
      )}
    </div>
  );
}
