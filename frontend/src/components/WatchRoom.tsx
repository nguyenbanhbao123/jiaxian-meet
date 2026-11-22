import { useLayoutEffect, useRef, useState } from "react";
import AppHeader, { GuideLink } from "./AppHeader";
import ChatSidebar from "./watch-room/ChatSidebar";
import VideoPlayer from "./watch-room/VideoPlayer";
import VoicePanel from "./watch-room/VoicePanel";
import VideoStatePreviewDialog from "./watch-room/VideoStatePreviewDialog";
import { RoomIcon } from "./watch-room/RoomIcon";
import { Avatar, RoomDialog } from "./watch-room/RoomUI";

export default function WatchRoom({ active, onGuide }: { active: boolean; onGuide: () => void }) {
  const [dialog, setDialog] = useState<"participants" | "video-states" | null>(null);
  const [theater, setTheater] = useState(false);
  const [showChat, setShowChat] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const chatToggle = useRef<HTMLButtonElement>(null);
  const chatSlot = useRef<HTMLDivElement>(null);
  const moveChatFocus = useRef(false);
  const diagnostics = import.meta.env.DEV && new URLSearchParams(window.location.search).has("diagnostics");
  // Theater temporarily hides chat while preserving the user’s layout preference.
  const chatVisible = showChat && !theater;

  useLayoutEffect(() => {
    if (moveChatFocus.current) {
      (chatVisible ? chatSlot.current : chatToggle.current)?.focus();
      moveChatFocus.current = false;
    }
  }, [chatVisible]);

  function toggleChat() {
    moveChatFocus.current = true;
    setShowChat(!chatVisible);
    if (theater) setTheater(false);
  }

  return <>
    <AppHeader mainId="room-main">
      <nav className="flex items-center gap-1" aria-label="Room navigation">
        <GuideLink onOpen={onGuide} />
        <a className="room-danger-button" href="#home" aria-label="Leave room" title="Leave room"><RoomIcon name="phone-off" /><span className="hidden sm:inline">Leave</span></a>
      </nav>
    </AppHeader>
    <main id="room-main" tabIndex={-1} className="screen-main">
      <div className="screen-heading">
        <div className="flex flex-wrap items-center gap-x-3"><h1 className="text-lg font-semibold">Watch room</h1><span className="text-xs text-room-muted">Local demo</span></div>
        <button className="room-control px-2 text-sm" onClick={() => setDialog("participants")} aria-haspopup="dialog" aria-label="Sample participants" title="Sample participants">
          <RoomIcon name="users" /><span>2 seats</span>
        </button>
      </div>
      <div className="screen-workspace" data-chat={chatVisible} data-theater={theater}>
        <div className="min-w-0">
          <VideoPlayer active={active} theater={theater} onToggleTheater={() => setTheater(value => !value)} />
          <div className="screen-dock">
            <VoicePanel />
            <button ref={chatToggle} type="button" aria-expanded={chatVisible} aria-controls="room-chat" onClick={toggleChat} className={`room-secondary-button chat-toggle ${chatVisible ? "lg:hidden" : ""}`}>
              <RoomIcon name="chat" />Chat
            </button>
          </div>
          {diagnostics && <button type="button" className="room-control px-2 text-sm" aria-haspopup="dialog" onClick={() => setDialog("video-states")}>Preview video UI states <RoomIcon name="arrow" /></button>}
        </div>
        {/* Keep the sidebar mounted so closing chat preserves the draft, history and scroll position. */}
        <div id="room-chat" ref={chatSlot} hidden={!chatVisible} tabIndex={-1} aria-label="Local chat" role="region" className="chat-slot">
          <ChatSidebar visible={active && chatVisible} onClose={toggleChat} />
        </div>
      </div>
    </main>
    {diagnostics && active && dialog === "video-states" && <VideoStatePreviewDialog onClose={() => setDialog(null)} />}
    {active && dialog === "participants" && <RoomDialog title="Sample participants" onClose={() => setDialog(null)}>
      {/* Room presence should supply both this list and the seat count above. */}
      <ul className="space-y-3">
        <li className="flex items-center gap-3"><Avatar name="Jiaxian" /><span>Jiaxian <small className="text-room-muted">· You</small></span></li>
        <li className="flex items-center gap-3"><Avatar name="Bao" tone="sage" /><span>Bao <small className="text-room-muted">· Sample guest</small></span></li>
      </ul>
    </RoomDialog>}
  </>;
}
