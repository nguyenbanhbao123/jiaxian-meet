import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { RoomIcon } from "./RoomIcon";
import { IconButton } from "./RoomUI";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  return `${hours ? `${hours}:` : ""}${String(Math.floor(whole / 60) % 60).padStart(hours ? 2 : 1, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

function progressStyle(value: number): CSSProperties {
  return { "--range-progress": `${value}%` } as CSSProperties;
}

export default function VideoPlayer({ theater, onToggleTheater }: { theater: boolean; onToggleTheater: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const [source, setSource] = useState<{ url: string; name: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => () => { if (source) URL.revokeObjectURL(source.url); }, [source]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
      videoRef.current.playbackRate = rate;
    }
  }, [source, volume, muted, rate]);

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === canvasRef.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  function chooseFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|m4v|ogv|ogg|mkv)$/i.test(file.name)) {
      setNotice("Choose a video file, such as MP4 or WebM.");
      return;
    }
    try {
      const url = URL.createObjectURL(file);
      videoRef.current?.pause();
      setSource({ url, name: file.name });
      setPlaying(false);
      setReady(false);
      setCurrentTime(0);
      setDuration(0);
      setRate(1);
      setError("");
      setNotice("");
    } catch {
      setNotice("This file couldn’t be opened. Please choose it again.");
    }
  }

  async function togglePlay() {
    const video = videoRef.current;
    if (!video || !ready) return;
    if (!video.paused) video.pause();
    else {
      try { await video.play(); setNotice(""); }
      catch (failure) { if (!(failure instanceof DOMException && failure.name === "AbortError")) setNotice("Playback couldn’t start. Try again or choose another browser-supported video."); }
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (canvasRef.current?.requestFullscreen) await canvasRef.current.requestFullscreen();
      else setNotice("Fullscreen isn’t available in this browser. Try theater view instead.");
    } catch { setNotice("Fullscreen couldn’t open. Try theater view instead."); }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  }

  const playable = Boolean(source && ready && !error);

  return <section id="watch-screen" aria-label="Local video player" tabIndex={-1} className="room-player scroll-mt-4 rounded-2xl">
    <input ref={inputRef} type="file" accept="video/*,.mkv,.m4v" className="sr-only" tabIndex={-1} aria-label="Choose a local video file" onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = ""; }} />
    <div ref={canvasRef} className={`room-canvas room-panel overflow-hidden transition-colors ${dragging ? "border-room-accent ring-2 ring-room-accent/25" : ""}`}
      onDragEnter={(event) => { event.preventDefault(); dragDepth.current++; setDragging(true); }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDragLeave={(event) => { event.preventDefault(); dragDepth.current--; if (dragDepth.current <= 0) setDragging(false); }} onDrop={onDrop}>
      <div className="room-video-slot">
        <div className="room-video-stage relative flex aspect-video items-center justify-center overflow-hidden bg-room-canvas">
          {source && <video key={source.url} ref={videoRef} src={source.url} playsInline preload="metadata" aria-label={`Local video: ${source.name}`} className="h-full w-full object-contain"
            onLoadedMetadata={(event) => { setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0); setReady(true); }}
            onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
            onCanPlay={() => setReady(true)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
            onError={() => { setError("This browser can’t play this video. Try an MP4 (H.264) or WebM file."); setReady(false); setPlaying(false); }} />}
          {!source && <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_43%,rgba(223,206,162,0.035),transparent_65%)]" />
            <div className="room-video-label absolute left-4 top-4 hidden items-center gap-2 text-room-label font-medium tracking-[0.14em] text-room-muted sm:flex"><span className="h-1 w-1 rounded-full bg-room-muted" /> YOUR SCREEN</div>
            <div className="room-video-label absolute right-4 top-4 hidden items-center gap-1.5 text-room-label tracking-[0.1em] text-room-muted sm:flex"><RoomIcon name="lock" className="h-3 w-3" /> LOCAL PLAYBACK</div>
            <div className="room-empty-state relative flex flex-col items-center px-5 py-3 text-center max-[360px]:py-2 sm:py-8">
              <div className="room-empty-icon mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-room-accent/25 bg-room-accent/5 text-room-accent max-[360px]:hidden sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl"><RoomIcon name="film" className="h-5 w-5 sm:h-7 sm:w-7" /></div>
              <h2 className="text-xl font-medium tracking-[-0.6px] sm:text-[28px]">Set the scene.</h2>
              <p className="room-empty-copy mb-3 mt-1 text-xs leading-relaxed text-room-muted sm:mb-5 sm:mt-2 sm:text-sm">Your next movie night starts with a video.</p>
              <button type="button" className="room-button-primary" onClick={() => inputRef.current?.click()}><RoomIcon name="upload" className="h-4 w-4" /> Choose a video</button>
              <p className="room-empty-hint mt-3 hidden text-xs text-room-muted sm:block">or drop a video file here <span className="mx-1" aria-hidden="true">·</span> MP4, WebM & more</p>
            </div>
            <span className="absolute bottom-5 left-5 hidden h-3 w-3 border-b border-l border-room-accent/25 sm:block" /><span className="absolute bottom-5 right-5 hidden h-3 w-3 border-b border-r border-room-accent/25 sm:block" />
          </>}
          {source && !ready && !error && <div role="status" className="absolute inset-0 flex items-center justify-center bg-room-canvas/90 text-sm text-room-muted">Opening your local video…</div>}
          {error && <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-room-canvas/95 px-6 text-center"><RoomIcon name="info" className="h-7 w-7 text-room-accent" /><p role="alert" className="max-w-sm text-sm text-room-text">{error}</p><button type="button" className="room-button-primary" onClick={() => inputRef.current?.click()}>Choose another video</button></div>}
          {dragging && <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-room-accent bg-room-canvas/95"><div className="flex items-center gap-3 text-sm text-room-accent"><RoomIcon name="upload" /> Drop to open locally</div></div>}
        </div>
      </div>

      <div className="room-player-controls border-t border-room-border/70 px-3 pb-1 sm:px-4" role="group" aria-label="Playback controls">
        <div className="flex items-center gap-3">
          <label htmlFor="video-timeline" className="sr-only">Video timeline</label>
          <input id="video-timeline" type="range" className="room-range w-full" min="0" max={duration || 1} step="0.1" value={currentTime} disabled={!playable || !duration} style={progressStyle(duration ? currentTime / duration * 100 : 0)} aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`} onChange={(event) => { if (videoRef.current) { videoRef.current.currentTime = Number(event.target.value); setCurrentTime(Number(event.target.value)); } }} />
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 sm:gap-x-2">
          <IconButton label={playing ? "Pause video" : "Play video"} disabled={!playable} onClick={togglePlay} className="text-room-text"><RoomIcon name={playing ? "pause" : "play"} className="h-[18px] w-[18px]" /></IconButton>
          <span className="mr-1 whitespace-nowrap text-xs tabular-nums text-room-muted sm:mr-2">{formatTime(currentTime)}<span className="mx-1.5">/</span>{formatTime(duration)}</span>
          <span className="mr-1 hidden h-4 w-px bg-room-border sm:block" />
          <IconButton label="Mute video" title={muted || volume === 0 ? "Unmute video" : "Mute video"} aria-pressed={muted || volume === 0} onClick={() => { if (volume === 0) { setVolume(0.8); setMuted(false); } else setMuted(!muted); }}><RoomIcon name={muted || volume === 0 ? "muted" : "volume"} className="h-[18px] w-[18px]" /></IconButton>
          <label htmlFor="video-volume" className="sr-only">Video volume</label><input id="video-volume" type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} className="room-range hidden w-16 sm:block" style={progressStyle(muted ? 0 : volume * 100)} aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} percent`} onChange={(event) => { setVolume(Number(event.target.value)); setMuted(false); }} />
          <div className="ml-auto flex items-center sm:gap-1"><button type="button" aria-label={`Playback speed: ${rate}×. Click to change.`} disabled={!playable} onClick={() => setRate(rate === 2 ? 0.5 : rate === 0.5 ? 1 : rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 2)} className="room-control px-2 text-xs tabular-nums" title="Cycle playback speed">{rate}×</button>
            <IconButton label="Theater view" title={theater ? "Exit theater view" : "Theater view"} aria-pressed={theater} onClick={onToggleTheater} className="hidden sm:inline-flex"><svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" /></svg></IconButton>
            <IconButton label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={toggleFullscreen}><RoomIcon name={fullscreen ? "minimize" : "fullscreen"} className="h-[18px] w-[18px]" /></IconButton>
          </div>
        </div>
      </div>
    </div>

    <div className="room-player-meta mt-2 flex min-h-11 min-w-0 items-center justify-between gap-3 px-1 text-xs leading-relaxed text-room-muted">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <RoomIcon name={source ? "film" : "info"} className="h-3.5 w-3.5 shrink-0" />
        {source ? <div className="min-w-0"><p className="truncate text-room-text" title={source.name}>{source.name}</p><p>Only you can see this. Playback isn’t synchronized.</p></div> : <p>Local preview only. Your video isn’t uploaded or shared.</p>}
      </div>
      {source && <button type="button" className="room-control shrink-0 px-2 text-xs text-room-accent" onClick={() => inputRef.current?.click()}><RoomIcon name="upload" className="h-3.5 w-3.5" /> Change video</button>}
    </div>
    {notice && <p role="status" className="mt-3 rounded-lg border border-room-accent/20 bg-room-accent/5 px-4 py-3 text-xs leading-relaxed text-room-accent">{notice}</p>}
  </section>;
}
