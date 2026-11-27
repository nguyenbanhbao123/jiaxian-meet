import { DEMO_JOIN_DELAY_MS, DEMO_ROOM_CODE } from "./demoRoom";

// These are UI results. A future adapter can map the server contract to them.
export interface RoomOperations {
  createRoom(signal: AbortSignal): Promise<string>;
  joinRoom(code: string, signal: AbortSignal): Promise<void>;
}

export const demoRoomOperations: RoomOperations = {
  async createRoom(signal) {
    signal.throwIfAborted();
    return DEMO_ROOM_CODE;
  },

  async joinRoom(_code, signal) {
    signal.throwIfAborted();
    // All valid demo codes open the same local Watch Room.
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        signal.removeEventListener("abort", cancel);
        resolve();
      }, DEMO_JOIN_DELAY_MS);

      function cancel() {
        window.clearTimeout(timer);
        reject(signal.reason);
      }
      signal.addEventListener("abort", cancel, { once: true });
    });
  },
};
