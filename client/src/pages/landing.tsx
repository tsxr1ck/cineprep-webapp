import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Film,
    Clapperboard,
    Zap,
    Clock,
    Brain,
    CheckCircle2,
    ArrowRight,
    Star,
    Play,
    Shield,
    TrendingUp
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/home';

    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const features = [
        {
            icon: <Brain className="w-6 h-6" />,
            title: "Resúmenes Inteligentes",
            description: "IA que analiza y resume el lore de películas anteriores sin spoilers.",
            color: "from-[#FF6B35] to-[#F7931E]"
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Ahorra Tiempo",
            description: "No vuelvas a ver 10 películas antes de un estreno. Prepárate en minutos.",
            color: "from-[#4ECDC4] to-[#45B7D1]"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Siempre Actualizado",
            description: "Base de datos conectada a TMDB con estrenos, cartelera y populares.",
            color: "from-[#FFD166] to-[#F7931E]"
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Sin Spoilers",
            description: "Solo el contexto necesario para disfrutar la nueva película al máximo.",
            color: "from-[#FF6B35] to-[#FF8C42]"
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Busca tu película",
            description: "Encuentra el estreno que quieres ver en nuestra biblioteca actualizada.",
            icon: <Film className="w-8 h-8" />
        },
        {
            number: "02",
            title: "Genera el análisis",
            description: "Nuestra IA analiza la saga y genera un resumen del lore previo.",
            icon: <Sparkles className="w-8 h-8" />
        },
        {
            number: "03",
            title: "Ve preparado",
            description: "Lee el resumen en 5 minutos y disfruta la película con contexto completo.",
            icon: <CheckCircle2 className="w-8 h-8" />
        }
    ];

    const testimonials = [
        {
            name: "María González",
            role: "Cinéfila",
            content: "Antes de ver Dune 2 no tenía idea de qué había pasado en la primera. CinePrep me salvó la experiencia.",
            rating: 5
        },
        {
            name: "Carlos Ramírez",
            role: "Fan de Marvel",
            content: "Perfecto para ponerte al día con las sagas. No más confusión al entrar al cine.",
            rating: 5
        },
        {
            name: "Ana Torres",
            role: "Crítica de cine",
            content: "Una herramienta esencial para cualquiera que ame el cine pero no tenga tiempo de verlo todo.",
            rating: 5
        }
    ];

    const stats = [
        { value: "10K+", label: "Usuarios activos" },
        { value: "500+", label: "Películas analizadas" },
        { value: "98%", label: "Satisfacción" },
        { value: "5min", label: "Tiempo promedio" }
    ];

    return (
        <div className="min-h-screen bg-background overflow-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Film className="w-6 h-6 text-primary" />
                            <span className="text-foreground font-bold text-xl">CinePrep</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                Características
                            </a>
                            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                                Cómo funciona
                            </a>
                            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                                Testimonios
                            </a>
                        </div>
                        <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all">
                            Comenzar gratis
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/10 via-transparent to-[#4ECDC4]/5" />
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#FF6B35]/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4ECDC4]/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground text-sm font-medium">
                                Potenciado por IA • Gratis para siempre
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
                            Nunca más te pierdas{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#F7931E] to-[#FFD166]">
                                el contexto
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto">
                            Resúmenes inteligentes de sagas cinematográficas para que disfrutes cada estreno con el lore completo.{' '}
                            <span className="text-foreground font-medium">Sin spoilers, solo contexto.</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link to="/login" className="group px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary/40 transition-all hover:scale-105 flex items-center gap-2">
                                Comenzar ahora
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold text-lg hover:border-border transition-all flex items-center gap-2">
                                <Play className="w-5 h-5" />
                                Ver demo
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#F7931E] mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 md:py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
                            <TrendingUp className="w-4 h-4 text-teal-500" />
                            <span className="text-muted-foreground text-sm font-medium">Características</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Todo lo que necesitas para ir{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ECDC4] to-[#45B7D1]">
                                preparado
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Tecnología de punta que transforma cómo disfrutas el cine
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-border transition-all hover:bg-card cursor-default"
                            >
                                {/* Gradient hover effect */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl bg-gradient-to-br ${feature.color}`} />

                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                                    {React.cloneElement(feature.icon, { className: "w-6 h-6 text-foreground" })}
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 md:py-32 relative">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
                            <Clapperboard className="w-4 h-4 text-yellow-500" />
                            <span className="text-muted-foreground text-sm font-medium">Proceso</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Tres pasos para estar{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD166] to-[#F7931E]">
                                listo
                            </span>
                        </h2>
                    </motion.div>

                    <div className="max-w-5xl mx-auto">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative flex flex-col md:flex-row items-start gap-6 mb-12 last:mb-0"
                            >
                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute left-[52px] top-[80px] w-0.5 h-24 bg-gradient-to-b from-[#FF6B35] to-transparent" />
                                )}

                                {/* Icon Circle */}
                                <div className="flex-shrink-0 relative">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center">
                                        {React.cloneElement(step.icon, { className: "w-8 h-8 text-foreground" })}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-background border-2 border-[#FF6B35] flex items-center justify-center">
                                        <span className="text-xs font-bold text-primary">{step.number}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-2">
                                    <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 md:py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-muted-foreground text-sm font-medium">Testimonios</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Lo que dicen nuestros{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ECDC4] to-[#45B7D1]">
                                usuarios
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-border transition-all"
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    "{testimonial.content}"
                                </p>

                                {/* Author */}
                                <div>
                                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 md:py-32 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/20 via-[#F7931E]/10 to-[#FFD166]/5" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF6B35]/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4ECDC4]/20 rounded-full blur-[120px]" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        {...fadeInUp}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                            ¿Listo para disfrutar el cine{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#F7931E]">
                                como nunca?
                            </span>
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Únete a miles de cinéfilos que ya usan CinePrep para estar siempre preparados.
                        </p>

                        {/* CTA Button */}
                        <Link to="/login" className="group px-10 py-5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-primary/50 transition-all hover:scale-105 inline-flex items-center gap-3">
                            Comenzar gratis ahora
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Link>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                                <span className="text-sm">Gratis para siempre</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                                <span className="text-sm">Sin tarjeta de crédito</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                                <span className="text-sm">Configuración en 2 minutos</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>


        </div>
    );
}
