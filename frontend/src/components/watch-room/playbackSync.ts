// Room integration can supply a connection state once the transport is defined.
export const playbackSyncLabels = {
  "local-only": "Local playback only",
  connecting: "Connecting",
  connected: "Connected",
  synchronizing: "Synchronizing",
  disconnected: "Disconnected",
  reconnecting: "Reconnecting",
  error: "Connection error",
} as const;

export type PlaybackSyncState = keyof typeof playbackSyncLabels;

// Local control actions only. Device preferences are independent of room playback.
export type PlaybackIntent = { kind: "play" | "pause" } | { kind: "seek"; seconds: number };
