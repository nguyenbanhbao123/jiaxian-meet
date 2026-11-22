import type { ReactNode } from "react";

const paths = {
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.7-1.7 1.2-1.7 2.7m0 3h.01" /></>,
  ticket: <><path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Z" /><path d="M15 6v2m0 3v2m0 3v2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  play: <path d="m9 5 11 7-11 7V5Z" />,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></>,
  film: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 3v18M17 3v18M3 8h4m-4 8h4M17 8h4m-4 8h4" /></>,
  volume: <><path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
  muted: <><path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6" /></>,
  fullscreen: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
  minimize: <path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5" />,
  mic: <><rect x="9" y="2" width="6" height="13" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8" /></>,
  "mic-off": <><path d="m2 2 20 20M9 9v3a3 3 0 0 0 5.1 2.1M9 4.2A3 3 0 0 1 15 5v5m-10 0v2a7 7 0 0 0 12 4.9M19 10v2a7 7 0 0 1-.3 2M12 19v3m-4 0h8" /></>,
  headphones: <><path d="M3 14v-3a9 9 0 0 1 18 0v3" /><rect x="3" y="12" width="4" height="9" rx="2" /><rect x="17" y="12" width="4" height="9" rx="2" /></>,
  "phone-off": <><path d="M3 10a19 19 0 0 1 18 0 2 2 0 0 1 1 1.7v3a1 1 0 0 1-1.3 1l-4.4-1.5a1 1 0 0 1-.7-.9V11a15 15 0 0 0-7.2 0v2.3a1 1 0 0 1-.7.9L3.3 15.7a1 1 0 0 1-1.3-1v-3A2 2 0 0 1 3 10Z" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
  chat: <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 3V11.5a10 10 0 0 1 20 0Z" />,
  send: <><path d="m21 3-7 18-4-7-7-4L21 3Zm0 0L10 14" /></>,
  smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14a4 4 0 0 0 8 0M8 9h.01M16 9h.01" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  back: <path d="M19 12H5m5-5-5 5 5 5" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.01" /></>,
  settings: <><path d="m9.5 3 .6-1h3.8l.6 2.5 2 .9 2.3-.8 1.9 3.2-1.8 1.8.2 2.4 1.5 1.8-1.9 3.3-2.5-.6-1.9 1.2-.5 2.3H10l-.6-2.4-2-1.1-2.4.6L3 13.8 4.7 12V9.7L3 8l1.9-3.3 2.4.7 2-.9Z" /><circle cx="12" cy="11.2" r="3.1" /></>,
  speed: <><path d="M3 18a10 10 0 1 1 18 0H3Zm9-5 4-5" /><circle cx="12" cy="13" r="1" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  loop: <path d="m16 2 4 4-4 4M4 12V9a3 3 0 0 1 3-3h13M8 22l-4-4 4-4m12-2v3a3 3 0 0 1-3 3H4" />,
  reset: <path d="M3 4v6h6M3.5 10a8.5 8.5 0 1 1 .5 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  signal: <path d="M4 19v-4m5 4v-8m5 8V7m5 12V3" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-2a6 6 0 0 1 12 0v2m1-17a3 3 0 0 1 0 6m2 5a5 5 0 0 1 3 4v2" /></>,
} satisfies Record<string, ReactNode>;

export type RoomIconName = keyof typeof paths;

export function RoomIcon({ name, className = "h-5 w-5" }: { name: RoomIconName; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name]}</svg>;
}
