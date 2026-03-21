import DrawingPreloader from "./pages/components/drawingPreloader/DrawingPreloader";
import useOverlayStore from "./utils/store";
import LandingRevamp from "./pages/landingRevamp/LandingRevamp";
import BreadCrumb from "./pages/components/breadCrumb/BreadCrumb";
import { useContext } from "react";
import { navContext } from "./App";

export default function Homepage({
  goToPage,
}: {
  goToPage: (path: string) => void;
}) {
  const { playMusic } = useContext(navContext);
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

  return (
    <div>
      <BreadCrumb data={breadcrumbJsonLd} />
      {!removeGif && (
        <DrawingPreloader onEnter={() => playMusic?.()} />
      )}
      <LandingRevamp goToPage={goToPage} />
    </div>
  );
}
