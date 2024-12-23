import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { MdPause, MdPlayArrow, MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { Track, TreeNode } from "./Types";

type AudioPlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  volume: number;
  setVolume: (volume: number) => void;
  playAudio: (track: Track) => void;
  pauseAudio: () => void;
  checkSubTree: (node: TreeNode<Track>) => boolean;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', updateProgress);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [audioRef.current]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playAudio = async (track: Track) => {
    try {
      setIsLoading(true);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      setCurrentTrack(track);

      // Small delay to ensure audio is loaded
      await new Promise(resolve => setTimeout(resolve, 10));

      if (audioRef.current) {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const checkSubTree = (node: TreeNode<Track>): boolean => {
    if (node.value === currentTrack) return true;
    return node.children.some(checkSubTree);
  };

  return (
    <AudioPlayerContext.Provider value={{ currentTrack, isPlaying, isLoading, progress, volume, setVolume, playAudio, pauseAudio, checkSubTree }}>
      {children}
      <div className="fixed w-full md:w-auto bottom-0 right-0 p-2 duration-300">
        <div className={`flex min-w-[300px] flex-row justify-start items-center gap-3 p-3 bg-glass rounded-lg backdrop-blur-xl`}>
          <div className="flex grow flex-row items-center gap-3 overflow-hidden">
            {currentTrack ? (
              <a href={currentTrack.album.url} target="_blank">
                <img className="w-12 h-12 bg-lighter rounded" src={currentTrack.album.image} />
              </a>
            ) : (
              <div className="w-12 h-12 bg-lighter rounded" />
            )}
            <div className="flex flex-col overflow-hidden">
              <a
                className="whitespace-nowrap text-ellipsis overflow-hidden leading-[1.25] hover:underline"
                href={currentTrack?.url}
                target="_blank"
              >
                {currentTrack?.name}
              </a>
              <a
                className="whitespace-nowrap text-ellipsis overflow-hidden leading-[1.25] hover:underline opacity-60"
                href={currentTrack?.artists[0].url}
                target="_blank"
              >
                {currentTrack?.artists[0].name}
              </a>
            </div>
          </div>
          {isPlaying ? (
            <button className="text-2xl p-2" onClick={() => pauseAudio()}>
              <MdPause />
            </button>
          ) : (
            <button className="text-2xl p-2" onClick={() => playAudio(currentTrack!)}>
              <MdPlayArrow />
            </button>
          )}
          <div className="flex flex-row items-center gap-1 pr-2">
            <button className="text-xl" onClick={() => setVolume(volume === 0 ? 1 : 0)}>
              {volume === 0 ? <MdVolumeOff /> : <MdVolumeUp />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="unstyled w-24"
            />
          </div>
        </div>
        <audio ref={audioRef} src={currentTrack?.preview_url} loop={true} />
      </div>
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};

export default AudioPlayerProvider;
