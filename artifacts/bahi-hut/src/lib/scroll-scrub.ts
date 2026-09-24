// Helpers shared by the scroll-scrubbed video scenes (the home hero and the
// Find Your Escape dive). Their videos are encoded with every frame a
// keyframe so scroll seeks are cheap.

// Kept a hair before the true end so the browser reliably renders the last
// frame instead of occasionally clamping/blanking exactly at duration.
const END_EPSILON_SECONDS = 0.05;

// Skip seeks smaller than half a frame - they wouldn't change the picture,
// just cost a decode.
const MIN_SEEK_DELTA_SECONDS = 1 / 60;

// How quickly a scene catches up to the scroll position each frame (0-1).
// Lower = smoother/laggier trailing motion, higher = snappier/closer to 1:1.
export const SMOOTHING = 0.12;

export const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

export const smoothstep = (from: number, to: number, x: number) => {
  const t = clamp01((x - from) / (to - from));
  return t * t * (3 - 2 * t);
};

// Seek only once the previous seek has finished decoding. Seeking every frame
// cancels in-flight seeks before they paint, which makes scrubbing jittery.
export const seekTo = (video: HTMLVideoElement, time: number) => {
  if (
    !video.seeking &&
    Number.isFinite(time) &&
    Math.abs(video.currentTime - time) > MIN_SEEK_DELTA_SECONDS
  ) {
    video.currentTime = time;
  }
};

export const maxTime = (video: HTMLVideoElement) =>
  Math.max(video.duration - END_EPSILON_SECONDS, 0);

// iOS Safari won't render frames reached via `currentTime` seeks until the
// video has actually played at least once. A muted, near-instant play/pause
// "primes" the decoder so later scroll-driven seeks show up.
export const primeVideo = (video: HTMLVideoElement, onPrimed: () => void) => {
  const playing = video.play();
  if (playing && typeof playing.then === 'function') {
    playing
      .then(() => {
        video.pause();
        onPrimed();
      })
      .catch(() => {
        /* Autoplay can be blocked; scrubbing still works once the user interacts. */
      });
  } else {
    video.pause();
  }
};

// Frame-rate independent easing factor, so 120Hz and 60Hz screens feel the
// same. `elapsedMs` is the time since the previous animation frame.
export const easeFactor = (elapsedMs: number) =>
  1 - Math.pow(1 - SMOOTHING, elapsedMs / 16.67);
