import { useRef, useEffect, useState, useCallback } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import styles from "./FrameScrollCanvas.module.scss";

const framePaths = Array.from({ length: 240 }, (_, i) => {
    const index = i + 1;
    return `/images/New_images_gdg/Landing_page/ezgif-frame-${index.toString().padStart(3, "0")}.jpg`;
});

export default function FrameScrollCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lenisRef = useRef<Lenis | null>(null);
    const [frameIndex, setFrameIndex] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const totalFrames = framePaths.length;

    // Initialize Lenis with smooth scroll and inertia
    useEffect(() => {
        lenisRef.current = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.2,
            touchMultiplier: 2,
            infinite: false,
        });

        const raf = (time: number) => {
            lenisRef.current?.raf(time);
            requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);

        return () => {
            lenisRef.current?.destroy();
        };
    }, []);

    // Update frame index based on scroll position
    const updateFrameIndex = useCallback(() => {
        if (!lenisRef.current || !canvasRef.current) return;
        const scrollY = lenisRef.current.scroll || 0;
        const maxScroll = (totalFrames * 50) - window.innerHeight; // Match scrollSection height
        const scrollProgress = Math.min(Math.max(0, scrollY / maxScroll), 1);
        const newIndex = Math.min(Math.floor(scrollProgress * totalFrames), totalFrames - 1);
        setFrameIndex(newIndex);
    }, [totalFrames]);

    // Animation loop for frame updates
    useEffect(() => {
        const animate = () => {
            updateFrameIndex();
            requestAnimationFrame(animate);
        };
        const id = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(id);
    }, [updateFrameIndex]);

    // Monitor Lenis scroll to update frames
    useEffect(() => {
        if (!lenisRef.current) return;

        const handleScroll = () => {
            updateFrameIndex();
        };

        lenisRef.current.on("scroll", handleScroll);

        return () => {
            lenisRef.current?.off("scroll", handleScroll);
        };
    }, [updateFrameIndex]);

    // Handle wheel/trackpad events for auto-scroll triggering
    useEffect(() => {
        let isAnimating = false;
        let animationTween: gsap.core.Tween | null = null;
        let wheelAccumulator = 0;
        const WHEEL_THRESHOLD = 30; // Lower threshold for trackpads

        const handleWheel = (e: WheelEvent) => {
            if (!lenisRef.current || imagesLoaded < totalFrames) return;

            const currentScroll = lenisRef.current.scroll || 0;
            const maxScroll = (totalFrames * 50) - window.innerHeight; // Match scrollSection height

            // Accumulate delta to detect intent
            wheelAccumulator += Math.abs(e.deltaY);

            if (currentScroll < maxScroll && wheelAccumulator > WHEEL_THRESHOLD) {
                const targetScroll = e.deltaY > 0 ? maxScroll : 0;

                if (Math.abs(currentScroll - targetScroll) < 10) return;

                if (animationTween && ((e.deltaY > 0 && animationTween.vars.scroll < currentScroll) || (e.deltaY < 0 && animationTween.vars.scroll > currentScroll))) {
                    animationTween.kill();
                    isAnimating = false;
                    wheelAccumulator = 0;
                }

                if (!isAnimating) {
                    isAnimating = true;
                    const scrollProxy = { value: currentScroll };
                    animationTween = gsap.to(scrollProxy, {
                        value: targetScroll,
                        duration: 5,
                        ease: "power2.inOut",
                        onUpdate: () => {
                            lenisRef.current?.scrollTo(scrollProxy.value, { immediate: true });
                            updateFrameIndex();
                        },
                        onComplete: () => {
                            isAnimating = false;
                            animationTween = null;
                            wheelAccumulator = 0;
                        }
                    });
                }
            }

            // Reset accumulator
            setTimeout(() => { wheelAccumulator = 0; }, 150);
        };

        window.addEventListener("wheel", handleWheel, { passive: true });

        return () => {
            window.removeEventListener("wheel", handleWheel);
            if (animationTween) animationTween.kill();
        };
    }, [totalFrames, updateFrameIndex, imagesLoaded]);

    // Preload images with progress tracking
    useEffect(() => {
        const loadImages = async () => {
            const promises = framePaths.map((path) =>
                new Promise<void>((resolve) => {
                    const img = new Image();
                    img.src = path;
                    img.onload = () => {
                        setImagesLoaded((prev) => prev + 1);
                        resolve();
                    };
                    img.onerror = (err) => {
                        console.error("Failed to load some frame images", err);
                        resolve();
                    };
                })
            );
            try {
                await Promise.all(promises);
            } catch (err) {
                console.error("Failed to load some frame images", err);
            }
        };
        loadImages();
    }, [framePaths]);

    // Draw current frame on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const imageCache = new Map<string, HTMLImageElement>();

        const preloadImages = () => {
            framePaths.forEach((path) => {
                const img = new Image();
                img.src = path;
                imageCache.set(path, img);
            });
        };
        preloadImages();

        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawCurrentFrame();
        };
        window.addEventListener("resize", resize);
        resize();

        function drawCurrentFrame() {
            if (!canvas || !ctx) return;
            const idx = frameIndex;
            if (idx < 0 || idx >= framePaths.length) return;
            const path = framePaths[idx];
            const img = imageCache.get(path);

            if (img && img.complete) {
                const fw = 1024;
                const fh = 576;
                const cw = canvas.width;
                const ch = canvas.height;
                const scale = Math.min(cw / fw, ch / fh);
                const dx = (cw - fw * scale) / 2;
                const dy = (ch - fh * scale) / 2;

                ctx.clearRect(0, 0, cw, ch);
                ctx.drawImage(img, dx, dy, fw * scale, fh * scale);
            } else if (img) {
                img.onload = () => {
                    if (!ctx || !canvas) return;
                    const fw = 1024;
                    const fh = 576;
                    const cw = canvas.width;
                    const ch = canvas.height;
                    const scale = Math.min(cw / fw, ch / fh);
                    const dx = (cw - fw * scale) / 2;
                    const dy = (ch - fh * scale) / 2;

                    ctx.clearRect(0, 0, cw, ch);
                    ctx.drawImage(img, dx, dy, fw * scale, fh * scale);
                };
            }
        }
        drawCurrentFrame();

        return () => window.removeEventListener("resize", resize);
    }, [frameIndex, totalFrames]);

    return (
        <div className={styles.container}>
            <div className={styles.canvasContainer}>
                <canvas ref={canvasRef} className={styles.canvas} />
            </div>

            {/* Transparent element to provide scroll height */}
            <div className={styles.scrollSection} style={{ height: `${totalFrames * 50}px` }} />

            {imagesLoaded < totalFrames && (
                <div className={styles.loading}>
                    Loading frames... {Math.round((imagesLoaded / totalFrames) * 100)}%
                </div>
            )}
        </div>
    );
}
