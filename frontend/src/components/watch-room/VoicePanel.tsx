import { useState } from "react";
import { RoomIcon } from "./RoomIcon";

export default function VoicePanel() {
  const [enabled, setEnabled] = useState(false);
  return <div className="flex flex-wrap items-center gap-x-2">
    <button type="button" className="room-control px-2 text-sm" aria-label="Preview microphone" aria-pressed={enabled}
      aria-describedby="voice-status" title="Toggle microphone preview" onClick={() => setEnabled(value => !value)}>
      <RoomIcon name={enabled ? "mic" : "mic-off"} />Mic {enabled ? "on" : "off"}
    </button>
    <span id="voice-status" className="text-xs text-room-muted">No audio connection</span>
  </div>;
}
