import type { CSSProperties, ReactNode } from "react";

// Cohesive line-icon set for Baby Dawn. One consistent style: 24px grid,
// currentColor, 1.75 stroke, round caps/joins. Filled icons override.
export type IconName =
  | "play"
  | "stop"
  | "clock"
  | "diaper"
  | "bottle"
  | "chart"
  | "settings"
  | "download"
  | "document"
  | "moon"
  | "back"
  | "close"
  | "left"
  | "right";

const paths: Record<IconName, ReactNode> = {
  play: (
    <path
      d="M9 7.3v9.4a1 1 0 0 0 1.5.86l7.7-4.7a1 1 0 0 0 0-1.72l-7.7-4.7A1 1 0 0 0 9 7.3Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  stop: (
    <rect x="7" y="7" width="10" height="10" rx="3" fill="currentColor" stroke="none" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  diaper: (
    <>
      <path d="M4 8h16l-6.4 8.6a2 2 0 0 1-3.2 0L4 8Z" />
      <path d="M8.2 8.4 9.4 12M15.8 8.4 14.6 12" />
    </>
  ),
  bottle: (
    <>
      <path d="M9.5 3h5M10.5 3v2.2M13.5 3v2.2" />
      <path d="M8.7 8.6a3.3 3.3 0 0 1 6.6 0v10a2 2 0 0 1-2 2h-2.6a2 2 0 0 1-2-2v-10Z" />
      <path d="M8.7 11.2h6.6M11.4 13.4v2.6" />
    </>
  ),
  chart: (
    <>
      <path d="M4.5 20h15" />
      <path d="M8 20v-5M12 20V7.5M16 20v-8" />
    </>
  ),
  settings: (
    <>
      <path d="M4 8h9M4 16h3M20 8h-3M20 16h-9" />
      <circle cx="16" cy="8" r="2.4" />
      <circle cx="8" cy="16" r="2.4" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10M8.3 10.5 12 14l3.7-3.5" />
      <path d="M5 15.5V18a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18v-2.5" />
    </>
  ),
  document: (
    <>
      <path d="M7 3.5h6.5L18.5 8.5V20a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" />
      <path d="M13.5 3.5V9h5" />
      <path d="M9.5 13.5h5M9.5 16.5h3" />
    </>
  ),
  moon: (
    <path
      d="M20 13.8A7.6 7.6 0 1 1 10.6 4.2a6 6 0 0 0 9.4 9.6Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  back: <path d="M14 6l-6 6 6 6" />,
  close: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  left: <path d="M14 7l-5 5 5 5" />,
  right: <path d="M10 7l5 5-5 5" />,
};

export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
