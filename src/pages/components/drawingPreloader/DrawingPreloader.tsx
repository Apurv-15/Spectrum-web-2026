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

const TOTAL_PATHS = 103;
const CIRCUMFERENCE = 251.3;

export default function DrawingPreloader({
  onEnter,
}: {
  onEnter: () => void;
}) {
  const setRemoveGif = useOverlayStore((s) => s.setRemoveGif);
  const isLandingReady = useOverlayStore((s) => s.isLandingReady);
  const progress = useOverlayStore((s) => s.preloaderProgress);
  const setGlobalProgress = useOverlayStore((s) => s.setPreloaderProgress);

  const [showEnterButton, setShowEnterButton] = useState(false);
  const circleRef = useRef<SVGCircleElement>(null);
  const pctTextRef = useRef<SVGTextElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingStartedRef = useRef(false);
  const hasEnteredRef = useRef(false);

  // Initialize paths with stroke-dash animation
  useEffect(() => {
    const svgContainer = svgContainerRef.current;
    if (!svgContainer) return;

    for (let i = 1; i <= TOTAL_PATHS; i++) {
      const el = svgContainer.querySelector(`#p${i}`);
      if (!el) continue;

      if (el.tagName === "circle" || el.tagName === "CIRCLE") {
        el.setAttribute("data-opacity", "0");
        continue;
      }

      try {
        const len =
          (el as SVGPathElement).getTotalLength?.() ||
          parseFloat(el.getAttribute("stroke-dasharray") || "200");
        el.setAttribute("stroke-dasharray", len.toString());
        el.setAttribute("stroke-dashoffset", len.toString());
      } catch {
        el.setAttribute("stroke-dasharray", "200");
        el.setAttribute("stroke-dashoffset", "200");
      }
      (el as HTMLElement).style.transition = "";
    }
  }, []);

  // Animate paths based on progress
  useEffect(() => {
    const normalized = progress / 100;
    const svgContainer = svgContainerRef.current;
    if (!svgContainer) return;

    for (let i = 1; i <= TOTAL_PATHS; i++) {
      const el = svgContainer.querySelector(`#p${i}`);
      if (!el) continue;

      const pathStart = (i - 1) / TOTAL_PATHS;
      const pathEnd = i / TOTAL_PATHS;

      if (el.tagName === "circle" || el.tagName === "CIRCLE") {
        if (normalized >= pathEnd) {
          el.setAttribute("opacity", "1");
        }
        continue;
      }

      if (normalized >= pathEnd) {
        el.setAttribute("stroke-dashoffset", "0");
        (el as HTMLElement).style.transition =
          "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)";
      } else if (normalized >= pathStart) {
        const pathProg = (normalized - pathStart) / (pathEnd - pathStart);
        try {
          const len = parseFloat(
            el.getAttribute("stroke-dasharray") || "200"
          );
          el.setAttribute(
            "stroke-dashoffset",
            (len * (1 - pathProg)).toString()
          );
          (el as HTMLElement).style.transition =
            "stroke-dashoffset 1s ease-out";
        } catch {
          /* skip */
        }
      }
    }
  }, [progress]);

  // Update progress circle
  useEffect(() => {
    if (circleRef.current) {
      const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
      circleRef.current.style.strokeDashoffset = offset.toString();
    }
    if (pctTextRef.current) {
      pctTextRef.current.textContent = Math.round(progress) + "%";
    }
  }, [progress]);

  // Preload assets and simulate progress
  useEffect(() => {
    if (loadingStartedRef.current) return;
    loadingStartedRef.current = true;

    if (progress >= 100) {
      setShowEnterButton(true);
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
          setTimeout(() => setShowEnterButton(true), 400);
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

    // Fade out preloader
    if (containerRef.current) {
      containerRef.current.style.transition = "opacity 1.5s ease";
      containerRef.current.style.opacity = "0";
      containerRef.current.style.pointerEvents = "none";
    }

    onEnter();

    // Remove preloader from DOM after fade completes
    setTimeout(() => setRemoveGif(), 1500);
  };

  return (
    <div className={styles.preloaderContainer} ref={containerRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900&family=Noto+Serif+JP:wght@300;400&family=Shippori+Mincho&family=Abhaya+Libre:wght@400;700;800&family=DM+Serif+Text&family=Ibarra+Real+Nova:wght@600&display=swap');

        .preloader-wrapper {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5ede0;
          pointer-events: none;
        }

        .preloader-wrapper::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 100;
          opacity: 0.6;
        }

        .ink-wash {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .wash-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0;
          animation: washReveal 3s ease-out forwards;
        }

        .wash-blob:nth-child(1) {
          width: 600px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(26,20,16,0.12) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          animation-delay: 0.5s;
        }

        .wash-blob:nth-child(2) {
          width: 500px;
          height: 500px;
          background: radial-gradient(ellipse, rgba(201,168,76,0.15) 0%, transparent 70%);
          top: -50px;
          right: -50px;
          animation-delay: 1s;
        }

        .wash-blob:nth-child(3) {
          width: 800px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(26,20,16,0.08) 0%, transparent 70%);
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: 1.5s;
        }

        @keyframes washReveal {
          to { opacity: 1; }
        }

        .scene {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .drawing-stage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: auto;
        }

        .drawing-stage svg {
          width: 100%;
          height: 100%;
        }

        .draw-path {
          fill: none;
          stroke: #1a1410;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .gold-path {
          fill: none;
          stroke: #c9a84c;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ui-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 60px;
          pointer-events: none;
          z-index: 50;
        }

        .title-block {
          text-align: center;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1s ease, transform 1s ease;
        }

        .title-block.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .title-kanji {
          font-family: 'Noto Serif JP', serif;
          font-size: clamp(12px, 2vw, 18px);
          letter-spacing: 0.5em;
          color: #c9a84c;
          margin-bottom: 8px;
          display: block;
        }

        .title-main {
          font-family: 'Cinzel', serif;
          font-size: clamp(28px, 5vw, 56px);
          font-weight: 900;
          color: #1a1410;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          line-height: 1;
          text-shadow: 2px 2px 0 rgba(201,168,76,0.3);
        }

        .title-sub {
          font-family: 'Cinzel', serif;
          font-size: clamp(10px, 1.5vw, 14px);
          font-weight: 400;
          color: rgba(26,20,16,0.5);
          letter-spacing: 0.4em;
          margin-top: 8px;
        }

        .moon-group {
          transform: translate(820px, 180px);
          transition: transform 0.5s ease;
        }

        @media (max-width: 768px) {
          .moon-group {
            transform: translate(700px, 220px) scale(0.9);
          }
        }

        .progress-track {
          fill: none;
          stroke: rgba(192, 176, 99, 0.1);
          stroke-width: 2;
        }

        .progress-fill {
          fill: none;
          stroke: #c0b063;
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.3s ease;
        }

        .progress-pct {
          font-family: 'Cinzel', serif;
          font-size: 24px;
          font-weight: bold;
          fill: #c0b063;
          text-anchor: middle;
          dominant-baseline: middle;
        }

        .enter-btn-wrap {
          pointer-events: auto;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .enter-btn-wrap.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .enter-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 18px 60px;
          font-family: 'Cinzel', serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5em;
          color: #1a1410;
          text-transform: uppercase;
          overflow: hidden;
        }

        .enter-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1.5px solid #1a1410;
          border-radius: 2px;
          transition: transform 0.4s ease;
        }

        .enter-btn::after {
          content: '';
          position: absolute;
          inset: 3px;
          border: 1px solid #c9a84c;
          border-radius: 1px;
          opacity: 0.5;
          transition: opacity 0.4s ease;
        }

        .enter-btn:hover::before { transform: scale(1.03); }
        .enter-btn:hover::after { opacity: 1; }

        .enter-btn .btn-ink {
          position: absolute;
          inset: 0;
          background: #1a1410;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
          z-index: -1;
        }

        .enter-btn:hover .btn-ink { transform: scaleX(1); }
        .enter-btn:hover { color: #f5ede0; }

        .tagline {
          font-family: 'Noto Serif JP', serif;
          font-size: clamp(9px, 1.2vw, 11px);
          color: rgba(26,20,16,0.45);
          letter-spacing: 0.2em;
          margin-top: 20px;
          text-align: center;
          max-width: 500px;
          line-height: 2;
        }

        .mist-layer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: linear-gradient(to top, #f5ede0 0%, transparent 100%);
          pointer-events: none;
          z-index: 5;
        }
      `}</style>

      <div className="preloader-wrapper">
        <div className="ink-wash">
          <div className="wash-blob"></div>
          <div className="wash-blob"></div>
          <div className="wash-blob"></div>
        </div>

        <div className="scene">
          <div className="drawing-stage" ref={svgContainerRef}>
            <svg
              viewBox="0 0 1400 900"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* CLOUDS */}
              <path className="draw-path" id="p1" strokeWidth="1.8"
                d="M 0,180 C 40,160 80,140 130,155 C 160,162 175,145 210,140 C 250,134 270,150 300,148 C 330,146 350,130 380,135 C 410,140 420,155 440,150" />
              <path className="draw-path" id="p2" strokeWidth="1.2"
                d="M 20,200 C 60,185 100,170 150,178 C 185,183 200,168 230,162 C 265,155 285,172 315,168 C 345,164 365,148 395,155 C 425,162 435,175 455,168" />
              <path className="draw-path" id="p3" strokeWidth="2"
                d="M 0,220 C 30,195 70,178 110,185 C 145,191 165,172 200,165 C 240,158 265,178 300,172 C 340,165 365,148 400,155 C 435,162 450,180 480,172" />
              <path className="draw-path" id="p4" strokeWidth="1.5"
                d="M 50,130 C 80,110 120,95 160,105 C 190,112 200,90 230,82 C 265,73 290,95 310,88 C 335,80 345,60 375,68" />
              <path className="draw-path" id="p5" strokeWidth="1.2"
                d="M 60,148 C 95,128 135,112 175,122 C 205,130 215,108 245,100 C 280,91 305,113 325,106 C 350,98 360,78 390,86" />

              {/* Gold clouds */}
              <path className="gold-path" id="p6" strokeWidth="2.5"
                d="M 900,60 C 950,40 1020,30 1080,50 C 1120,63 1150,45 1190,42 C 1230,39 1265,55 1300,52 C 1350,48 1380,35 1420,40" />
              <path className="gold-path" id="p7" strokeWidth="1.8"
                d="M 920,85 C 975,62 1045,52 1105,72 C 1145,85 1175,67 1215,64 C 1255,61 1285,78 1325,75 C 1370,72 1395,58 1430,63" />
              <path className="gold-path" id="p8" strokeWidth="3"
                d="M 880,110 C 940,88 1015,78 1075,98 C 1115,111 1145,93 1185,90 C 1225,87 1255,104 1295,101 C 1340,98 1370,84 1410,89" />
              <path className="gold-path" id="p9" strokeWidth="2"
                d="M 1100,40 C 1130,20 1170,15 1200,30 C 1230,45 1220,70 1195,80 C 1170,90 1145,75 1150,55 C 1155,35 1180,28 1200,38" />
              <path className="gold-path" id="p10" strokeWidth="1.5"
                d="M 1050,70 C 1080,45 1130,38 1165,55 C 1195,70 1190,100 1162,110 C 1135,120 1108,102 1115,82 C 1122,62 1150,55 1168,68" />
              <path className="gold-path" id="p11" strokeWidth="1.2"
                d="M 1180,20 C 1220,5 1270,8 1300,28 C 1330,48 1315,80 1285,88 C 1255,96 1228,75 1238,52 C 1248,29 1280,22 1302,38" />

              {/* MOUNTAINS */}
              <path className="draw-path" id="p12" strokeWidth="1.5"
                d="M 600,650 L 680,450 L 760,650" />
              <path className="draw-path" id="p13" strokeWidth="1"
                d="M 550,700 L 640,520 L 700,650" />
              <path className="draw-path" id="p14" strokeWidth="1.2"
                d="M 700,680 L 790,480 L 870,680" />
              <path className="draw-path" id="p15" strokeWidth="0.7"
                d="M 680,450 C 690,480 695,510 700,540 C 705,570 708,600 710,630" />
              <path className="draw-path" id="p16" strokeWidth="0.7"
                d="M 680,450 C 670,480 665,510 660,540 C 655,570 652,600 650,630" />
              <path className="draw-path" id="p17" strokeWidth="0.8"
                d="M 400,700 C 450,620 520,560 600,550 C 680,540 750,580 820,600 C 890,620 950,580 1020,560 C 1090,540 1160,590 1220,650 C 1280,710 1350,750 1400,770" />
              <path className="draw-path" id="p18" strokeWidth="0.6"
                d="M 300,750 C 380,680 470,630 560,620 C 650,610 730,650 810,670 C 890,690 960,650 1040,635 C 1120,620 1200,670 1270,730" />

              {/* PAGODA */}
              <path className="draw-path" id="p19" strokeWidth="2"
                d="M 230,680 L 400,680" />
              <path className="draw-path" id="p20" strokeWidth="1.5"
                d="M 240,672 L 390,672" />
              <path className="draw-path" id="p21" strokeWidth="2"
                d="M 270,672 L 270,640 L 360,640 L 360,672" />
              <path className="draw-path" id="p22" strokeWidth="1.5"
                d="M 275,640 L 275,610 L 355,610 L 355,640" />
              <path className="draw-path" id="p23" strokeWidth="2.2"
                d="M 250,640 C 270,630 315,625 315,625 C 315,625 360,630 380,640" />
              <path className="draw-path" id="p24" strokeWidth="1.5"
                d="M 248,642 C 268,636 315,631 315,631 C 315,631 362,636 382,642" />
              <path className="draw-path" id="p25" strokeWidth="1.8"
                d="M 250,640 C 240,638 232,632 228,625" />
              <path className="draw-path" id="p26" strokeWidth="1.8"
                d="M 380,640 C 390,638 398,632 402,625" />
              <path className="draw-path" id="p27" strokeWidth="1.8"
                d="M 285,610 L 285,580 L 345,580 L 345,610" />
              <path className="draw-path" id="p28" strokeWidth="1.5"
                d="M 288,580 L 288,552 L 342,552 L 342,580" />
              <path className="draw-path" id="p29" strokeWidth="2"
                d="M 262,580 C 285,570 315,566 315,566 C 315,566 345,570 368,580" />
              <path className="draw-path" id="p30" strokeWidth="1.2"
                d="M 260,582 C 283,575 315,571 315,571 C 315,571 347,575 370,582" />
              <path className="draw-path" id="p31" strokeWidth="1.5"
                d="M 262,580 C 252,578 244,572 240,565" />
              <path className="draw-path" id="p32" strokeWidth="1.5"
                d="M 368,580 C 378,578 386,572 390,565" />
              <path className="draw-path" id="p33" strokeWidth="1.5"
                d="M 298,552 L 298,525 L 332,525 L 332,552" />
              <path className="draw-path" id="p34" strokeWidth="1.2"
                d="M 300,525 L 300,500 L 330,500 L 330,525" />
              <path className="draw-path" id="p35" strokeWidth="1.8"
                d="M 278,525 C 298,516 315,513 315,513 C 315,513 332,516 352,525" />
              <path className="draw-path" id="p36" strokeWidth="1"
                d="M 276,527 C 296,520 315,517 315,517 C 315,517 334,520 354,527" />
              <path className="draw-path" id="p37" strokeWidth="1.2"
                d="M 278,525 C 268,523 260,517 256,510" />
              <path className="draw-path" id="p38" strokeWidth="1.2"
                d="M 352,525 C 362,523 370,517 374,510" />
              <path className="draw-path" id="p39" strokeWidth="1.5"
                d="M 308,500 L 308,480 L 322,480 L 322,500" />
              <path className="draw-path" id="p40" strokeWidth="1.2"
                d="M 315,480 L 315,455 M 310,468 L 315,455 L 320,468" />
              <path className="draw-path" id="p41" strokeWidth="1"
                d="M 311,475 C 313,473 317,473 319,475" />
              <path className="draw-path" id="p42" strokeWidth="1"
                d="M 311,470 C 313,468 317,468 319,470" />
              <path className="draw-path" id="p43" strokeWidth="1"
                d="M 311,465 C 313,463 317,463 319,465" />
              <path className="draw-path" id="p44" strokeWidth="1"
                d="M 311,460 C 313,458 317,458 319,460" />
              <path className="draw-path" id="p45" strokeWidth="0.8"
                d="M 295,655 L 295,645 L 305,645 L 305,655 Z" />
              <path className="draw-path" id="p46" strokeWidth="0.8"
                d="M 325,655 L 325,645 L 335,645 L 335,655 Z" />
              <path className="draw-path" id="p47" strokeWidth="0.8"
                d="M 303,625 L 303,615 L 310,615 L 310,625 Z M 320,625 L 320,615 L 327,615 L 327,625 Z" />

              {/* PINE TREES */}
              <path className="draw-path" id="p48" strokeWidth="1.5"
                d="M 200,680 L 200,620 M 185,650 L 200,620 L 215,650 M 180,665 L 200,635 L 220,665" />
              <path className="draw-path" id="p49" strokeWidth="1.2"
                d="M 175,680 L 175,630 M 162,658 L 175,630 L 188,658 M 158,672 L 175,645 L 192,672" />
              <path className="draw-path" id="p50" strokeWidth="1.5"
                d="M 420,680 L 420,625 M 405,652 L 420,625 L 435,652 M 400,668 L 420,638 L 440,668" />

              {/* MIST */}
              <path className="draw-path" id="p51" strokeWidth="0.8"
                d="M 150,685 C 200,678 280,675 350,678 C 420,681 470,688 500,685" />
              <path className="draw-path" id="p52" strokeWidth="0.6"
                d="M 160,692 C 215,685 295,682 365,685 C 435,688 480,694 510,692" />

              {/* SAMURAI */}
              <path className="draw-path" id="p53" strokeWidth="2"
                d="M 980,780 C 1010,765 1060,758 1100,762 C 1140,766 1160,780 1180,785" />
              <path className="draw-path" id="p54" strokeWidth="1.5"
                d="M 990,790 C 1025,778 1070,772 1110,775 C 1145,778 1165,790 1185,795" />
              <path className="draw-path" id="p55" strokeWidth="2.5"
                d="M 1055,762 C 1048,740 1042,710 1038,680 C 1034,660 1033,640 1035,625" />
              <path className="draw-path" id="p56" strokeWidth="2.5"
                d="M 1078,762 C 1085,740 1090,710 1092,680 C 1094,660 1094,640 1092,625" />
              <path className="draw-path" id="p57" strokeWidth="2"
                d="M 1035,625 C 1040,618 1060,615 1067,620" />
              <path className="draw-path" id="p58" strokeWidth="1.5"
                d="M 1040,680 C 1050,675 1070,674 1080,678 L 1092,680" />
              <path className="draw-path" id="p59" strokeWidth="0.8"
                d="M 1045,710 C 1050,700 1055,690 1057,675" />
              <path className="draw-path" id="p60" strokeWidth="0.8"
                d="M 1075,710 C 1072,700 1070,690 1068,675" />
              <path className="draw-path" id="p61" strokeWidth="0.8"
                d="M 1062,725 C 1065,715 1067,700 1065,685" />
              <path className="draw-path" id="p62" strokeWidth="2.5"
                d="M 1035,625 C 1028,600 1025,575 1027,550 C 1029,535 1035,525 1045,520" />
              <path className="draw-path" id="p63" strokeWidth="2.5"
                d="M 1092,625 C 1099,600 1102,575 1100,550 C 1098,535 1092,525 1082,520" />
              <path className="draw-path" id="p64" strokeWidth="1.8"
                d="M 1045,520 C 1055,512 1063,510 1067,515 C 1071,520 1063,530 1063,540 L 1063,625" />
              <path className="draw-path" id="p65" strokeWidth="1.8"
                d="M 1082,520 C 1072,512 1064,510 1067,515" />
              <path className="draw-path" id="p66" strokeWidth="2"
                d="M 1032,608 C 1050,603 1080,601 1098,606" />
              <path className="draw-path" id="p67" strokeWidth="2.5"
                d="M 1030,615 C 1050,610 1082,608 1100,614" />
              <path className="draw-path" id="p68" strokeWidth="2"
                d="M 1032,622 C 1050,617 1080,615 1098,620" />
              <path className="draw-path" id="p69" strokeWidth="2.2"
                d="M 1027,560 C 1010,555 995,548 980,535 C 970,526 965,515 970,505" />
              <path className="draw-path" id="p70" strokeWidth="2"
                d="M 1030,572 C 1012,568 998,562 982,550 C 972,541 967,530 972,520" />
              <path className="draw-path" id="p71" strokeWidth="0.8"
                d="M 1015,560 C 1010,552 1000,543 993,538" />
              <path className="draw-path" id="p72" strokeWidth="0.8"
                d="M 1020,567 C 1014,558 1005,549 997,543" />
              <path className="draw-path" id="p73" strokeWidth="1.5"
                d="M 970,505 C 968,498 969,490 975,485 C 980,480 987,480 990,487 C 993,494 990,502 984,506" />
              <path className="draw-path" id="p74" strokeWidth="3"
                d="M 975,485 C 1000,470 1040,450 1080,435 C 1120,420 1160,410 1200,405" />
              <path className="draw-path" id="p75" strokeWidth="1.2"
                d="M 975,490 C 1002,476 1042,456 1082,441 C 1122,426 1162,416 1202,411" />
              <path className="draw-path" id="p76" strokeWidth="2"
                d="M 978,488 C 976,483 977,478 982,476 C 987,474 992,477 992,482 C 992,487 988,490 983,490 Z" />
              <path className="draw-path" id="p77" strokeWidth="2"
                d="M 1200,405 C 1215,402 1228,403 1235,407 L 1202,411" />
              <path className="draw-path" id="p78" strokeWidth="2"
                d="M 1100,555 C 1112,548 1118,538 1115,525" />
              <path className="draw-path" id="p79" strokeWidth="1.5"
                d="M 1102,565 C 1115,558 1122,547 1118,534" />
              <path className="draw-path" id="p80" strokeWidth="2"
                d="M 1052,520 C 1055,510 1060,505 1063,500 C 1066,495 1068,510 1072,520" />
              <path className="draw-path" id="p81" strokeWidth="2"
                d="M 1052,500 C 1048,488 1050,475 1060,468 C 1070,461 1082,463 1086,474 C 1090,485 1087,498 1080,504" />
              <path className="draw-path" id="p82" strokeWidth="1"
                d="M 1058,482 C 1062,479 1066,479 1068,482" />
              <path className="draw-path" id="p83" strokeWidth="1.8"
                d="M 1060,468 C 1062,458 1068,450 1075,445 C 1082,440 1090,442 1095,448" />
              <path className="draw-path" id="p84" strokeWidth="1.2"
                d="M 1086,474 C 1098,468 1112,460 1125,452 C 1138,444 1148,436 1155,428" />
              <path className="draw-path" id="p85" strokeWidth="0.8"
                d="M 1090,480 C 1102,475 1116,468 1128,460 C 1140,452 1150,444 1158,436" />

              {/* FOREGROUND ROCKS */}
              <path className="draw-path" id="p86" strokeWidth="2.5"
                d="M 900,900 C 920,850 940,800 960,770 C 975,745 995,730 1020,725 C 1045,720 1065,728 1085,740 C 1100,750 1110,768 1120,790 C 1135,820 1145,860 1150,900" />
              <path className="draw-path" id="p87" strokeWidth="0.8"
                d="M 930,850 C 945,835 960,820 975,810" />
              <path className="draw-path" id="p88" strokeWidth="0.8"
                d="M 920,875 C 938,858 958,840 975,830" />
              <path className="draw-path" id="p89" strokeWidth="0.8"
                d="M 1120,820 C 1110,810 1100,800 1092,790" />
              <path className="draw-path" id="p90" strokeWidth="0.8"
                d="M 1135,860 C 1122,848 1112,836 1104,825" />
              <path className="draw-path" id="p91" strokeWidth="1.5"
                d="M 820,880 C 830,865 850,858 870,862 C 890,866 900,880 895,895" />
              <path className="draw-path" id="p92" strokeWidth="1.2"
                d="M 1170,870 C 1180,856 1198,850 1215,854 C 1232,858 1240,872 1235,885" />

              {/* GROUND MIST */}
              <path className="draw-path" id="p93" strokeWidth="0.6"
                d="M 0,800 C 100,790 250,785 400,790 C 550,795 700,800 850,795 C 1000,790 1150,782 1300,788 C 1380,791 1430,796 1460,800" />
              <path className="draw-path" id="p94" strokeWidth="0.5"
                d="M 0,820 C 120,812 280,807 440,812 C 600,817 760,823 920,818 C 1080,813 1240,806 1400,812" />
              <path className="draw-path" id="p95" strokeWidth="0.4"
                d="M 0,840 C 150,833 350,828 550,833 C 750,838 950,844 1150,839 C 1300,835 1400,830 1470,836" />

              {/* Decorative elements */}
              <circle id="p96" cx="500" cy="200" r="2" fill="#1a1410" stroke="none" />
              <circle id="p97" cx="508" cy="190" r="1.2" fill="#1a1410" stroke="none" />
              <circle id="p98" cx="492" cy="195" r="1.5" fill="#1a1410" stroke="none" />

              {/* Moon circle with progress */}
              <g className={`moon-group ${showEnterButton ? "hidden" : ""}`}>
                <circle id="p99" r="85" fill="none" stroke="#c0b063" strokeWidth="1.5" opacity="0.4" strokeDasharray="5,5" />
                <circle id="p100" r="70" fill="none" stroke="#c0b063" strokeWidth="0.8" opacity="0.2" />

                {/* Real progress ring */}
                <circle className="progress-track" r="40" />
                <circle
                  className="progress-fill"
                  ref={circleRef}
                  r="40"
                  strokeDasharray={251.3}
                  strokeDashoffset={251.3}
                  transform="rotate(-90)"
                />
                <text className="progress-pct" ref={pctTextRef} dy="0.35em">
                  0%
                </text>
              </g>

              {/* Flying birds */}
              <path className="draw-path" id="p101" strokeWidth="1"
                d="M 650,120 C 658,112 668,112 676,120" />
              <path className="draw-path" id="p102" strokeWidth="1"
                d="M 620,135 C 628,127 638,127 646,135" />
              <path className="draw-path" id="p103" strokeWidth="0.8"
                d="M 680,105 C 687,98 695,98 702,105" />
            </svg>
          </div>

          <div className="mist-layer"></div>

          <div className="ui-overlay">
            <div className={`title-block ${showEnterButton ? "visible" : ""}`}>
              <span className="title-kanji">スペクトラム・ウィーク</span>
              <div className="title-main">SPECTRUM WEEK</div>
              <div className="title-sub">GDG VIT MUMBAI · 2026</div>
            </div>

            <div
              className={`enter-btn-wrap ${showEnterButton ? "visible" : ""}`}
            >
              <button className="enter-btn" onClick={handleEnter}>
                <div className="btn-ink"></div>
                Enter the World
              </button>
              <div className="tagline">
                Four days of code, strategy, and innovation await
                <br />
                Enter the world of Spectrum Week
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
