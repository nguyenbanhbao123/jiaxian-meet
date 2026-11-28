import { useId } from "react";
import { RoomIcon, type RoomIconName } from "./RoomIcon";
import "./video-upload-state.css";

import { normalizeProgress, type VideoUploadStatus } from "./mediaPreparation";

export type { VideoUploadStatus } from "./mediaPreparation";

export type VideoUploadStateProps = {
  status: VideoUploadStatus;
  /** Current use is always true. Only real state data may disable this label. */
  isDemoPreview: boolean;
  onSelect: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onReturn: () => void;
};

const STATE_DETAILS: Record<VideoUploadStatus["kind"], { title: string; icon: RoomIconName }> = {
  canceled: { title: "Preparation canceled", icon: "close" },
  empty: { title: "No video selected", icon: "film" },
  uploading: { title: "Uploading video", icon: "upload" },
  ready: { title: "Ready for playback", icon: "check" },
  error: { title: "Video unavailable", icon: "info" },
  "waiting-for-host": { title: "Waiting for host", icon: "users" },
};

/** Presentational state views: no media, transfer, timers, or navigation lives here. */
export default function VideoUploadState({ status, isDemoPreview, onSelect, onCancel, onRetry, onReturn }: VideoUploadStateProps) {
  const headingId = useId();
  const progressId = useId();
  const details = STATE_DETAILS[status.kind];
  const iconTone = status.kind === "error" ? "text-room-danger" : status.kind === "ready" ? "text-room-success" : "text-room-accent";
  const progress = status.kind === "uploading" ? normalizeProgress(status.progress) : 0;
  let description: string;

  switch (status.kind) {
    case "canceled":
      description = isDemoPreview ? "The sample operation was canceled." : "You can retry this file.";
      break;
    case "empty":
      description = isDemoPreview
        ? "Preview the moment before a video is chosen. The sample button uses mock data only."
        : "Choose a video to prepare your next movie night.";
      break;
    case "uploading":
      description = isDemoPreview
        ? "Mock progress only. No upload or file transfer is running."
        : "Preparing the selected video. You can cancel this operation.";
      break;
    case "ready":
      description = isDemoPreview
        ? "Preview only. No playable video is attached."
        : "The video is available for playback.";
      break;
    case "error":
      description = isDemoPreview ? "Mock error preview. No real transfer has failed." : "The video could not be prepared. You can try again.";
      break;
    case "waiting-for-host":
      description = isDemoPreview
        ? "Guest-view preview only. This doesn’t change your role or connect you to a host."
        : "The host will choose the video for this movie night.";
      break;
  }

  return (
    <section aria-labelledby={headingId} className="video-upload-state room-panel flex min-h-[240px] min-w-0 flex-col items-center justify-center bg-room-base px-5 py-6 text-center sm:px-6">
      {isDemoPreview && <span className="room-badge mb-4 border border-room-accent/25 bg-room-accent/5 text-room-accent">UI preview only</span>}
      <span className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-room-border bg-room-panel ${iconTone}`}>
        <RoomIcon name={details.icon} className="h-6 w-6" />
      </span>
      <h3 id={headingId} className="text-xl font-medium tracking-[-0.4px] text-room-text">{details.title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-room-muted">{description}</p>

      {"fileName" in status && status.fileName && (
        <p className="mt-4 max-w-full text-sm font-medium leading-relaxed text-room-text [overflow-wrap:anywhere]">
          <span className="mr-2 text-xs font-normal text-room-muted">{isDemoPreview ? "Sample file" : "File"}</span>
          {status.fileName}
        </p>
      )}

      {status.kind === "uploading" && (
        <div className="mt-4 w-full max-w-md text-left">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs text-room-muted">
            <label htmlFor={progressId}>{isDemoPreview ? "Mock upload progress" : "Upload progress"}</label>
            <span className="font-medium tabular-nums text-room-accent">{progress}%</span>
          </div>
          <progress id={progressId} className="video-state-progress block h-2 w-full overflow-hidden rounded-full" max={100} value={progress} aria-valuetext={`${progress} percent${isDemoPreview ? ", mock progress" : ""}`} />
        </div>
      )}

      {status.kind === "error" && (
        <p role="alert" className="mt-4 max-w-md text-sm leading-relaxed text-room-danger [overflow-wrap:anywhere]">{status.message}</p>
      )}

      {status.kind === "waiting-for-host" && (
        <p className="mt-4 max-w-full text-sm leading-relaxed text-room-text [overflow-wrap:anywhere]">
          <span className="mr-1 text-room-muted">{isDemoPreview ? "Sample host:" : "Host:"}</span> {status.hostName}
        </p>
      )}

      <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2">
        {status.kind === "empty" && <button type="button" className="room-button-primary w-full sm:w-auto" onClick={onSelect}><RoomIcon name="upload" className="h-4 w-4" />{isDemoPreview ? "Use sample video" : "Choose a video"}</button>}
        {status.kind === "uploading" && <button type="button" className="room-secondary-button w-full sm:w-auto" onClick={onCancel}>{isDemoPreview ? "Cancel demo upload" : "Cancel upload"}</button>}
        {status.kind === "ready" && <button type="button" className="room-button-primary w-full sm:w-auto" onClick={onReturn}>{isDemoPreview ? "Return to local player" : "Continue"}<RoomIcon name="arrow" className="h-4 w-4" /></button>}
        {(status.kind === "error" || status.kind === "canceled") && <button type="button" className="room-button-primary w-full sm:w-auto" onClick={onRetry}>{isDemoPreview ? "Retry demo" : "Try again"}<RoomIcon name="arrow" className="h-4 w-4" /></button>}
        {status.kind === "waiting-for-host" && <button type="button" className="room-secondary-button w-full sm:w-auto" onClick={onReturn}>{isDemoPreview ? "Exit preview" : "Go back"}</button>}
      </div>
    </section>
  );
}
