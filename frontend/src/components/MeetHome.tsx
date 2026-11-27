import AppHeader, { GuideLink } from "./AppHeader";
import type { AuthUser } from "../api/auth";
import Avatar from "./home/Avatar";
import HomeScene from "./home/HomeScene";
import CreateRoomDialog from "./home/CreateRoomDialog";
import JoinRoomForm from "./home/JoinRoomForm";
import { demoRoomOperations } from "./home/roomOperations";
import { useRoomOperation } from "./home/useRoomOperation";
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
  const creation = useRoomOperation<string>(active);
  const creating = creation.state.status === "pending";
  const invitationOpen = creation.state.status === "success";

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
            <button type="button" className="room-button-primary w-full" aria-haspopup="dialog" aria-disabled={creating} aria-busy={creating} onClick={() => creation.run(demoRoomOperations.createRoom)}>
              <RoomIcon name="plus" />{creating ? "Creating demo…" : "Create Room"}
            </button>
            <span role="status" className="sr-only">{creating ? "Creating the local demo room…" : ""}</span>
            {creation.state.status === "error" && (
              <p role="alert" className="mt-2 text-xs text-room-danger">Couldn’t create the local demo. Select Create Room to retry.</p>
            )}
            <JoinRoomForm joinRoom={demoRoomOperations.joinRoom} onJoinDemo={onEnter} disabled={creating || invitationOpen || !active} />
          </div>
          <p className="ticket-stub"><RoomIcon name="ticket" />Local demo · No shared connection</p>
        </section>
      </main>
      {active && creation.state.status === "success" && (
        <CreateRoomDialog
          sampleRoomCode={creation.state.value}
          onClose={() => creation.reset()}
          onEnterWatchRoom={onEnter}
        />
      )}
    </>
  );
}
