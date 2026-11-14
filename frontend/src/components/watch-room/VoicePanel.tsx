import { useId, useState } from "react";
import { RoomIcon } from "./RoomIcon";
import { Avatar } from "./RoomUI";

type VoicePanelProps = {
  onLeave: () => void;
};

export default function VoicePanel({ onLeave }: VoicePanelProps) {
  const [micMuted, setMicMuted] = useState(false);
  const descriptionId = useId();

  return (
    <section
      aria-label="Participants and voice preview"
      className="room-panel px-4 py-3"
    >
      <h2 className="sr-only">In the room · 2 of 2 demo participants</h2>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-3" aria-label="Demo participants">
          <li className="flex items-center gap-2">
            <Avatar name="Jiaxian" tone="gold" size="sm" online />
            <div>
              <p className="text-sm font-medium text-room-text">
                Jiaxian
              </p>
              <p className="mt-0.5 text-xs text-room-muted">You · Host</p>
            </div>
          </li>
          <li className="flex items-center gap-2">
            <Avatar name="Bao" tone="sage" size="sm" online />
            <div>
              <p className="text-sm font-medium text-room-text">Bao</p>
              <p className="mt-0.5 text-xs text-room-muted">Guest</p>
            </div>
          </li>
        </ul>

        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-3">
          <div>
            <h3 className="text-xs font-medium text-room-text">Voice preview</h3>
            <p className="mt-0.5 text-xs text-room-muted">Demo · no audio connection</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Mute microphone preview"
              aria-pressed={micMuted}
              aria-describedby={descriptionId}
              title="Demo microphone toggle. Your microphone is never accessed."
              onClick={() => setMicMuted((value) => !value)}
              className="room-secondary-button"
            >
              <RoomIcon name={micMuted ? "mic-off" : "mic"} className="h-[18px] w-[18px]" />
              <span>{micMuted ? "Mic off" : "Mic on"}</span>
            </button>
            <button
              type="button"
              onClick={onLeave}
              aria-label="Leave room"
              className="room-danger-button"
            >
              <RoomIcon name="phone-off" className="h-[18px] w-[18px]" />
              Leave
            </button>
          </div>
        </div>
      </div>
      <p id={descriptionId} className="sr-only">This is a visual demo. Your microphone is never accessed.</p>
    </section>
  );
}
