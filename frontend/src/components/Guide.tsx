import AppHeader from "./AppHeader";
import { RoomIcon, type RoomIconName } from "./watch-room/RoomIcon";

const topics: { title: string; icon: RoomIconName; text: string }[] = [
  { title: "Create Room", icon: "plus", text: "Copy the sample invitation code or select Enter Watch Room." },
  { title: "Join Room", icon: "ticket", text: "Try DEMO-2SEATS. Any DEMO- code followed by six letters or digits opens the same local room." },
  { title: "Choose Video", icon: "film", text: "Choose a local file or drop it onto the player. Use Change video to replace it." },
  { title: "Control playback", icon: "play", text: "Seek, adjust volume or change speed below the video. Theater view expands the player. Visiting Guide pauses playback at your current position." },
  { title: "Chat", icon: "chat", text: "Enter sends a message. Shift+Enter adds a line. Messages and drafts stay until you leave the room or reload." },
  { title: "Voice", icon: "mic", text: "The mic switch is a preview. It does not capture or transmit audio." },
  { title: "Local demo", icon: "info", text: "The guest and incoming message are samples. Video and Chat stay on this device. Log In, Sign Up, provider login and password recovery have no connected service." },
];

export default function Guide({ onBack }: { onBack: () => void }) {
  return <>
    <AppHeader mainId="guide-main"><button className="room-control px-3" onClick={onBack}><RoomIcon name="back" />Back</button></AppHeader>
    <main id="guide-main" tabIndex={-1} className="reading-page">
      <h1 className="page-title">Guide</h1>
      <div className="divide-y divide-room-border border-y border-room-border">
        {topics.map(topic => <section key={topic.title} className="flex gap-4 py-4">
          <RoomIcon name={topic.icon} className="mt-0.5 h-5 w-5 shrink-0 text-room-accent" />
          <div><h2 className="font-semibold">{topic.title}</h2><p className="mt-1 text-sm leading-relaxed text-room-muted">{topic.text}</p></div>
        </section>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href="#watch-room" className="room-secondary-button">Open watch room <RoomIcon name="arrow" /></a>
        <a href="#login" className="room-control px-3">Log In</a>
        <a href="#sign-up" className="room-control px-3">Sign Up</a>
      </div>
    </main>
  </>;
}
