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
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-4 font-display font-extrabold tracking-tight text-3xl sm:text-4xl text-white text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-slate-400 text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}