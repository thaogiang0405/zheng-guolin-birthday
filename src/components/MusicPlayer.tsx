import { motion } from "framer-motion";
import { Disc3, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAudioExperience } from "../audio/AudioExperience";

type MusicPlayerLabels = {
  title: string;
  unavailable: string;
  error: string;
  play: string;
  pause: string;
  mute: string;
  unmute: string;
  volume: string;
  progress: string;
  addMusicHint: string;
  errorHint: string;
};

type MusicPlayerProps = {
  labels: MusicPlayerLabels;
  title: string;
  subtitle: string;
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}

function formatTime(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function MusicPlayer({ labels, title, subtitle }: MusicPlayerProps) {
  const {
    hasTrack,
    isPlaying,
    isMuted,
    volume,
    progress,
    duration,
    togglePlayback,
    toggleMute,
    setVolume,
    seek,
    error,
  } = useAudioExperience();

  const hasPlaybackError = Boolean(error);
  const available = hasTrack && !hasPlaybackError;
  const safeProgress = clamp(progress);
  const safeVolume = clamp(volume);
  const currentTime = duration > 0 ? duration * safeProgress : 0;
  const status = hasPlaybackError ? labels.error : (available ? subtitle : labels.unavailable);
  const unavailableHint = hasPlaybackError ? labels.errorHint : labels.addMusicHint;
  const playbackLabel = isPlaying ? labels.pause : labels.play;
  const muteLabel = isMuted ? labels.unmute : labels.mute;

  return (
    <aside
      aria-label={labels.title}
      className="fixed bottom-[max(0.875rem,env(safe-area-inset-bottom))] right-[max(0.875rem,env(safe-area-inset-right))] z-40 w-[min(22rem,calc(100vw-1.75rem))]"
    >
      <div className="relative overflow-hidden rounded-[1.45rem] border border-white/55 bg-[#fffaf0]/82 p-3 shadow-[0_20px_55px_rgba(99,71,22,0.22)] backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_20px_55px_rgba(0,0,0,0.42)]">
        <div className="pointer-events-none absolute -right-9 -top-10 h-32 w-32 rounded-full bg-[#F6CE4B]/35 blur-3xl dark:bg-[#D7AC64]/20" />
        <div className="pointer-events-none absolute -bottom-12 left-8 h-24 w-24 rounded-full bg-[#A9DDF1]/30 blur-3xl dark:bg-[#A9DDF1]/10" />

        <div className="relative flex items-center gap-3">
          <motion.div
            aria-hidden="true"
            animate={available && isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={available && isPlaying ? { duration: 3.4, ease: "linear", repeat: Infinity } : { duration: 0.35 }}
            className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-[5px] border-[#29282C] bg-[radial-gradient(circle_at_35%_30%,#4c4b52_0%,#29282C_46%,#131318_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2),0_8px_20px_rgba(41,40,44,0.22)]"
          >
            <span className="absolute inset-1 rounded-full border border-white/10" />
            <span className="absolute inset-[0.7rem] rounded-full border border-white/10" />
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#D7AC64] shadow-inner">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFF5E4]" />
            </span>
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#9a6e22] dark:text-[#f4cf75]">
              {labels.title}
            </p>
            <p className="mt-0.5 truncate font-editorial text-base font-semibold text-[#29282C] dark:text-[#fff8e9]">
              {title}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#29282C]/58 dark:text-slate-300" aria-live="polite">
              {status}
            </p>
          </div>

          <button
            type="button"
            disabled={!available}
            onClick={() => void togglePlayback()}
            aria-label={playbackLabel}
            aria-pressed={isPlaying}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#29282C] text-[#FFF5E4] shadow-lg transition hover:scale-105 hover:bg-[#3c3a41] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F6CE4B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf0] disabled:cursor-not-allowed disabled:bg-[#29282C]/25 disabled:text-[#29282C]/40 dark:focus-visible:ring-offset-slate-900"
          >
            {isPlaying && available ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        <div className="relative mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <span className="min-w-[2.5rem] text-right font-mono text-[0.65rem] tabular-nums text-[#29282C]/55 dark:text-slate-400">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={safeProgress}
            disabled={!available}
            onChange={(event) => seek(clamp(Number(event.currentTarget.value)))}
            aria-label={labels.progress}
            aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
            style={{
              background: `linear-gradient(90deg, #D7AC64 0%, #D7AC64 ${safeProgress * 100}%, rgba(212, 175, 55, 0.18) ${safeProgress * 100}%, rgba(212, 175, 55, 0.18) 100%)`,
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[#D7AC64] transition-[background] duration-200 disabled:cursor-not-allowed disabled:opacity-40"
          />
          <span className="min-w-[2.5rem] font-mono text-[0.65rem] tabular-nums text-[#29282C]/55 dark:text-slate-400">
            {formatTime(duration)}
          </span>
        </div>

        <div className="relative mt-2 flex items-center gap-2 border-t border-[#D7AC64]/20 pt-2 dark:border-white/10">
          <button
            type="button"
            disabled={!available}
            onClick={toggleMute}
            aria-label={muteLabel}
            aria-pressed={isMuted}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#72531b] transition hover:bg-[#F6CE4B]/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F6CE4B] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#f4cf75] dark:hover:bg-white/10"
          >
            {isMuted || safeVolume === 0 ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={safeVolume}
            disabled={!available}
            onChange={(event) => setVolume(clamp(Number(event.currentTarget.value)))}
            aria-label={labels.volume}
            aria-valuetext={`${Math.round(safeVolume * 100)}%`}
            style={{
              background: `linear-gradient(90deg, #D7AC64 0%, #D7AC64 ${safeVolume * 100}%, rgba(212, 175, 55, 0.18) ${safeVolume * 100}%, rgba(212, 175, 55, 0.18) 100%)`,
            }}
            className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full accent-[#D7AC64] transition-[background] duration-200 disabled:cursor-not-allowed disabled:opacity-40"
          />
          <div className="min-w-[3.2rem] text-right text-[0.65rem] font-bold tabular-nums text-[#72531b] dark:text-[#f4cf75]">
            {Math.round(safeVolume * 100)}%
          </div>
        </div>

        {!available && (
          <div className="relative mt-2 flex items-center gap-1.5 rounded-xl bg-[#D7AC64]/10 px-2.5 py-2 text-[0.68rem] leading-4 text-[#72531b] dark:bg-[#D7AC64]/10 dark:text-[#f4cf75]">
            <Disc3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{unavailableHint}</span>
          </div>
        )}
      </div>
    </aside>
  );
}

export default MusicPlayer;
