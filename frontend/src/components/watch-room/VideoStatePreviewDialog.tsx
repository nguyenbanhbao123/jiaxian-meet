import { useId, useRef, useState } from "react";
import { RoomIcon } from "./RoomIcon";
import { RoomDialog } from "./RoomUI";
import VideoUploadState, { type VideoUploadStatus } from "./VideoUploadState";

const SAMPLE_FILENAME = "movie-night-demo.mp4";
const STATE_OPTIONS: { value: VideoUploadStatus["kind"]; label: string }[] = [
  { value: "empty", label: "Empty — no video selected" },
  { value: "uploading", label: "Uploading — mock progress" },
  { value: "ready", label: "Ready — sample availability" },
  { value: "error", label: "Error — mock failure" },
  { value: "waiting-for-host", label: "Waiting for host — guest preview" },
];

/** All state and data in this dialog are local UI fixtures, unrelated to media. */
export default function VideoStatePreviewDialog({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<VideoUploadStatus["kind"]>("empty");
  const [progress, setProgress] = useState(42);
  const [announcement, setAnnouncement] = useState("Showing the empty UI preview. Your local player is unchanged.");
  const selectRef = useRef<HTMLSelectElement>(null);
  const stateId = useId();
  const progressId = useId();
  const explanationId = useId();

  function showState(next: VideoUploadStatus["kind"], message?: string) {
    setKind(next);
    if (next === "uploading") setProgress(42);
    setAnnouncement(message ?? `Showing ${STATE_OPTIONS.find((option) => option.value === next)?.label.toLowerCase()} UI preview. No upload or sharing occurs.`);
  }

  function showStateFromAction(next: VideoUploadStatus["kind"], message: string) {
    showState(next, message);
    // The action button is replaced by the next view; retain keyboard focus.
    selectRef.current?.focus();
  }

  let status: VideoUploadStatus;
  switch (kind) {
    case "empty": status = { kind }; break;
    case "uploading": status = { kind, fileName: SAMPLE_FILENAME, progress }; break;
    case "ready": status = { kind, fileName: SAMPLE_FILENAME }; break;
    case "error": status = { kind, fileName: SAMPLE_FILENAME, message: "Sample transfer interrupted. This is a mock error for the UI preview." }; break;
    case "waiting-for-host": status = { kind, hostName: "Jiaxian (sample host)" }; break;
  }

  return (
    <RoomDialog title="Video UI states" size="wide" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-room-accent/25 bg-room-accent/5 p-4">
          <RoomIcon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-room-accent" />
          <div>
            <p className="text-sm font-medium text-room-accent">UI preview only</p>
            <p id={explanationId} className="mt-1 text-sm leading-relaxed text-room-muted">
              These are sample screens, not a file upload. No video is uploaded, shared, or synchronized. Your local player is unchanged.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor={stateId} className="mb-2 block text-sm font-medium">Preview state</label>
          <select
            ref={selectRef}
            id={stateId}
            value={kind}
            onChange={(event) => showState(event.target.value as VideoUploadStatus["kind"])}
            aria-describedby={explanationId}
            className="min-h-11 w-full min-w-0 rounded-room-control border border-room-control-border bg-room-base px-3 text-base text-room-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-room-accent sm:text-sm"
          >
            {STATE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <VideoUploadState
          status={status}
          isDemoPreview={true}
          onSelect={() => showStateFromAction("uploading", "Sample filename selected. Showing mock progress only; no file was opened or transferred.")}
          onCancel={() => showStateFromAction("empty", "Demo upload canceled. No file was transferred; your local player is unchanged.")}
          onRetry={() => showStateFromAction("uploading", "Retrying the UI preview only. Showing mock progress; no request was sent.")}
          onReturn={onClose}
        />

        {kind === "uploading" && (
          <div className="rounded-xl border border-room-border p-4">
            <label htmlFor={progressId} className="flex flex-wrap items-center justify-between gap-2 text-xs text-room-muted">
              Mock progress control <span className="tabular-nums">{progress}%</span>
            </label>
            <input id={progressId} type="range" min="0" max="100" step="1" value={progress} onChange={(event) => setProgress(Number(event.target.value))} className="room-range w-full" aria-valuetext={`${progress} percent, mock progress only`} />
            <p className="text-xs leading-relaxed text-room-muted">Move the slider to inspect progress. Choose Ready above to preview completion.</p>
          </div>
        )}

        <p role="status" aria-atomic="true" className="text-xs leading-relaxed text-room-muted">{announcement}</p>
        <div className="flex justify-end border-t border-room-border pt-4">
          <button type="button" className="room-secondary-button w-full sm:w-auto" onClick={onClose}>Close preview</button>
        </div>
      </div>
    </RoomDialog>
  );
}
