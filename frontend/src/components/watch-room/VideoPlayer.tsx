import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import PlayerSettings, { playbackDefaults } from "./PlayerSettings";
import { RoomIcon } from "./RoomIcon";
import { IconButton } from "./RoomUI";

const DEFAULT_VOLUME = 0.8;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor(whole / 60) % 60;
  const secondsText = String(whole % 60).padStart(2, "0");
  if (hours === 0) return `${minutes}:${secondsText}`;
  return `${hours}:${String(minutes).padStart(2, "0")}:${secondsText}`;
}

function progressStyle(value: number): CSSProperties {
  return { "--range-progress": `${value}%` } as CSSProperties;
}

export default function VideoPlayer({ active, theater, onToggleTheater }: { active: boolean; theater: boolean; onToggleTheater: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const [source, setSource] = useState<{ url: string; name: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [preferences, setPreferences] = useState(playbackDefaults);
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => { if (!active) videoRef.current?.pause(); }, [active]);

  useEffect(() => {
    if (!source) return;
    // Release the local file when it is replaced or the room closes.
    return () => URL.revokeObjectURL(source.url);
  }, [source]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
      videoRef.current.playbackRate = preferences.speed;
    }
  }, [source, volume, muted, preferences.speed]);

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
      setPreferences(playbackDefaults);
      setError("");
      setNotice("");
    } catch {
      setNotice("This file couldn’t be opened. Please choose it again.");
    }
  }

  async function togglePlay() {
    const video = videoRef.current;
    if (!video || !ready) return;
    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      await video.play();
      setNotice("");
    } catch (failure) {
      // Pausing or replacing a file can interrupt a pending play request.
      if (failure instanceof DOMException && failure.name === "AbortError") return;
      setNotice("Playback couldn’t start. Try again or choose another browser-supported video.");
    }
  }

  function updateDuration(mediaDuration: number) {
    setDuration(Number.isFinite(mediaDuration) ? mediaDuration : 0);
  }

  function seekTo(seconds: number) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }

  function toggleMute() {
    if (volume === 0) {
      setVolume(DEFAULT_VOLUME);
      setMuted(false);
    } else {
      setMuted(!muted);
    }
  }

  // Fullscreen the canvas so the controls and settings stay with the video.
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

  const displayedVolume = muted ? 0 : volume;
  const silent = displayedVolume === 0;
  const brightnessFilter = preferences.brightness === 100 ? undefined : `brightness(${preferences.brightness}%)`;
  const playable = Boolean(source && ready && !error);

  return <section id="watch-screen" aria-label="Local video player" tabIndex={-1} className="room-player scroll-mt-4 rounded-2xl">
    <input ref={inputRef} type="file" accept="video/*,.mkv,.m4v" className="sr-only" tabIndex={-1} aria-label="Choose a local video file" onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = ""; }} />
    <div ref={canvasRef} className={`room-canvas room-panel overflow-hidden transition-colors ${dragging ? "border-room-accent ring-2 ring-room-accent/25" : ""}`}
      onDragEnter={event => {
        event.preventDefault();
        dragDepth.current++;
        setDragging(true);
      }}
      onDragOver={event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={event => {
        event.preventDefault();
        dragDepth.current--;
        if (dragDepth.current <= 0) setDragging(false);
      }}
      onDrop={onDrop}>
      <div className="room-video-slot">
        <div className="room-video-stage relative flex aspect-video items-center justify-center overflow-hidden bg-room-canvas">
          {/* Room synchronization can consume media events here. The file URL stays on this device. */}
          {source && <video
            key={source.url}
            ref={videoRef}
            src={source.url}
            loop={preferences.loop}
            style={{ filter: brightnessFilter }}
            playsInline
            preload="metadata"
            aria-label={`Local video: ${source.name}`}
            className="h-full w-full object-contain"
            onLoadedMetadata={event => {
              updateDuration(event.currentTarget.duration);
              setReady(true);
            }}
            onDurationChange={event => updateDuration(event.currentTarget.duration)}
            onCanPlay={() => setReady(true)}
            onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => {
              setError("This browser can’t play this video. Try an MP4 (H.264) or WebM file.");
              setReady(false);
              setPlaying(false);
            }}
          />}
          {!source && <div className="flex flex-col items-center gap-3">
            <RoomIcon name="film" className="h-8 w-8 text-room-accent" />
            <button type="button" className="room-button-primary" onClick={() => inputRef.current?.click()}>Choose Video</button>
          </div>}
          {source && !ready && !error && <div role="status" className="absolute inset-0 flex items-center justify-center bg-room-canvas/90 text-sm text-room-muted">Opening your local video…</div>}
          {error && <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-room-canvas/95 px-6 text-center"><RoomIcon name="info" className="h-7 w-7 text-room-accent" /><p role="alert" className="max-w-sm text-sm text-room-text">{error}</p><button type="button" className="room-button-primary" onClick={() => inputRef.current?.click()}>Choose another video</button></div>}
          {dragging && <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-room-accent bg-room-canvas/95"><div className="flex items-center gap-3 text-sm text-room-accent"><RoomIcon name="upload" /> Drop to open locally</div></div>}
        </div>
      </div>

      <div className="room-player-controls border-t border-room-border/70 px-3 pb-1 sm:px-4" role="group" aria-label="Playback controls">
        <div className="playback-layout">
          <div className="playback-transport">
            <IconButton label={playing ? "Pause video" : "Play video"} disabled={!playable} onClick={togglePlay} className="text-room-text"><RoomIcon name={playing ? "pause" : "play"} className="h-[18px] w-[18px]" /></IconButton>
            <span className="whitespace-nowrap text-xs tabular-nums text-room-text">{formatTime(currentTime)}<span className="mx-1.5">/</span>{formatTime(duration)}</span>
          </div>
          <div className="playback-seek">
            <label htmlFor="video-timeline" className="sr-only">Video timeline</label>
            <input id="video-timeline" type="range" className="room-range w-full" min="0" max={duration || 1} step="0.1" value={currentTime} disabled={!playable || !duration} style={progressStyle(duration ? currentTime / duration * 100 : 0)} aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`} onChange={event => seekTo(Number(event.target.value))} />
          </div>
          <div className="playback-audio">
            <IconButton label="Mute video" title={silent ? "Unmute video" : "Mute video"} aria-pressed={silent} onClick={toggleMute}><RoomIcon name={silent ? "muted" : "volume"} className="h-[18px] w-[18px]" /></IconButton>
            <label htmlFor="video-volume" className="sr-only">Video volume</label>
            <input id="video-volume" type="range" min="0" max="1" step="0.01" value={displayedVolume} className="room-range w-12 sm:w-16" style={progressStyle(displayedVolume * 100)} aria-valuetext={`${Math.round(displayedVolume * 100)} percent`} onChange={(event) => { setVolume(Number(event.target.value)); setMuted(false); }} />
          </div>
          <div className="playback-view">
            <IconButton label="Theater view" title={theater ? "Exit theater view" : "Theater view"} aria-pressed={theater} onClick={onToggleTheater}><svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" /></svg></IconButton>
            {active && <PlayerSettings key={source?.url} value={preferences} disabled={!playable} onChange={setPreferences} />}
            <IconButton label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={toggleFullscreen}><RoomIcon name={fullscreen ? "minimize" : "fullscreen"} className="h-[18px] w-[18px]" /></IconButton>
          </div>
        </div>
      </div>
      {notice && <p role="status" className="border-t border-room-border px-4 py-2 text-sm text-room-accent">{notice}</p>}
    </div>
    {source && <div className="flex min-w-0 items-center justify-between gap-2 border-b border-room-border text-xs">
      <p className="min-w-0 truncate text-room-muted" title={source.name}>{source.name} · Local file</p>
      <button type="button" className="room-control shrink-0 px-2" onClick={() => inputRef.current?.click()}>Change video</button>
    </div>}
  </section>;
}
