export default function VeridionLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 820 200"
      className={className}
      fill="none"
      aria-hidden
    >
      <rect width="820" height="200" fill="#080c14" />
      <rect width="820" height="2" fill="#1e40af" opacity="0.6" />
      <text
        x="36"
        y="118"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontSize="82"
        fontWeight="900"
        fontStyle="italic"
        fill="white"
        letterSpacing="-2"
      >
        VERIDION
        <tspan
          fontFamily="'Arial', sans-serif"
          fontSize="52"
          fontWeight="400"
          fontStyle="italic"
          fill="#22d3a5"
          letterSpacing="4"
          dx="6"
        >
          nexus
        </tspan>
      </text>
      <line x1="36" y1="148" x2="784" y2="148" stroke="#1e293b" strokeWidth="1" />
      <text
        x="36"
        y="172"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="#475569"
        letterSpacing="4"
      >
        EVALUATED
      </text>
      <text x="138" y="172" fontFamily="Arial, sans-serif" fontSize="11" fill="#334155">
        {" "}
        —{" "}
      </text>
      <text
        x="172"
        y="172"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="#1d4ed8"
        letterSpacing="4"
      >
        ENFORCED
      </text>
      <text x="268" y="172" fontFamily="Arial, sans-serif" fontSize="11" fill="#334155">
        {" "}
        —{" "}
      </text>
      <text
        x="302"
        y="172"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="#475569"
        letterSpacing="4"
      >
        SEALED
      </text>
    </svg>
  );
}
