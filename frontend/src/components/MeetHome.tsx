import { useState } from "react";
import AppHeader, { GuideLink } from "./AppHeader";
import HomeScene from "./home/HomeScene";
import CreateRoomDialog from "./home/CreateRoomDialog";
import JoinRoomForm from "./home/JoinRoomForm";
import { DEMO_ROOM_CODE } from "./home/demoRoom";
import { RoomIcon } from "./watch-room/RoomIcon";
import "./home/home.css";

type Props = { active: boolean; onEnter: () => void; onGuide: () => void };

export default function MeetHome({ active, onEnter, onGuide }: Props) {
  const [creating, setCreating] = useState(false);
  return <>
    <AppHeader mainId="home-main">
      <nav aria-label="Home navigation" className="home-nav flex items-center gap-1 whitespace-nowrap text-sm">
        <a href="#login" className="room-control px-2">Log In</a>
        <a href="#sign-up" className="room-control px-2">Sign Up</a>
        <GuideLink onOpen={onGuide} />
      </nav>
    </AppHeader>
    <main id="home-main" tabIndex={-1} className="home-main">
      <section className="home-ticket" aria-labelledby="home-title">
        <div className="home-art"><HomeScene /></div>
        <div className="ticket-body">
          <h1 id="home-title">Watch room</h1>
          <button type="button" className="room-button-primary w-full" aria-haspopup="dialog" onClick={() => setCreating(true)}>
            <RoomIcon name="plus" />Create Room
          </button>
          <JoinRoomForm onJoinDemo={onEnter} disabled={creating || !active} />
        </div>
        <p className="ticket-stub"><RoomIcon name="ticket" />Local demo · No shared connection</p>
      </section>
    </main>
    {active && creating && <CreateRoomDialog sampleRoomCode={DEMO_ROOM_CODE} onClose={() => setCreating(false)} onEnterWatchRoom={onEnter} />}
  </>;
}
