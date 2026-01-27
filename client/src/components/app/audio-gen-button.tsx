// src/components/AudioGenerationButton.tsx
import React, { useState } from 'react';
import { Play, Pause, Loader2, Volume2, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioGenerationButtonProps {
    narrative: string;
    movieTitle: string;
    movieId: number;
}

type AudioState = 'idle' | 'generating' | 'ready' | 'playing' | 'paused' | 'error';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3100';

export function AudioGenerationButton({ narrative, movieTitle, movieId }: AudioGenerationButtonProps) {
    const [state, setState] = useState<AudioState>('idle');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const generateAudio = async () => {
        try {
            setState('generating');
            setError(null);
            setProgress(0);

            console.log('🎙️ Generando audio...');

            // Truncate narrative if too long (TTS limit is 600 chars)
            const truncatedNarrative = narrative.length > 580
                ? narrative.substring(0, 580) + "..."
                : narrative;

            const response = await fetch(`${BACKEND_URL}/api/audio/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    narrative: truncatedNarrative,
                    movieTitle
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error generando audio');
            }

            const data = await response.json();
            console.log('📦 Response data:', data);

            // FIXED: Handle the actual response structure from backend
            const audioUrl =
                data.audio_base64.url ||
                data.output?.audio?.url ||           // Qwen direct response
                data.audio_url ||                    // Old backend format
                data.audio?.url ||                   // Nested format
                null;

            console.log('🎵 Extracted audio URL:', audioUrl);

            if (audioUrl) {
                setAudioUrl(audioUrl);

                // Create audio element
                const audioElement = new Audio(audioUrl);

                // Setup event listeners
                audioElement.addEventListener('loadeddata', () => {
                    console.log('✅ Audio cargado');
                    setState('ready');
                });

                audioElement.addEventListener('timeupdate', () => {
                    const progress = (audioElement.currentTime / audioElement.duration) * 100;
                    setProgress(progress);
                });

                audioElement.addEventListener('ended', () => {
                    setState('ready');
                    setProgress(0);
                });

                audioElement.addEventListener('error', (e) => {
                    console.error('Audio playback error:', e);
                    setError('Error reproduciendo audio');
                    setState('error');
                });

                setAudio(audioElement);

                // Auto-play after generation
                setTimeout(() => {
                    audioElement.play().catch(err => {
                        console.error('Autoplay error:', err);
                        // Just set to ready, let user click play
                        setState('ready');
                    });
                    setState('playing');
                }, 500);

            } else {
                console.error('No audio URL found in response:', data);
                throw new Error('No se recibió URL de audio');
            }

        } catch (err) {
            console.error('Error generando audio:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setState('error');
        }
    };

    const togglePlayPause = () => {
        if (!audio) return;

        if (state === 'playing') {
            audio.pause();
            setState('paused');
        } else {
            audio.play();
            setState('playing');
        }
    };

    const downloadAudio = () => {
        if (!audioUrl) return;

        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `${movieTitle.replace(/[^a-z0-9]/gi, '_')}_resumen.mp3`;
        a.click();
    };

    return (
        <div className="space-y-3">
            {/* Main Button */}
            {state === 'idle' && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={generateAudio}
                    className="text-xs text-[#A0A0AB] hover:text-white border-white/20 hover:border-[#FF6B35]/50 transition-all"
                >
                    <Volume2 className="w-3.5 h-3.5 mr-1.5" />
                    Generar Audio
                </Button>
            )}

            {/* Generating State */}
            {state === 'generating' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-lg p-3"
                >
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin" />
                        <div className="flex-1">
                            <p className="text-xs font-medium text-white">
                                Generando audio con IA...
                            </p>
                            <p className="text-xs text-[#6B6B78] mt-0.5">
                                Esto puede tardar 10-20 segundos
                            </p>
                        </div>
                    </div>

                    {/* Fake progress bar for UX */}
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E]"
                            initial={{ width: '0%' }}
                            animate={{ width: '90%' }}
                            transition={{ duration: 15, ease: 'easeOut' }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Ready/Playing State */}
            {(state === 'ready' || state === 'playing' || state === 'paused') && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#4ECDC4]/10 border border-[#4ECDC4]/30 rounded-lg p-3"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-[#4ECDC4]" />
                        <p className="text-xs font-medium text-white flex-1">
                            Audio Generado
                        </p>
                        <button
                            onClick={downloadAudio}
                            className="text-[#6B6B78] hover:text-white transition-colors"
                            title="Descargar audio"
                        >
                            <Download className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Audio Player Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={togglePlayPause}
                            className="w-8 h-8 rounded-full bg-[#4ECDC4] hover:bg-[#4ECDC4]/80 flex items-center justify-center transition-all"
                        >
                            {state === 'playing' ? (
                                <Pause className="w-4 h-4 text-white" fill="white" />
                            ) : (
                                <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                            )}
                        </button>

                        {/* Progress Bar */}
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#4ECDC4]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <span className="text-xs text-[#6B6B78] min-w-[40px] text-right">
                            {Math.round(progress)}%
                        </span>
                    </div>

                    {state === 'playing' && (
                        <div className="mt-2 flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-0.5 bg-[#4ECDC4] rounded-full"
                                        animate={{
                                            height: ['4px', '12px', '4px'],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-[#4ECDC4]">Reproduciendo...</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Error State */}
            {state === 'error' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                >
                    <p className="text-xs text-red-400 mb-2">{error}</p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={generateAudio}
                        className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                        Reintentar
                    </Button>
                </motion.div>
            )}
        </div>
    );
}