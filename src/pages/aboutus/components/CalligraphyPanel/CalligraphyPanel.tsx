import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./CalligraphyPanel.module.scss";

gsap.registerPlugin(ScrollTrigger);

const VALUES = [
  { jp: "創造", en: "CREATE" },
  { jp: "挑戦", en: "CHALLENGE" },
  { jp: "勝利", en: "VICTORY" },
  { jp: "技術", en: "TECHNOLOGY" },
];

export default function CalligraphyPanel() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const pillarRef     = useRef<HTMLDivElement>(null);
  const ensoRef       = useRef<HTMLDivElement>(null);
  const lanternsRef   = useRef<HTMLDivElement>(null);
  const inkParticleRef = useRef<HTMLDivElement>(null);
  const jpRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const enRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const tipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    if (!containerRef.current) return;

    // ── Pillar parallax (moves slightly slower than scroll) ──────────────
    if (pillarRef.current) {
      gsap.to(pillarRef.current, {
        y: -35,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // ── Ensō Reveal Animation ──────────────────────────────────────────
    if (ensoRef.current) {
      gsap.fromTo(ensoRef.current, 
        { 
          opacity: 0, 
          scale: 0.8,
          rotate: -45,
          filter: "blur(10px)"
        },
        {
          opacity: 1, 
          scale: 1,
          rotate: 0,
          filter: "blur(0px)",
          duration: 2.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          }
        }
      );

      // Subtle parallax for Ensō
      gsap.to(ensoRef.current, {
        y: -15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // ── Sequential brush-stroke reveal per JP character ──────────────────
    jpRefs.current.forEach((el, i) => {
      const tip = tipRefs.current[i];
      if (!el || !tip) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 68%",
          toggleActions: "play none none reverse",
        },
        delay: 0.5 + i * 0.8, // Slightly increased delay for storytelling
      });

      // Synchronized reveal + brush tip movement
      tl.fromTo(
        el,
        { clipPath: "inset(0 100% 0 0)", opacity: 1 },
        { clipPath: "inset(0 0% 0 0)", duration: 1.6, ease: "power2.inOut" }
      ).fromTo(
        tip,
        { left: "0%", opacity: 0 },
        { left: "100%", opacity: 1, duration: 1.6, ease: "power2.inOut" },
        0
      ).to(tip, { opacity: 0, duration: 0.4 });

      // After reveal, start gentle floating
      tl.add(() => {
        gsap.to(el, {
          y: "-=6",
          duration: 4 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    });

    // ── EN label fades in right after its JP char ────────────────────────
    enRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 10, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 68%",
            toggleActions: "play none none reverse",
          },
          delay: 0.5 + i * 0.8 + 1.2,
        }
      );
    });

    // ── Ink smoke particles ──────────────────────────────────────────────
    if (inkParticleRef.current) {
      for (let i = 0; i < 20; i++) {
        const p = document.createElement("div");
        p.className = styles.inkParticle;
        const size = 3 + Math.random() * 6;
        p.style.width  = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left   = `${Math.random() * 100}%`;
        p.style.top    = `${Math.random() * 100}%`;
        inkParticleRef.current.appendChild(p);

        // Random floating motion with fade in/out
        gsap.to(p, {
          opacity: 0.15 + Math.random() * 0.15,
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          duration: 6 + Math.random() * 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 4,
        });
      }
    }

    // ── Floating lanterns ────────────────────────────────────────────────
    if (lanternsRef.current) {
      for (let i = 0; i < 7; i++) {
        const l = document.createElement("div");
        l.className = styles.lantern;
        const size = 18 + Math.random() * 28;
        l.style.width  = `${size}px`;
        l.style.height = `${size * 1.5}px`;
        l.style.left   = `${8 + Math.random() * 84}%`;
        l.style.bottom = `${-15 - Math.random() * 30}%`;
        lanternsRef.current.appendChild(l);

        // Perpetual linear drift
        gsap.to(l, {
          y: `${-(110 + Math.random() * 70)}vh`,
          x: `${(Math.random() - 0.5) * 50}px`,
          rotation: (Math.random() - 0.5) * 18,
          duration: 22 + Math.random() * 15,
          repeat: -1,
          ease: "none",
          delay: Math.random() * 14,
        });

        // Scroll parallax - subtle vertical offset based on scroll position
        gsap.to(l, {
          y: "-=30",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        });
      }
    }
  }, { scope: containerRef });

  return (
    <div className={styles.panelContainer} ref={containerRef}>
      {/* Background glow for pillar highlight */}
      <div className={styles.radialGlow} />

      {/* Faint Ensō circle behind everything */}
      <div className={styles.ensoWrapper} ref={ensoRef}>
        <div className={styles.enso} />
      </div>

      {/* Ink smoke particles */}
      <div className={styles.inkParticleLayer} ref={inkParticleRef} />

      {/* Floating lanterns */}
      <div className={styles.lanternsLayer} ref={lanternsRef} />

      {/* Vertical philosophy pillar */}
      <div className={styles.pillar} ref={pillarRef}>
        {/* Central vertical brush divider line */}
        <div className={styles.verticalDivider} />

        {VALUES.map((val, i) => (
          <div key={i} className={styles.valueBlock}>
            <div className={styles.valueItem}>
              {/* Spark/Tip at the reveal edge */}
              <div
                className={styles.brushTip}
                ref={(el) => { if (el) tipRefs.current[i] = el; }}
              />

              {/* JP char — brush-stroke revealed via clip-path */}
              <div
                className={styles.jpChar}
                ref={(el) => { if (el) jpRefs.current[i] = el; }}
                style={{ clipPath: "inset(0 100% 0 0)", opacity: 1 }}
              >
                {val.jp}
              </div>

              {/* EN label fades in after char */}
              <div
                className={styles.enLabel}
                ref={(el) => { if (el) enRefs.current[i] = el; }}
                style={{ opacity: 0 }}
              >
                {val.en}
              </div>
            </div>

            {i < VALUES.length - 1 && (
              <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerGlyph}>⚔</span>
                <span className={styles.dividerLine} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
