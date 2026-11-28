import { useId, useLayoutEffect, useRef, useState } from "react";
import { RoomIcon } from "./RoomIcon";
import { RoomDialog } from "./RoomUI";
import VideoUploadState, { type VideoUploadStatus } from "./VideoUploadState";

import { createMediaPreparation } from "./mediaPreparation";
import { playbackSyncLabels, type PlaybackSyncState } from "./playbackSync";

const SAMPLE_FILE = { name: "movie-night-demo.mp4" };
const SAMPLE_ERROR = "Sample transfer interrupted. This is a mock error for the UI preview.";
const STATE_OPTIONS: { value: VideoUploadStatus["kind"]; label: string }[] = [
  { value: "empty", label: "Empty — no video selected" },
  { value: "uploading", label: "Uploading — mock progress" },
  { value: "ready", label: "Ready — sample availability" },
  { value: "error", label: "Error — mock failure" },
  { value: "canceled", label: "Canceled — sample stopped" },
  { value: "waiting-for-host", label: "Waiting for host — guest preview" },
];

/** All state and data in this dialog are local UI fixtures, unrelated to media. */
export default function VideoStatePreviewDialog({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<VideoUploadStatus>({ kind: "empty" });
  const [media] = useState(() => createMediaPreparation(setStatus));
  const attempt = useRef<ReturnType<typeof media.begin>>(null);
  const [syncPreview, setSyncPreview] = useState<PlaybackSyncState>("local-only");
  useLayoutEffect(() => media.discard, [media]);
  const [announcement, setAnnouncement] = useState("Showing the empty UI preview. Your local player is unchanged.");
  const selectRef = useRef<HTMLSelectElement>(null);
  const stateId = useId();
  const progressId = useId();
  const explanationId = useId();

  function showState(next: VideoUploadStatus["kind"], message?: string) {
    if (next === "empty" || next === "waiting-for-host") {
      media.discard();
      setStatus(next === "empty" ? { kind: next } : { kind: next, hostName: "Jiaxian (sample host)" });
    } else {
      // Direct fixture selection can also finish or cancel the current sample.
      const operation = attempt.current ?? media.begin(SAMPLE_FILE);
      if (!operation) return;
      switch (next) {
        case "uploading": attempt.current = operation; operation.progress(42); break;
        case "ready": operation.ready(); break;
        case "error": operation.fail(SAMPLE_ERROR); break;
        case "canceled": media.cancel(); break;
      }
    }
    if (next !== "uploading") attempt.current = null;
    setAnnouncement(message ?? `Showing ${STATE_OPTIONS.find((option) => option.value === next)?.label.toLowerCase()} UI preview. No upload or sharing occurs.`);
  }

  function showStateFromAction(next: VideoUploadStatus["kind"], message: string) {
    showState(next, message);
    // The action button is replaced by the next view; retain keyboard focus.
    selectRef.current?.focus();
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
            value={status.kind}
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
          onCancel={() => showStateFromAction("canceled", "Demo upload canceled. No file was transferred; your local player is unchanged.")}
          onRetry={() => showStateFromAction("uploading", "Retrying the UI preview only. Showing mock progress; no request was sent.")}
          onReturn={onClose}
        />

        {status.kind === "uploading" && (
          <div className="rounded-xl border border-room-border p-4">
            <label htmlFor={progressId} className="flex flex-wrap items-center justify-between gap-2 text-xs text-room-muted">
              Mock progress control <span className="tabular-nums">{status.progress}%</span>
            </label>
            <input id={progressId} type="range" min="0" max="100" step="1" value={status.progress} onChange={(event) => attempt.current?.progress(Number(event.target.value))} className="room-range w-full" aria-valuetext={`${status.progress} percent, mock progress only`} />
            <p className="text-xs leading-relaxed text-room-muted">Move the slider to inspect progress. Choose Ready above to preview completion.</p>
          </div>
        )}

        <label className="block text-sm font-medium">
          Playback sync preview
          <select value={syncPreview} onChange={event => setSyncPreview(event.target.value as PlaybackSyncState)}
            aria-describedby={explanationId}
            className="mt-2 min-h-11 w-full rounded-room-control border border-room-control-border bg-room-base px-3 text-base text-room-text sm:text-sm">
            {Object.entries(playbackSyncLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <p role="status" aria-atomic="true" className="text-xs leading-relaxed text-room-muted">{announcement}</p>
        <div className="flex justify-end border-t border-room-border pt-4">
          <button type="button" className="room-secondary-button w-full sm:w-auto" onClick={onClose}>Close preview</button>
        </div>
      </div>
    </RoomDialog>
  );
}
