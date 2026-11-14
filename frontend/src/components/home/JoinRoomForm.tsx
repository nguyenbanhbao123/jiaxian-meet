import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { RoomIcon } from "../watch-room/RoomIcon";
import { IconButton } from "../watch-room/RoomUI";
import { DEMO_JOIN_DELAY_MS, DEMO_ROOM_CODE, validateDemoRoomCode } from "./demoRoom";

export type JoinRoomFormProps = {
  onJoinDemo: () => void;
  /** Block the form and cancel its simulation while a parent dialog is open. */
  disabled?: boolean;
};

type JoinPhase = "idle" | "joining" | "canceled";

export default function JoinRoomForm({ onJoinDemo, disabled = false }: JoinRoomFormProps) {
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<JoinPhase>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const codeId = useId();
  const headingId = useId();
  const helpId = useId();
  const errorId = useId();
  const statusId = useId();
  const validation = validateDemoRoomCode(code);
  const joining = phase === "joining";
  const showError = touched && validation.state !== "valid";

  const clearPendingJoin = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  // Leaving Home must never trigger a delayed navigation into the demo.
  useEffect(() => clearPendingJoin, [clearPendingJoin]);

  useEffect(() => {
    if (disabled) {
      clearPendingJoin();
      setPhase("idle");
    }
  }, [disabled, clearPendingJoin]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || timerRef.current !== null) return;
    setTouched(true);

    if (validation.state !== "valid") {
      inputRef.current?.focus();
      return;
    }

    setPhase("joining");
    // This delay only demonstrates a pending UI; no request or verification occurs.
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setPhase("idle");
      onJoinDemo();
    }, DEMO_JOIN_DELAY_MS);
  }

  function cancelJoin() {
    clearPendingJoin();
    setPhase("canceled");
    inputRef.current?.focus();
  }

  const statusMessage = joining
    ? "Simulated joining… opening the local demo. No server connection."
    : phase === "canceled"
      ? "Demo join canceled. Edit the code or try again."
      : validation.state === "valid" ? validation.message : "";

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-[29rem] border-t border-room-border pt-5" aria-labelledby={headingId}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id={headingId} className="text-sm font-medium">Have an invite? Join a friend.</h2>
        <span className="room-badge border border-room-border text-room-muted">Demo only</span>
      </div>
      <label htmlFor={codeId} className="mb-2 block text-xs text-room-muted">Room code</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div
          data-validation={showError ? "invalid" : validation.state}
          className="home-code-field flex min-h-12 min-w-0 flex-1 items-center gap-1 rounded-room-control border bg-room-panel pl-3.5 pr-1"
        >
          <RoomIcon name={validation.state === "valid" ? "check" : "lock"} className={`mr-2 h-4 w-4 shrink-0 ${validation.state === "valid" ? "text-room-success" : "text-room-muted"}`} />
          <input
            ref={inputRef}
            id={codeId}
            name="roomCode"
            type="text"
            value={code}
            required
            disabled={disabled}
            readOnly={joining}
            onChange={(event) => {
              if (joining) return;
              setCode(event.target.value);
              setPhase("idle");
            }}
            onBlur={() => setTouched(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault();
            }}
            placeholder="Enter a room code"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={64}
            aria-invalid={showError}
            aria-describedby={`${helpId} ${showError ? errorId : statusId}`}
            className="min-h-11 min-w-0 flex-1 rounded-md bg-transparent text-base text-room-text placeholder:text-room-muted disabled:opacity-50"
          />
          {code && (
            <IconButton label="Clear room code" disabled={joining || disabled} onClick={() => { setCode(""); setTouched(false); setPhase("idle"); inputRef.current?.focus(); }}>
              <RoomIcon name="close" className="h-4 w-4" />
            </IconButton>
          )}
        </div>
        <button type="submit" className="room-secondary-button min-h-12 shrink-0 px-4 text-sm sm:min-w-40" disabled={joining || disabled} aria-busy={joining}>
          {joining ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : null}
          {joining ? "Joining demo…" : "Join Room"}
          {!joining && <RoomIcon name="arrow" className="h-4 w-4" />}
        </button>
      </div>
      <p id={helpId} className="mt-2 text-xs leading-relaxed text-room-muted">
        Demo only. Try <code className="font-mono text-room-accent">{DEMO_ROOM_CODE}</code>. No real room is checked or joined.
      </p>
      <div className="mt-2 min-h-5">
        {showError && <p id={errorId} role="alert" className="text-xs leading-relaxed text-room-danger">{validation.message}</p>}
        <p id={statusId} role="status" aria-atomic="true" className={`text-xs leading-relaxed ${validation.state === "valid" && phase === "idle" ? "text-room-success" : "text-room-muted"}`}>
          {statusMessage}
        </p>
      </div>
      {joining && (
        <button type="button" className="room-control mt-1 px-2 text-xs" onClick={cancelJoin}>Cancel demo join</button>
      )}
    </form>
  );
}
