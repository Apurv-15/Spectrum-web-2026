import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, createContext } from "react";
import Homepage from "./Homepage";
import DoorTransition from "./pages/components/page-transition/DoorTransition";
import AboutUs from "./pages/aboutus/AboutUs";
import Events from "./pages/events/Events";
import HeavenlyStrike from "./pages/heavenlyStrike/HeavenlyStrike";
import AiAgents from "./pages/aiAgents/AiAgents";
import WayOfGhost from "./pages/wayOfGhost/WayOfGhost";
import Invasion from "./pages/invasion/Invasion";

export const navContext = createContext<{ goToPage?: (page: string) => void }>(
  {}
);

const pageList = [
  "home",
  "events",
  "events/heavenly-strike",
  "events/ai-agents",
  "events/way-of-ghost",
  "events/invasion",
  "about",
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const resolvePage = (pathname: string): string => {
    const path = pathname.replace(/^\//, "");
    if (path === "") return "home";
    if (pageList.includes(path)) return path;
    return "home";
  };

  const [currentPage, setCurrentPage] = useState<string>(
    resolvePage(location.pathname)
  );

  const [doorPhase, setDoorPhase] = useState<
    "idle" | "closing" | "waiting" | "opening"
  >("idle");

  const nextRoute = useRef<string | null>(null);

  useEffect(() => {
    setCurrentPage(resolvePage(location.pathname));
  }, [location.pathname]);

  const handleDoorsClosed = async () => {
    setDoorPhase("waiting");

    if (nextRoute.current) {
      navigate(nextRoute.current, { state: { startAnimation: true } });
    }

    setTimeout(() => {
      setDoorPhase("opening");
    }, 500);
  };

  const handleDoorsOpened = () => {
    setDoorPhase("idle");
    nextRoute.current = null;
  };

  const goToPage = (path: string) => {
    if (location.pathname !== path) {
      nextRoute.current = path;
      setDoorPhase("closing");
    }
  };

  return (
    <navContext.Provider value={{ goToPage }}>
      <DoorTransition
        phase={doorPhase}
        onClosed={handleDoorsClosed}
        onOpened={handleDoorsOpened}
        percentageLoaded={100}
        targetPageRef={nextRoute}
      />
      <h1 style={{ display: "none" }}>Spectrum Week 2026 | GDG VIT Mumbai</h1>

      {currentPage === "home" && <Homepage goToPage={goToPage} />}
      {currentPage === "events" && <Events />}
      {currentPage === "events/heavenly-strike" && <HeavenlyStrike />}
      {currentPage === "events/ai-agents" && <AiAgents />}
      {currentPage === "events/way-of-ghost" && <WayOfGhost />}
      {currentPage === "events/invasion" && <Invasion />}
      {currentPage === "about" && <AboutUs />}
    </navContext.Provider>
  );
}
