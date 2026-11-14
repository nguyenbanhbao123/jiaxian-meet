import { useRef, useState } from "react";
import HomeScene from "./home/HomeScene";
import CreateRoomDialog from "./home/CreateRoomDialog";
import JoinRoomForm from "./home/JoinRoomForm";
import { DEMO_ROOM_CODE } from "./home/demoRoom";
import { RoomIcon, type RoomIconName } from "./watch-room/RoomIcon";
import "./home/home.css";

type MeetHomeProps = {
  onPreviewWatchRoom: () => void;
};

const MOVIE_NIGHT_DETAILS: { icon: RoomIconName; title: string; description: string }[] = [
  {
    icon: "users",
    title: "A little space for two",
    description: "Made with you and your favorite movie companion in mind.",
  },
  {
    icon: "film",
    title: "Bring your kind of movie",
    description: "Try local video playback in the Watch Room preview. Your file stays on your device.",
  },
  {
    icon: "chat",
    title: "Keep the conversation close",
    description: "Explore the chat and voice-control demos, right beside the screen.",
  },
];

export default function MeetHome({ onPreviewWatchRoom }: MeetHomeProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const detailsRef = useRef<HTMLElement>(null);

  // This opens only the static invitation preview; no room is created.
  function handleCreateRoom() {
    setCreateDialogOpen(true);
  }

  function showDetails() {
    const section = detailsRef.current;
    section?.focus({ preventScroll: true });
    section?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className="watch-room meet-home min-h-dvh bg-room-base text-room-text">
      <a
        href="#home-main"
        className="room-skip-link"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("home-main");
          main?.focus();
          main?.scrollIntoView({ block: "start" });
        }}
      >
        Skip to main content
      </a>

      <header className="border-b border-room-border/60">
        <div className="home-container flex min-h-20 flex-wrap items-center justify-between gap-3 py-3">
          <a
            href="#home"
            className="flex min-h-11 items-center gap-2.5 rounded-xl"
            aria-label="Jiaxian Meet home"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById("home-main")?.focus({ preventScroll: true });
              window.scrollTo({ top: 0, behavior: "auto" });
            }}
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
          <nav aria-label="Home navigation" className="flex items-center gap-2 sm:gap-5">
            <button type="button" className="room-control hidden px-3 text-sm md:inline-flex" onClick={showDetails}>
              How it works
            </button>
            <button type="button" className="room-secondary-button" onClick={onPreviewWatchRoom}>
              Explore demo <RoomIcon name="arrow" className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>

      <main id="home-main" tabIndex={-1} className="home-container rounded-2xl">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-intro min-w-0">
            <p className="room-eyebrow mb-5 flex items-center gap-2.5 text-room-accent">
              <span className="h-px w-6 bg-room-accent" aria-hidden="true" />
              A night in, together
            </p>
            <h1 id="home-title" className="home-title font-medium">
              Your own little<br />
              <span className="text-room-accent">cinema for two.</span>
            </h1>
            <p className="mt-5 max-w-[27rem] text-base leading-relaxed text-room-muted">
              Bring a movie. Bring your favorite person.<br className="hidden sm:block" />
              Make a little time for a good night together.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button type="button" className="room-button-primary home-create-button" aria-haspopup="dialog" onClick={handleCreateRoom}>
                <RoomIcon name="film" className="h-[18px] w-[18px]" />
                Create Room
                <RoomIcon name="arrow" className="ml-3 h-4 w-4" />
              </button>
              <span className="flex items-center gap-2 text-xs text-room-muted">
                <RoomIcon name="users" className="h-4 w-4 text-room-accent" />
                Just two seats. Yours and theirs.
              </span>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-room-muted">
              <RoomIcon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Frontend demo. No room is created or joined.
            </p>

            <JoinRoomForm onJoinDemo={onPreviewWatchRoom} disabled={createDialogOpen} />
          </div>
          <HomeScene onPreview={onPreviewWatchRoom} />
        </section>

        <section ref={detailsRef} tabIndex={-1} className="home-details scroll-mt-6 rounded-xl border-t border-room-border/80" aria-labelledby="home-details-title">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <h2 id="home-details-title" className="room-eyebrow text-room-accent">Made for your next night in</h2>
            <span className="text-xs text-room-muted">A little preview of the experience.</span>
          </div>
          <div className="grid gap-7 md:grid-cols-3 md:gap-8">
            {MOVIE_NIGHT_DETAILS.map((detail) => (
              <article key={detail.title} className="flex min-w-0 items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-room-border bg-room-panel text-room-accent">
                  <RoomIcon name={detail.icon} className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h3 className="text-sm font-medium">{detail.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-room-muted">{detail.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="home-container flex flex-wrap items-center justify-between gap-3 border-t border-room-border/60 py-5 text-xs leading-relaxed text-room-muted">
        <span>Jiaxian Meet <span className="mx-2 text-room-border" aria-hidden="true">/</span> A little closer, wherever you are.</span>
        <span className="flex items-center gap-1.5"><RoomIcon name="film" className="h-3.5 w-3.5 text-room-accent" /> Made for movie nights.</span>
      </footer>

      {createDialogOpen && (
        <CreateRoomDialog
          sampleRoomCode={DEMO_ROOM_CODE}
          onClose={() => setCreateDialogOpen(false)}
          onEnterWatchRoom={onPreviewWatchRoom}
        />
      )}
    </div>
  );
}
