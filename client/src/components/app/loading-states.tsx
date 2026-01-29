// src/components/LoadingStates.tsx

import { motion } from 'framer-motion';
import { Loader2, Film, Sparkles, CheckCircle2, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { LoadingStatesProps } from '@/types/components';

export function LoadingStates({ stage, stages }: LoadingStatesProps) {
    /**
     * Obtiene el icono apropiado para cada etapa
     */
    const getIcon = (stageId: number) => {
        switch (stageId) {
            case 1: return Search;
            case 2: return Film;
            case 3: return Sparkles;
            case 4: return CheckCircle2;
            default: return Loader2;
        }
    };

    return (
        <Card className="bg-cinema-elevated border-border p-8 shadow-cinema">
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                        Preparando tu resumen
                    </h3>
                    <p className="text-muted-foreground">
                        Esto tomará unos segundos mientras analizamos la saga...
                    </p>
                </div>

                {/* Stages List */}
                <div className="space-y-4">
                    {stages.map((item) => {
                        const Icon = getIcon(item.id);
                        const isActive = item.id === stage;
                        const isComplete = item.id < stage;
                        const isPending = item.id > stage;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: item.id * 0.1, duration: 0.3 }}
                                className="flex items-center gap-4"
                            >
                                {/* Icon Circle */}
                                <div
                                    className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center 
                    transition-all duration-500 ease-in-out
                    ${isComplete
                                            ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/20 scale-100 border border-emerald-500/30'
                                            : isActive
                                                ? 'bg-orange-500/20 shadow-lg shadow-orange-500/20 scale-110 border border-orange-500/40' // Orange for active
                                                : 'bg-muted/50 border border-border scale-95'
                                        }
                  `}
                                >
                                    {/* Spinning ring for active stage */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent"
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                        />
                                    )}

                                    {/* Icon */}
                                    <Icon
                                        className={`
                      w-6 h-6 z-10 transition-all duration-300
                      ${isComplete
                                                ? 'text-emerald-400'
                                                : isActive
                                                    ? 'text-orange-400'
                                                    : 'text-gray-500'
                                            }
                      ${isActive && item.id !== 4 ? 'animate-pulse' : ''}
                    `}
                                    />
                                </div>

                                {/* Text Content */}
                                <div className="flex-1">
                                    <p
                                        className={`
                      text-base transition-all duration-300 font-medium
                      ${isActive
                                                ? 'text-foreground'
                                                : isComplete
                                                    ? 'text-emerald-400'
                                                    : 'text-gray-500'
                                            }
                    `}
                                    >
                                        {item.message}
                                    </p>

                                    {/* Progress bar for active stage */}
                                    {isActive && (
                                        <motion.div
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{
                                                duration: 3,
                                                ease: 'easeInOut',
                                                repeat: Infinity
                                            }}
                                            className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-2 shadow-sm"
                                        />
                                    )}
                                </div>

                                {/* Status indicator */}
                                <div className="w-8 flex items-center justify-center">
                                    {isComplete && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 20
                                            }}
                                        >
                                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                        </motion.div>
                                    )}

                                    {isActive && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                        </motion.div>
                                    )}

                                    {isPending && (
                                        <div className="w-2 h-2 bg-gray-600 rounded-full" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer with branding */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-6 mt-6 border-t border-border flex items-center justify-center gap-2 text-muted-foreground text-sm"
                >
                    <Sparkles className="w-4 h-4" />
                    <span>Powered by Qwen AI</span>
                </motion.div>
            </div>
        </Card>
    );
}