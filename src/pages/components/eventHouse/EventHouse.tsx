import { useState } from "react";
import styles from "./EventHouse.module.scss";

interface EventHouseProps {
  day: string;
  date: string;
  title: string;
  subtitle: string;
  tagline: string;
  type: string;
  prize?: string;
  link?: string;
  accent: string;
  registrationLink: string;
  onClickCTA: (link: string) => void;
  onClickRoute?: (link: string) => void;
  // Positioning props for absolute placement in the village
  style?: React.CSSProperties;
  className?: string;
}

export default function EventHouse({
  day,
  date,
  title,
  subtitle,
  tagline,
  type,
  prize,
  link,
  accent,
  registrationLink,
  onClickCTA,
  onClickRoute,
  style,
  className = "",
}: EventHouseProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDoors = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleCTA = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (registrationLink.startsWith('http')) {
      window.open(registrationLink, '_blank', 'noopener,noreferrer');
    } else {
      onClickCTA(registrationLink);
    }
  };

  const handleRoute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClickRoute && link) {
      onClickRoute(link);
    }
  };


  return (
    <div
      className={`${styles.houseContainer} ${isOpen ? styles.isOpen : ""} ${className}`}
      style={style}
      onClick={toggleDoors}
    >
      {/* Environmental Effects linked to the house */}
      <div className={styles.ambientGlow} style={{ backgroundColor: accent }} />
      <div className={styles.sakuraPetalFall} />

      {/* Main Structural House Wrapper */}
      <div className={styles.houseStructure}>
        {/* Roof Structure */}
        <div className={styles.roof}>
          <div className={styles.roofTexture} />
          <div className={styles.beams} />
        </div>

        {/* Lanterns */}
        <div className={styles.lanternLeft}>
          <div className={styles.lanternGlow} style={{ backgroundColor: accent }} />
        </div>
        <div className={styles.lanternRight}>
          <div className={styles.lanternGlow} style={{ backgroundColor: accent }} />
        </div>

        {/* Interior Event Panel (Revealed when doors open) */}
        <div className={styles.interiorPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.typeBadge} style={{ color: accent, borderColor: accent }}>
              {type}
            </span>
            <span className={styles.dayDate}>
              {day} • {date}
            </span>
          </div>

          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
          <div className={styles.divider} style={{ backgroundColor: accent }} />
          <p className={styles.tagline}>{tagline}</p>

          {prize && (
            <div className={styles.prizeContainer}>
              <span className={styles.prizeLabel}>PRIZE</span>
              <span className={styles.prizeValue} style={{ color: accent }}>
                {prize}
              </span>
            </div>
          )}

          <div className={styles.buttonRow}>
            <button
              className={styles.routeButton}
              style={{ color: accent, borderColor: accent }}
              onClick={handleRoute}
            >
              DETAILS
            </button>
            <button
              className={styles.ctaButton}
              style={{ backgroundColor: accent }}
              onClick={handleCTA}
            >
              REGISTER
            </button>
          </div>
        </div>

        {/* Sliding Shoji Doors */}
        <div className={styles.shojiDoors}>
          <div className={styles.doorLeft}>
            <div className={styles.woodFrame} />
            <div className={styles.paperPanels} />
          </div>
          <div className={styles.doorRight}>
            <div className={styles.woodFrame} />
            <div className={styles.paperPanels} />
          </div>
        </div>

        {/* Engawa (Wooden Porch Platform) */}
        <div className={styles.engawa}>
          <div className={styles.woodPlanks} />
        </div>
      </div>
    </div>
  );
}
