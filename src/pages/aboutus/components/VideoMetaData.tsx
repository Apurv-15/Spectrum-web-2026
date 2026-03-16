import { useEffect } from "react";

interface VideoMetadataType {
  videoId: string;
  title: string;
  description: string;
  uploadDate: string;
}

const VideoMetaData: React.FC<VideoMetadataType> = ({
  videoId,
  title,
  description,
  uploadDate,
}) => {
  useEffect(() => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: title,
      description,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      uploadDate,
      contentUrl: videoUrl,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [videoId, title, description, uploadDate]);

  return null;
};

export default VideoMetaData;
