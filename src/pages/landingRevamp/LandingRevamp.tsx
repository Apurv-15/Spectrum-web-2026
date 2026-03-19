import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./LandingRevamp.module.scss";

import Navbar from "../components/navbar/Navbar";
import MainHam from "../components/mainHam/mainHam";
import AboutUs from "../aboutus/AboutUs";
import { useMainHamStore } from "../../utils/store";
import useOverlayStore from "../../utils/store";

import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";

const FRAME_COUNT = 240;
const FRAME_START = 1;

// Path to images in public directory
const getFramePath = (index: number) => {
  const paddedIndex = index.toString().padStart(3, "0");
  return `/images/New_images_gdg/Landing_page/ezgif-frame-${paddedIndex}.jpg`;
};

export default function LandingRevamp({
  goToPage,
  onToggle,
  audioRef,
}: {
  goToPage: (path: string) => void;
  onToggle: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef<number>(FRAME_START);
  const lenisRef = useRef<Lenis | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);


  const isMainHamOpen = useMainHamStore((state) => state.isMainHamOpen);
  const setIsMainHamOpen = useMainHamStore((state) => state.setMainHamOpen);

  const overlayIsActive = useOverlayStore((state) => state.isActive);
  const removeGif = useOverlayStore((state) => state.removeGif);
  const setRemoveGif = useOverlayStore((state) => state.setRemoveGif);
  const setLandingReady = useOverlayStore((state) => state.setLandingReady);

  const [styleTag, setstyleTag] = useState([
    audioRef.current?.paused ? styles.soundLine2 : styles.soundLine,
    styles.soundCross2,
  ]);

  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = imagesRef.current[index];

    if (ctx && img && img.complete) {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculate aspect ratio for "cover" effect
      const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
      const x = (canvasWidth - img.width * scale) / 2;
      const y = (canvasHeight - img.height * scale) / 2;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  }, []);

  // Initialize Lenis
  useEffect(() => {
    lenisRef.current = new Lenis({
      duration: 2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.1,
    });

    const raf = (time: number) => {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  const updateFrame = useCallback(() => {
    if (!lenisRef.current || !scrollSectionRef.current) return;

    const scrollTop = lenisRef.current.scroll || 0;
    const sectionHeight = scrollSectionRef.current.offsetHeight;
    const maxScroll = sectionHeight - window.innerHeight;

    const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));

    const frameIndex = Math.min(
      FRAME_COUNT,
      Math.max(FRAME_START, Math.round(scrollFraction * (FRAME_COUNT - FRAME_START)) + FRAME_START)
    );

    if (frameRef.current !== frameIndex) {
      frameRef.current = frameIndex;
      renderFrame(frameIndex);
    }
  }, [renderFrame]);

  // Sync frame updates with Lenis
  useEffect(() => {
    if (!lenisRef.current) return;

    const handleScroll = () => {
      updateFrame();
    };

    lenisRef.current.on("scroll", handleScroll);
    return () => {
      lenisRef.current?.off("scroll", handleScroll);
    };
  }, [updateFrame]);



  // Preload frames
  useEffect(() => {
    let isCancelled = false;

    const preloadFrames = async () => {
      let loaded = 0;
      for (let i = FRAME_START; i <= FRAME_COUNT; i++) {
        if (isCancelled) break;

        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          if (!isCancelled) {
            imagesRef.current[i] = img;
            loaded++;
            setImagesLoaded(loaded);
            if (loaded % 20 === 0 || loaded === FRAME_COUNT) {
              console.log(`LandingRevamp: Loaded ${loaded}/${FRAME_COUNT} frames`);
            }
            if (loaded === FRAME_COUNT) {
              console.log("LandingRevamp: ALL FRAMES LOADED - SETTING READY");
              setLandingReady(true);
            }
            if (i === FRAME_START) renderFrame(FRAME_START);
          }
        };
        img.onerror = () => {
          if (!isCancelled) {
            console.error(`LandingRevamp: Failed to load frame ${i}`);
            loaded++;
            setImagesLoaded(loaded);
            if (loaded === FRAME_COUNT) {
              console.log("LandingRevamp: ALL FRAMES (WITH ERRORS) PROCESSED - SETTING READY");
              setLandingReady(true);
            }
          }
        };
      }
    };

    preloadFrames();
    return () => { isCancelled = true; };
  }, [renderFrame]);

  // Handle Wheel/Trackpad for Auto Scroll
  useEffect(() => {
    let isAnimating = false;
    let animationTween: gsap.core.Tween | null = null;
    let wheelAccumulator = 0;
    const WHEEL_THRESHOLD = 30; // Lower threshold for trackpads

    const handleWheel = (e: WheelEvent) => {
      if (!lenisRef.current || imagesLoaded < FRAME_COUNT * 0.5) return;

      const currentScroll = lenisRef.current.scroll || 0;
      const maxScroll = scrollSectionRef.current?.offsetHeight ? scrollSectionRef.current.offsetHeight - window.innerHeight : 0;

      // Accumulate delta to detect intent
      wheelAccumulator += Math.abs(e.deltaY);

      // Auto scroll triggers if user is in the frame section
      if (currentScroll < maxScroll && wheelAccumulator > WHEEL_THRESHOLD) {
        const targetScroll = e.deltaY > 0 ? maxScroll : 0;

        // Check if we already are near the target
        if (Math.abs(currentScroll - targetScroll) < 50) return;

        // Handle interruption: if user scrolls back, kill the auto-animation
        if (animationTween && ((e.deltaY > 0 && animationTween.vars.scroll < currentScroll) || (e.deltaY < 0 && animationTween.vars.scroll > currentScroll))) {
          animationTween.kill();
          isAnimating = false;
          wheelAccumulator = 0;
        }

        if (!isAnimating) {
          isAnimating = true;
          const scrollProxy = { value: currentScroll };
          animationTween = gsap.to(scrollProxy, {
            value: targetScroll,
            duration: 5,
            ease: "power2.inOut",
            onUpdate: () => {
              lenisRef.current?.scrollTo(scrollProxy.value, { immediate: true });
              updateFrame();
            },
            onComplete: () => {
              isAnimating = false;
              animationTween = null;
              wheelAccumulator = 0;
            }
          });
        }
      }

      // Reset accumulator if no events for a while
      setTimeout(() => { wheelAccumulator = 0; }, 150);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (animationTween) animationTween.kill();
    };
  }, [imagesLoaded, updateFrame]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth * (window.devicePixelRatio || 1);
        canvasRef.current.height = window.innerHeight * (window.devicePixelRatio || 1);
        renderFrame(frameRef.current);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [renderFrame]);

  useEffect(() => {
    setstyleTag([
      audioRef.current?.paused ? styles.soundLine2 : styles.soundLine,
      styles.soundCross2,
    ]);
  }, [audioRef.current?.paused]);

  useEffect(() => {
    if (overlayIsActive) {
      setTimeout(() => {
        setRemoveGif();
      }, 3000);
    }
  }, [overlayIsActive, setRemoveGif]);

  useEffect(() => {
    if (removeGif) {
      // Unlock native scroll allowing the canvas to be scrolled
      document.body.style.overflow = "";
      document.body.style.height = "";
    }
    if (!removeGif) {
      // Force native scroll lock and reset scroll to top so the user starts exactly at frame 1
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
      document.body.style.height = "100svh";
    }

    // Cleanup exactly when component unmounts for safety
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [removeGif]);

  return (
    <div
      className={`${styles.wrapper} ${!removeGif ? styles.pointerNoneEvent : ""} ${overlayIsActive ? styles.mask : ""}`}
      style={{
        maskImage: removeGif ? "none" : undefined,
        WebkitMaskImage: removeGif ? "none" : undefined
      }}
    >
      <Navbar />

      {/* Scrollable container for pinning canvas */}
      <div className={styles.scrollSection} ref={scrollSectionRef}>
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} className={styles.mainCanvas} />
        </div>
      </div>

      {/* Social and Menu Overlays */}
      <div className={styles.contentOverlay}>
        <div
          className={
            isMainHamOpen
              ? `${styles.mainHamContainer} ${styles.mainHamOpen}`
              : styles.mainHamContainer
          }
        >
          <div onClick={() => setIsMainHamOpen(false)}></div>
          <div className={styles.showMainHam}>
            <MainHam goToPage={goToPage} />
          </div>
        </div>

        <div
          className={styles.sounds}
          onClick={() => {
            onToggle();
          }}
        >
          <span className={styleTag[0]}></span>
          <span className={styleTag[0]}></span>
          <span className={styleTag[0]}></span>
          <span className={styleTag[0]}></span>
          <span className={styleTag[0]}></span>
        </div>
      </div>

      {/* Footer / About Us Section */}
      <div className={styles.bottomContainer}>
        <div className={styles.aboutUsContainer}>
          <AboutUs isBackBtn={false} />
        </div>
      </div>
    </div>
  );
}
