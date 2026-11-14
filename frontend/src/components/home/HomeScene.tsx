import { useId } from "react";
import { RoomIcon } from "../watch-room/RoomIcon";
import { Avatar } from "../watch-room/RoomUI";

type HomeSceneProps = {
  onPreview: () => void;
};

/** An illustrated invitation to the demo, rather than a simulated video player. */
export default function HomeScene({ onPreview }: HomeSceneProps) {
  const id = useId();
  const skyId = `${id}-sky`;
  const glowId = `${id}-glow`;
  const lakeId = `${id}-lake`;
  const captionId = `${id}-caption`;

  return (
    <figure
      className="home-scene room-panel relative min-w-0 p-2 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] sm:p-3"
      aria-labelledby={captionId}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-4 pt-2">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.13em] text-room-muted">
          <RoomIcon name="film" className="h-3.5 w-3.5 text-room-accent" />
          The Watch Room
        </p>
        <span className="rounded-full border border-room-border px-2.5 py-1 text-xs text-room-muted">
          UI preview
        </span>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-room-border/60 bg-room-canvas">
        <svg
          viewBox="0 0 560 350"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
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
          <g fill="none" stroke="var(--color-room-accent)">
            <ellipse cx="380" cy="111" rx="109" ry="81" strokeOpacity="0.08" />
            <ellipse cx="380" cy="111" rx="87" ry="64" strokeOpacity="0.1" />
            <path d="m78 109 47-14" strokeOpacity="0.3" />
          </g>
          <circle cx="380" cy="104" r="43" fill="var(--color-room-accent)" fillOpacity="0.85" />
          <circle cx="368" cy="94" r="42" fill="var(--color-room-accent-hover)" fillOpacity="0.18" />

          <path d="m0 207 80-50 58 30 59-63 84 86 52-48 48 41 65-36 114 47v136H0Z" fill="var(--color-room-avatar-sage-ink)" />
          <path d="m0 234 80-44 60 25 57-58 76 71 63-35 72 36 68-26 84 34v113H0Z" fill="var(--color-room-base)" />
          <path d="M0 241c85-8 134 8 209 3 73-5 139-15 203-9 63 5 104 6 148 1v114H0Z" fill={`url(#${lakeId})`} />
          <g fill="none" stroke="var(--color-room-accent)" strokeLinecap="round">
            <path d="M355 244h49m-40 10h35m-57 11h70m-48 12h28m-58 14h81" strokeOpacity="0.18" />
            <path d="M372 234h18m-4 63h25m-71 17h72" strokeOpacity="0.12" />
          </g>
          <path d="M0 288c64-3 101 26 151 36 70 16 140-6 204 6 77 14 151-11 205-7v27H0Z" fill="var(--color-room-canvas)" />
        </svg>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-room-canvas via-room-canvas/65 to-transparent px-5 pb-5 pt-12 sm:px-7 sm:pb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.17em] text-room-accent">Less distance. More movie nights.</p>
          <h2 className="text-2xl font-medium leading-tight tracking-[-0.7px] text-room-text sm:text-[30px]">
            A screen for two.
          </h2>
        </div>
      </div>

      <figcaption id={captionId} className="flex flex-wrap items-center justify-between gap-4 px-3 pb-2 pt-5 sm:pb-3">
        <div className="flex items-center gap-3">
          <span className="flex -space-x-2" aria-hidden="true">
            <span className="rounded-full ring-[3px] ring-room-panel"><Avatar name="Jiaxian" size="sm" tone="gold" /></span>
            <span className="rounded-full ring-[3px] ring-room-panel"><Avatar name="Bao" size="sm" tone="sage" /></span>
          </span>
          <div>
            <p className="text-sm font-medium text-room-text">Two seats. One good night.</p>
            <p className="mt-0.5 text-xs text-room-muted">A peek at the experience.</p>
          </div>
        </div>
        <button type="button" className="room-control min-h-11 gap-2 px-2 text-sm text-room-accent" onClick={onPreview} aria-label="Take a look inside the Watch Room demo">
          Take a look <RoomIcon name="arrow" className="h-4 w-4" />
        </button>
      </figcaption>
    </figure>
  );
}
