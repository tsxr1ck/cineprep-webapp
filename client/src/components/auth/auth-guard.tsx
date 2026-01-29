import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#08080f] flex items-center justify-center" >
                <div className="text-center space-y-4" >
                    <Loader2 className="w-8 h-8 text-foreground/60 animate-spin mx-auto" />
                    <p className="text-foreground/60 text-sm" > Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Guardar la ruta a la que intentaba acceder
        return <Navigate to="/login" state={{ from: location }
        } replace />;
    }

    return <>{children} </>;
}