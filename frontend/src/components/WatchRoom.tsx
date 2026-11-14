import { useState } from "react";
import ChatSidebar from "./watch-room/ChatSidebar";
import VideoPlayer from "./watch-room/VideoPlayer";
import VoicePanel from "./watch-room/VoicePanel";
import VideoStatePreviewDialog from "./watch-room/VideoStatePreviewDialog";
import { RoomIcon } from "./watch-room/RoomIcon";
import { Avatar, IconButton, RoomDialog } from "./watch-room/RoomUI";

export default function WatchRoom({ onLeave }: { onLeave: () => void }) {
  const [dialog, setDialog] = useState<"about" | "participants" | "video-states" | null>(null);
  const [theater, setTheater] = useState(false);
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="watch-room room-shell min-h-dvh bg-room-base text-room-text">
      <a
        href="#watch-screen"
        className="room-skip-link"
        onClick={(event) => {
          event.preventDefault();
          const screen = document.getElementById("watch-screen");
          screen?.focus();
          screen?.scrollIntoView({ block: "start" });
        }}
      >
        Skip to video player
      </a>

      <header className="border-b border-room-border/70">
        <div className="room-container flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
          <a
            href="#home"
            onClick={(event) => { event.preventDefault(); onLeave(); }}
            className="flex min-h-11 items-center gap-2.5 rounded-xl"
            aria-label="Jiaxian Meet home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-room-accent text-room-base">
              <svg viewBox="0 0 28 28" fill="none" className="h-7 w-7" aria-hidden="true">
                <path d="M8 7v9a4 4 0 0 0 8 0V7m-4 0v9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="m20 8 5 6-5 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-[-0.6px]">
              Jiaxian<span className="ml-1.5 font-normal text-room-muted">Meet</span>
            </span>
          </a>

          <div className="hidden items-center gap-2 text-xs text-room-muted xl:flex">
            <RoomIcon name="lock" className="h-3.5 w-3.5" />
            A little space for the two of you
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setDialog("participants")}
              className="room-participants-button room-control flex items-center gap-2.5 px-2"
              aria-label="View 2 of 2 mock participants"
              aria-haspopup="dialog"
            >
              <RoomIcon name="users" className="h-5 w-5 sm:hidden" />
              <span className="hidden -space-x-2 sm:flex">
                <Avatar name="Jiaxian" tone="gold" size="sm" />
                <span className="rounded-full ring-[3px] ring-room-base">
                  <Avatar name="Bao" tone="sage" size="sm" />
                </span>
              </span>
              <span className="whitespace-nowrap text-sm font-medium text-room-text">
                2<span className="text-room-muted"> / 2</span>
                <span className="ml-2 hidden text-xs font-normal text-room-muted sm:inline">online · demo</span>
              </span>
            </button>
            <span className="h-5 w-px bg-room-border" aria-hidden="true" />
            <IconButton label="About this room prototype" aria-haspopup="dialog" onClick={() => setDialog("about")}>
              <RoomIcon name="info" />
            </IconButton>
            <a
              href="#home"
              onClick={(event) => { event.preventDefault(); onLeave(); }}
              className="room-secondary-button hidden text-xs sm:inline-flex"
            >
              Home preview <RoomIcon name="arrow" className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main id="room-main" tabIndex={-1} className="room-container room-main">
        <div className="room-content" data-theater={theater}>
          <div className="room-context flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
            <div>
              <p className="room-eyebrow mb-1 flex items-center gap-2 text-room-accent">
                <span className="h-1 w-1 rounded-full bg-room-accent" aria-hidden="true" />
                A night in, together
              </p>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h1 className="text-2xl font-semibold leading-tight tracking-[-0.7px]">
                  The watch room<span className="text-room-accent">.</span>
                </h1>
                <p className="hidden text-xs text-room-muted md:block">Good movies. Better company.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="room-badge border border-room-border text-room-muted">
                <RoomIcon name="lock" className="h-3 w-3" /> Private room
              </span>
              <span className="room-badge bg-room-accent/8 text-room-accent">Local prototype</span>
              <button type="button" className="room-secondary-button text-xs" aria-haspopup="dialog" onClick={() => setDialog("video-states")}>
                <RoomIcon name="upload" className="h-3.5 w-3.5" /> Video UI states
              </button>
            </div>
          </div>

          <div className={`room-workspace ${theater ? "room-workspace--theater" : ""}`}>
            <div className="room-main-column min-w-0">
              <VideoPlayer theater={theater} onToggleTheater={() => setTheater((value) => !value)} />
              <VoicePanel onLeave={onLeave} />
            </div>
            
            {showChat && (
              <div className="room-chat-slot min-w-0 max-h-[63vh]">
                <ChatSidebar />
              </div>
            )}

            {/* Changed footer to handle the non-absolute control bar */}
            <footer className="room-footer flex flex-wrap items-end justify-between gap-2 text-xs leading-relaxed text-room-muted">
              <span className="flex items-center gap-2 mb-1">
                <RoomIcon name="lock" className="h-3.5 w-3.5" /> Your video stays on your device.
              </span>
              
              <div className="hidden sm:flex flex-col items-end gap-3">
                
                {/* 3. The control bar seamlessly embedded into the layout */}
                <div className="flex items-center gap-1 rounded-full bg-[#1e1e20] px-2 py-1.5 shadow-lg border border-white/5 -translate-y-16 -translate-x-2">
                  
                  {/* Chat Button (Active toggle) */}
                  <button 
                    onClick={() => setShowChat((prev) => !prev)}
                    aria-label={showChat ? "Close chat" : "Open chat"} 
                    className={`flex h-[42px] w-[42px] items-center justify-center rounded-full transition-colors ${
                      showChat ? "bg-[#a8c7fa]/15 text-[#a8c7fa]" : "text-gray-300 hover:bg-[#333438]"
                    }`}
                  >
                    <RoomIcon name="chat" className="h-5 w-5" />
                  </button>

                  {/* Activities / Grid Button */}
                  <button 
                    aria-label="Activities"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-[#333438]"
                  >
                    <svg className="h-[22px] w-[22px] fill-current" viewBox="0 0 24 24">
                      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                    </svg>
                  </button>

                  {/* Host Controls Button */}
                  <button 
                    aria-label="Host controls"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-[#333438]"
                  >
                    <svg className="h-[22px] w-[22px] fill-current" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                  </button>
                </div>

                <span className="hidden sm:inline mr-2">Made for movie nights. Just us, just here.</span>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {dialog === "video-states" && <VideoStatePreviewDialog onClose={() => setDialog(null)} />}
      {dialog && dialog !== "video-states" && (
        <RoomDialog
          title={dialog === "about" ? "Your private cinema, in preview" : "The best seats in the house"}
          onClose={() => setDialog(null)}
        >
          {dialog === "about" ? (
            <div className="space-y-4 text-sm leading-relaxed text-room-muted">
              <p>This is the local Watch Room prototype of Jiaxian Meet. Choose a video to play it directly from your device.</p>
              <div className="rounded-xl border border-room-border bg-room-base p-4">
                <p className="mb-2 font-medium text-room-text">What you can try</p>
                <p>Local playback, seeking, volume, fullscreen, theater view, and sending messages in this browser session.</p>
              </div>
              <p>Participants and voice controls are demos. Videos and chat aren’t uploaded, shared, or synchronized. No microphone is accessed.</p>
            </div>
          ) : (
            <>
              <p className="mb-5 text-sm text-room-muted">Two mock participants, one cozy room.</p>
              <div className="space-y-3">
                {[
                  { name: "Jiaxian", role: "You · Host", tone: "gold" as const },
                  { name: "Bao", role: "Guest · Mock participant", tone: "sage" as const },
                ].map((person) => (
                  <div key={person.name} className="flex flex-wrap items-center gap-3 rounded-xl bg-room-base p-4">
                    <Avatar name={person.name} tone={person.tone} online />
                    <div>
                      <p className="text-sm font-medium">{person.name}</p>
                      <p className="mt-0.5 text-xs text-room-muted">{person.role}</p>
                    </div>
                    <span className="ml-auto text-xs text-room-success">Online · demo</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <button type="button" className="room-button-primary mt-6 w-full" onClick={() => setDialog(null)}>
            Back to movie night <RoomIcon name="arrow" className="h-4 w-4" />
          </button>
        </RoomDialog>
      )}
    </div>
  );
}
