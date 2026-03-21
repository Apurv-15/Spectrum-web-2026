import { useEffect, useRef, useState, useCallback, lazy, Suspense } from "react";
import styles from "./LandingRevamp.module.scss";

import { useMainHamStore } from "../../utils/store";
import useOverlayStore from "../../utils/store";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Navbar = lazy(() => import("../components/navbar/Navbar"));
const MainHam = lazy(() => import("../components/mainHam/mainHam"));
const AboutUs = lazy(() => import("../aboutus/AboutUs"));

gsap.registerPlugin(ScrollTrigger);

// ─── Sprite sheet configuration ───────────────────────────────────────────────
const TOTAL_FRAMES = 240;
const SPRITE_COUNT = 12;
const FRAMES_PER_SPRITE = 20; // frames per sprite sheet
const GRID_COLS = 4;

const DESKTOP_W = 1024;
const DESKTOP_H = 576;
const MOBILE_W = 540;
const MOBILE_H = 960;

const getSpritePath = (i: number, isMobile: boolean) =>
  isMobile
    ? `/images/New_images_gdg/mobile_sheets/sprite_${i}.webp`
    : `/images/New_images_gdg/sprite_${i}.webp`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── Module-level cache & lock (survives component remounts) ──────────────
let globalLoadPromise: Promise<void> | null = null;

