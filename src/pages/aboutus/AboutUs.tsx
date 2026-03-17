import { useEffect, useRef, useState } from "react";
import styles from "./AboutUs.module.scss";
import Header from "/svgs/aboutus/header.svg";
import Reg from "/svgs/aboutus/reghead.svg";
import BackButton from "../components/backButton/BackButton";
import aboutPageBG from "/images/aboutus/background.jpg";
import aboutPageBGMobile from "/images/aboutus/backg.png";
import letter1 from "/svgs/aboutus/letter1.svg";
import letter2 from "/svgs/aboutus/letter2.svg";
import letter3 from "/svgs/aboutus/letter3.svg";
import letter4 from "/svgs/aboutus/letter4.svg";
import letter5 from "/svgs/aboutus/letter5.svg";
import letter6 from "/svgs/aboutus/letter6.svg";
import letter7 from "/svgs/aboutus/letter7.svg";
import letter8 from "/svgs/aboutus/letter8.svg";
import VideoMetaData from "./components/VideoMetaData";
// Helmet removed — SEO handled in index.html
import SocialLinks from "./components/SocialLinks/SocialLinks";
import AboutText from "./components/AboutText/AboutText";
import CalligraphyPanel from "./components/CalligraphyPanel/CalligraphyPanel";
import { useFanAnimation } from "./components/useFanAnimation/useFanAnimation";
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface AboutUsProps {
  isBackBtn?: boolean;
}

const icons = [
  letter1,
  letter2,
  letter3,
  letter4,
  letter5,
  letter6,
  letter7,
  letter8,
];


const mainVideoMetadata = {
  id: "V9LHjddKR_M",
  title: "Spectrum Week 2026 | GDG VIT Mumbai",
  description:
    "Spectrum Week — 4 days of coding battles, AI talks, strategy games, and a hackathon. By Google Developer Group, VIT Mumbai.",
  uploadDate: "2026-03-01T00:00:00+05:30",
};
const iconImages: HTMLImageElement[] = icons.map((src) => {
  const img = new Image();
  img.src = src;
  img.alt = "Letters";
  return img;
});

const AboutUs = ({ isBackBtn = true }: AboutUsProps) => {
  // const [current, setCurrent] = useState(0);
  // const [isPlaying, setIsPlaying] = useState(false);
  const AboutRef = useRef<HTMLDivElement | null>(null);

  // const playerRef = useRef<any>(null);

  const fan2Ref = useRef<HTMLImageElement>(null);
  const fan1Ref = useRef<HTMLImageElement>(null);

  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 1200px) and (max-aspect-ratio: 0.75) ")
      .matches
  );
  useFanAnimation(fan1Ref, fan2Ref, isMobile, iconImages, styles);


  useEffect(() => {
    const handleResize = () =>
      setIsMobile(
        window.matchMedia("(max-width: 1200px) and (max-aspect-ratio: 0.75) ")
          .matches
      );

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      {/* Title: About | Spectrum Week 2026 | GDG VIT Mumbai */}
      <div
        className={styles.AboutContainer}
        ref={AboutRef}
        style={{
          backgroundImage: `url("${
            isMobile ? aboutPageBGMobile : aboutPageBG
          }")`,
        }}
      >
        <VideoMetaData
          videoId={mainVideoMetadata.id}
          title={mainVideoMetadata.title}
          description={mainVideoMetadata.description}
          uploadDate={mainVideoMetadata.uploadDate}
        />

        <div className={styles.header}>
          <img src={isMobile ? Reg : Header} alt="About Us" />
        </div>

        <div className={styles.content3D}>
          <div className={styles.wrapper}>
            <CalligraphyPanel />
          </div>
          <AboutText isMobile={isMobile} />
        </div>
        <SocialLinks />
        {isBackBtn && <BackButton className={styles.aboutBB} />}
      </div>
    </div>
  );
};

export default AboutUs;
