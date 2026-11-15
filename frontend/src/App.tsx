import { useEffect, useRef, useState } from "react";
import MeetHome from "./components/MeetHome";
import WatchRoom from "./components/WatchRoom";
import SignUp from "./components/SignUp"; // Ensure you import your new component

type ViewState = "home" | "room" | "signup";

const getViewFromHash = (): ViewState => {
  const hash = window.location.hash;
  if (hash === "#watch-room") return "room";
  if (hash === "#sign-up") return "signup";
  return "home";
};

export default function App() {
  const [view, setView] = useState<ViewState>(getViewFromHash);
  const previousView = useRef(view);

  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    
    let selector = "#home-main";
    if (view === "room") selector = "#room-main";
    if (view === "signup") selector = "#signup-main";

    const destination = document.querySelector<HTMLElement>(selector);
    destination?.focus({ preventScroll: true });
  }, [view]);

  useEffect(() => {
    const updateView = () => setView(getViewFromHash());
    window.addEventListener("hashchange", updateView);
    return () => window.removeEventListener("hashchange", updateView);
  }, []);

  function navigate(next: ViewState) {
    if (next === "room") window.location.hash = "watch-room";
    else if (next === "signup") window.location.hash = "sign-up";
    else window.location.hash = "home";
    
    setView(next);
    window.scrollTo(0, 0);
  }

  if (view === "room") return <WatchRoom onLeave={() => navigate("home")} />;
  if (view === "signup") return <SignUp />; 

  return (
    <MeetHome 
      onPreviewWatchRoom={() => navigate("room")} 
      onNavigateSignUp={() => navigate("signup")} 
    />
  );
}
