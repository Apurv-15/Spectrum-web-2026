import { useContext, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./Events.module.scss";
import BackButton from "../components/backButton/BackButton";
import { navContext } from "../../App";

gsap.registerPlugin(ScrollTrigger);

interface EventDay {
  id: string;
  day: string;
  date: string;
  title: string;
  subtitle: string;
  tagline: string;
  type: string;
  prize?: string;
  link: string;
  accent: string;
  registrationLink: string;
}

const EVENTS: EventDay[] = [
  {
    id: "01",
    day: "DAY 1",
    date: "1st April",
    title: "THE HEAVENLY STRIKE",
    subtitle: "The Last Standing Ronin: Speed Code Instant Death",
    tagline: "One Breath. One Cut.",
    type: "BATTLE",
    prize: "₹13,000",
    link: "/events/heavenly-strike",
    accent: "#ff2200",
    registrationLink:
      "https://unstop.com/p/the-heavenly-strike-google-developer-groups-on-campus-vit-mumbai-1656097",
  },
  {
    id: "02",
    day: "DAY 2",
    date: "2nd April",
    title: "THE AGE OF AI AGENTS",
    subtitle: "Speaker Session",
    tagline: "Exploring the frontier of autonomous AI systems.",
    type: "TALK",
    link: "/events/ai-agents",
    accent: "#4d8eff",
    registrationLink: "https://forms.gle/Hx1MNjPGbLBG5CR28",
  },
  {
    id: "03",
    day: "DAY 3",
    date: "3rd April",
    title: "THE WAY OF THE GHOST",
    subtitle: "Bluff & Bid — Strategy & DSA Competition",
    tagline: "Survive the grid. Outsmart the ghost.",
    type: "STRATEGY",
    prize: "₹12,000",
    link: "/events/way-of-ghost",
    accent: "#9b4dff",
    registrationLink:
      "https://unstop.com/p/the-way-of-the-ghost-google-developer-groups-on-campus-vit-mumbai-1656118",
  },
  {
    id: "04",
    day: "DAY 4",
    date: "4th April",
    title: "THE INVASION",
    subtitle: "Hack the Ghost — Hybrid Hackathon",
    tagline: "The ultimate siege. ₹40,000 prize pool.",
    type: "HACKATHON",
    prize: "₹40,000",
    link: "/events/invasion",
    accent: "#ff4d00",
    registrationLink: "https://tinyurl.com/4etp7z8e",
  },
];

export default function Events() {
  const { goToPage } = useContext(navContext);
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (bgRef.current && containerRef.current) {
      gsap.to(bgRef.current, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 80,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
          delay: i * 0.1,
        }
      );
    });
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.backgroundWrapper}>
        <div className={styles.bgParallax} ref={bgRef} />
        <div className={styles.fogOverlay} />
      </div>
      <div className={styles.ambientOverlay} />
      
      <div className={styles.sakuraContainer}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={styles.sakura}
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 5}s, ${Math.random() * 3 + 2}s`,
              animationDelay: `-${Math.random() * 5}s, -${Math.random() * 3}s`,
              width: `${Math.random() * 6 + 8}px`,
              height: `${Math.random() * 8 + 12}px`,
              opacity: Math.random() * 0.4 + 0.4,
            }}
          />
        ))}
      </div>

      <BackButton className={styles.backBtn} />

      <div className={styles.header}>
        <h1 className={styles.title}>SPECTRUM WEEK</h1>
        <p className={styles.subtitle}>
          GDG VIT Mumbai × GDG UMIT
        </p>
        <p className={styles.dateRange}>1st — 4th April 2026</p>
        <div className={styles.divider} />
      </div>

      <div className={styles.timeline} ref={timelineRef}>
        <div className={styles.timelineLine} />

        {EVENTS.map((event, i) => (
          <div
            key={event.id}
            className={`${styles.card} ${i % 2 === 0 ? styles.cardLeft : styles.cardRight}`}
            ref={(el) => { cardRefs.current[i] = el; }}
            onClick={() => goToPage?.(event.link)}
          >
            <div className={styles.timelineDot} style={{ borderColor: event.accent }}>
              <div className={styles.dotInner} style={{ backgroundColor: event.accent }} />
            </div>

            <div className={styles.cardContent} style={{ borderColor: `${event.accent}40` }}>
              <div className={styles.cardHeader}>
                <span className={styles.cardType} style={{ color: event.accent, backgroundColor: `${event.accent}15` }}>
                  {event.type}
                </span>
                <span className={styles.cardId}>N{event.id}</span>
              </div>

              <div className={styles.cardDay} style={{ color: event.accent }}>
                {event.day} — {event.date}
              </div>

              <h2 className={styles.cardTitle}>{event.title}</h2>
              <p className={styles.cardSubtitle}>{event.subtitle}</p>
              <p className={styles.cardTagline}>{event.tagline}</p>

              {event.prize && (
                <div className={styles.cardPrize}>
                  <span className={styles.prizeLabel}>PRIZE POOL</span>
                  <span className={styles.prizeValue} style={{ color: event.accent }}>{event.prize}</span>
                </div>
              )}

              <div className={styles.cardArrow} style={{ color: event.accent }}>
                ENTER →
              </div>
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.registerButton}
                style={{ borderColor: `${event.accent}66`, color: event.accent }}
                onClick={(e) => e.stopPropagation()}
              >
                Register Now
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Presented by Google Developer Group, VIT Mumbai × GDG UMIT
        </p>
        <p className={styles.footerCollege}>
          Vidyalankar Institute of Technology, Mumbai
        </p>
      </div>
    </div>
  );
}
