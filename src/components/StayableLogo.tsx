export default function StayableLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="28" height="28" rx="8" fill="#2563EB" />
      <path d="M12 24L18 13L24 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 20.5H21.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="18" cy="9.5" r="2.5" fill="#38BDF8" />
      <text
        x="38"
        y="26"
        fill="#0F172A"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontSize="20"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        Stay<tspan fill="#2563EB">able</tspan>
      </text>
    </svg>
  );
}
