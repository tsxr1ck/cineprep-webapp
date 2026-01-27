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
        <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#0A0A0F]/80 border-b border-white/5">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Film className="w-6 h-6 text-[#FF6B35]" />
                            <span className="text-white font-bold text-xl">CinePrep</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-[#A0A0AB] hover:text-white transition-colors">
                                Características
                            </a>
                            <a href="#how-it-works" className="text-[#A0A0AB] hover:text-white transition-colors">
                                Cómo funciona
                            </a>
                            <a href="#testimonials" className="text-[#A0A0AB] hover:text-white transition-colors">
                                Testimonios
                            </a>
                        </div>
                        <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#FF6B35]/30 transition-all">
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
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1C2E] border border-white/10 mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                            <span className="text-[#A0A0AB] text-sm font-medium">
                                Potenciado por IA • Gratis para siempre
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                            Nunca más te pierdas{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#F7931E] to-[#FFD166]">
                                el contexto
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-[#A0A0AB] leading-relaxed mb-10 max-w-3xl mx-auto">
                            Resúmenes inteligentes de sagas cinematográficas para que disfrutes cada estreno con el lore completo.{' '}
                            <span className="text-white font-medium">Sin spoilers, solo contexto.</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link to="/login" className="group px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-[#FF6B35]/40 transition-all hover:scale-105 flex items-center gap-2">
                                Comenzar ahora
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="px-8 py-4 bg-[#1C1C2E] border border-white/10 text-white rounded-xl font-semibold text-lg hover:border-white/20 transition-all flex items-center gap-2">
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
                                    <div className="text-sm text-[#A0A0AB]">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 md:py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1C1C2E]/20 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1C2E] border border-white/10 mb-6">
                            <TrendingUp className="w-4 h-4 text-[#4ECDC4]" />
                            <span className="text-[#A0A0AB] text-sm font-medium">Características</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Todo lo que necesitas para ir{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ECDC4] to-[#45B7D1]">
                                preparado
                            </span>
                        </h2>
                        <p className="text-lg text-[#A0A0AB] max-w-2xl mx-auto">
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
                                className="group relative p-6 rounded-2xl bg-[#1C1C2E]/50 border border-white/5 hover:border-white/10 transition-all hover:bg-[#1C1C2E] cursor-default"
                            >
                                {/* Gradient hover effect */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl bg-gradient-to-br ${feature.color}`} />

                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                                    {React.cloneElement(feature.icon, { className: "w-6 h-6 text-white" })}
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-[#A0A0AB] leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 md:py-32 relative">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1C2E] border border-white/10 mb-6">
                            <Clapperboard className="w-4 h-4 text-[#FFD166]" />
                            <span className="text-[#A0A0AB] text-sm font-medium">Proceso</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
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
                                        {React.cloneElement(step.icon, { className: "w-8 h-8 text-white" })}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-[#0A0A0F] border-2 border-[#FF6B35] flex items-center justify-center">
                                        <span className="text-xs font-bold text-[#FF6B35]">{step.number}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-2">
                                    <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                                    <p className="text-lg text-[#A0A0AB] leading-relaxed max-w-xl">
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1C1C2E]/20 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div {...fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1C2E] border border-white/10 mb-6">
                            <Star className="w-4 h-4 text-[#FFD166]" />
                            <span className="text-[#A0A0AB] text-sm font-medium">Testimonios</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
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
                                className="p-6 rounded-2xl bg-[#1C1C2E]/50 border border-white/5 hover:border-white/10 transition-all"
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-[#FFD166] text-[#FFD166]" />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-[#A0A0AB] leading-relaxed mb-6">
                                    "{testimonial.content}"
                                </p>

                                {/* Author */}
                                <div>
                                    <div className="font-semibold text-white">{testimonial.name}</div>
                                    <div className="text-sm text-[#6B6B78]">{testimonial.role}</div>
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
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            ¿Listo para disfrutar el cine{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#F7931E]">
                                como nunca?
                            </span>
                        </h2>
                        <p className="text-xl text-[#A0A0AB] mb-10 max-w-2xl mx-auto">
                            Únete a miles de cinéfilos que ya usan CinePrep para estar siempre preparados.
                        </p>

                        {/* CTA Button */}
                        <Link to="/login" className="group px-10 py-5 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-[#FF6B35]/50 transition-all hover:scale-105 inline-flex items-center gap-3">
                            Comenzar gratis ahora
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Link>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
                            <div className="flex items-center gap-2 text-[#A0A0AB]">
                                <CheckCircle2 className="w-5 h-5 text-[#4ECDC4]" />
                                <span className="text-sm">Gratis para siempre</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#A0A0AB]">
                                <CheckCircle2 className="w-5 h-5 text-[#4ECDC4]" />
                                <span className="text-sm">Sin tarjeta de crédito</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#A0A0AB]">
                                <CheckCircle2 className="w-5 h-5 text-[#4ECDC4]" />
                                <span className="text-sm">Configuración en 2 minutos</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 relative">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Film className="w-6 h-6 text-[#FF6B35]" />
                                <span className="text-white font-bold text-xl">CinePrep</span>
                            </div>
                            <p className="text-[#6B6B78] mb-4 max-w-sm">
                                La forma más inteligente de prepararte para los estrenos de cine.
                                Resúmenes con IA, sin spoilers, solo contexto.
                            </p>
                            <div className="flex gap-4">
                                {/* Social Icons */}
                                <a href="#" className="text-[#6B6B78] hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                                </a>
                                <a href="#" className="text-[#6B6B78] hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Producto</h3>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-[#6B6B78] hover:text-white transition-colors">Características</a></li>
                                <li><a href="#" className="text-[#6B6B78] hover:text-white transition-colors">Precios</a></li>
                                <li><a href="#" className="text-[#6B6B78] hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="text-[#6B6B78] hover:text-white transition-colors">Changelog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold mb-4">Empresa</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-[#6B6B78] hover:text-white transition-colors">Acerca de</a></li>
                                <li><a href="#" className="text-[#6B6B78] hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-[#6B6B78] hover:text-white transition-colors">Contacto</a></li>
                                <li><a href="#" className="text-[#6B6B78] hover:text-white transition-colors">Legal</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[#6B6B78] text-sm">
                            © 2026 CinePrep. Todos los derechos reservados. Datos de{' '}
                            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-[#4ECDC4] hover:underline">
                                TMDB
                            </a>
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-[#6B6B78] hover:text-white transition-colors">Privacidad</a>
                            <a href="#" className="text-[#6B6B78] hover:text-white transition-colors">Términos</a>
                            <a href="#" className="text-[#6B6B78] hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
