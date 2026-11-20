import { useEffect, useLayoutEffect, useRef, useState } from "react";
import MeetHome from "./components/MeetHome";
import WatchRoom from "./components/WatchRoom";
import SignUp from "./components/SignUp";
import Guide from "./components/Guide";

type Page = "home" | "watch-room" | "sign-up" | "login";
type Route = { page: Page; guide: boolean };

function isAccountPage(page: string) {
  return page === "login" || page === "sign-up";
}

function readRoute(): Route {
  const hash = location.hash.slice(1);
  const guide = hash === "guide";
  const page = guide ? history.state?.guideFrom : hash;
  return { page: page === "watch-room" || isAccountPage(page) ? page : "home", guide };
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const previous = useRef(route);
  useEffect(() => {
    const sync = () => setRoute(readRoute());
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  useLayoutEffect(() => {
    const last = previous.current;
    const mainId = { home: "home-main", "watch-room": "room-main", "sign-up": "signup-main", login: "signup-main" }[route.page];
    const name = route.guide ? "Guide" : { home: "Home", "watch-room": "Watch room", "sign-up": "Sign Up", login: "Log In" }[route.page];
    document.title = `${name} · Jiaxian Meet`;
    const switchingAuthMode = isAccountPage(last.page) && isAccountPage(route.page);
    if (last.guide !== route.guide || (last.page !== route.page && !switchingAuthMode)) {
      const returning = last.guide && !route.guide && last.page === route.page;
      const target = returning ? document.querySelector<HTMLElement>("[data-guide-link]") : null;
      if (!returning) window.scrollTo(0, 0);
      (target ?? document.getElementById(route.guide ? "guide-main" : mainId))?.focus({ preventScroll: true });
    }
    previous.current = route;
  }, [route]);

  function openGuide() {
    history.pushState({ guideFrom: route.page }, "", "#guide");
    setRoute(readRoute());
  }

  function closeGuide() {
    if (history.state?.guideFrom) history.back();
    else location.hash = "home";
  }

  if (!route.guide && isAccountPage(route.page)) {
    return <SignUp mode={route.page === "login" ? "login" : "signup"} />;
  }

  return <div className="watch-room min-h-dvh bg-room-base text-room-text">
    <div hidden={route.guide}>
      {route.page === "home" && <MeetHome active={!route.guide} onGuide={openGuide} onEnter={() => { location.hash = "watch-room"; }} />}
      {route.page === "watch-room" && <WatchRoom active={!route.guide} onGuide={openGuide} />}
    </div>
    {route.guide && <Guide onBack={closeGuide} />}
  </div>;
}
