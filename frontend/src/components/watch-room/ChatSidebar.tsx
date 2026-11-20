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
  { id: 1, author: "Bao", text: "Ready when you are :)", time: "8:42 PM" },
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const own = message.author === "Jiaxian";

  return (
    <li className={`flex items-end gap-2.5 ${own ? "flex-row-reverse" : ""}`}>
      <Avatar name={message.author} tone={own ? "gold" : "sage"} size="sm" />
      <div className={`min-w-0 max-w-[calc(100%-2.625rem)] ${own ? "text-right" : ""}`}>
        <div className={`mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs ${own ? "justify-end" : ""}`}>
          <span className="font-medium text-room-text">{own ? "You" : "Bao · Sample"}</span>
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
export default function ChatSidebar({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const inputId = useId();
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
        <IconButton label="Close chat" onClick={onClose}><RoomIcon name="close" /></IconButton>
      </div>

      <div
        ref={scrollRef}
        role="region"
        aria-label="Chat history"
        tabIndex={0}
        className="room-chat-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <ul role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions" className="space-y-3">
          {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        </ul>
      </div>

      <div className="shrink-0 border-t border-room-border p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-x-1 rounded-xl border border-room-border bg-room-base/50 p-1.5 transition-colors focus-within:border-room-accent/60"
        >
          <label htmlFor={inputId} className="sr-only">Message the room</label>
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
            maxLength={2000}
            rows={draft.includes("\n") ? 2 : 1}
            placeholder="Write a message…"
            className="block min-h-11 w-full min-w-0 resize-none rounded-md bg-transparent px-2 py-2 text-base leading-relaxed text-room-text placeholder:text-room-muted sm:text-sm"
          />
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
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send local message"
            title="Send local message"
            className="room-button-primary h-11 w-11 shrink-0 p-0"
          >
            <RoomIcon name="send" className="h-[18px] w-[18px]" />
          </button>
          {draft.length > 1800 && <span className="col-span-3 px-2 text-right text-xs text-room-muted">{draft.length}/2000</span>}
        </form>
      </div>
    </aside>
  );
}
