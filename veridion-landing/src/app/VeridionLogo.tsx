export default function VeridionLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <div
      className={`flex items-center text-xl sm:text-2xl ${className} [font-family:var(--font-inter),Inter,sans-serif]`}
      aria-hidden
    >
      <span className="inline-flex items-baseline">
        <span
          className="font-black italic uppercase text-white shrink-0"
          style={{ letterSpacing: "-0.05em", lineHeight: 0.85 }}
        >
          VERIDION
        </span>
        <span
          className="ml-1.5 font-semibold italic lowercase shrink-0"
          style={{
            color: "#10b981",
            letterSpacing: "-0.02em",
            filter: "drop-shadow(0 0 15px rgba(16, 185, 129, 0.3))",
          }}
        >
          nexus
        </span>
      </span>
    </div>
  );
}
