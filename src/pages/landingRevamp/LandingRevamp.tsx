import { useEffect, useRef, useState, useCallback, lazy, Suspense } from "react";
import styles from "./LandingRevamp.module.scss";
import { useMainHamStore } from "../../utils/store";
import useOverlayStore from "../../utils/store";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isTouchDevice } from "../../utils/debounce";

const Navbar = lazy(() => import("../components/navbar/Navbar"));
const MainHam = lazy(() => import("../components/mainHam/mainHam"));
const AboutUs = lazy(() => import("../aboutus/AboutUs"));

gsap.registerPlugin(ScrollTrigger);

// ─── Sprite sheet configuration ───────────────────────────────────────────────
const TOTAL_FRAMES = 240;
const SPRITE_COUNT = 12;
const FRAMES_PER_SPRITE = 20;
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

const TARGET_DATE = new Date("2026-04-01T00:00:00+05:30");

// ─── Module-level cache & lock ──────────────────────────────────────────────
let globalLoadPromise: Promise<void> | null = null;

export default function LandingRevamp({
  goToPage,
}: {
  goToPage: (path: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bitmapsRef = useRef<ImageBitmap[][]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafIdRef = useRef<number>(0);
  const isReadyRef = useRef(false);
  const isMobileRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Refs for GSAP scroll-triggered fade-outs
  const registerButtonRef = useRef<HTMLDivElement>(null);
  const dateCountdownRef = useRef<HTMLDivElement>(null);
  const socialLinksRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);

  const [allLoaded, setAllLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

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

  // ─── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = TARGET_DATE.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      });
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  // ─── Draw frame ──────────────────────────────────────────────────────────────
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
      scale = lerp(coverScale, containScale, t);
    }

    const dx = (cw - fw * scale) / 2;
    const dy = (ch - fh * scale) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(bitmap, dx, dy, fw * scale, fh * scale);
  };

  // ─── Scroll handler ─────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const section = scrollSectionRef.current;
    if (!section) return;
    const scrollTop = window.scrollY;
    const maxScroll = section.offsetHeight - window.innerHeight;
    const fraction =
      maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
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

  // ─── Preload all sprites (Robust Singleton) ─────────────────────────────────
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const currentType = isMobile ? "mobile" : "desktop";

    if (globalLoadPromise && cacheType && cacheType !== currentType) {
      globalLoadPromise = null;
      isReadyRef.current = false;
    }

    if (isReadyRef.current && cacheType === currentType) return;

    if (
      bitMapCache &&
      bitMapCache.length === SPRITE_COUNT &&
      cacheType === currentType
    ) {
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

    if (!globalLoadPromise) {
      globalLoadPromise = (async () => {
        try {
          isMobileRef.current = isMobile;
          const fw = isMobile ? MOBILE_W : DESKTOP_W;
          const fh = isMobile ? MOBILE_H : DESKTOP_H;

          const blobs = await Promise.all(
            Array.from({ length: SPRITE_COUNT }, (_, i) =>
              fetch(getSpritePath(i + 1, isMobile), {
                cache: "force-cache",
              }).then((r) =>
                r.ok ? r.blob() : Promise.reject(`HTTP ${r.status}`)
              )
            )
          );

          const newBitmaps: ImageBitmap[][] = [];
          for (let si = 0; si < SPRITE_COUNT; si++) {
            const sheetBitmap = await createImageBitmap(blobs[si]);
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
                { colorSpaceConversion: "none" }
              );
              frames.push(bm);
            }
            sheetBitmap.close();
            newBitmaps[si] = frames;
            useOverlayStore.getState().setSpritesLoaded(si + 1);
          }

          useOverlayStore.getState().setBitMapCache(newBitmaps, currentType);
          useOverlayStore.getState().setLandingReady(true);
        } catch (err) {
          console.error("LandingRevamp: global load error", err);
          globalLoadPromise = null;
        }
      })();
    }

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

    return () => {
      cancelled = true;
    };
  }, [bitMapCache, setAllLoaded, setLandingReady, setSpritesLoaded, handleScroll]);

  // ─── Animation loop (lerp 0.15 for smoother feel) ──────────────────────────
  useEffect(() => {
    let lastDrawnFrame = -1;
    const tick = () => {
      rafIdRef.current = requestAnimationFrame(tick);
      if (!isReadyRef.current) return;
      currentFrameRef.current = lerp(
        currentFrameRef.current,
        targetFrameRef.current,
        0.15
      );
      const rounded = Math.round(currentFrameRef.current);
      if (rounded !== lastDrawnFrame) {
        lastDrawnFrame = rounded;
        drawFrame(rounded);
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, []);

  // ─── Canvas resize (DPR capped at 1 on mobile, 2 on desktop) ─────────────
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const isMobile = window.innerWidth < 768;
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      drawFrame(Math.round(currentFrameRef.current));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Lenis smooth scroll ──────────────────────────────────────────────────
  useEffect(() => {
    // Disable Lenis on touch/mobile devices — native scroll is sufficient
    // and smooth scroll adds significant CPU overhead that can crash mobile browsers.
    if (isTouchDevice()) return;

    lenisRef.current = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.5,
    });

    let lenisRafId: number;
    const raf = (time: number) => {
      lenisRef.current?.raf(time);
      lenisRafId = requestAnimationFrame(raf);
    };
    lenisRafId = requestAnimationFrame(raf);

    lenisRef.current.on("scroll", ScrollTrigger.update);

    return () => {
      cancelAnimationFrame(lenisRafId);
      lenisRef.current?.destroy();
    };
  }, []);

  // ─── Scroll listener ─────────────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ─── Returning user: jump to scroll end ───────────────────────────────────
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

  // ─── Auto-scroll on wheel (Cinematic jump to end) ──────────────────────────
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

      // If we haven't reached the bottom yet, trigger auto-scroll
      if (currentScroll < maxScroll && wheelAccumulator > WHEEL_THRESHOLD) {
        const targetScroll = e.deltaY > 0 ? maxScroll : 0;

        // Don't restart if already very close
        if (Math.abs(currentScroll - targetScroll) < 50) return;

        // If user reverses direction, kill current animation
        if (
          animationTween &&
          ((e.deltaY > 0 &&
            (animationTween.vars as any).scroll < currentScroll) ||
            (e.deltaY < 0 &&
              (animationTween.vars as any).scroll > currentScroll))
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
            duration: 9,
            ease: "power1.inOut",
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
      setTimeout(() => {
        wheelAccumulator = 0;
      }, 150);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      animationTween?.kill();
    };
  }, [allLoaded]);

  // ─── GSAP ScrollTrigger fade-outs (matching original) ─────────────────────
  useEffect(() => {
    if (!removeGif) return;

    const anims: gsap.core.Tween[] = [];

    const fadeOut = (
      el: HTMLElement | null,
      start: string,
      end: string
    ) => {
      if (!el) return;
      const anim = gsap.fromTo(
        el,
        { autoAlpha: 1 },
        {
          autoAlpha: 0,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start,
            end,
            scrub: true,
          },
        }
      );
      anims.push(anim);
    };

    const timer = setTimeout(() => {
      fadeOut(registerButtonRef.current, "50vh", "+=145vh");
      fadeOut(dateCountdownRef.current, "0vh", "+=200vh");
      fadeOut(socialLinksRef.current, "50vh", "+=200vh");
      fadeOut(logoContainerRef.current, "50vh", "+=200vh");
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timer);
      anims.forEach((a) => {
        a.scrollTrigger?.kill();
        a.kill();
      });
    };
  }, [removeGif]);

  // ─── Body scroll lock during preloader ─────────────────────────────────────
  useEffect(() => {
    if (removeGif) {
      document.body.classList.remove("scroll-locked");
      document.scrollingElement?.scrollTo({ top: 0 });
    } else {
      document.body.classList.add("scroll-locked");
    }
    return () => document.body.classList.remove("scroll-locked");
  }, [removeGif]);

  // ─── Ink-spread mask transition (3s for full animation) ────────────────────
  const transitionStartedRef = useRef(false);
  useEffect(() => {
    if (overlayIsActive && !transitionStartedRef.current && !removeGif) {
      transitionStartedRef.current = true;
      setTimeout(() => setRemoveGif(), 1500);
    }
  }, [overlayIsActive, removeGif, setRemoveGif]);

  return (
    <>
      {/* Navbar outside masked wrapper so it's always clickable */}
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main
        className={`${styles.wrapper} ${
          removeGif ? styles.revealed : ""
        } ${!removeGif ? styles.pointerNoneEvent : ""} ${
          overlayIsActive && !removeGif ? styles.mask : ""
        }`}
        ref={wrapperRef}
      >

      {/* ─── Social Links (LEFT side) ──────────────────────────────────── */}
      <div className={styles.socialLinksOverlay} ref={socialLinksRef}>
        {[
          {
            href: "https://x.com/gdgvitmumbai",
            icon: "/svgs/landing/x.svg",
            lamp: "/svgs/landing/xLamp.svg",
            cls: styles.xDiv,
            iconCls: styles.xIcon,
          },
          {
            href: "https://www.instagram.com/gdg.vitm/",
            icon: "/svgs/landing/insta.svg",
            lamp: "/svgs/landing/instaLamp.svg",
            cls: styles.instaDiv,
            iconCls: styles.instaIcon,
          },
          {
            href: "https://www.linkedin.com/company/gdgvitmumbai/",
            icon: "/svgs/landing/linkden.svg",
            lamp: "/svgs/landing/linkdenLamp.svg",
            cls: styles.linkdenDiv,
            iconCls: styles.linkdenIcon,
          },
        ].map((s) => (
          <div className={`${styles.socialLinkItem} ${s.cls}`} key={s.href}>
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              <img
                src={s.icon}
                alt=""
                className={`${styles.socialIcon} ${s.iconCls}`}
              />
              <img src={s.lamp} alt="" className={styles.socialLamp} />
            </a>
          </div>
        ))}
      </div>

      {/* ─── Logo container (RIGHT side, above register button) ────────── */}
      <div className={styles.logoContainer} ref={logoContainerRef}>
        <img
          src="/images/branding/gdg-spectrum-banner.png"
          className={styles.profileBanner}
          alt="GDG Spectrum banner"
        />
        <img
          src="/images/branding/gdg-spectrum-logo.webp"
          className={styles.logo}
          alt="GDG Logo for Spectrum"
        />
      </div>

      {/* ─── Countdown Timer (RIGHT side, near sound toggle) ──────────── */}
      <div className={styles.dateCountdown} ref={dateCountdownRef}>
        <div className={`${styles.daysLeft} ${styles.timeLeft}`}>
          <div className={styles.days}>
            {countdown.days >= 10 ? (
              <span>{countdown.days}</span>
            ) : (
              <span>0{countdown.days}</span>
            )}
          </div>
          DAYS
        </div>
        <div>:</div>
        <div className={`${styles.hoursLeft} ${styles.timeLeft}`}>
          <div className={styles.hours}>
            {countdown.hours >= 10 ? (
              <span>{countdown.hours}</span>
            ) : (
              <span>0{countdown.hours}</span>
            )}
          </div>
          HOURS
        </div>
        <div>:</div>
        <div className={`${styles.minutesLeft} ${styles.timeLeft}`}>
          <div className={styles.minutes}>
            {countdown.minutes >= 10 ? (
              <span>{countdown.minutes}</span>
            ) : (
              <span>0{countdown.minutes}</span>
            )}
          </div>
          MINS
        </div>
      </div>

      {/* ─── Register / Explore Events button (fixed, bottom-right) ────── */}
      <div
        className={styles.registerBtnContainer}
        onClick={() => goToPage("/events")}
        ref={registerButtonRef}
      >
        <img
          src="/svgs/landing/registerBtn.svg"
          className={styles.registerBtn}
          alt="Explore Events"
        />
        <img
          src="/svgs/landing/mobileRegisterBtn.svg"
          className={styles.mobileRegisterBtn}
          alt="Explore Events"
        />
        <div className={styles.registerBtnText}>Explore Events</div>
      </div>

      {/* ─── Scroll Section (Canvas) ───────────────────────────────────── */}
      <div className={styles.scrollSection} ref={scrollSectionRef}>
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} className={`${styles.mainCanvas} ${allLoaded ? styles.visible : ""}`} />
        </div>
      </div>

      {/* ─── Main Menu (revealed at scroll end) ────────────────────────── */}
      <div
        className={`${styles.menuSection} ${
          isMainHamOpen ? styles.revealed : ""
        }`}
      >
        <Suspense fallback={null}>
          <MainHam goToPage={goToPage} />
        </Suspense>
      </div>

      {/* ─── Scroll Indicator ──────────────────────────────────────────── */}
      <div className={styles.contentOverlay}>
        <div
          className={`${styles.scrollIndicator} ${
            isScrolled || !removeGif ? styles.hidden : ""
          }`}
        >
          <div className={styles.mouse}>
            <div className={styles.wheel}></div>
          </div>
          <span className={styles.scrollText}>Scroll Down</span>
        </div>
      </div>

      {/* ─── About Us Section ──────────────────────────────────────────── */}
      <div className={styles.bottomContainer}>
        <Suspense fallback={null}>
          <AboutUs isBackBtn={false} />
        </Suspense>
      </div>
    </main>
    </>
  );
}
