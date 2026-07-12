import { useId } from "react";

// Original Baby Dawn illustration — mother and baby reduced to one
// continuous, bowed silhouette plus a small nested form for the baby.
// Abstract and symbolic, in the same economy-of-stroke language as
// the sun mark, rather than a literal figurative portrait.
export function MotherMark({ size = 120 }: { size?: number }) {
  const id = useId();
  const grad = `url(#${id})`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      stroke={grad}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={id}
          x1="24"
          y1="16"
          x2="94"
          y2="96"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E7C79B" />
          <stop offset="1" stopColor="#E7A6A8" />
        </linearGradient>
      </defs>
      {/* a small flip of hair at the crown */}
      <path d="M58 16c4-2 7-1 8 2" />
      {/* head, curving down to a short gap at the neck */}
      <path d="M60 17c-11 0-20 8-21 19-1 5 1 9 0 13" />
      {/* shoulders, down the back, under, and forward again into a
          gentle hook that cradles the baby */}
      <path d="M40 55c-7 9-9 19-5 29 5 12 18 19 30 17 8-1 15-6 19-13" />
      {/* baby's head, nested in the crook of the hook */}
      <circle cx="88" cy="74" r="8.5" />
      {/* baby's body, tucked against the mother */}
      <path d="M82 82c-3 5-10 7-16 5" />
    </svg>
  );
}
