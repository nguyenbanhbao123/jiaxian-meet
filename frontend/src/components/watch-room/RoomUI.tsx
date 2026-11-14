import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { RoomIcon } from "./RoomIcon";

export function IconButton({ label, className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button type="button" aria-label={label} title={label} className={`room-control room-icon-button ${className}`} {...props}>{children}</button>;
}

export function Avatar({ name, tone = "gold", size = "md", online = false }: { name: string; tone?: "gold" | "sage"; size?: "sm" | "md"; online?: boolean }) {
  return <span className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"} ${tone === "gold" ? "bg-room-avatar-gold text-room-avatar-gold-ink" : "bg-room-avatar-sage text-room-avatar-sage-ink"}`} aria-hidden="true">{name.charAt(0)}{online && <span className="absolute -right-0.5 bottom-0 h-3 w-3 rounded-full border-[3px] border-room-panel bg-room-success" />}</span>;
}

export function RoomDialog({ title, children, onClose, size = "default" }: { title: string; children: ReactNode; onClose: () => void; size?: "default" | "wide" }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return <dialog ref={ref} aria-labelledby={titleId} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className={`room-dialog room-panel m-auto w-[calc(100%-2rem)] ${size === "wide" ? "max-w-3xl" : "max-w-md"} p-6 text-room-text shadow-2xl`}>
    <div className="mb-5 flex items-center justify-between gap-4"><h2 id={titleId} className="text-xl font-semibold">{title}</h2><IconButton label="Close dialog" onClick={onClose}><RoomIcon name="close" /></IconButton></div>
    {children}
  </dialog>;
}