export default function LandingRevamp({
  goToPage,
}: {
  goToPage: (path: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const bitmapsRef = useRef<ImageBitmap[][]>([]); 
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef<number>(0);
  const isReadyRef = useRef(false);
  const isMobileRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);

  const [allLoaded, setAllLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isMainHamOpen = useMainHamStore((s) => s.isMainHamOpen);
  const setIsMainHamOpen = useMainHamStore((s) => s.setMainHamOpen);

  const bitMapCache = useOverlayStore((s) => s.bitMapCache);
  const cacheType = useOverlayStore((s) => s.cacheType);
  const setLandingReady = useOverlayStore((s) => s.setLandingReady);
  const setSpritesLoaded = useOverlayStore((s) => s.setSpritesLoaded);
  const overlayIsActive = useOverlayStore((s) => s.isActive);
  const removeGif = useOverlayStore((s) => s.removeGif);
  const setRemoveGif = useOverlayStore((s) => s.setRemoveGif);
  const resetRemoveGif = useOverlayStore((s) => s.resetRemoveGif);

  const isReturningRef = useRef(false);
  
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("introPlayed") === "true";
    if (hasSeenIntro) {
      isReturningRef.current = true;
    } else {
      resetRemoveGif();
    }
  }, [resetRemoveGif]);

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
    
    const coverScale = Math.max(cw / fw, ch / fh);
    const containScale = Math.min(cw / fw, ch / fh);

    // Smoothly transition from cover to contain in the last frames (sprite sheet 12)
    let scale = coverScale;
    const transitionStart = 180; 
    const transitionEnd = 210;   
    
    if (fi > transitionStart) {
      const t = Math.min(1, (fi - transitionStart) / (transitionEnd - transitionStart));
      // Apply smooth transition
      scale = lerp(coverScale, containScale, t);
    }

    const dx = (cw - fw * scale) / 2;
    const dy = (ch - fh * scale) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(bitmap, dx, dy, fw * scale, fh * scale);
  };

  const handleScroll = useCallback(() => {
    const section = scrollSectionRef.current;
    if (!section) return;
    const scrollTop = window.scrollY;
    const maxScroll = section.offsetHeight - window.innerHeight;
    const fraction = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    const animationFraction = Math.min(1, fraction / 0.9);
    targetFrameRef.current = animationFraction * (TOTAL_FRAMES - 1);

    if (fraction > 0.92) {
      if (!isMainHamOpen) {
        setIsMainHamOpen(true);
        sessionStorage.setItem("introPlayed", "true");
      }
    } else if (fraction < 0.85) {
      if (isMainHamOpen) setIsMainHamOpen(false);
    }
    setIsScrolled(fraction > 0.05 && fraction < 0.95);
  }, [isMainHamOpen, setIsMainHamOpen]);

  // ─── Preload all sprites (Robust Singleton) ─────────────────────────────
  useEffect(() => {
    const isMobile = window.innerWidth < 1024 || (navigator.maxTouchPoints > 0 && window.innerWidth < 1366);
    const currentType = isMobile ? 'mobile' : 'desktop';

    // 1. Invalidate Global Promise if the environment changed (resize)
    if (globalLoadPromise && cacheType && cacheType !== currentType) {
      globalLoadPromise = null; 
      isReadyRef.current = false;
    }

    // 2. Local already loaded & correct type?
    if (isReadyRef.current && cacheType === currentType) return;

    // 3. Check Store Cache
    if (bitMapCache && bitMapCache.length === SPRITE_COUNT && cacheType === currentType) {
      bitmapsRef.current = bitMapCache;
      isReadyRef.current = true;
      setAllLoaded(true);
      setLandingReady(true);
      setSpritesLoaded(SPRITE_COUNT);
      setTimeout(() => {
        ScrollTrigger.refresh();
        handleScroll();
        drawFrame(targetFrameRef.current);
      }, 50);
      return;
    }

    // 4. Start/Join Global Promise
    if (!globalLoadPromise) {
      globalLoadPromise = (async () => {
        try {
          // Update ref for drawFrame to use correct dimensions
          isMobileRef.current = isMobile; 
          const fw = isMobile ? MOBILE_W : DESKTOP_W;
          const fh = isMobile ? MOBILE_H : DESKTOP_H;

          // Sequential fetch and decode to save memory on mobile/tablets
          const newBitmaps: ImageBitmap[][] = [];
          for (let si = 0; si < SPRITE_COUNT; si++) {
            const response = await fetch(getSpritePath(si + 1, isMobile), { cache: 'force-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            const sheetBitmap = await createImageBitmap(blob);
            
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
            newBitmaps[si] = frames;
            // Update store progress for preloader
            useOverlayStore.getState().setSpritesLoaded(si + 1);
            
            // Brief pause to keep main thread responsive during load
            await new Promise(r => setTimeout(r, 0));
          }

          useOverlayStore.getState().setBitMapCache(newBitmaps, currentType);
          useOverlayStore.getState().setLandingReady(true);
        } catch (err) {
          console.error("LandingRevamp: global load error", err);
          globalLoadPromise = null;
        }
      })();
    }

    // 4. Component instance sync
    let cancelled = false;
    globalLoadPromise.then(() => {
      if (cancelled) return;
      const latest = useOverlayStore.getState().bitMapCache;
      if (latest && latest.length === SPRITE_COUNT) {
        bitmapsRef.current = latest;
        isReadyRef.current = true;
        setAllLoaded(true);
        setTimeout(() => {
          ScrollTrigger.refresh();
          drawFrame(targetFrameRef.current);
          handleScroll();
        }, 100);
      }
    });

    return () => { cancelled = true; };
  }, [bitMapCache, setAllLoaded, setLandingReady, setSpritesLoaded, handleScroll]);

  useEffect(() => {
    let lastDrawnFrame = -1;
    const tick = () => {
      rafIdRef.current = requestAnimationFrame(tick);
      if (!isReadyRef.current) return;
      currentFrameRef.current = lerp(currentFrameRef.current, targetFrameRef.current, 0.2);
      const rounded = Math.round(currentFrameRef.current);
      if (rounded !== lastDrawnFrame) {
        lastDrawnFrame = rounded;
        drawFrame(rounded);
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for memory safety on high-res iPads
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      drawFrame(Math.round(currentFrameRef.current));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    lenisRef.current = new Lenis({
      duration: 2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isReturningRef.current && allLoaded) {
      const section = scrollSectionRef.current;
      if (section) {
        const timer = setTimeout(() => {
          const maxScroll = section.offsetHeight - window.innerHeight;
          window.scrollTo(0, maxScroll);
          if (lenisRef.current) lenisRef.current.scrollTo(maxScroll, { immediate: true });
          requestAnimationFrame(() => {
            targetFrameRef.current = TOTAL_FRAMES - 1;
            currentFrameRef.current = TOTAL_FRAMES - 1;
            setIsMainHamOpen(true);
            handleScroll();
            drawFrame(TOTAL_FRAMES - 1);
            isReturningRef.current = false;
          });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [allLoaded, setIsMainHamOpen, handleScroll]);

  useEffect(() => {
    if (!allLoaded) return;
    let isAnimating = false;
    let animationTween: gsap.core.Tween | null = null;
    let wheelAccumulator = 0;
    const WHEEL_THRESHOLD = 10;
    const handleWheel = (e: WheelEvent) => {
      if (!lenisRef.current) return;
      const currentScroll = lenisRef.current.scroll || 0;
      const maxScroll = scrollSectionRef.current ? scrollSectionRef.current.offsetHeight - window.innerHeight : 0;
      wheelAccumulator += Math.abs(e.deltaY);
      if (currentScroll < maxScroll && wheelAccumulator > WHEEL_THRESHOLD) {
        const targetScroll = e.deltaY > 0 ? maxScroll : 0;
        if (Math.abs(currentScroll - targetScroll) < 50) return;
        if (animationTween && ((e.deltaY > 0 && (animationTween.vars as any).scroll < currentScroll) || (e.deltaY < 0 && (animationTween.vars as any).scroll > currentScroll))) {
          animationTween.kill();
          isAnimating = false;
          wheelAccumulator = 0;
        }
        if (!isAnimating) {
          isAnimating = true;
          const proxy = { value: currentScroll };
          animationTween = gsap.to(proxy, {
            value: targetScroll,
            duration: 9,
            ease: "power1.inOut",
            onUpdate: () => { lenisRef.current?.scrollTo(proxy.value, { immediate: true }); },
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

  const transitionStartedRef = useRef(false);
  useEffect(() => {
    if (overlayIsActive && !transitionStartedRef.current && !removeGif) {
      transitionStartedRef.current = true;
      setTimeout(() => setRemoveGif(), 1500);
    }
  }, [overlayIsActive, removeGif, setRemoveGif]);

  return (
    <div
      className={`${styles.wrapper} ${overlayIsActive && !removeGif ? styles.mask : ""}`}
      style={{
        maskImage: removeGif ? "none" : undefined,
        WebkitMaskImage: removeGif ? "none" : undefined,
      }}
    >
      <Navbar />
      <div className={styles.scrollSection} ref={scrollSectionRef}>
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} className={`${styles.mainCanvas} ${allLoaded ? styles.visible : ""}`} />
        </div>
      </div>
      <div className={`${styles.menuSection} ${isMainHamOpen ? styles.revealed : ""}`}>
        <Suspense fallback={null}>
          <MainHam goToPage={goToPage} />
        </Suspense>
      </div>
      <div className={styles.contentOverlay}>
        <div className={`${styles.scrollIndicator} ${isScrolled || !removeGif ? styles.hidden : ""}`}>
          <div className={styles.mouse}>
            <div className={styles.wheel}></div>
          </div>
          <span className={styles.scrollText}>Scroll Down</span>
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <Suspense fallback={null}>
          <AboutUs isBackBtn={false} />
        </Suspense>
      </div>
    </div>
  );
}
