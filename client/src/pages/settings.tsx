import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Globe,
    MessageCircleHeart,
    Volume2,
    Palette,
    Mail,
    Newspaper,
    Loader2,
    Save,
    RotateCcw,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';
import type { Language, DetailLevel, Tone, Theme } from '@/types/favorites';

type SettingSection = 'general' | 'appearance' | 'notifications' | 'lore';

export default function SettingsPage() {
    const {
        preferences,
        loading,
        error,
        isSaving,
        fetchPreferences,
        updatePreferences,
        resetPreferences
    } = useSettings();

    const [activeSection, setActiveSection] = useState<SettingSection>('general');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [localSettings, setLocalSettings] = useState({
        default_language: 'es' as Language,
        default_detail_level: 'standard' as DetailLevel,
        default_tone: 'engaging' as Tone,
        preferred_voice_id: '',
        auto_generate_audio: false,
        theme: 'dark' as Theme,
        email_notifications: true,
        new_features_newsletter: true
    });

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    useEffect(() => {
        if (preferences) {
            setLocalSettings({
                default_language: preferences.default_language || 'es',
                default_detail_level: preferences.default_detail_level || 'standard',
                default_tone: preferences.default_tone || 'engaging',
                preferred_voice_id: preferences.preferred_voice_id || '',
                auto_generate_audio: preferences.auto_generate_audio || false,
                theme: preferences.theme || 'dark',
                email_notifications: preferences.email_notifications ?? true,
                new_features_newsletter: preferences.new_features_newsletter ?? true
            });
        }
    }, [preferences]);

    const handleSave = async () => {
        setSaveStatus('saving');
        const success = await updatePreferences(localSettings);
        if (success) {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
            setSaveStatus('error');
        }
    };

    const handleReset = async () => {
        if (window.confirm('¿Estás seguro de que deseas restablecer todas las configuraciones a sus valores predeterminados?')) {
            const success = await resetPreferences();
            if (success) {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        }
    };

    const handleToggle = (key: keyof typeof localSettings) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSelect = (key: keyof typeof localSettings, value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const sections = [
        { id: 'general' as const, label: 'General', icon: SettingsIcon },
        { id: 'appearance' as const, label: 'Apariencia', icon: Palette },
        { id: 'notifications' as const, label: 'Notificaciones', icon: Mail },
        { id: 'lore' as const, label: 'Generación de Lore', icon: MessageCircleHeart }
    ];

    if (loading && !preferences) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-foreground animate-spin" />
                    </div>
                    <p className="text-muted-foreground">Cargando configuración...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                Configuración
                            </h1>
                            <p className="text-muted-foreground">
                                Personaliza tu experiencia en CinePrep
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={isSaving}
                                className="gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Restablecer
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || saveStatus === 'saved'}
                                className="gap-2 bg-gradient-to-r from-[#FF6B35] to-[#F7931E]"
                            >
                                {saveStatus === 'saving' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : saveStatus === 'saved' ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saveStatus === 'saved' ? 'Guardado' : 'Guardar'}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="grid md:grid-cols-[240px_1fr] gap-8">
                        {/* Sidebar Navigation */}
                        <Card className="p-4 h-fit bg-muted/30 border-border">
                            <nav className="space-y-2">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeSection === section.id
                                            ? 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <section.icon className="w-5 h-5" />
                                        <span className="font-medium">{section.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </Card>

                        {/* Settings Content */}
                        <Card className="p-6 bg-muted/30 border-border">
                            {/* General Settings */}
                            {activeSection === 'general' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-[#FF6B35]" />
                                        Configuración General
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Idioma Predeterminado
                                            </label>
                                            <div className="flex gap-3">
                                                {(['es', 'en'] as Language[]).map((lang) => (
                                                    <button
                                                        key={lang}
                                                        onClick={() => handleSelect('default_language', lang)}
                                                        className={`px-4 py-2 rounded-xl border-2 transition-all ${localSettings.default_language === lang
                                                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                                                            : 'border-border hover:border-[#FF6B35]/50'
                                                            }`}
                                                    >
                                                        {lang === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Appearance Settings */}
                            {activeSection === 'appearance' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-[#FF6B35]" />
                                        Apariencia
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Tema
                                            </label>
                                            <div className="flex gap-3">
                                                {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                                                    <button
                                                        key={theme}
                                                        onClick={() => handleSelect('theme', theme)}
                                                        className={`px-4 py-2 rounded-xl border-2 transition-all ${localSettings.theme === theme
                                                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                                                            : 'border-border hover:border-[#FF6B35]/50'
                                                            }`}
                                                    >
                                                        {theme === 'light' ? '☀️ Claro' : theme === 'dark' ? '🌙 Oscuro' : '💻 Sistema'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Lore Generation Settings */}
                            {activeSection === 'lore' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                        <MessageCircleHeart className="w-5 h-5 text-[#FF6B35]" />
                                        Generación de Lore
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Nivel de Detalle
                                            </label>
                                            <div className="flex gap-3 flex-wrap">
                                                {(['brief', 'standard', 'detailed'] as DetailLevel[]).map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => handleSelect('default_detail_level', level)}
                                                        className={`px-4 py-2 rounded-xl border-2 transition-all ${localSettings.default_detail_level === level
                                                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                                                            : 'border-border hover:border-[#FF6B35]/50'
                                                            }`}
                                                    >
                                                        {level === 'brief' ? '📝 Breve' : level === 'standard' ? '📄 Estándar' : '📚 Detallado'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Tono del Análisis
                                            </label>
                                            <div className="flex gap-3 flex-wrap">
                                                {(['neutral', 'engaging', 'dramatic', 'humorous'] as Tone[]).map((tone) => (
                                                    <button
                                                        key={tone}
                                                        onClick={() => handleSelect('default_tone', tone)}
                                                        className={`px-4 py-2 rounded-xl border-2 transition-all ${localSettings.default_tone === tone
                                                            ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                                                            : 'border-border hover:border-[#FF6B35]/50'
                                                            }`}
                                                    >
                                                        {tone === 'neutral' ? '😐 Neutral' : tone === 'engaging' ? '✨ Atractivo' : tone === 'dramatic' ? '🎭 Dramático' : '😄 Divertido'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                                            <div className="flex items-center gap-3">
                                                <Volume2 className="w-5 h-5 text-[#FF6B35]" />
                                                <div>
                                                    <p className="font-medium text-foreground">Generación Automática de Audio</p>
                                                    <p className="text-sm text-muted-foreground">Generar automáticamente audio para cada película</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggle('auto_generate_audio')}
                                                className={`w-12 h-6 rounded-full transition-all ${localSettings.auto_generate_audio
                                                    ? 'bg-[#FF6B35]'
                                                    : 'bg-muted-foreground/30'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-all ${localSettings.auto_generate_audio ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Notification Settings */}
                            {activeSection === 'notifications' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-[#FF6B35]" />
                                        Notificaciones
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-[#FF6B35]" />
                                                <div>
                                                    <p className="font-medium text-foreground">Notificaciones por Email</p>
                                                    <p className="text-sm text-muted-foreground">Recibir actualizaciones sobre tus análisis</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggle('email_notifications')}
                                                className={`w-12 h-6 rounded-full transition-all ${localSettings.email_notifications
                                                    ? 'bg-[#FF6B35]'
                                                    : 'bg-muted-foreground/30'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-all ${localSettings.email_notifications ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                                            <div className="flex items-center gap-3">
                                                <Newspaper className="w-5 h-5 text-[#FF6B35]" />
                                                <div>
                                                    <p className="font-medium text-foreground">Boletín de Nuevas Funciones</p>
                                                    <p className="text-sm text-muted-foreground">Mantente informado sobre nuevas características</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggle('new_features_newsletter')}
                                                className={`w-12 h-6 rounded-full transition-all ${localSettings.new_features_newsletter
                                                    ? 'bg-[#FF6B35]'
                                                    : 'bg-muted-foreground/30'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-all ${localSettings.new_features_newsletter ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
