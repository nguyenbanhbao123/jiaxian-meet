import type { ReactNode } from "react";
import { RoomIcon } from "./watch-room/RoomIcon";

export function GuideLink({ onOpen }: { onOpen: () => void }) {
  return <button type="button" className="room-control px-2" data-guide-link onClick={onOpen} title="Open guide">
    <RoomIcon name="help" /><span className="hidden sm:inline">Guide</span><span className="sr-only sm:hidden">Guide</span>
  </button>;
}

export default function AppHeader({ children, mainId }: { children: ReactNode; mainId: string }) {
  return <>
    <a className="room-skip-link" href={`#${mainId}`} onClick={event => {
      event.preventDefault();
      document.getElementById(mainId)?.focus();
    }}>Skip to main content</a>
    <header className="app-header">
      <div className="app-header-inner">
        <a className="brand-link" href="#home" aria-label="Jiaxian Meet home">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="var(--color-room-accent)" />
            <path d="M7 9v9a4 4 0 0 0 8 0V9m-4 0v9m9-8 5 6-5 6" fill="none" stroke="var(--color-room-base)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Jiaxian <span className="font-normal text-room-muted">Meet</span></span>
        </a>
        {children}
      </div>
    </header>
  </>;
}
