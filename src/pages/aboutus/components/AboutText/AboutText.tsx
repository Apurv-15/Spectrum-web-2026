import styles from"../../AboutUs.module.scss"
import abtus from "/svgs/aboutus/abtus.svg";
import aboutTextBG from "/images/aboutus/abtbck.png";

interface AboutTextProps {
  isMobile: boolean;
}

const AboutText = ({ isMobile }: AboutTextProps) => (
  <div className={styles.abt}>
    <div
      className={styles.aboutback}
      style={{ backgroundImage: isMobile ? "none" : `url("${aboutTextBG}")` }}
    >
      <p>
        Google Developer Group VIT Mumbai is a community of passionate
                developers and tech enthusiasts at Vidyalankar Institute of
                Technology, Mumbai. We foster a culture of innovation by
                organizing workshops, hackathons, speaker sessions, and coding
                competitions. Spectrum Week is our flagship 4-day tech
                extravaganza — featuring coding battles, AI talks, strategy
                games, and a massive hackathon. Build. Ship. Inspire.
      </p>
    </div>
    <div className={styles.abtus}>
      <img src={abtus} alt="ABOUT US" />
      <h3>ABOUT US</h3>
    </div>
  </div>
);

export default AboutText;
