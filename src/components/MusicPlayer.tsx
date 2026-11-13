import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
  src?: string;
  label: string;
}

export function MusicPlayer({ src, label }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => () => audioRef.current?.pause(), []);

  if (!src) return null;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex overflow-hidden rounded-full border border-[#D7AC64]/35 bg-[#FFFCF6]/90 shadow-xl backdrop-blur-md dark:bg-[#29282C]/90 sm:right-6">
      <audio ref={audioRef} src={src} preload="none" loop onEnded={() => setPlaying(false)} />
      <button type="button" onClick={togglePlayback} className="flex min-h-11 min-w-11 items-center justify-center text-[#29282C] transition hover:bg-[#F6CE4B] dark:text-[#FFF5E4]" aria-label={label} aria-pressed={playing}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button type="button" onClick={toggleMute} className="flex min-h-11 min-w-11 items-center justify-center border-l border-[#D7AC64]/25 text-[#29282C] transition hover:bg-[#FFF0B8] dark:text-[#FFF5E4]" aria-label={muted ? "Unmute" : "Mute"} aria-pressed={muted}>
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
