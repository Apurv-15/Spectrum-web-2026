import { useRef, useEffect, useState } from "react";
import styles from "./DrawingPreloader.module.scss";
import useOverlayStore from "../../../utils/store";

const baseImagesToPreload = [
  "/images/doors/Door1.webp",
  "/images/doors/Door2.webp",
  "/images/doors/Door3.webp",
  "/images/doors/Door4.webp",
  "/svgs/landing/hamClouds/cloud1.min.svg",
  "/svgs/landing/hamClouds/cloud2.min.svg",
  "/svgs/landing/hamClouds/cloud3.min.svg",
  "/svgs/landing/hamClouds/cloud4.min.svg",
  "/svgs/landing/hamClouds/cloud5.min.svg",
  "/svgs/landing/hamClouds/cloud6.min.svg",
  "/svgs/landing/moon1.svg",
  "/svgs/landing/moonHam.svg",
  "/images/landing/hamCloud.png",
  "/svgs/landing/hamBack.svg",
  "/svgs/landing/topRightDragon.svg",
  "/svgs/landing/heartIcon.svg",
];

export default function DrawingPreloader({
  onEnter,
}: {
  onEnter: () => void;
}) {
  const overlaySetActive = useOverlayStore((s) => s.setActive);
  const setRemoveGif = useOverlayStore((s) => s.setRemoveGif);
  const isLandingReady = useOverlayStore((s) => s.isLandingReady);
  const progress = useOverlayStore((s) => s.preloaderProgress);
  const setGlobalProgress = useOverlayStore((s) => s.setPreloaderProgress);

  const [showEnter, setShowEnter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasEnteredRef = useRef(false);
  const loadingStartedRef = useRef(false);

  // ─── Preload assets ──────────────────────────────────────────────────────
  useEffect(() => {
    if (loadingStartedRef.current) return;
    loadingStartedRef.current = true;

    if (progress >= 100) {
      setShowEnter(true);
      return;
    }

    const allImages = [...baseImagesToPreload];
    const isMobile = window.innerWidth < 768;
    const CONCURRENCY_LIMIT = isMobile ? 4 : 8;
    let imagesLoaded = 0;
    const totalAssets = allImages.length;

    const loadBatch = async (paths: string[]) => {
      for (let i = 0; i < paths.length; i += CONCURRENCY_LIMIT) {
        const batch = paths.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(
          batch.map(
            (src) =>
              new Promise<void>((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                  imagesLoaded++;
                  resolve();
                };
                img.onerror = () => {
                  imagesLoaded++;
                  resolve();
                };
              })
          )
        );
      }
    };

    loadBatch(allImages);

    let displayProgress = 0;
    const interval = setInterval(() => {
      const spritesLoaded = useOverlayStore.getState().spritesLoaded;
      const combinedLoaded = imagesLoaded + spritesLoaded;
      const totalCombinedAssets = totalAssets + 12;
      const realProgress =
        totalCombinedAssets > 0
          ? (combinedLoaded / totalCombinedAssets) * 100
          : 100;
      const currentReady = useOverlayStore.getState().isLandingReady;

      let target = realProgress;
      if (target >= 99 && !currentReady) target = 99;

      const jump = (target - displayProgress) * 0.25;
      if (jump > 0) displayProgress += jump;
      if (displayProgress >= 99.9) displayProgress = 100;

      setGlobalProgress(displayProgress);

      if (displayProgress >= 99.5 && currentReady) {
        clearInterval(interval);
        setTimeout(() => {
          setGlobalProgress(100);
          setTimeout(() => setShowEnter(true), 400);
        }, 200);
      }
    }, 32);

    return () => {
      clearInterval(interval);
      loadingStartedRef.current = false;
    };
  }, [setGlobalProgress, isLandingReady]);

  // ─── Enter handler ─────────────────────────────────────────────────────
  const handleEnter = () => {
    if (hasEnteredRef.current) return;
    hasEnteredRef.current = true;

    // Fade out video preloader
    if (containerRef.current) {
      containerRef.current.style.transition = "opacity 1.5s ease";
      containerRef.current.style.opacity = "0";
      containerRef.current.style.pointerEvents = "none";
    }

    onEnter();
    overlaySetActive();

    // Remove preloader from DOM after fade completes
    setTimeout(() => setRemoveGif(), 1500);
  };

  return (
    <div className={styles.videoPreloader} ref={containerRef}>
      <video
        autoPlay
        muted
        loop
        playsInline
        className={styles.bgVideo}
      >
        <source src="/videos/loading-intro.mp4" type="video/mp4" />
      </video>

      <div className={styles.overlay}>
        {/* Progress bar */}
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>

        {/* Enter button */}
        <div
          className={`${styles.enterWrap} ${showEnter ? styles.visible : ""}`}
        >
          <button className={styles.enterBtn} onClick={handleEnter}>
            Enter the World
          </button>
        </div>

        {/* Loading text */}
        {!showEnter && (
          <div className={styles.loadingText}>
            Loading {Math.round(progress)}%
          </div>
        )}
      </div>
    </div>
  );
}
