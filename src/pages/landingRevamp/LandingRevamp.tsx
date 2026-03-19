import { useEffect, useRef, useState } from "react";
import styles from "./LandingRevamp.module.scss";

import Navbar from "../components/navbar/Navbar";
import MainHam from "../components/mainHam/mainHam";
import AboutUs from "../aboutus/AboutUs";
import { useMainHamStore } from "../../utils/store";
import useOverlayStore from "../../utils/store";

import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";

// ─── Sprite sheet configuration ───────────────────────────────────────────────
const TOTAL_FRAMES = 240;
const SPRITE_COUNT = 12;
const FRAMES_PER_SPRITE = 20; // frames per sprite sheet
const GRID_COLS = 4;
const GRID_ROWS = 5; // FRAMES_PER_SPRITE / GRID_COLS
const FRAME_W = 1024;
const FRAME_H = 576;

const getSpritePath = (i: number) => `/images/New_images_gdg/sprite_${i}.png`;

// ─── Lerp helper ──────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function LandingRevamp({
  goToPage,
  onToggle,
  audioRef,
}: {
  goToPage: (path: string) => void;
  onToggle: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
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
  const setLandingReady = useOverlayStore((s) => s.setLandingReady);

  const [styleTag, setStyleTag] = useState([
    audioRef.current?.paused ? styles.soundLine2 : styles.soundLine,
    styles.soundCross2,
  ]);

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

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
    const dx = (cw - FRAME_W * scale) / 2;
    const dy = (ch - FRAME_H * scale) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(bitmap, dx, dy, FRAME_W * scale, FRAME_H * scale);
  };

  // ─── RAF animation loop ───────────────────────────────────────────────────
  useEffect(() => {
    let lastDrawnFrame = -1;

    const tick = () => {
      rafIdRef.current = requestAnimationFrame(tick);

      if (!isReadyRef.current) return;

      // Lerp toward target — 0.12 gives an Apple-style silky feel
      currentFrameRef.current = lerp(currentFrameRef.current, targetFrameRef.current, 0.12);

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

  // ─── Preload all sprites → createImageBitmap ─────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      try {
        for (let si = 0; si < SPRITE_COUNT; si++) {
          if (cancelled) return;

          // Fetch the sprite PNG as a blob
          const resp = await fetch(getSpritePath(si + 1));
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
              col * FRAME_W,
              row * FRAME_H,
              FRAME_W,
              FRAME_H
            );
            frames.push(bm);
          }
          sheetBitmap.close(); // release the full sheet — we keep only per-frame bitmaps

          bitmapsRef.current[si] = frames;

          // Draw first frame as soon as sprite 0 is ready
          if (si === 0) {
            isReadyRef.current = true;
            targetFrameRef.current = 0;
            currentFrameRef.current = 0;
          }

          console.log(`LandingRevamp: bitmap sprite ${si + 1}/${SPRITE_COUNT} ready`);
        }

        if (!cancelled) {
          console.log("LandingRevamp: ALL BITMAPS READY");
          setAllLoaded(true);
          setLandingReady(true);
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
      // Free all GPU memory on unmount
      bitmapsRef.current.forEach((frames) => frames?.forEach((bm) => bm.close()));
      bitmapsRef.current = [];
      isReadyRef.current = false;
    };
  }, [setLandingReady]);

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

  // ─── Passive scroll listener → update targetFrame ─────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const section = scrollSectionRef.current;
      if (!section) return;

      const scrollTop = window.scrollY;
      const maxScroll = section.offsetHeight - window.innerHeight;
      const fraction = Math.min(1, Math.max(0, scrollTop / maxScroll));

      targetFrameRef.current = fraction * (TOTAL_FRAMES - 1);

      // Scroll indicator visibility (UI state update — low frequency)
      setIsScrolled(fraction > 0.05 && fraction < 0.95);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── GSAP auto-scroll on wheel ────────────────────────────────────────────
  useEffect(() => {
    if (!allLoaded) return;

    let isAnimating = false;
    let animationTween: gsap.core.Tween | null = null;
    let wheelAccumulator = 0;
    const WHEEL_THRESHOLD = 30;

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
            duration: 5,
            ease: "power2.inOut",
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
  useEffect(() => {
    if (overlayIsActive) {
      setTimeout(() => setRemoveGif(), 3000);
    }
  }, [overlayIsActive, setRemoveGif]);

  // ─── Sound icon sync ──────────────────────────────────────────────────────
  useEffect(() => {
    setStyleTag([
      audioRef.current?.paused ? styles.soundLine2 : styles.soundLine,
      styles.soundCross2,
    ]);
  }, [audioRef.current?.paused]);

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`${styles.wrapper} ${!removeGif ? styles.pointerNoneEvent : ""} ${overlayIsActive ? styles.mask : ""}`}
      style={{
        maskImage: removeGif ? "none" : undefined,
        WebkitMaskImage: removeGif ? "none" : undefined,
      }}
    >
      <Navbar />

      {/* Scroll section — long enough to cover all 240 frames */}
      <div className={styles.scrollSection} ref={scrollSectionRef}>
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} className={styles.mainCanvas} />
        </div>
      </div>

      {/* Overlays */}
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

        <div className={styles.sounds} onClick={onToggle}>
          <span className={styleTag[0]}></span>
          <span className={styleTag[0]}></span>
          <span className={styleTag[0]}></span>
          <span className={styleTag[0]}></span>
          <span className={styleTag[0]}></span>
        </div>

        <div className={`${styles.scrollIndicator} ${isScrolled || !removeGif ? styles.hidden : ""}`}>
          <div className={styles.mouse}>
            <div className={styles.wheel}></div>
          </div>
          <span className={styles.scrollText}>Scroll Down</span>
        </div>
      </div>

      {/* About Us */}
      <div className={styles.bottomContainer}>
        <div className={styles.aboutUsContainer}>
          <AboutUs isBackBtn={false} />
        </div>
      </div>
    </div>
  );
}
