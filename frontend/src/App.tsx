import { useEffect, useLayoutEffect, useRef, useState } from "react";
import MeetHome from "./components/MeetHome";
import WatchRoom from "./components/WatchRoom";
import SignUp from "./components/Auth";
import Guide from "./components/Guide";
import type { AuthUser } from "./api/auth";

type Page = "home" | "watch-room" | "sign-up" | "login";
type Route = { page: Page; guide: boolean };

const pageDetails = {
  home: { mainId: "home-main", title: "Home" },
  "watch-room": { mainId: "room-main", title: "Watch room" },
  "sign-up": { mainId: "signup-main", title: "Sign Up" },
  login: { mainId: "signup-main", title: "Log In" },
} satisfies Record<Page, { mainId: string; title: string }>;

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
  // The API returns a profile only. Reloading clears this in-memory account state.
  const [user, setUser] = useState<AuthUser | null>(null);
  const previous = useRef(route);

  function handleAuthSuccess(user: AuthUser) {
    setUser(user);
    location.hash = "home";
  }

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
    const { mainId, title } = pageDetails[route.page];
    const name = route.guide ? "Guide" : title;
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
    return (
      <SignUp
        mode={route.page === "login" ? "login" : "signup"}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="watch-room min-h-dvh bg-room-base text-room-text">
      {/* Keep the originating screen mounted while Guide is open so Back restores its state. */}
      <div hidden={route.guide}>
        {route.page === "home" && (
          <MeetHome
            active={!route.guide}
            user={user}
            onGuide={openGuide}
            onEnter={() => { location.hash = "watch-room"; }}
            onLogout={() => setUser(null)}
          />
        )}
        {route.page === "watch-room" && <WatchRoom active={!route.guide} onGuide={openGuide} />}
      </div>
      {route.guide && <Guide onBack={closeGuide} />}
    </div>
  );
}
