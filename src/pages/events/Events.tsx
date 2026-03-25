import { useContext, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./Events.module.scss";
import BackButton from "../components/backButton/BackButton";
import { navContext } from "../../App";
import EventHouse from "../components/eventHouse/EventHouse";
import { isTouchDevice } from "../../utils/debounce";

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
    title: "THE LAST STANDING RONIN",
    subtitle: "Speed Coding Battle",
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
    tagline: "Exploring autonomous systems.",
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
    subtitle: "Bluff & Bid — Strategy",
    tagline: "Outsmart the ghost.",
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
    subtitle: "Hack the Ghost — Hybrid",
    tagline: "The ultimate siege.",
    type: "HACKATHON",
    prize: "₹40,000",
    link: "/events/invasion",
    accent: "#ff4d00",
    registrationLink: "https://tinyurl.com/4etp7z8e",
  },
];

export default function Events() {
  const { goToPage } = useContext(navContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isMobile = isTouchDevice();

  useGSAP(() => {
    if (!bgRef.current || !containerRef.current) return;

    // Animate timeline progress line based on scroll
    gsap.to(progressRef.current, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: timelineRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
      },
    });

    // Background moves slowest
    gsap.to(bgRef.current, {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

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
      {/* Background stays same */}
      <div className={styles.backgroundWrapper}>
        <div className={styles.bgParallax} ref={bgRef} />
        <div className={styles.fogOverlay} />
      </div>
      <div className={styles.ambientOverlay} />
      
      {/* Environmental Animation Layer - Sakura & Lanterns */}
      <div className={styles.particleContainer}>
        {[...Array(isMobile ? 10 : 25)].map((_, i) => (
          <div
            key={`sakura-${i}`}
            className={styles.sakura}
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 6}s, ${Math.random() * 3 + 2}s`,
              animationDelay: `-${Math.random() * 5}s, -${Math.random() * 3}s`,
              width: `${Math.random() * 6 + 6}px`,
              height: `${Math.random() * 8 + 10}px`,
              opacity: Math.random() * 0.4 + 0.3,
            }}
          />
        ))}

        {[...Array(isMobile ? 2 : 6)].map((_, i) => (
          <div
            key={`lantern-${i}`}
            className={styles.driftingLantern}
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: `-20%`,
              animationDuration: `${Math.random() * 15 + 20}s`,
              animationDelay: `${Math.random() * 10}s`,
              transform: `scale(${0.5 + Math.random() * 0.5})`,
            }}
          />
        ))}
      </div>

      <BackButton className={styles.backBtn} />

      {/* Header overlay */}
      <div className={styles.header}>
        <h1 className={styles.title}>SPECTRUM WEEK</h1>
        <p className={styles.subtitle}>GDG VIT Mumbai × GDG UMIT</p>
        <div className={styles.divider} />
      </div>

      <div className={styles.timeline} ref={timelineRef}>
        <div className={styles.timelineLine}>
          <div className={styles.timelineProgress} ref={progressRef} />
        </div>

        {EVENTS.map((event, i) => (
          <div
            key={event.id}
            className={`${styles.card} ${i % 2 === 0 ? styles.cardLeft : styles.cardRight}`}
            ref={(el) => { cardRefs.current[i] = el; }}
          >
            <div className={styles.timelineDot} style={{ borderColor: event.accent }}>
              <div className={styles.dotInner} style={{ backgroundColor: event.accent }} />
            </div>

            <div className={styles.houseTimelineWrapper}>
              <EventHouse
                {...event}
                onClickCTA={(link: string) => goToPage?.(link)}
                onClickRoute={(link: string) => goToPage?.(link)}
                style={{ position: "relative" }}
              />
              <div className={styles.outsideInfo}>
                <div className={styles.outsideDay} style={{ color: event.accent }}>
                  {event.day} — {event.date}
                </div>
                
                <div className={styles.outsideTitle}>{event.title}</div>
                <div className={styles.outsideHint}>Click house to reveal details</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>Explore the village. Enter a house to register.</p>
      </div>
    </div>
  );
}
