import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type EffectName = "gift" | "letter" | "candles" | "finale";
export type AudioExperienceError = "music-playback" | "music-load" | null;

export interface AudioExperienceConfig {
  /** A looped background-music source. Omit it to run without background music. */
  musicPath?: string;
  /** Sound-effect sources, created lazily only when their named effect is requested. */
  effects?: Partial<Record<EffectName, string>>;
  /** Optional metadata for a player UI consuming this context. */
  title?: string;
  /** Optional supporting metadata for a player UI consuming this context. */
  subtitle?: string;
}

export interface AudioExperienceState {
  isPlaying: boolean;
  isMuted: boolean;
  /** User-selected level from 0 to 1. This never reflects temporary ducking. */
  volume: number;
  /** Played proportion from 0 to 1. */
  progress: number;
  /** Track length in seconds; 0 until the browser knows it. */
  duration: number;
  hasTrack: boolean;
  /** Machine-readable background-audio failure state for a localized UI to map. */
  error: AudioExperienceError;
}

export interface AudioExperienceActions {
  /** Starts the configured background track after an explicit gift-opening interaction. */
  startAfterGift: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  toggleMute: () => void;
  /** Sets the preferred playback level, clamped to 0..1. */
  setVolume: (volume: number) => void;
  /** Seeks to a normalized position (0 = start, 1 = end). */
  seek: (progress: number) => void;
  /** Plays a configured effect, temporarily ducking active background music. */
  playEffect: (effect: EffectName) => Promise<void>;
}

export interface AudioExperienceValue
  extends AudioExperienceState,
    AudioExperienceActions {
  config: AudioExperienceConfig;
  title?: string;
  subtitle?: string;
}

export interface AudioExperienceProviderProps {
  config?: AudioExperienceConfig;
  children: ReactNode;
}

const DUCKING_FACTOR = 0.34;
const DUCK_IN_DURATION_MS = 130;
const RESTORE_DURATION_MS = 240;
const MAX_EFFECT_DURATION_MS = 8_000;
const INITIAL_STATE: AudioExperienceState = {
  isPlaying: false,
  isMuted: false,
  volume: 0.72,
  progress: 0,
  duration: 0,
  hasTrack: false,
  error: null,
};

const AudioExperienceContext = createContext<AudioExperienceValue | null>(null);

function clamp(value: number, minimum = 0, maximum = 1) {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}

