const debouncedHandler = (callback: () => void, period: number) => {
    let timer: number;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback();
        }, period);
    };
}

export default debouncedHandler;

/**
 * Returns true when the device is a touch-primary device (phone/tablet).
 * Evaluated once per call — callers should cache the result where needed.
 */
export const isTouchDevice = (): boolean =>
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;
