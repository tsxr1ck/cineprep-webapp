import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PricingPage() {
    const navigate = useNavigate();
    const { user, membership } = useAuth();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            id: '17aeacf4-637f-47a2-9fa0-e1ecdea7660a',
            name: 'Free',
            slug: 'free',
            description: 'Perfect para empezar',
            priceMonthly: 0,
            priceYearly: 0,
            maxAnalyses: 5,
            maxAudio: 0,
            icon: Sparkles,
            iconColor: 'text-blue-400',
            gradient: 'from-blue-500/10 to-cyan-500/10',
            borderGradient: 'from-blue-500/20 to-cyan-500/20',
            features: [
                '5 análisis por mes',
                'Voces básicas',
                'Acceso a la comunidad',
                'Caché compartido'
            ],
            highlighted: false,
        },
        {
            id: '8a39c216-78da-47e4-b159-7747d79493b9',
            name: 'Pro',
            slug: 'pro',
            description: 'Para cinéfilos dedicados',
            priceMonthly: 9.99,
            priceYearly: 99.99,
            maxAnalyses: 50,
            maxAudio: 20,
            icon: Zap,
            iconColor: 'text-purple-400',
            gradient: 'from-purple-500/10 to-pink-500/10',
            borderGradient: 'from-purple-500/20 to-pink-500/20',
            features: [
                '50 análisis por mes',
                '20 audios por mes',
                'Sin anuncios',
                'Regeneración ilimitada',
                'Soporte prioritario',
                'Acceso anticipado a nuevas películas'
            ],
            highlighted: true,
            badge: 'Más Popular'
        },
        {
            id: 'a1865f95-4978-464f-83b0-458f43b5046e',
            name: 'Premium',
            slug: 'premium',
            description: 'La experiencia completa',
            priceMonthly: 19.99,
            priceYearly: 199.99,
            maxAnalyses: -1,
            maxAudio: -1,
            icon: Crown,
            iconColor: 'text-yellow-400',
            gradient: 'from-yellow-500/10 to-orange-500/10',
            borderGradient: 'from-yellow-500/20 to-orange-500/20',
            features: [
                'Análisis ilimitados',
                'Audios ilimitados',
                'Voces premium exclusivas',
                'Cola prioritaria',
                'Acceso anticipado a funciones',
                'Análisis de series completas',
                'API access (próximamente)',
                'Soporte dedicado 24/7'
            ],
            highlighted: false,
            badge: 'Mejor Valor'
        },
    ];

    const getPrice = (plan: typeof plans[0]) => {
        if (plan.priceMonthly === 0) return 'Gratis';
        return billingCycle === 'monthly'
            ? `$${plan.priceMonthly}`
            : `$${(plan.priceYearly / 12).toFixed(2)}`;
    };

    const getTotalPrice = (plan: typeof plans[0]) => {
        if (plan.priceMonthly === 0) return null;
        return billingCycle === 'yearly' ? `$${plan.priceYearly}/año` : null;
    };

    const getSavings = (plan: typeof plans[0]) => {
        if (plan.priceMonthly === 0 || billingCycle === 'monthly') return null;
        const monthlyTotal = plan.priceMonthly * 12;
        const savings = monthlyTotal - plan.priceYearly;
        const savingsPercent = Math.round((savings / monthlyTotal) * 100);
        return `Ahorra ${savingsPercent}%`;
    };

    const isCurrentPlan = (planSlug: string) => {
        return membership?.plan.slug === planSlug;
    };

    const handleSelectPlan = (plan: typeof plans[0]) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isCurrentPlan(plan.slug)) {
            return;
        }

        // Navigate to checkout or billing page
        navigate(`/checkout?plan=${plan.slug}&billing=${billingCycle}`);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] pt-24 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <Badge
                        variant="secondary"
                        className="mb-4 bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20"
                    >
                        Precios Simples y Transparentes
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Elige tu
                        <span className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] bg-clip-text text-transparent">
                            {' '}Plan Perfecto
                        </span>
                    </h1>
                    <p className="text-xl text-[#A0A0AB] max-w-2xl mx-auto mb-8">
                        Prepárate para tus películas favoritas con análisis profundos
                        y contenido generado por IA
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-3 p-1 bg-white/5 rounded-full border border-white/10">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly'
                                    ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25'
                                    : 'text-[#A0A0AB] hover:text-white'
                                }`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${billingCycle === 'yearly'
                                    ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25'
                                    : 'text-[#A0A0AB] hover:text-white'
                                }`}
                        >
                            Anual
                            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[9px] font-bold bg-green-500 text-white rounded-full">
                                -17%
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`relative ${plan.highlighted ? 'md:-mt-4 md:scale-105' : ''}`}
                            >
                                <div
                                    className={`relative h-full rounded-3xl border backdrop-blur-xl transition-all duration-300 hover:scale-105 ${plan.highlighted
                                            ? 'bg-gradient-to-b from-white/10 to-white/5 border-[#FF6B35]/30 shadow-2xl shadow-[#FF6B35]/20'
                                            : `bg-gradient-to-b ${plan.gradient} border-white/10`
                                        }`}
                                >
                                    {/* Badge */}
                                    {plan.badge && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white border-0 shadow-lg">
                                                {plan.badge}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="p-8">
                                        {/* Icon */}
                                        <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${plan.gradient} border bg-gradient-to-br ${plan.borderGradient} mb-6`}>
                                            <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                                        </div>

                                        {/* Plan Name */}
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {plan.name}
                                        </h3>
                                        <p className="text-[#A0A0AB] mb-6">
                                            {plan.description}
                                        </p>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-bold text-white">
                                                    {getPrice(plan)}
                                                </span>
                                                {plan.priceMonthly > 0 && (
                                                    <span className="text-[#A0A0AB]">/mes</span>
                                                )}
                                            </div>
                                            {getTotalPrice(plan) && (
                                                <p className="text-sm text-[#6B6B78] mt-1">
                                                    {getTotalPrice(plan)}
                                                </p>
                                            )}
                                            {getSavings(plan) && (
                                                <Badge
                                                    variant="secondary"
                                                    className="mt-2 bg-green-500/10 text-green-400 border-green-500/20"
                                                >
                                                    {getSavings(plan)}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* CTA Button */}
                                        <Button
                                            onClick={() => handleSelectPlan(plan)}
                                            disabled={isCurrentPlan(plan.slug)}
                                            className={`w-full mb-8 ${plan.highlighted
                                                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#F7931E] hover:opacity-90 text-white shadow-lg shadow-[#FF6B35]/25'
                                                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                                }`}
                                            size="lg"
                                        >
                                            {isCurrentPlan(plan.slug) ? (
                                                'Plan Actual'
                                            ) : plan.priceMonthly === 0 ? (
                                                'Comenzar Gratis'
                                            ) : (
                                                <>
                                                    Elegir {plan.name}
                                                    <ArrowRight className="ml-2 w-4 h-4" />
                                                </>
                                            )}
                                        </Button>

                                        {/* Features */}
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold text-[#A0A0AB] uppercase tracking-wider mb-4">
                                                Características incluidas:
                                            </p>
                                            {plan.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mt-0.5">
                                                        <Check className="w-3 h-3 text-[#FF6B35]" />
                                                    </div>
                                                    <span className="text-[#E4E4E7] text-sm">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Limits Info */}
                                        <div className="mt-6 pt-6 border-t border-white/5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-[#6B6B78]">Análisis</span>
                                                <span className="text-white font-medium">
                                                    {plan.maxAnalyses === -1 ? '∞ Ilimitado' : `${plan.maxAnalyses}/mes`}
                                                </span>
                                            </div>
                                            {plan.maxAudio > 0 && (
                                                <div className="flex items-center justify-between text-sm mt-2">
                                                    <span className="text-[#6B6B78]">Generación de Audio</span>
                                                    <span className="text-white font-medium">
                                                        {plan.maxAudio === -1 ? '∞ Ilimitado' : `${plan.maxAudio}/mes`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-24 max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Preguntas Frecuentes
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: '¿Puedo cambiar de plan en cualquier momento?',
                                a: 'Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se aplicarán inmediatamente.'
                            },
                            {
                                q: '¿Qué pasa si alcanzo mi límite mensual?',
                                a: 'Si alcanzas tu límite, puedes actualizar a un plan superior o esperar hasta el próximo mes cuando tu límite se reinicie.'
                            },
                            {
                                q: '¿Hay algún contrato o compromiso?',
                                a: 'No, todos nuestros planes son sin compromiso. Puedes cancelar en cualquier momento.'
                            },
                            {
                                q: '¿Los análisis se guardan en mi cuenta?',
                                a: 'Sí, todos tus análisis se guardan en tu historial y puedes acceder a ellos en cualquier momento.'
                            },
                        ].map((faq, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {faq.q}
                                </h3>
                                <p className="text-[#A0A0AB]">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-24 text-center"
                >
                    <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10 border border-[#FF6B35]/20">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            ¿Tienes preguntas?
                        </h3>
                        <p className="text-[#A0A0AB] mb-6">
                            Nuestro equipo está aquí para ayudarte a elegir el mejor plan
                        </p>
                        <Button
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            Contactar Soporte
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}