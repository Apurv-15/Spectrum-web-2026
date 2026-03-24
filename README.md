# 🏯 Spectrum Week 2026

A premium, cinematic web experience for GDG VIT Mumbai's Spectrum Week 2026. This project pushes the boundaries of modern front-end engineering with high-fidelity animations and a stylized Japanese aesthetic.

---

## 🎬 Cinematic Walkthrough
Experience the journey from the drawing preloader to the interactive Dragon menu and cinematic door transitions.

![Spectrum Cinematic Showcase](./public/demo/walkthrough.webp)

---

## 🛠️ Super Tech Stack
This project leverages a sophisticated stack to achieve its cinematic feel:

### 🎭 Animation & Motion
*   **[GSAP (GreenSock)](https://gsap.com/)**: Orchestrates the complex timelines, scroll-triggered frame sequences, and responsive animation states.
*   **[Lenis](https://lenis.darkroom.engineering/)**: Provides ultra-smooth inertia scrolling, essential for the "heavy" cinematic feel of the canvas scroll.
*   **[Framer Motion](https://www.framer.com/motion/)**: Handles interactive gestures, SVG layout transitions, and high-performance micro-animations.

### 🖼️ Cinematic Rendering
*   **Sprite Sheet Optimization**: Uses professional-grade sprite-sheet sequencing (similar to Apple and Amazon product pages) to deliver 240 high-resolution frames with minimal network overhead and maximum scroll fluidity.
*   **Custom 240-Frame Engine**: A high-performance canvas implementation that drives the first-person "push-in" cinematic scroll.
*   **SVG Masking & Ink Spread**: Advanced custom transitions using video masks and SVG path animations to simulate ink drawing and door reveals.
*   **Paper Texture Depth**: Strategic use of alpha-blended textures (`paper-texture.webp`) to give the digital interface a tangible, traditional feel.

### 🏗️ Architecture
*   **[React 19](https://react.dev/)**: The latest in UI orchestration with concurrent rendering support.
*   **[Zustand](https://zustand-demo.pmnd.rs/)**: Lightweight, high-performance state management for preloader progress and UI overlays.
*   **[Vite](https://vitejs.dev/)**: Next-generation frontend build tool for instant HMR and optimized production bundles.
*   **SCSS Modules**: Modular, type-safe styling to maintain a complex design system.

---

## 🚀 Key Features
*   **Drawing Preloader**: A custom hand-drawn SVG animation that reveals the UI based on real-time asset loading progress.
*   **Dragon Reveal (MainHam)**: A stylized vertical scroll menu that reveals a massive crimson dragon with interactive "cloud" navigation.
*   **Shoji Door Transitions**: Seamless page transitions using animated sliding doors and ink spread effects for depth.
*   **Interactive Audio Sync**: Background music that intelligently starts upon entry and persists through transitions.

---

## 💻 Development

### Setup
```bash
npm install
```

### Dev Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

---

Made with ❤️ by **GDG VIT Mumbai**
