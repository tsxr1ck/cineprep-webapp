import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Sparkles, Shield, Zap } from 'lucide-react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '@/contexts/useAuth';
import { app } from '@/utils/firebase';
import { toast } from 'sonner';
import supabase from '@/utils/supabase';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/home';

    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);
    const handleGoogleLogin = async () => {
        if (loading) return; // Prevenir doble click
        setLoading(true);

        try {
            const userCred = await signInWithPopup(auth, googleProvider);
            const firebaseToken = await userCred.user.getIdToken();

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/firebase-to-supabase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseToken,
                    email: userCred.user.email,
                    displayName: userCred.user.displayName,
                    photoURL: userCred.user.photoURL,
                }),
            });

            const data = await res.json();

            if (!data.access_token) {
                console.error("ERROR CRÍTICO: El backend no devolvió access_token.");
                // toast.error(t('login.errorToken')); // Traducido
                toast.error("Error al iniciar sesión");
                setLoading(false);
                return;
            }

            const { error: sessionError } = await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
            });

            if (sessionError) {
                console.error("Error en setSession:", sessionError);
                // toast.error(t('login.errorToken')); // Traducido
                toast.error("Error al iniciar sesión");
            } else {
                // toast.success(t('login.success')); // Traducido
                toast.success("Inicio de sesión exitoso");
            }
        } catch (e) {
            console.error("EXCEPCIÓN EN EL FLUJO:", e);
            // toast.error(t('common.error'));
            toast.error("Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        {
            icon: <Zap className="w-5 h-5" />,
            text: "Acceso instantáneo"
        },
        {
            icon: <Shield className="w-5 h-5" />,
            text: "100% seguro"
        },
        {
            icon: <Sparkles className="w-5 h-5" />,
            text: "Sin contraseñas"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/10 via-transparent to-[#4ECDC4]/5" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6B35]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#4ECDC4]/10 rounded-full blur-[120px]" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#1C1C2E]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl"
                >
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] mb-4"
                        >
                            <Film className="w-8 h-8 text-white" />
                        </motion.div>

                        <h1 className="text-3xl font-bold text-white mb-2">
                            Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#F7931E]">CinePrep</span>
                        </h1>

                        <p className="text-[#A0A0AB] text-sm">
                            Inicia sesión para acceder a resúmenes inteligentes de tus sagas favoritas
                        </p>
                    </div>

                    {/* Google Sign In Button */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        onClick={handleGoogleLogin}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-white/10 group"
                    >
                        {/* Google Icon */}
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
                            <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
                            <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
                            <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
                        </svg>

                        <span className="text-base">Continuar con Google</span>
                    </motion.button>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-[#1C1C2E] text-[#6B6B78]">
                                Rápido, seguro y sin complicaciones
                            </span>
                        </div>
                    </div>

                    {/* Benefits */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-3"
                    >
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                className="flex items-center gap-3 text-sm text-[#A0A0AB]"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35]/20 to-[#F7931E]/20 flex items-center justify-center text-[#FF6B35]">
                                    {benefit.icon}
                                </div>
                                <span>{benefit.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Terms */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-xs text-[#6B6B78] text-center mt-8"
                    >
                        Al continuar, aceptas nuestros{' '}
                        <a href="#" className="text-[#4ECDC4] hover:underline">
                            Términos de Servicio
                        </a>
                        {' '}y{' '}
                        <a href="#" className="text-[#4ECDC4] hover:underline">
                            Política de Privacidad
                        </a>
                    </motion.p>
                </motion.div>

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-6"
                >
                    <a href="/" className="text-sm text-[#A0A0AB] hover:text-white transition-colors inline-flex items-center gap-2">
                        ← Volver al inicio
                    </a>
                </motion.div>
            </div>

            {/* Decorative Elements */}
            <motion.div
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-20 left-10 opacity-20"
            >
                <Sparkles className="w-6 h-6 text-[#FFD166]" />
            </motion.div>

            <motion.div
                animate={{
                    y: [0, 10, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute bottom-20 right-10 opacity-20"
            >
                <Film className="w-6 h-6 text-[#4ECDC4]" />
            </motion.div>
        </div>
    );
}
