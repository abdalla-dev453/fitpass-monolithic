import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  Tv,
  SlidersHorizontal,
  AlertCircle,
  X,
} from "lucide-react";

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export default function VideoPlayer({
  movie,
  onClose,
  isTheaterMode,
  setIsTheaterMode,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const [customStreamUrl, setCustomStreamUrl] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Active stream source: user custom or movie videoUrl
  const activeVideoUrl = customStreamUrl || movie?.videoUrl;

  // Handle Controls Visibility on inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Skip 10 seconds backward or forward
  const skipTime = useCallback((seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
    );
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  }, [isMuted]);

  // Adjust volume
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Change Playback Speed
  const handleSpeedSelect = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  // Toggle Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Toggle Picture in Picture
  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("Picture-in-picture failed:", err);
    }
  };

  // Scrubber / Seek Handler
  const handleScrubberClick = (e) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = percentage * duration;
  };

  const handleScrubberHover = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverPosition(percentage * 100);
    setHoverTime(percentage * duration);
  };

  // Auto-save watch position and update continue watching history
  const saveProgress = useCallback(() => {
    if (!videoRef.current || !movie?.id) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    if (dur > 0 && cur > 5) {
      const payload = {
        movieId: movie.id,
        title: movie.title,
        poster: movie.poster,
        currentTime: cur,
        duration: dur,
        percentage: Math.round((cur / dur) * 100),
        lastWatched: Date.now(),
      };
      try {
        localStorage.setItem(`fitpass_watch_${movie.id}`, JSON.stringify(payload));
        // Add to history list
        const histRaw = localStorage.getItem("fitpass_continue_watching");
        let list = histRaw ? JSON.parse(histRaw) : [];
        list = list.filter((item) => item.movieId !== movie.id);
        list.unshift(payload);
        localStorage.setItem("fitpass_continue_watching", JSON.stringify(list.slice(0, 10)));
      } catch (e) {
        console.warn("Storage save failed", e);
      }
    }
  }, [movie]);

  // Video Events
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedPercent((bufferedEnd / (videoRef.current.duration || 1)) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    setDuration(dur);
    setVideoError(false);

    // Resume from saved timestamp
    if (!hasResumed && movie?.id) {
      try {
        const saved = localStorage.getItem(`fitpass_watch_${movie.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.currentTime && parsed.currentTime < dur - 10) {
            videoRef.current.currentTime = parsed.currentTime;
            setCurrentTime(parsed.currentTime);
          }
        }
      } catch {}
      setHasResumed(true);
    }

    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  // Hotkey Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
          e.preventDefault();
          skipTime(-10);
          break;
        case "arrowright":
          e.preventDefault();
          skipTime(10);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "t":
          e.preventDefault();
          setIsTheaterMode((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skipTime, toggleMute, toggleFullscreen, setIsTheaterMode]);

  // Periodic Save
  useEffect(() => {
    const interval = setInterval(saveProgress, 4000);
    return () => {
      clearInterval(interval);
      saveProgress();
    };
  }, [saveProgress]);

  // Handle Fullscreen state change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative bg-black border-2 border-zinc-800 overflow-hidden select-none transition-all duration-300 ${
        isTheaterMode ? "w-full max-w-full aspect-[21/9] sm:aspect-video" : "w-full aspect-video"
      } ${isFullscreen ? "border-0" : "shadow-[8px_8px_0px_0px_rgba(204,255,0,0.8)]"}`}
    >
      {/* VIDEO ELEMENT */}
      <video
        ref={videoRef}
        src={activeVideoUrl}
        poster={movie?.backdrop || movie?.poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        onError={() => {
          setVideoError(true);
          setIsBuffering(false);
        }}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* BUFFERING SPINNER OVERLAY */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="h-14 w-14 rounded-full border-4 border-zinc-700 border-t-[#CCFF00] animate-spin" />
        </div>
      )}

      {/* ERROR FALLBACK OVERLAY */}
      {videoError && (
        <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center z-40 space-y-4">
          <AlertCircle size={36} className="text-[#CCFF00]" />
          <div>
            <h4 className="font-display font-black text-xl uppercase text-white">STREAM SIGNAL RECONNECTING</h4>
            <p className="text-zinc-400 text-xs mt-1 uppercase max-w-md">
              The external sample stream URL did not respond. Paste a custom direct video URL or choose another title from the theater library.
            </p>
          </div>
          <button
            onClick={() => setShowCustomInput(true)}
            className="bg-[#CCFF00] text-black font-display font-black text-xs uppercase px-5 py-2.5 border border-black hover:bg-white"
          >
            PASTE DIRECT MP4 STREAM URL
          </button>
        </div>
      )}

      {/* TOP BAR OVERLAY: Movie Title & Quick Tools */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="bg-[#CCFF00] text-black font-sans font-black text-[9px] uppercase px-2.5 py-0.5 border border-black">
            {movie?.quality || "4K THEATER"}
          </span>
          <h2 className="font-display font-black text-sm sm:text-lg uppercase text-white tracking-wide truncate max-w-xs sm:max-w-md">
            {movie?.title}
          </h2>
          {movie?.year && (
            <span className="text-zinc-500 font-mono text-xs hidden sm:inline-block">({movie.year})</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Stream Input Toggle */}
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="p-2 border border-zinc-800 bg-zinc-900/80 hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] text-zinc-300 rounded-none transition-colors text-[10px] font-black uppercase flex items-center gap-1.5"
            title="Switch Stream Source"
          >
            <SlidersHorizontal size={13} />
            <span className="hidden md:inline">SOURCE</span>
          </button>

          {/* Close Player */}
          {onClose && (
            <button
              onClick={() => {
                saveProgress();
                onClose();
              }}
              className="p-2 border border-zinc-800 bg-zinc-900/80 hover:bg-red-500 hover:text-white hover:border-red-500 text-zinc-400 rounded-none transition-colors"
              title="Close Player"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* CUSTOM STREAM INPUT DRAWER */}
      {showCustomInput && (
        <div className="absolute top-16 left-4 right-4 sm:left-6 sm:right-6 bg-zinc-950/95 border-2 border-zinc-800 p-4 z-40 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00]">
              ENTER CUSTOM VIDEO / STREAM URL
            </span>
            <button
              onClick={() => setShowCustomInput(false)}
              className="text-zinc-500 hover:text-white text-xs font-bold"
            >
              DISMISS
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={customStreamUrl}
              onChange={(e) => setCustomStreamUrl(e.target.value)}
              placeholder="Paste direct MP4/WebM URL (e.g. https://.../video.mp4)"
              className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#CCFF00]"
            />
            <button
              onClick={() => {
                setShowCustomInput(false);
                setVideoError(false);
              }}
              className="bg-[#CCFF00] text-black font-display font-black text-xs uppercase px-4 py-2 hover:bg-white"
            >
              LOAD STREAM
            </button>
          </div>
        </div>
      )}

      {/* CENTER BIG PLAY / PAUSE BUTTON */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto h-20 w-20 bg-[#CCFF00]/95 hover:bg-white text-black flex items-center justify-center transition-all duration-150 transform hover:scale-105 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-20"
          aria-label="Play Video"
        >
          <Play size={32} fill="currentColor" className="ml-1" />
        </button>
      )}

      {/* BOTTOM CONTROLS RACK */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* TIMELINE PROGRESS BAR */}
        <div
          ref={progressBarRef}
          onClick={handleScrubberClick}
          onMouseMove={handleScrubberHover}
          onMouseLeave={() => setHoverTime(null)}
          className="relative h-2.5 sm:h-3 w-full bg-zinc-800/80 cursor-pointer group mb-4 transition-all hover:h-4"
        >
          {/* Buffered Track */}
          <div
            className="absolute top-0 left-0 h-full bg-zinc-600/60"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Played Track */}
          <div
            className="absolute top-0 left-0 h-full bg-[#CCFF00]"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Hover Scrub Line */}
          {hoverTime !== null && (
            <div
              className="absolute top-0 h-full w-0.5 bg-white pointer-events-none"
              style={{ left: `${hoverPosition}%` }}
            />
          )}
          {/* Hover Timestamp Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute bottom-6 -translate-x-1/2 bg-black border border-zinc-700 text-white font-mono text-[10px] px-2 py-0.5 pointer-events-none"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
          {/* Scrub Thumb Dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 bg-[#CCFF00] border-2 border-black rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between text-white text-xs gap-3">
          {/* Left Actions: Play/Pause, Skips, Volume, Timer */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlay}
              className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] transition-colors"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
            </button>

            {/* Skip Back 10s */}
            <button
              onClick={() => skipTime(-10)}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Rewind 10s (Left Arrow)"
            >
              <RotateCcw size={16} />
            </button>

            {/* Skip Forward 10s */}
            <button
              onClick={() => skipTime(10)}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Fast Forward 10s (Right Arrow)"
            >
              <RotateCw size={16} />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={17} className="text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 size={17} />
                ) : (
                  <Volume2 size={17} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 accent-[#CCFF00] cursor-pointer h-1.5 bg-zinc-800"
              />
            </div>

            {/* Time Stamp Display */}
            <div className="text-[11px] font-mono tracking-wider text-zinc-400 hidden sm:block">
              <span className="text-white font-bold">{formatTime(currentTime)}</span> /{" "}
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Actions: Speed, Theater, PiP, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Playback Speed Picker */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-[#CCFF00] font-mono text-[10px] font-bold tracking-wider uppercase transition-colors"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 bg-zinc-950 border-2 border-zinc-800 p-1 flex flex-col gap-1 z-40 shadow-xl">
                  {SPEED_OPTIONS.map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedSelect(spd)}
                      className={`px-3 py-1 font-mono text-[10px] text-left uppercase hover:bg-[#CCFF00] hover:text-black transition-colors ${
                        playbackSpeed === spd
                          ? "bg-[#CCFF00] text-black font-black"
                          : "text-zinc-400"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              onClick={togglePip}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors hidden sm:block"
              title="Picture in Picture"
            >
              <PictureInPicture size={16} />
            </button>

            {/* Theater Mode */}
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className={`p-1.5 transition-colors hidden md:block ${
                isTheaterMode ? "text-[#CCFF00]" : "text-zinc-400 hover:text-white"
              }`}
              title="Cinema Theater Mode (T)"
            >
              <Tv size={16} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
