/** Shared static fixture. It is never generated or issued by a server. */
export const DEMO_ROOM_CODE = "DEMO-2SEATS";

/** A visible UI simulation, not a network request or connection timeout. */
export const DEMO_JOIN_DELAY_MS = 900;

export type DemoCodeValidation = {
  state: "empty" | "invalid" | "valid";
  normalizedCode: string;
  message: string;
};

/** Prototype-only format; the backend's eventual code contract is undecided.
 * Every matching demo value opens the same local preview, without room lookup.
 */
export function validateDemoRoomCode(rawCode: string): DemoCodeValidation {
  const trimmedCode = rawCode.trim();
  const normalizedCode = trimmedCode.toUpperCase();

  if (!normalizedCode) {
    return { state: "empty", normalizedCode, message: "Enter a room code to try the demo." };
  }
  if (!/^DEMO-[A-Z0-9]{6}$/i.test(trimmedCode)) {
    return {
      state: "invalid",
      normalizedCode,
      message: "Use DEMO- followed by six letters or numbers, such as DEMO-2SEATS.",
    };
  }
  return {
    state: "valid",
    normalizedCode,
    message: "Valid demo format. No room has been verified.",
  };
}
