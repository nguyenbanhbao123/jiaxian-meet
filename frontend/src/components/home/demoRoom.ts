// The invitation preview and join form share this sample code.
export const DEMO_ROOM_CODE = "DEMO-2SEATS";

export const DEMO_JOIN_DELAY_MS = 900;

const DEMO_CODE_PATTERN = /^DEMO-[A-Z0-9]{6}$/i;

export type DemoCodeValidation = {
  state: "empty" | "invalid" | "valid";
  normalizedCode: string;
  message: string;
};

// Every matching code opens the same local room.
export function validateDemoRoomCode(rawCode: string): DemoCodeValidation {
  const trimmedCode = rawCode.trim();
  const normalizedCode = trimmedCode.toUpperCase();

  if (!normalizedCode) {
    return { state: "empty", normalizedCode, message: "Enter a room code to try the demo." };
  }
  if (!DEMO_CODE_PATTERN.test(trimmedCode)) {
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
