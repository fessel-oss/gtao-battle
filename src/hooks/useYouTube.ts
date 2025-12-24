// YouTube IFrame API hook

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface UseYouTubeOptions {
  videoId: string;
  containerId: string;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
}

interface UseYouTubeReturn {
  player: YT.Player | null;
  isReady: boolean;
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;

  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  apiLoadPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });

  return apiLoadPromise;
}

export function useYouTube({
  videoId,
  containerId,
  onReady,
  onStateChange,
}: UseYouTubeOptions): UseYouTubeReturn {
  const playerRef = useRef<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Store callbacks in refs to avoid recreating player when they change
  const onReadyRef = useRef(onReady);
  const onStateChangeRef = useRef(onStateChange);

  // Keep refs updated
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      await loadYouTubeAPI();

      if (!mounted) return;

      // Check if container element exists
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`[YouTube] Container ${containerId} not found`);
        return;
      }

      // Destroy existing player if any
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Player might already be destroyed
        }
        playerRef.current = null;
        setIsReady(false);
      }

      // Create new player
      try {
        playerRef.current = new window.YT.Player(containerId, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0, // Hide controls for cleaner experience
            modestbranding: 1,
            rel: 0,
            fs: 0,
            disablekb: 1, // Disable keyboard controls
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (!mounted) return;
              console.log("[YouTube] Player ready");
              setIsReady(true);
              onReadyRef.current?.();
            },
            onStateChange: (event) => {
              if (!mounted) return;
              onStateChangeRef.current?.(event.data);
            },
            onError: (event) => {
              console.error("[YouTube] Player error:", event.data);
            },
          },
        });
      } catch (error) {
        console.error("[YouTube] Failed to create player:", error);
      }
    }

    init();

    return () => {
      mounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Player might already be destroyed
        }
        playerRef.current = null;
      }
    };
  }, [videoId, containerId]); // Only recreate when videoId or containerId changes

  const play = useCallback(() => {
    if (playerRef.current) {
      console.log("[YouTube] Playing video");
      playerRef.current.playVideo();
    } else {
      console.warn("[YouTube] Cannot play - player not ready");
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current) {
      console.log("[YouTube] Pausing video");
      playerRef.current.pauseVideo();
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  }, []);

  const getCurrentTime = useCallback(() => {
    return playerRef.current?.getCurrentTime() ?? 0;
  }, []);

  return {
    player: playerRef.current,
    isReady,
    play,
    pause,
    seekTo,
    getCurrentTime,
  };
}
