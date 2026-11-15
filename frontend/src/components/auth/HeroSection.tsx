import { useId } from "react";

export default function HeroSection() {
  const id = useId();
  const skyId = `${id}-sky`;
  const glowId = `${id}-glow`;
  const lakeId = `${id}-lake`;

  return (
    <div className="relative flex h-full w-full flex-col justify-end overflow-hidden bg-room-canvas">
      {/* Scalable SVG Background */}
      <div className="absolute inset-0 z-0">
        <svg
          viewBox="0 0 560 350"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full opacity-70"
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
              {/* Increased ambient glow */}
              <stop stopColor="var(--color-room-accent)" stopOpacity="0.35" />
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
            {/* Brightened stars */}
            <circle cx="51" cy="58" r="1" opacity="0.8" />
            <circle cx="135" cy="31" r="1" opacity="0.65" />
            <circle cx="215" cy="87" r="0.8" opacity="0.8" />
            <circle cx="275" cy="45" r="1" opacity="0.7" />
            <circle cx="491" cy="44" r="1" opacity="0.8" />
            <circle cx="516" cy="131" r="0.8" opacity="0.7" />
          </g>
          
          <g fill="none" stroke="var(--color-room-accent)">
            {/* Brightened moon rings */}
            <ellipse cx="380" cy="111" rx="109" ry="81" strokeOpacity="0.2" />
            <ellipse cx="380" cy="111" rx="87" ry="64" strokeOpacity="0.25" />
            <path d="m78 109 47-14" strokeOpacity="0.5" />
          </g>
          
          {/* Brightened moon body and crater shadow */}
          <circle cx="380" cy="104" r="43" fill="var(--color-room-accent)" fillOpacity="1" />
          <circle cx="368" cy="94" r="42" fill="var(--color-room-accent-hover)" fillOpacity="0.35" />

          <path d="m0 207 80-50 58 30 59-63 84 86 52-48 48 41 65-36 114 47v136H0Z" fill="var(--color-room-avatar-sage-ink)" />
          <path d="m0 234 80-44 60 25 57-58 76 71 63-35 72 36 68-26 84 34v113H0Z" fill="var(--color-room-base)" />
          <path d="M0 241c85-8 134 8 209 3 73-5 139-15 203-9 63 5 104 6 148 1v114H0Z" fill={`url(#${lakeId})`} />
          
          <g fill="none" stroke="var(--color-room-accent)" strokeLinecap="round">
            {/* Brightened lake reflections */}
            <path d="M355 244h49m-40 10h35m-57 11h70m-48 12h28m-58 14h81" strokeOpacity="0.4" />
            <path d="M372 234h18m-4 63h25m-71 17h72" strokeOpacity="0.3" />
          </g>
          
          <path d="M0 288c64-3 101 26 151 36 70 16 140-6 204 6 77 14 151-11 205-7v27H0Z" fill="var(--color-room-canvas)" />
        </svg>
      </div>
      
      {/* Gradient overlay to fade background behind text */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-room-canvas via-room-canvas/60 to-transparent"></div>

      {/* Text Content */}
      <div className="relative z-20 p-16 pb-24">
        <h2 className="mb-2 text-4xl font-bold leading-tight text-room-text lg:text-5xl">
          Bring your movie. <br />
          <span className="text-room-accent">Bring your favorite person.</span>
        </h2>
        <p className="mt-4 text-lg text-room-muted">
          Join Jiaxian Meet to watch together.
        </p>
      </div>
    </div>
  );
}