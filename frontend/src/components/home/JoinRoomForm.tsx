import { useId, useRef, useState, type FormEvent } from "react";
import { RoomIcon } from "../watch-room/RoomIcon";
import { IconButton } from "../watch-room/RoomUI";
import type { RoomOperations } from "./roomOperations";
import { useRoomOperation } from "./useRoomOperation";
import { DEMO_ROOM_CODE, validateDemoRoomCode } from "./demoRoom";

export type JoinRoomFormProps = {
  joinRoom: RoomOperations["joinRoom"];
  onJoinDemo: () => void;
  /** Block the form and cancel its simulation while a parent dialog is open. */
  disabled?: boolean;
};

export default function JoinRoomForm({ joinRoom, onJoinDemo, disabled = false }: JoinRoomFormProps) {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const join = useRoomOperation<void>(!disabled);
  const phase = join.state.status;
  const inputRef = useRef<HTMLInputElement>(null);
  const codeId = useId();
  const helpId = useId();
  const errorId = useId();
  const statusId = useId();
  const validation = validateDemoRoomCode(code);
  const joining = phase === "pending";
  const showError = submitted && validation.state !== "valid";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || joining || phase === "success") return;
    setSubmitted(true);

    if (validation.state !== "valid") {
      inputRef.current?.focus();
      return;
    }

    void join.run(signal => joinRoom(validation.normalizedCode, signal), onJoinDemo);
  }

  function cancelJoin() {
    join.reset("canceled");
    inputRef.current?.focus();
  }

  let statusMessage = validation.state === "valid" ? validation.message : "";
  if (phase === "error") statusMessage = "";
  if (phase === "success") statusMessage = "Local demo ready.";
  if (joining) statusMessage = "Opening the local room…";
  if (phase === "canceled") statusMessage = "Join canceled.";

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 border-t border-room-border pt-5" aria-label="Join room">
      <label htmlFor={codeId} className="mb-2 block text-xs text-room-muted">Room code</label>
      <div className="flex flex-col gap-2 min-[420px]:flex-row">
        <div
          data-validation={showError ? "invalid" : validation.state === "valid" ? "valid" : "idle"}
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
              join.reset();
            }}
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
            <IconButton label="Clear room code" disabled={joining || disabled} onClick={() => { setCode(""); setSubmitted(false); join.reset(); inputRef.current?.focus(); }}>
              <RoomIcon name="close" className="h-4 w-4" />
            </IconButton>
          )}
        </div>
        <button type="submit" className="room-secondary-button min-h-12 shrink-0 px-4 text-sm" disabled={joining || disabled} aria-busy={joining}>
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
        Try <code className="font-mono text-room-accent">{DEMO_ROOM_CODE}</code>.
      </p>
      <div className="mt-1">
        {phase === "error" && <p role="alert" className="text-xs text-room-danger">Couldn’t open the local demo. Select Join Room to retry.</p>}
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
