import styles from "../../AboutUs.module.scss";
import instaicon from "/svgs/aboutus/instaicon.svg";
import xicon from "/svgs/aboutus/xicon.svg";
import linkedin from "/svgs/aboutus/linkedin.svg";
import yticon from "/svgs/aboutus/yticon.svg";

const SocialLinks = () => (
  <div className={styles.social}>
    <a href="https://www.linkedin.com/company/gdgvitmumbai/" target="_blank" rel="noopener noreferrer"><img src={linkedin} alt="LinkedIn" /></a>
    <a href="https://www.youtube.com/@gdgvitmumbai" target="_blank" rel="noopener noreferrer"><img src={yticon} alt="YouTube" /></a>
    <a href="https://x.com/gdgvitmumbai" target="_blank" rel="noopener noreferrer"><img src={xicon} alt="X" /></a>
    <a href="https://www.instagram.com/gdg.vitm/" target="_blank" rel="noopener noreferrer"><img src={instaicon} alt="Instagram" /></a>
  </div>
);

export default SocialLinks;
