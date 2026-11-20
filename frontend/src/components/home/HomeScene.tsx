import { useId } from "react";

export default function HomeScene() {
  const id = useId();
  const skyId = `${id}-sky`;
  const glowId = `${id}-glow`;
  const lakeId = `${id}-lake`;
  return (
    <svg
      viewBox="0 58 560 210"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={skyId} x1="280" y1="0" x2="280" y2="350" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-room-canvas)" />
          <stop offset="0.65" stopColor="var(--color-room-avatar-sage-ink)" />
          <stop offset="1" stopColor="var(--color-room-canvas)" />
        </linearGradient>
        <radialGradient id={glowId} cx="0" cy="0" r="1" gradientTransform="translate(379 104) rotate(90) scale(185 220)" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-room-accent)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--color-room-accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={lakeId} x1="280" y1="206" x2="280" y2="350" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-room-avatar-sage-ink)" />
          <stop offset="1" stopColor="var(--color-room-canvas)" />
        </linearGradient>
      </defs>

      <path d="M0 0h560v350H0z" fill={`url(#${skyId})`} />
      <path d="M0 0h560v350H0z" fill={`url(#${glowId})`} />
      <g fill="var(--color-room-accent)">
        <circle cx="51" cy="58" r="1" opacity="0.5" />
        <circle cx="135" cy="31" r="1" opacity="0.35" />
        <circle cx="215" cy="87" r="0.8" opacity="0.5" />
        <circle cx="275" cy="45" r="1" opacity="0.4" />
        <circle cx="491" cy="44" r="1" opacity="0.5" />
        <circle cx="516" cy="131" r="0.8" opacity="0.4" />
      </g>
      <path d="m78 109 47-14" fill="none" stroke="var(--color-room-accent)" strokeOpacity="0.3" />
      <g className="home-moon">
        <g fill="none" stroke="var(--color-room-accent)">
          <ellipse cx="380" cy="111" rx="109" ry="81" strokeOpacity="0.08" />
          <ellipse cx="380" cy="111" rx="87" ry="64" strokeOpacity="0.1" />
        </g>
        <circle cx="380" cy="104" r="43" fill="var(--color-room-accent)" fillOpacity="0.85" />
        <circle cx="368" cy="94" r="42" fill="var(--color-room-accent-hover)" fillOpacity="0.18" />
      </g>

      <path d="m0 207 80-50 58 30 59-63 84 86 52-48 48 41 65-36 114 47v136H0Z" fill="var(--color-room-avatar-sage-ink)" />
      <path d="m0 234 80-44 60 25 57-58 76 71 63-35 72 36 68-26 84 34v113H0Z" fill="var(--color-room-base)" />
      <path d="M0 241c85-8 134 8 209 3 73-5 139-15 203-9 63 5 104 6 148 1v114H0Z" fill={`url(#${lakeId})`} />
      <g fill="none" stroke="var(--color-room-accent)" strokeLinecap="round">
        <path d="M355 244h49m-40 10h35m-57 11h70m-48 12h28m-58 14h81" strokeOpacity="0.18" />
        <path d="M372 234h18m-4 63h25m-71 17h72" strokeOpacity="0.12" />
      </g>
      <path d="M0 288c64-3 101 26 151 36 70 16 140-6 204 6 77 14 151-11 205-7v27H0Z" fill="var(--color-room-canvas)" />
    </svg>
  );
}
