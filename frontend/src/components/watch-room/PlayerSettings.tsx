import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { RoomIcon } from "./RoomIcon";

// File replacement and “Reset to defaults” use the same starting values.
export const playbackDefaults = { speed: 1, brightness: 100, loop: false };
type Preferences = typeof playbackDefaults;

// Both sliders read their limits and increments from this table.
const adjustments = {
  speed: { label: "Playback speed", icon: "speed", min: 0.5, max: 2, step: 0.25, unit: "×" },
  brightness: { label: "Brightness", icon: "sun", min: 50, max: 150, step: 5, unit: "%" },
} as const;
type Adjustment = keyof typeof adjustments;

export default function PlayerSettings({ value, disabled, onChange }: {
  value: Preferences;
  disabled: boolean;
  onChange: (next: Preferences) => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Adjustment | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLInputElement>(null);
  const returnRow = useRef<Adjustment>("speed");
  const id = useId();
  const adjustment = view && adjustments[view];
  const panelVisible = open && !disabled;

  useLayoutEffect(() => {
    if (!open || disabled) return;
    const target = slider.current ?? panel.current?.querySelector<HTMLButtonElement>(`[data-setting="${returnRow.current}"]`);
    panel.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    target?.focus({ preventScroll: true });
  }, [open, view, disabled]);

  useEffect(() => {
    if (!open) return;
    function dismissOutside(event: Event) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [open]);

  function togglePanel() {
    returnRow.current = "speed";
    setView(null);
    setOpen(!open);
  }

  function openSlider(key: Adjustment) {
    // Back should return keyboard focus to the row that opened this slider.
    returnRow.current = key;
    setView(key);
  }

  return <div ref={root} onKeyDown={event => {
    if (open && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    }
  }}>
    <button type="button" ref={trigger} className="room-control room-icon-button player-settings-trigger"
      title={disabled ? "Choose a video to adjust playback settings" : "Playback settings"} aria-label="Playback settings"
      aria-haspopup="dialog" aria-expanded={panelVisible} aria-controls={panelVisible ? id : undefined} disabled={disabled}
      onClick={togglePanel}>
      <RoomIcon name="settings" className="h-[18px] w-[18px]" />
    </button>
    {panelVisible && <div id={id} ref={panel} role="dialog" aria-label="Playback settings" className="player-settings-panel">
      {view && adjustment ? <>
        <div className="flex items-center gap-1 pr-3">
          <button type="button" className="room-control room-icon-button" aria-label="Back to playback settings" title="Back to playback settings" onClick={() => setView(null)}>
            <RoomIcon name="back" className="size-4" />
          </button>
          <label className="grow font-medium" htmlFor={id + "-range"}>{adjustment.label}</label>
          <span className="settings-value" aria-hidden="true">{value[view]}{adjustment.unit}</span>
        </div>
        <div className="px-3 pb-2">
          <input id={id + "-range"} ref={slider} type="range" className="room-range block w-full"
            min={adjustment.min} max={adjustment.max} step={adjustment.step} value={value[view]}
            aria-valuetext={view === "speed" ? `${value.speed} times normal speed` : `${value.brightness} percent`}
            style={{ "--range-progress": `${100 * (value[view] - adjustment.min) / (adjustment.max - adjustment.min)}%` } as CSSProperties}
            onChange={event => onChange({ ...value, [view]: Number(event.target.value) })} />
          <div className="flex justify-between text-xs tabular-nums text-room-muted" aria-hidden="true"><span>{adjustment.min}{adjustment.unit}</span><span>{adjustment.max}{adjustment.unit}</span></div>
        </div>
      </> : <>
        {(Object.keys(adjustments) as Adjustment[]).map(key => {
          const { label, icon, unit } = adjustments[key];
          return <button key={key} type="button" data-setting={key} className="settings-row" onClick={() => openSlider(key)}>
            <RoomIcon name={icon} /><span>{label}</span><span className="settings-value">{value[key]}{unit}</span><RoomIcon name="chevron-down" className="size-3 -rotate-90 text-room-muted" />
          </button>;
        })}
        <button type="button" className="settings-row" aria-label="Loop video" aria-pressed={value.loop} onClick={() => onChange({ ...value, loop: !value.loop })}>
          <RoomIcon name="loop" /><span>Loop video</span><span className="settings-value">{value.loop ? "On" : "Off"}</span>
        </button>
        <button type="button" className="settings-row settings-reset" onClick={() => onChange(playbackDefaults)}><RoomIcon name="reset" /><span>Reset to defaults</span></button>
      </>}
    </div>}
  </div>;
}