function validDuration(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function hasSource(source: string | undefined): source is string {
  return Boolean(source?.trim());
}

export function AudioExperienceProvider({
  config = {},
  children,
}: AudioExperienceProviderProps) {
  const musicPath = config.musicPath;
  const trackSource = hasSource(musicPath) ? musicPath : undefined;
  const musicRef = useRef<HTMLAudioElement>(null);
  const effectPlayersRef = useRef(new Set<HTMLAudioElement>());
  const effectTimersRef = useRef(new Set<number>());
  const duckingDepthRef = useRef(0);
  const volumeAnimationRef = useRef<number | null>(null);
  const playbackSettingsRef = useRef({
    isMuted: INITIAL_STATE.isMuted,
    volume: INITIAL_STATE.volume,
  });
  const [state, setState] = useState<AudioExperienceState>(() => ({
    ...INITIAL_STATE,
    hasTrack: Boolean(trackSource),
  }));

  playbackSettingsRef.current = {
    isMuted: state.isMuted,
    volume: state.volume,
  };

  const cancelVolumeAnimation = useCallback(() => {
    if (volumeAnimationRef.current === null || typeof window === "undefined") return;
    window.cancelAnimationFrame(volumeAnimationRef.current);
    volumeAnimationRef.current = null;
  }, []);

  const applyMusicVolume = useCallback((rampDuration = 0) => {
    const music = musicRef.current;
    if (!music) return;

    const { isMuted, volume } = playbackSettingsRef.current;

    const level = isMuted
      ? 0
      : volume * (duckingDepthRef.current > 0 ? DUCKING_FACTOR : 1);

    cancelVolumeAnimation();

    if (
      isMuted ||
      !rampDuration ||
      typeof window === "undefined" ||
      typeof window.requestAnimationFrame !== "function"
    ) {
      music.muted = isMuted;
      music.volume = clamp(level);
      return;
    }

    music.muted = false;
    const startingVolume = clamp(music.volume);
    const targetVolume = clamp(level);
    if (Math.abs(startingVolume - targetVolume) < 0.002) {
      music.volume = targetVolume;
      return;
    }

    const startedAt = window.performance?.now?.() ?? Date.now();
    const animate = (now: number) => {
      const progress = clamp((now - startedAt) / rampDuration);
      // A small ease-out curve feels less abrupt than a direct volume jump.
      const eased = 1 - (1 - progress) ** 2;
      music.volume = clamp(startingVolume + (targetVolume - startingVolume) * eased);

      if (progress < 1) {
        volumeAnimationRef.current = window.requestAnimationFrame(animate);
      } else {
        volumeAnimationRef.current = null;
        music.volume = targetVolume;
      }
    };

    volumeAnimationRef.current = window.requestAnimationFrame(animate);
  }, [cancelVolumeAnimation]);

  const updateTimeline = useCallback(() => {
    const music = musicRef.current;
    if (!music) return;

    const duration = validDuration(music.duration);
    const progress = duration ? clamp(music.currentTime / duration) : 0;

    setState((current) => {
      if (current.duration === duration && current.progress === progress) return current;
      return { ...current, duration, progress };
    });
  }, []);

  const playBackground = useCallback(async () => {
    const music = musicRef.current;
    if (!music || !hasSource(musicPath)) return;

    applyMusicVolume();

    try {
      await music.play();
      setState((current) => ({ ...current, isPlaying: true, error: null }));
    } catch {
      setState((current) => ({
        ...current,
        isPlaying: false,
        error: "music-playback",
      }));
    }
  }, [applyMusicVolume, musicPath]);

  const startAfterGift = useCallback(async () => {
    await playBackground();
  }, [playBackground]);

  const togglePlayback = useCallback(async () => {
    const music = musicRef.current;
    if (!music || !hasSource(musicPath)) return;

    if (music.paused) {
      await playBackground();
      return;
    }

    music.pause();
    setState((current) => ({ ...current, isPlaying: false, error: null }));
  }, [musicPath, playBackground]);

  const toggleMute = useCallback(() => {
    setState((current) => ({ ...current, isMuted: !current.isMuted }));
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    setState((current) => ({ ...current, volume: clamp(nextVolume) }));
  }, []);

  const seek = useCallback((nextProgress: number) => {
    const music = musicRef.current;
    const duration = music ? validDuration(music.duration) : 0;
    if (!music || !duration || !hasSource(musicPath)) return;

    const progress = clamp(nextProgress);
    music.currentTime = duration * progress;
    setState((current) => ({ ...current, progress, duration }));
  }, [musicPath]);

  const playEffect = useCallback(
    async (effectName: EffectName) => {
      const path = config.effects?.[effectName];
      if (!hasSource(path) || typeof Audio === "undefined") return;

      const effect = new Audio(path);
      const music = musicRef.current;
      const shouldDuck = Boolean(music && !music.paused && hasSource(musicPath));
      let settled = false;
      let fallbackTimer: number | undefined;
      const { isMuted, volume } = playbackSettingsRef.current;

      effect.preload = "auto";
      effect.muted = isMuted;
      effect.volume = clamp(volume);
      effectPlayersRef.current.add(effect);

      if (shouldDuck) {
        duckingDepthRef.current += 1;
        applyMusicVolume(DUCK_IN_DURATION_MS);
      }

      const clearFallbackTimer = () => {
        if (fallbackTimer === undefined || typeof window === "undefined") return;
        window.clearTimeout(fallbackTimer);
        effectTimersRef.current.delete(fallbackTimer);
        fallbackTimer = undefined;
      };

      const scheduleFallbackRestore = (durationMs = MAX_EFFECT_DURATION_MS) => {
        if (typeof window === "undefined") return;
        clearFallbackTimer();
        const boundedDuration = Math.max(400, Math.min(durationMs, MAX_EFFECT_DURATION_MS));
        fallbackTimer = window.setTimeout(() => {
          if (fallbackTimer !== undefined) {
            effectTimersRef.current.delete(fallbackTimer);
            fallbackTimer = undefined;
          }
          restoreAfterEffect(true);
        }, boundedDuration);
        effectTimersRef.current.add(fallbackTimer);
      };

      const restoreAfterEffect = (stopEffect = false) => {
        if (settled) return;
        settled = true;
        clearFallbackTimer();
        effectPlayersRef.current.delete(effect);
        effect.onended = null;
        effect.onerror = null;
        effect.onloadedmetadata = null;

        if (stopEffect) effect.pause();

        if (shouldDuck) {
          duckingDepthRef.current = Math.max(0, duckingDepthRef.current - 1);
          if (duckingDepthRef.current === 0) applyMusicVolume(RESTORE_DURATION_MS);
        }
      };

      effect.onended = () => restoreAfterEffect();
      effect.onerror = () => {
        restoreAfterEffect();
      };
      effect.onloadedmetadata = () => {
        const duration = validDuration(effect.duration);
        if (duration) scheduleFallbackRestore(duration * 1_000 + 320);
      };
      scheduleFallbackRestore();

      try {
        await effect.play();
      } catch {
        restoreAfterEffect();
      }
    },
    [applyMusicVolume, config.effects, musicPath],
  );

  useEffect(() => {
    cancelVolumeAnimation();
    musicRef.current?.pause();
    setState((current) => ({
      ...current,
      isPlaying: false,
      duration: 0,
      progress: 0,
      hasTrack: Boolean(trackSource),
      error: null,
    }));
  }, [cancelVolumeAnimation, trackSource]);

  useEffect(() => {
    applyMusicVolume();
  }, [applyMusicVolume, state.isMuted, state.volume]);

  useEffect(() => {
    effectPlayersRef.current.forEach((effect) => {
      effect.muted = state.isMuted;
      effect.volume = clamp(state.volume);
    });
  }, [state.isMuted, state.volume]);

  useEffect(() => {
    return () => {
      musicRef.current?.pause();
      cancelVolumeAnimation();
      effectTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      effectTimersRef.current.clear();
      effectPlayersRef.current.forEach((effect) => {
        effect.onended = null;
        effect.onerror = null;
        effect.onloadedmetadata = null;
        effect.pause();
      });
      effectPlayersRef.current.clear();
      duckingDepthRef.current = 0;
    };
  }, [cancelVolumeAnimation]);

  const value = useMemo<AudioExperienceValue>(
    () => ({
      ...state,
      config,
      title: config.title,
      subtitle: config.subtitle,
      startAfterGift,
      togglePlayback,
      toggleMute,
      setVolume,
      seek,
      playEffect,
    }),
    [
      config,
      playEffect,
      seek,
      setVolume,
      startAfterGift,
      state,
      toggleMute,
      togglePlayback,
    ],
  );

  return (
    <AudioExperienceContext.Provider value={value}>
      <audio
        ref={musicRef}
        src={trackSource}
        loop
        preload={trackSource ? "metadata" : "none"}
        aria-label={config.title ?? "Background music"}
        title={config.subtitle ?? config.title}
        onPlay={() => setState((current) => ({ ...current, isPlaying: true, error: null }))}
        onPause={() => setState((current) => ({ ...current, isPlaying: false }))}
        onLoadedMetadata={updateTimeline}
        onDurationChange={updateTimeline}
        onTimeUpdate={updateTimeline}
        onEnded={() => setState((current) => ({ ...current, isPlaying: false, progress: 0 }))}
        onError={() => {
          if (hasSource(musicPath)) {
            setState((current) => ({
              ...current,
              isPlaying: false,
              error: "music-load",
            }));
          }
        }}
      />
      {children}
    </AudioExperienceContext.Provider>
  );
}

export function useAudioExperience() {
  const context = useContext(AudioExperienceContext);
  if (!context) {
    throw new Error("useAudioExperience must be used inside an AudioExperienceProvider.");
  }
  return context;
}
