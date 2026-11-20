import { useEffect, useId, useRef, useState } from "react";
import { RoomIcon } from "../watch-room/RoomIcon";
import { RoomDialog } from "../watch-room/RoomUI";

export type CreateRoomDialogProps = {
  sampleRoomCode: string;
  onClose: () => void;
  onEnterWatchRoom: () => void;
};

type CopyState = "idle" | "copying" | "copied" | "error";

/** Presentation-only invitation preview. No room is created or looked up here. */
export default function CreateRoomDialog({ sampleRoomCode, onClose, onEnterWatchRoom }: CreateRoomDialogProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const codeRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  const codeId = useId();
  const copyStatusId = useId();

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function copySampleCode() {
    if (copyState === "copying") return;
    setCopyState("copying");

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(sampleRoomCode);
      if (mounted.current) setCopyState("copied");
    } catch {
      if (!mounted.current) return;
      setCopyState("error");
      codeRef.current?.focus();
      codeRef.current?.select();
    }
  }

  const copyMessage = copyState === "copied"
    ? "Sample code copied."
    : copyState === "error"
      ? "Automatic copying isn’t available. The sample code is selected; use your device’s Copy command."
      : copyState === "copying"
        ? "Copying the sample code…"
        : "";

  return (
    <RoomDialog title="Room invitation" onClose={onClose}>
      <p className="text-sm text-room-muted">Demo invitation · Opens on this device only.</p>

      <div className="mt-4 rounded-xl border border-room-border bg-room-base p-4">
        <label htmlFor={codeId} className="block text-xs font-medium text-room-muted">Sample room code</label>
        <div className="mt-2 flex min-w-0 flex-col gap-2 min-[460px]:flex-row min-[460px]:items-center">
          <input
            ref={codeRef}
            id={codeId}
            type="text"
            value={sampleRoomCode}
            readOnly
            spellCheck={false}
            aria-describedby={copyStatusId}
            onFocus={(event) => event.currentTarget.select()}
            className="min-h-11 w-full min-w-0 flex-1 rounded-md bg-transparent font-mono text-xl tracking-[0.08em] text-room-accent"
          />
          <button
            type="button"
            onClick={copySampleCode}
            disabled={copyState === "copying"}
            aria-busy={copyState === "copying"}
            aria-label={copyState === "copied" ? "Copied sample code. Copy again." : copyState === "copying" ? "Copying sample code" : "Copy code · sample only"}
            className="room-secondary-button min-w-28 shrink-0 px-3"
          >
            {copyState === "copied" ? <RoomIcon name="check" className="h-4 w-4" /> : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="8" y="8" width="12" height="13" rx="2" />
                <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
              </svg>
            )}
            {copyState === "copied" ? "Copied" : copyState === "copying" ? "Copying…" : "Copy code"}
          </button>
        </div>
      </div>

      <p id={copyStatusId} role="status" aria-atomic="true" className={`empty:hidden mt-2 text-xs leading-relaxed ${copyState === "error" ? "text-room-accent" : copyState === "copied" ? "text-room-success" : "text-room-muted"}`}>
        {copyMessage}
      </p>

      <div className="mt-4">
        <button type="button" className="room-button-primary w-full" onClick={onEnterWatchRoom}>
          Enter Watch Room <RoomIcon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </RoomDialog>
  );
}
