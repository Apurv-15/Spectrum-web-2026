import { create } from "zustand";

type overlayActive = {
  isActive: boolean;
  removeGif: boolean;
  isLandingReady: boolean;
  preloaderProgress: number;
  bitMapCache: ImageBitmap[][] | null;
  cacheType: "mobile" | "desktop" | null;
  isPlaying: boolean;
  spritesLoaded: number;
  isFetchingSprites: boolean;
  setActive: () => void;
  setRemoveGif: () => void;
  setLandingReady: (ready: boolean) => void;
  setPreloaderProgress: (progress: number) => void;
  setBitMapCache: (cache: ImageBitmap[][] | null, type: "mobile" | "desktop") => void;
  setIsPlaying: (playing: boolean) => void;
  setSpritesLoaded: (count: number) => void;
  setIsFetchingSprites: (fetching: boolean) => void;
  togglePlaying: () => void;
  resetActive: () => void;
  resetRemoveGif: () => void;
};

const useOverlayStore = create<overlayActive>((set) => ({
  isActive: false,
  removeGif: false,
  isLandingReady: false,
  preloaderProgress: 0,
  bitMapCache: null,
  cacheType: null,
  isPlaying: false,
  spritesLoaded: 0,
  isFetchingSprites: false,
  setActive: () => set({ isActive: true }),
  setRemoveGif: () => set({ removeGif: true, isActive: true }),
  setLandingReady: (ready) => set({ isLandingReady: ready }),
  setPreloaderProgress: (progress) => set({ preloaderProgress: progress }),
  setBitMapCache: (cache, type) => set({ bitMapCache: cache, cacheType: type }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSpritesLoaded: (count) => set({ spritesLoaded: count }),
  setIsFetchingSprites: (fetching) => set({ isFetchingSprites: fetching }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  resetActive: () => set({ isActive: false }),
  resetRemoveGif: () => set({ removeGif: false, isLandingReady: false }),
}));

export default useOverlayStore;

type ham = {
    isHamOpen: boolean;
    setHamOpen: (isOpen: boolean) => void;
}
export const useHamStore = create<ham>((set) => ({
    isHamOpen: false,
    setHamOpen: (isOpen) => set({ isHamOpen: isOpen })
}));

type mainHam = {
    isMainHamOpen: boolean;
    setMainHamOpen: (isOpen: boolean) => void;
}
export const useMainHamStore = create<mainHam>((set) => ({
    isMainHamOpen: false,
    setMainHamOpen: (isOpen) => set({ isMainHamOpen: isOpen })
}));
