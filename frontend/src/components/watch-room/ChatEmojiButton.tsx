import { lazy, Suspense, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { RoomIcon } from "./RoomIcon";
import "./chat-emoji.css";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

type Props = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  messageLimit: number;
  onInsert: (emoji: string) => boolean;
};

export default function ChatEmojiButton({ inputRef, onInsert, messageLimit }: Props) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [atLimit, setAtLimit] = useState(false);

  useLayoutEffect(() => {
    const popup = panel.current;
    const composer = inputRef.current?.form;
    if (!open || !popup || !composer) return;

    // The on-screen keyboard can shrink the visible area around the composer.
    const viewport = window.visualViewport;
    function positionPicker() {
      if (!popup || !composer) return;
      const rect = composer.getBoundingClientRect();
      const gap = 8;
      const x = (viewport?.offsetLeft ?? 0) + gap;
      const y = (viewport?.offsetTop ?? 0) + gap;
      const right = x + (viewport?.width ?? document.documentElement.clientWidth) - 2 * gap;
      const bottom = y + (viewport?.height ?? window.innerHeight) - 2 * gap;
      const spaceAbove = Math.min(rect.top - gap, bottom) - y;
      const spaceBelow = bottom - Math.max(rect.bottom + gap, y);
      const width = Math.min(352, right - x);
      const height = Math.min(384, Math.max(spaceAbove, spaceBelow));
      popup.style.width = width + "px";
      popup.style.height = height + "px";
      popup.style.left = Math.max(x, Math.min(rect.right - width, right - width)) + "px";
      popup.style.top = (spaceAbove >= spaceBelow ? y + spaceAbove - height : bottom - spaceBelow) + "px";
    }

    // Handle Escape before the picker uses it to clear an active search.
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && !event.isComposing && popup?.matches(":popover-open")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        popup.hidePopover();
      }
    }

    positionPicker();
    const resize = new ResizeObserver(positionPicker);
    resize.observe(composer);
    window.addEventListener("keydown", escape, true);
    window.addEventListener("resize", positionPicker);
    window.addEventListener("scroll", positionPicker, true);
    viewport?.addEventListener("resize", positionPicker);
    viewport?.addEventListener("scroll", positionPicker);
    return () => {
      resize.disconnect();
      window.removeEventListener("keydown", escape, true);
      window.removeEventListener("resize", positionPicker);
      window.removeEventListener("scroll", positionPicker, true);
      viewport?.removeEventListener("resize", positionPicker);
      viewport?.removeEventListener("scroll", positionPicker);
    };
  }, [open, inputRef]);

  return <>
    <button type="button" className="room-control room-icon-button" popoverTarget={id}
      aria-label="Choose emoji" title="Choose emoji" aria-haspopup="dialog" aria-controls={id} aria-expanded={open}>
      <RoomIcon name="smile" className="h-[18px] w-[18px]" />
    </button>
    {createPortal(
      <div ref={panel} id={id} popover="auto" role="dialog" aria-label="Choose emoji" className="chat-emoji-popover"
        onToggle={event => {
          setOpen(event.newState === "open");
          setAtLimit(false);
        }}>
        {open && <Suspense fallback={<p role="status">Loading emojis…</p>}>
          <EmojiPicker
            className="chat-emoji-picker"
            cssLayer="epr"
            theme="dark"
            emojiStyle="native"
            suggestedEmojisMode="recent"
            autoFocusSearch
            keepSearchFocus
            searchLabel="Search emojis"
            previewConfig={{ showPreview: false }}
            width="100%"
            height="100%"
            onEmojiClick={({ emoji }) => {
              if (!onInsert(emoji)) {
                setAtLimit(true);
                return;
              }
              panel.current?.hidePopover();
              inputRef.current?.focus({ preventScroll: true });
            }}
          />
        </Suspense>}
        {atLimit && <p role="status">This emoji exceeds the {messageLimit}-character limit.</p>}
      </div>,
      document.body
    )}
  </>;
}
