import DrawingPreloader from "./pages/components/drawingPreloader/DrawingPreloader";
import useOverlayStore from "./utils/store";
import LandingRevamp from "./pages/landingRevamp/LandingRevamp";
import BreadCrumb from "./pages/components/breadCrumb/BreadCrumb";
import bgMusic from "/sounds/bg-music2.mp3";
import { useRef, useEffect } from "react";

export default function Homepage({
  goToPage,
}: {
  goToPage: (path: string) => void;
}) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://spectrumweek.gdgvitmumbai.com/",
      },
    ],
  };
  const removeGif = useOverlayStore((state) => state.removeGif);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Force scroll to top when user navigates back to home
    window.scrollTo(0, 0);
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };
  return (
    <div>
      <BreadCrumb data={breadcrumbJsonLd} />
      <div
        style={
          removeGif ? { display: "none" } : { zIndex: 1000, position: "relative" }
        }
      >
        <DrawingPreloader onEnter={playMusic} />
      </div>
      <audio
        src={bgMusic}
        loop
        ref={(el) => {
          audioRef.current = el;
          if (el) el.volume = 0.2;
        }}
      />
      <div
        style={{
          zIndex: 100,
          position: "relative",
          pointerEvents: "auto",
        }}
      >
        <LandingRevamp
          goToPage={goToPage}
          onToggle={toggleMusic}
          audioRef={audioRef}
        />
      </div>
    </div>
  );
}
