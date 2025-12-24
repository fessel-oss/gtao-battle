// YouTube player component with synchronized playback

import { useEffect, useRef, useId, useCallback } from "react";
import { useYouTube } from "../../hooks/useYouTube";

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  onReady?: () => void;
  startTime?: number; // Timestamp when to start (for sync)
  seekTo?: number; // Position in seconds to seek to when playing
  audioOnly?: boolean;
}

export function YouTubePlayer({
  videoId,
  isPlaying,
  onReady,
  startTime,
  seekTo,
  audioOnly = false,
}: YouTubePlayerProps) {
  const containerId = useId().replace(/:/g, "_");
  const scheduledPlayRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSeekRef = useRef<number | undefined>(undefined);

  const handleReady = useCallback(() => {
    onReady?.();
  }, [onReady]);

  const { isReady, play, pause, seekTo: seekToPosition } = useYouTube({
    videoId,
    containerId: `yt-player-${containerId}`,
    onReady: handleReady,
  });

  // Handle play/pause state changes
  useEffect(() => {
    if (!isReady) return;

    // Clear any scheduled play
    if (scheduledPlayRef.current) {
      clearTimeout(scheduledPlayRef.current);
      scheduledPlayRef.current = undefined;
    }

    if (isPlaying) {
      const doPlay = () => {
        // Only seek if we have a position and it's different from last seek
        if (seekTo !== undefined && seekTo !== lastSeekRef.current) {
          console.log(`[YouTubePlayer] Seeking to ${seekTo}s and playing`);
          seekToPosition(seekTo);
          lastSeekRef.current = seekTo;
        }
        play();
      };

      if (startTime) {
        // Schedule play at specific time for synchronization
        const delay = startTime - Date.now();
        if (delay > 0) {
          scheduledPlayRef.current = setTimeout(doPlay, delay);
        } else {
          doPlay();
        }
      } else {
        doPlay();
      }
    } else {
      pause();
    }

    return () => {
      if (scheduledPlayRef.current) {
        clearTimeout(scheduledPlayRef.current);
      }
    };
  }, [isPlaying, isReady, startTime, seekTo, play, pause, seekToPosition]);

  // Reset lastSeekRef when video changes
  useEffect(() => {
    lastSeekRef.current = undefined;
  }, [videoId]);

  // When audioOnly, we render the player off-screen but it still plays audio
  if (audioOnly) {
    return (
      <div
        className="fixed -left-[9999px] -top-[9999px] w-[1px] h-[1px] overflow-hidden"
        aria-hidden="true"
      >
        <div id={`yt-player-${containerId}`} className="w-[320px] h-[180px]" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div id={`yt-player-${containerId}`} className="w-full h-full" />
    </div>
  );
}
