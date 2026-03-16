import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./EventLayout.module.scss";
import BackButton from "../backButton/BackButton";

gsap.registerPlugin(ScrollTrigger);

interface Round {
  name: string;
  difficulty?: string;
  description: string;
  duration?: string;
  details?: string[];
}

interface ScoringCriteria {
  label: string;
  weight: string;
}

interface Prize {
  rank: string;
  reward: string;
}

interface EventLayoutProps {
  day: string;
  date: string;
  title: string;
  tagline: string;
  type: string;
  accent: string;
  overview: string;
  eligibility?: string[];
  rounds?: Round[];
  scoring?: ScoringCriteria[];
  prizes?: Prize[];
  rulesAllowed?: string[];
  rulesNotAllowed?: string[];
  disqualification?: string[];
  registrationLink?: string;
  registrationLabel?: string;
  children?: ReactNode;
}

export default function EventLayout({
  day,
  date,
  title,
  tagline,
  type,
  accent,
  overview,
  eligibility,
  rounds,
  scoring,
  prizes,
  rulesAllowed,
  rulesNotAllowed,
  disqualification,
  registrationLink,
  registrationLabel = "Register Now",
  children,
}: EventLayoutProps) {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useGSAP(() => {
    sectionsRef.current.forEach((section) => {
      if (!section) return;
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, []);

  const addRef = (el: HTMLElement | null, index: number) => {
    sectionsRef.current[index] = el;
  };

  let sectionIdx = 0;

  return (
    <div className={styles.container}>
      <BackButton className={styles.backBtn} to="/events" />

      <header className={styles.hero}>
        <div className={styles.heroBadge} style={{ color: accent, backgroundColor: `${accent}15`, borderColor: `${accent}40` }}>
          {type}
        </div>
        <div className={styles.heroDay} style={{ color: accent }}>
          {day} — {date}
        </div>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroTagline}>{tagline}</p>
        <div className={styles.heroDivider} style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        {registrationLink && (
          <a
            href={registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.registerButton}
            style={{ borderColor: `${accent}66`, color: accent }}
          >
            {registrationLabel}
          </a>
        )}
      </header>

      <div className={styles.content}>
        <section ref={(el) => addRef(el, sectionIdx++)} className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ color: accent }}>Overview</h2>
          <p className={styles.sectionText}>{overview}</p>
        </section>

        {eligibility && (
          <section ref={(el) => addRef(el, sectionIdx++)} className={styles.section}>
            <h2 className={styles.sectionTitle} style={{ color: accent }}>Eligibility</h2>
            <ul className={styles.list}>
              {eligibility.map((item, i) => (
                <li key={i} className={styles.listItem}>
                  <span className={styles.listBullet} style={{ backgroundColor: accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {rounds && rounds.length > 0 && (
          <section ref={(el) => addRef(el, sectionIdx++)} className={styles.section}>
            <h2 className={styles.sectionTitle} style={{ color: accent }}>Round Structure</h2>
            <div className={styles.rounds}>
              {rounds.map((round, i) => (
                <div key={i} className={styles.roundCard} style={{ borderColor: `${accent}30` }}>
                  <div className={styles.roundHeader}>
                    <span className={styles.roundNumber} style={{ color: accent }}>
                      R{i + 1}
                    </span>
                    <div>
                      <h3 className={styles.roundName}>{round.name}</h3>
                      {round.difficulty && (
                        <span className={styles.roundDifficulty}>{round.difficulty}</span>
                      )}
                    </div>
                    {round.duration && (
                      <span className={styles.roundDuration} style={{ color: accent }}>{round.duration}</span>
                    )}
                  </div>
                  <p className={styles.roundDesc}>{round.description}</p>
                  {round.details && (
                    <ul className={styles.roundDetails}>
                      {round.details.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {scoring && scoring.length > 0 && (
          <section ref={(el) => addRef(el, sectionIdx++)} className={styles.section}>
            <h2 className={styles.sectionTitle} style={{ color: accent }}>Scoring Criteria</h2>
            <div className={styles.scoringGrid}>
              {scoring.map((criteria, i) => (
                <div key={i} className={styles.scoringItem}>
                  <div className={styles.scoringBar}>
                    <div
                      className={styles.scoringFill}
                      style={{
                        width: criteria.weight,
                        backgroundColor: accent,
                      }}
                    />
                  </div>
                  <div className={styles.scoringLabel}>{criteria.label}</div>
                  <div className={styles.scoringWeight} style={{ color: accent }}>{criteria.weight}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {prizes && prizes.length > 0 && (
          <section ref={(el) => addRef(el, sectionIdx++)} className={styles.section}>
            <h2 className={styles.sectionTitle} style={{ color: accent }}>Prizes</h2>
            <div className={styles.prizeGrid}>
              {prizes.map((prize, i) => (
                <div key={i} className={styles.prizeCard} style={{ borderColor: `${accent}30` }}>
                  <span className={styles.prizeRank}>{prize.rank}</span>
                  <span className={styles.prizeReward} style={{ color: accent }}>{prize.reward}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(rulesAllowed || rulesNotAllowed) && (
          <section ref={(el) => addRef(el, sectionIdx++)} className={styles.section}>
            <h2 className={styles.sectionTitle} style={{ color: accent }}>Rules</h2>
            <div className={styles.rulesGrid}>
              {rulesAllowed && (
                <div className={styles.rulesColumn}>
                  <h3 className={styles.rulesLabel} style={{ color: "#4dff4d" }}>ALLOWED</h3>
                  <ul className={styles.rulesList}>
                    {rulesAllowed.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
              {rulesNotAllowed && (
                <div className={styles.rulesColumn}>
                  <h3 className={styles.rulesLabel} style={{ color: "#ff4d4d" }}>NOT ALLOWED</h3>
                  <ul className={styles.rulesList}>
                    {rulesNotAllowed.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {disqualification && disqualification.length > 0 && (
          <section ref={(el) => addRef(el, sectionIdx++)} className={styles.section}>
            <h2 className={styles.sectionTitle} style={{ color: accent }}>Disqualification</h2>
            <ul className={styles.list}>
              {disqualification.map((item, i) => (
                <li key={i} className={styles.listItem}>
                  <span className={styles.listBullet} style={{ backgroundColor: "#ff4d4d" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {children}
      </div>

      <footer className={styles.footer}>
        <p>Presented by GDG VIT Mumbai × GDG UMIT</p>
        <p>Vidyalankar Institute of Technology, Mumbai</p>
      </footer>
    </div>
  );
}
