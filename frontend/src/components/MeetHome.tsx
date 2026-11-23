import { useState } from "react";
import AppHeader, { GuideLink } from "./AppHeader";
import Avatar, { AuthUser } from "./home/Avatar";
import HomeScene from "./home/HomeScene";
import CreateRoomDialog from "./home/CreateRoomDialog";
import JoinRoomForm from "./home/JoinRoomForm";
import { DEMO_ROOM_CODE } from "./home/demoRoom";
import { RoomIcon } from "./watch-room/RoomIcon";
import "./home/home.css";

type Props = {
  active: boolean;
  user: AuthUser | null;
  onEnter: () => void;
  onGuide: () => void;
  onLogout?: () => void;
};

export default function MeetHome({ active, user, onEnter, onGuide, onLogout }: Props) {
  const [invitationOpen, setInvitationOpen] = useState(false);

  return (
    <>
      <AppHeader mainId="home-main">
        <nav aria-label="Home navigation" className="home-nav flex items-center gap-1 whitespace-nowrap text-sm">
          {user ? (
            <Avatar user={user} onLogout={onLogout} />
          ) : (
            <>
              <a href="#login" className="room-control px-2">Log In</a>
              <a href="#sign-up" className="room-control px-2">Sign Up</a>
            </>
          )}
          <GuideLink onOpen={onGuide} />
        </nav>
      </AppHeader>
      <main id="home-main" tabIndex={-1} className="home-main">
        <section className="home-ticket" aria-labelledby="home-title">
          <div className="home-art"><HomeScene /></div>
          <div className="ticket-body">
            <h1 id="home-title">Watch room</h1>
            <button type="button" className="room-button-primary w-full" aria-haspopup="dialog" onClick={() => setInvitationOpen(true)}>
              <RoomIcon name="plus" />Create Room
            </button>
            <JoinRoomForm onJoinDemo={onEnter} disabled={invitationOpen || !active} />
          </div>
          <p className="ticket-stub"><RoomIcon name="ticket" />Local demo · No shared connection</p>
        </section>
      </main>
      {/* Supply the room code returned by room creation here when the backend is connected. */}
      {active && invitationOpen && (
        <CreateRoomDialog
          sampleRoomCode={DEMO_ROOM_CODE}
          onClose={() => setInvitationOpen(false)}
          onEnterWatchRoom={onEnter}
        />
      )}
    </>
  );
}
