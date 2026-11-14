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
  const hintId = useId();
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
    ? "Sample code copied. It won’t open a real room."
    : copyState === "error"
      ? "Automatic copying isn’t available. The sample code is selected; use your device’s Copy command."
      : copyState === "copying"
        ? "Copying the sample code…"
        : "Copy this sample to try the invitation UI.";

  return (
    <RoomDialog title="Room invitation preview" onClose={onClose}>
      <div className="mb-4 flex items-center gap-2">
        <span className="room-badge border border-room-accent/25 bg-room-accent/5 text-room-accent">Demo only</span>
        <span className="text-xs text-room-muted">A little room for two.</span>
      </div>
      <p className="text-sm leading-relaxed text-room-muted">
        Preview an invitation for your next movie night. No real room has been created.
      </p>

      <div className="mt-5 rounded-xl border border-room-accent/25 bg-room-base p-4">
        <label htmlFor={codeId} className="block text-xs font-medium text-room-muted">Sample room code</label>
        <div className="mt-2 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={codeRef}
            id={codeId}
            type="text"
            value={sampleRoomCode}
            readOnly
            spellCheck={false}
            aria-describedby={`${hintId} ${copyStatusId}`}
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
        <p id={hintId} className="mt-2 text-xs leading-relaxed text-room-muted">Example only. This code isn’t a valid invitation.</p>
      </div>

      <p id={copyStatusId} role="status" aria-atomic="true" className={`mt-3 text-xs leading-relaxed ${copyState === "error" ? "text-room-accent" : copyState === "copied" ? "text-room-success" : "text-room-muted"}`}>
        {copyMessage}
      </p>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-room-border p-4">
        <RoomIcon name="users" className="mt-0.5 h-5 w-5 shrink-0 text-room-accent" />
        <div>
          <h3 className="text-sm font-medium">An invitation to a night in</h3>
          <p className="mt-1 text-sm leading-relaxed text-room-muted">
            In the full experience, share a code with your friend to invite them. This sample won’t connect anyone.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button type="button" className="room-button-primary w-full" onClick={onEnterWatchRoom}>
          Enter Watch Room <RoomIcon name="arrow" className="h-4 w-4" />
        </button>
        <button type="button" className="room-secondary-button w-full" onClick={onClose}>Close</button>
      </div>
      <p className="mt-3 text-center text-xs leading-relaxed text-room-muted">Opens the local demo. No shared session.</p>
    </RoomDialog>
  );
}
