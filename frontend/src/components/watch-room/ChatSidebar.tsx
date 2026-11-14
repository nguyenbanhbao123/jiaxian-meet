import { useEffect, useId, useRef, useState } from "react";
import { RoomIcon } from "./RoomIcon";
import { Avatar, IconButton } from "./RoomUI";

type ChatMessage = {
  id: number;
  author: "Jiaxian" | "Bao";
  text: string;
  time: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, author: "Bao", text: "Made it! I've got the popcorn.", time: "8:41 PM" },
  {
    id: 2,
    author: "Jiaxian",
    text: "And I've got the movie. Best kind of night.",
    time: "8:42 PM",
  },
  { id: 3, author: "Bao", text: "Ready when you are :)", time: "8:42 PM" },
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const own = message.author === "Jiaxian";

  return (
    <li className={`flex items-end gap-2.5 ${own ? "flex-row-reverse" : ""}`}>
      <Avatar name={message.author} tone={own ? "gold" : "sage"} size="sm" />
      <div className={`min-w-0 max-w-[calc(100%-2.625rem)] ${own ? "text-right" : ""}`}>
        <div className={`mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs ${own ? "justify-end" : ""}`}>
          <span className="font-medium text-room-text">{own ? "You" : message.author}</span>
          <span className="text-room-muted">{message.time}</span>
        </div>
        <p
          className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-left text-sm leading-relaxed [overflow-wrap:anywhere] ${
            own
              ? "rounded-br-sm border border-room-accent/15 bg-room-accent/10 text-room-text"
              : "rounded-bl-sm border border-room-border bg-room-raised text-room-text"
          }`}
        >
          {message.text}
        </p>
      </div>
    </li>
  );
}

/** A browser-local conversation. The other participant's messages are fixtures. */
export default function ChatSidebar() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const hintId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(INITIAL_MESSAGES.length + 1);
  // Start at the latest mock message, then scroll only after a local send.
  const scrollAfterSend = useRef(true);
  const canSend = draft.trim().length > 0;

  useEffect(() => {
    if (scrollAfterSend.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      scrollAfterSend.current = false;
    }
  }, [messages.length]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    scrollAfterSend.current = true;
    const message: ChatMessage = {
      id: nextId.current++,
      author: "Jiaxian",
      text,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };
    setMessages((current) => [...current, message]);
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <aside
      aria-label="Room chat"
      className="room-panel flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
    >
      <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-room-border px-4">
        <h2 className="flex items-center gap-2.5 text-sm font-semibold text-room-text">
          <RoomIcon name="chat" className="h-[18px] w-[18px] text-room-muted" />
          Room chat
        </h2>
        <span className="rounded-md border border-room-border px-2 py-1 text-xs font-medium text-room-muted">
          Local demo
        </span>
      </div>

      <div
        ref={scrollRef}
        role="region"
        aria-label="Chat history"
        tabIndex={0}
        className="room-chat-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <div className="mb-4 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-room-border" />
          <span className="text-room-label font-medium tracking-[0.16em] text-room-muted">TONIGHT</span>
          <span className="h-px flex-1 bg-room-border" />
        </div>

        <div className="mb-5 text-center">
          <span className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border border-room-border bg-room-base/40 text-room-accent">
            <RoomIcon name="lock" className="h-4 w-4" />
          </span>
          <p className="text-xs font-medium text-room-text">A little room for the two of you.</p>
          <p className="mt-1 text-xs leading-relaxed text-room-muted">A mock conversation for movie night.</p>
        </div>

        <ul role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions" className="space-y-4">
          {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        </ul>
      </div>

      <div className="shrink-0 border-t border-room-border p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="rounded-xl border border-room-border bg-room-base/50 p-2 transition-colors focus-within:border-room-accent/60"
        >
          <label htmlFor={inputId} className="block px-2 pt-1 text-xs font-medium text-room-muted">Message the room</label>
          <textarea
            ref={inputRef}
            id={inputId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                sendMessage();
              }
            }}
            aria-describedby={hintId}
            maxLength={2000}
            rows={2}
            placeholder="Say something nice…"
            className="block min-h-11 w-full resize-none rounded-md bg-transparent px-2 py-2 text-base leading-relaxed text-room-text placeholder:text-room-muted sm:text-sm"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <IconButton
                label="Add a smile to your message"
                disabled={draft.length > 1997}
                onClick={() => {
                  setDraft((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}:)`.slice(0, 2000));
                  inputRef.current?.focus();
                }}
              >
                <RoomIcon name="smile" className="h-[18px] w-[18px]" />
              </IconButton>
              <span className="text-xs text-room-muted">
                {draft.length > 1800 ? `${draft.length}/2000` : "Enter to send"}
              </span>
            </div>
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send local message"
              title="Send local message"
              className="room-button-primary h-11 w-11 shrink-0 p-0"
            >
              <RoomIcon name="send" className="h-[18px] w-[18px]" />
            </button>
          </div>
        </form>
        <p id={hintId} className="mt-2 text-center text-xs leading-relaxed text-room-muted">
          Local demo · resets when you leave or reload.
        </p>
      </div>
    </aside>
  );
}
