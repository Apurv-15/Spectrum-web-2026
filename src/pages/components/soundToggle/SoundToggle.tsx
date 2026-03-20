import { useState, useEffect } from "react";
import useOverlayStore from "../../../utils/store";
import styles from "./SoundToggle.module.scss";

export default function SoundToggle({ toggleMusic }: { toggleMusic: () => void }) {
  const isPlaying = useOverlayStore((s) => s.isPlaying);

  const [styleTag, setStyleTag] = useState([
    isPlaying ? styles.soundLine : styles.soundLine2,
    styles.soundCross2,
  ]);

  useEffect(() => {
    setStyleTag([
      isPlaying ? styles.soundLine : styles.soundLine2,
      styles.soundCross2,
    ]);
  }, [isPlaying]);

  return (
    <div className={styles.sounds} onClick={toggleMusic}>
      <span className={styleTag[0]}></span>
      <span className={styleTag[0]}></span>
      <span className={styleTag[0]}></span>
      <span className={styleTag[0]}></span>
      <span className={styleTag[0]}></span>
    </div>
  );
}
