import { useId } from "react";

// Baby Dawn mark — a rose-gold sun cresting the horizon with soft rays
// and one lingering star (the last star of night). Warm, hopeful, and
// legible from favicon size up to the header lockup.
export function Logo({ size = 28 }: { size?: number }) {
  const id = useId();
  const grad = `url(#${id})`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={id}
          x1="6"
          y1="6"
          x2="26"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E7C79B" />
          <stop offset="1" stopColor="#E7A6A8" />
        </linearGradient>
      </defs>
      {/* rays */}
      <g stroke={grad} strokeWidth="1.6" strokeLinecap="round">
        <path d="M16 4.4v3.1" />
        <path d="M7.4 8.1l1.9 2" />
        <path d="M24.6 8.1l-1.9 2" />
      </g>
      {/* rising sun */}
      <path d="M7 21a9 9 0 0 1 18 0Z" fill={grad} />
      {/* horizon */}
      <g stroke={grad} strokeWidth="1.8" strokeLinecap="round">
        <path d="M3.4 21h3.2" />
        <path d="M25.4 21h3.2" />
      </g>
      {/* lingering star */}
      <circle cx="25.2" cy="6.4" r="1.15" fill="#E7C79B" />
    </svg>
  );
}
