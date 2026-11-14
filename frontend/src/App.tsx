import { useEffect, useRef, useState } from "react";
import MeetHome from "./components/MeetHome";
import WatchRoom from "./components/WatchRoom";

export default function App() {
  const [view, setView] = useState(() => window.location.hash === "#watch-room" ? "room" : "home");
  const previousView = useRef(view);

  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    const destination = document.querySelector<HTMLElement>(
      view === "room" ? "#room-main" : "#home-main"
    );
    destination?.focus({ preventScroll: true });
  }, [view]);

  useEffect(() => {
    const updateView = () => setView(window.location.hash === "#watch-room" ? "room" : "home");
    window.addEventListener("hashchange", updateView);
    return () => window.removeEventListener("hashchange", updateView);
  }, []);

  function navigate(next: "home" | "room") {
    window.location.hash = next === "room" ? "watch-room" : "home";
    setView(next);
    window.scrollTo(0, 0);
  }

  if (view === "room") return <WatchRoom onLeave={() => navigate("home")} />;

  return <MeetHome onPreviewWatchRoom={() => navigate("room")} />;
}
