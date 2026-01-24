import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
    audio: {
        voice_name: string;
        duration: string;
    };
    movieTitle: string;
}
export default function AudioPlayer({ audio, movieTitle }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Simulated audio playback (since we don't have real audio files)
    const intervalRef = useRef<number | null>(null);

    // Parse duration string to seconds
    useEffect(() => {
        if (audio?.duration) {
            const parts = audio.duration.split(':');
            if (parts.length === 2) {
                setDuration(parseInt(parts[0]) * 60 + parseInt(parts[1]));
            }
        }
    }, [audio]);

    useEffect(() => {
        if (isPlaying && duration > 0) {
            intervalRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev >= duration) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, duration]);

    useEffect(() => {
        if (duration > 0) {
            setProgress((currentTime / duration) * 100);
        }
    }, [currentTime, duration]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (value: number[]) => {
        const newTime = (value[0] / 100) * duration;
        setCurrentTime(newTime);
        setProgress(value[0]);
    };

    const handleRestart = () => {
        setCurrentTime(0);
        setProgress(0);
        setIsPlaying(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#FF6B35]/10 to-[#4ECDC4]/10 border border-[#FF6B35]/20 rounded-2xl p-4 md:p-6"
        >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Play Controls */}
                <div className="flex items-center gap-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] w-14 h-14 rounded-full p-0 hover:shadow-[0_10px_40px_rgba(255,107,53,0.4)]"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6 text-white" />
                            ) : (
                                <Play className="w-6 h-6 text-white ml-1" />
                            )}
                        </Button>
                    </motion.div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#A0A0AB] hover:text-white"
                        onClick={handleRestart}
                    >
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                </div>

                {/* Info & Progress */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-white font-semibold text-sm md:text-base">
                                🎧 Narración Premium
                            </p>
                            <p className="text-xs text-[#6B6B78]">
                                {audio.voice_name} • {movieTitle}
                            </p>
                        </div>
                        <span className="text-[#A0A0AB] font-mono text-sm">
                            {formatTime(currentTime)} / {audio.duration}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <Slider
                        value={[progress]}
                        max={100}
                        step={0.1}
                        className="cursor-pointer"
                        onValueChange={handleProgressChange}
                    />
                </div>

                {/* Volume Control */}
                <div className="hidden md:flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#A0A0AB] hover:text-white"
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                        ) : (
                            <Volume2 className="w-5 h-5" />
                        )}
                    </Button>
                    <Slider
                        value={[isMuted ? 0 : volume]}
                        max={100}
                        step={1}
                        className="w-24"
                        onValueChange={(value) => {
                            setVolume(value[0]);
                            setIsMuted(false);
                        }}
                    />
                </div>
            </div>

            {/* Waveform Visualization (decorative) */}
            <div className="mt-4 flex items-center justify-center gap-1 h-8 overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-1 bg-gradient-to-t from-[#FF6B35] to-[#4ECDC4] rounded-full"
                        animate={{
                            height: isPlaying
                                ? [8, Math.random() * 24 + 8, 8]
                                : 8
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: isPlaying ? Infinity : 0,
                            delay: i * 0.02
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}