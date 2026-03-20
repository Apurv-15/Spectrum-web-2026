import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./LandingRevamp.module.scss";

import Navbar from "../components/navbar/Navbar";
import MainHam from "../components/mainHam/mainHam";
import AboutUs from "../aboutus/AboutUs";
import { useMainHamStore } from "../../utils/store";
import useOverlayStore from "../../utils/store";

import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Sprite sheet configuration ───────────────────────────────────────────────
const TOTAL_FRAMES = 240;
const SPRITE_COUNT = 12;
const FRAMES_PER_SPRITE = 20; // frames per sprite sheet
const GRID_COLS = 4;

// Desktop dimensions
const DESKTOP_W = 1024;
const DESKTOP_H = 576;

// Mobile dimensions (downscaled for performance)
const MOBILE_W = 540;
const MOBILE_H = 960;

const getSpritePath = (i: number, isMobile: boolean) =>
  isMobile
    ? `/images/New_images_gdg/mobile_sheets/sprite_${i}.webp`
    : `/images/New_images_gdg/sprite_${i}.webp`;

// ─── Lerp helper ──────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function LandingRevamp({
  goToPage,
}: {
  goToPage: (path: string) => void;
}) {
  // ─── DOM refs ─────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollSectionRef = useRef<HTMLDivElement>(null);

  // ─── Animation state (all refs — zero React re-renders during animation) ──
  const bitmapsRef = useRef<ImageBitmap[][]>([]); // [spriteIndex][frameInSprite]
  const currentFrameRef = useRef(0);              // lerped current frame (float)
  const targetFrameRef = useRef(0);               // scroll-driven target frame
  const rafIdRef = useRef<number>(0);
  const isReadyRef = useRef(false);               // all bitmaps loaded
  const isMobileRef = useRef(false);

  // ─── Lenis & GSAP refs ────────────────────────────────────────────────────
  const lenisRef = useRef<Lenis | null>(null);

  // ─── React state (UI only) ────────────────────────────────────────────────
  const [allLoaded, setAllLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isMainHamOpen = useMainHamStore((s) => s.isMainHamOpen);
  const setIsMainHamOpen = useMainHamStore((s) => s.setMainHamOpen);
  const overlayIsActive = useOverlayStore((s) => s.isActive);
  const removeGif = useOverlayStore((s) => s.removeGif);
  const setRemoveGif = useOverlayStore((s) => s.setRemoveGif);
  const resetRemoveGif = useOverlayStore((s) => s.resetRemoveGif);
  const setLandingReady = useOverlayStore((s) => s.setLandingReady);

  const isReturningRef = useRef(false);
  
  useEffect(() => {
    // Check if we are returning via back navigation OR if we've already seen the intro in this session
    const hasSeenIntro = sessionStorage.getItem("introPlayed") === "true";
    if (hasSeenIntro) {
      isReturningRef.current = true;
    } else {
      // Reset removeGif on mount to allow re-playing the ink spread
      resetRemoveGif();
    }
  }, [resetRemoveGif]);

  // ─── Draw a single frame to canvas (pure function, no React deps) ─────────
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !isReadyRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fi = Math.round(Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex)));
    const spriteIdx = Math.floor(fi / FRAMES_PER_SPRITE);
    const frameInSprite = fi % FRAMES_PER_SPRITE;

    const bitmaps = bitmapsRef.current[spriteIdx];
    if (!bitmaps) return;

    const bitmap = bitmaps[frameInSprite];
    if (!bitmap) return;

    const isMobile = isMobileRef.current;
    const fw = isMobile ? MOBILE_W : DESKTOP_W;
    const fh = isMobile ? MOBILE_H : DESKTOP_H;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / fw, ch / fh);
    const dx = (cw - fw * scale) / 2;
    const dy = (ch - fh * scale) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(bitmap, dx, dy, fw * scale, fh * scale);
  };

  // ─── RAF animation loop ───────────────────────────────────────────────────
  useEffect(() => {
    let lastDrawnFrame = -1;

    const tick = () => {
      rafIdRef.current = requestAnimationFrame(tick);

      if (!isReadyRef.current) return;

      // Lerp toward target — slightly faster follow
      currentFrameRef.current = lerp(currentFrameRef.current, targetFrameRef.current, 0.2);

      const rounded = Math.round(currentFrameRef.current);
      if (rounded !== lastDrawnFrame) {
        lastDrawnFrame = rounded;
        drawFrame(rounded);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Resize handler ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      drawFrame(Math.round(currentFrameRef.current));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bitMapCache = useOverlayStore((state) => state.bitMapCache);
  const setBitMapCache = useOverlayStore((state) => state.setBitMapCache);

  const loadingStartedRef = useRef(false);

  // ─── Preload all sprites → createImageBitmap ─────────────────────────────
  useEffect(() => {
    if (loadingStartedRef.current) return;
    loadingStartedRef.current = true;

    // Check Cache first!
    if (bitMapCache) {
      console.log("LandingRevamp: Using cached bitmaps");
      bitmapsRef.current = bitMapCache;
      isReadyRef.current = true;
      setAllLoaded(true);
      setLandingReady(true);
      
      // Force layout refresh for ScrollTrigger
      setTimeout(() => {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => drawFrame(targetFrameRef.current));
        handleScroll();
      }, 50);
      return;
    }

    let cancelled = false;

    const loadAll = async () => {
      try {
        const isMobile = window.innerWidth < 768;
        isMobileRef.current = isMobile;
        const fw = isMobile ? MOBILE_W : DESKTOP_W;
        const fh = isMobile ? MOBILE_H : DESKTOP_H;

        for (let si = 0; si < SPRITE_COUNT; si++) {
          if (cancelled) return;

          // Fetch with cache policy to hit preloader cache
          const resp = await fetch(getSpritePath(si + 1, isMobile), { cache: 'force-cache' });
          if (!resp.ok) throw new Error(`HTTP ${resp.status} for sprite ${si + 1}`);
          const blob = await resp.blob();
          if (cancelled) return;

          // Slice into individual frame bitmaps
          const sheetBitmap = await createImageBitmap(blob);
          if (cancelled) { sheetBitmap.close(); return; }

          const frames: ImageBitmap[] = [];
          for (let fi = 0; fi < FRAMES_PER_SPRITE; fi++) {
            const col = fi % GRID_COLS;
            const row = Math.floor(fi / GRID_COLS);
            const bm = await createImageBitmap(
              sheetBitmap,
              col * fw,
              row * fh,
              fw,
              fh,
              { colorSpaceConversion: 'none' }
            );
            frames.push(bm);
          }
          sheetBitmap.close();

          bitmapsRef.current[si] = frames;
          console.log(`LandingRevamp: bitmap sprite ${si + 1}/${SPRITE_COUNT} (${isMobile ? 'mobile' : 'desktop'}) ready`);
        }

        if (!cancelled) {
          console.log("LandingRevamp: ALL BITMAPS READY");
          isReadyRef.current = true; // Set ready only after ALL are decoded
          setBitMapCache([...bitmapsRef.current]); // Save to global cache
          setAllLoaded(true);
          setLandingReady(true);
          
          // Force layout refresh for ScrollTrigger
          setTimeout(() => {
            ScrollTrigger.refresh();
            // Initial draw with a micro-delay to ensure canvas ref is stable
            requestAnimationFrame(() => drawFrame(targetFrameRef.current));
            // Run an initial scroll check to sync UI states
            handleScroll();
          }, 50);
        }
      } catch (err) {
        console.error("LandingRevamp: bitmap load error", err);
        if (!cancelled) {
          setAllLoaded(true);
          setLandingReady(true);
        }
      }
    };

    loadAll();

    return () => {
      cancelled = true;
      loadingStartedRef.current = false;
    };
  }, [setLandingReady, setBitMapCache, bitMapCache]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Lenis smooth scroll ──────────────────────────────────────────────────
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

    return () => lenisRef.current?.destroy();
  }, []);

  // ─── Shared scroll handler ───────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const section = scrollSectionRef.current;
    if (!section) return;

    const scrollTop = window.scrollY;
    const maxScroll = section.offsetHeight - window.innerHeight;
    const fraction = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

    // Map animation to first 90% of scroll
    const animationFraction = Math.min(1, fraction / 0.9);
    targetFrameRef.current = animationFraction * (TOTAL_FRAMES - 1);

    // Trigger MainHam visibility based on scroll (last 10%)
    if (fraction > 0.92) {
      if (!isMainHamOpen) {
        setIsMainHamOpen(true);
        sessionStorage.setItem("introPlayed", "true");
      }
    } else if (fraction < 0.85) {
      if (isMainHamOpen) setIsMainHamOpen(false);
    }

    // Scroll indicator visibility (UI state update — low frequency)
    setIsScrolled(fraction > 0.05 && fraction < 0.95);
  }, [isMainHamOpen, setIsMainHamOpen]);

  // ─── Passive scroll listener ──────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Handle scroll to bottom when returning
  useEffect(() => {
    if (isReturningRef.current && allLoaded) {
      const section = scrollSectionRef.current;
      if (section) {
        // Wait longer than the 50ms ScrollTrigger refresh to avoid race conditions
        const timer = setTimeout(() => {
          const maxScroll = section.offsetHeight - window.innerHeight;
          
          // Force immediate scroll
          window.scrollTo(0, maxScroll);
          if (lenisRef.current) {
            lenisRef.current.scrollTo(maxScroll, { immediate: true });
          }

          // Let the browser register the new scroll position before syncing state
          requestAnimationFrame(() => {
            targetFrameRef.current = TOTAL_FRAMES - 1;
            currentFrameRef.current = TOTAL_FRAMES - 1;
            setIsMainHamOpen(true);
            
            handleScroll(); // Now handleScroll will correctly read the max scroll Y
            drawFrame(TOTAL_FRAMES - 1);
            
            isReturningRef.current = false;
          });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [allLoaded, setIsMainHamOpen, handleScroll]);

  // ─── GSAP auto-scroll on wheel ────────────────────────────────────────────
  useEffect(() => {
    if (!allLoaded) return;

    let isAnimating = false;
    let animationTween: gsap.core.Tween | null = null;
    let wheelAccumulator = 0;
    const WHEEL_THRESHOLD = 10;

    const handleWheel = (e: WheelEvent) => {
      if (!lenisRef.current) return;

      const currentScroll = lenisRef.current.scroll || 0;
      const maxScroll = scrollSectionRef.current
        ? scrollSectionRef.current.offsetHeight - window.innerHeight
        : 0;

      wheelAccumulator += Math.abs(e.deltaY);

      if (currentScroll < maxScroll && wheelAccumulator > WHEEL_THRESHOLD) {
        const targetScroll = e.deltaY > 0 ? maxScroll : 0;
        if (Math.abs(currentScroll - targetScroll) < 50) return;

        if (
          animationTween &&
          ((e.deltaY > 0 && (animationTween.vars as any).scroll < currentScroll) ||
            (e.deltaY < 0 && (animationTween.vars as any).scroll > currentScroll))
        ) {
          animationTween.kill();
          isAnimating = false;
          wheelAccumulator = 0;
        }

        if (!isAnimating) {
          isAnimating = true;
          const proxy = { value: currentScroll };
          animationTween = gsap.to(proxy, {
            value: targetScroll,
            duration: 9, // Slightly faster for responsiveness
            ease: "power1.inOut", // Less slow start than power2
            onUpdate: () => {
              lenisRef.current?.scrollTo(proxy.value, { immediate: true });
            },
            onComplete: () => {
              isAnimating = false;
              animationTween = null;
              wheelAccumulator = 0;
            },
          });
        }
      }

      setTimeout(() => { wheelAccumulator = 0; }, 150);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      animationTween?.kill();
    };
  }, [allLoaded]);

  // ─── Body scroll lock ─────────────────────────────────────────────────────
  useEffect(() => {
    if (removeGif) {
      document.body.style.overflow = "";
      document.body.style.height = "";
    } else {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
      document.body.style.height = "100svh";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [removeGif]);

  // ─── Overlay transition ───────────────────────────────────────────────────
  const transitionStartedRef = useRef(false);
  useEffect(() => {
    if (overlayIsActive && !transitionStartedRef.current && !removeGif) {
      transitionStartedRef.current = true;
      setTimeout(() => setRemoveGif(), 1500); // Prevent loop
    }
  }, [overlayIsActive, removeGif, setRemoveGif]);
  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`${styles.wrapper} ${overlayIsActive && !removeGif ? styles.mask : ""}`}
      style={{
        maskImage: removeGif ? "none" : undefined,
        WebkitMaskImage: removeGif ? "none" : undefined,
      }}
    >
      <Navbar />

      {/* Scroll section house the sticky animation */}
      <div className={styles.scrollSection} ref={scrollSectionRef}>
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} className={`${styles.mainCanvas} ${allLoaded ? styles.visible : ""}`} />
        </div>
      </div>

      {/* Cloud Menu Section - appears after animation */}
      <div className={`${styles.menuSection} ${isMainHamOpen ? styles.revealed : ""}`}>
        <MainHam goToPage={goToPage} />
      </div>

      {/* Static Overlays (Scroll Indicator) */}
      <div className={styles.contentOverlay}>
        <div className={`${styles.scrollIndicator} ${isScrolled || !removeGif ? styles.hidden : ""}`}>
          <div className={styles.mouse}>
            <div className={styles.wheel}></div>
          </div>
          <span className={styles.scrollText}>Scroll Down</span>
        </div>
      </div>

      {/* About Us Section */}
      <div className={styles.bottomContainer}>
        <AboutUs isBackBtn={false} />
      </div>
    </div>
  );
}
