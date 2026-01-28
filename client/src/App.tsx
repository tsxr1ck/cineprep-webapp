import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Home from '@/pages/home';
import MoviePage from '@/pages/movie';
import Login from '@/pages/login';
import FavoritesPage from '@/pages/favorites';
import { AuthGuard } from '@/components/auth/auth-guard';
import LandingPage from './pages/landing';
import ComingSoon from './pages/coming-soon';
import Pricing from './pages/pricing';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/movie/:movieId"
            element={
              <AuthGuard>
                <MoviePage />
              </AuthGuard>
            }
          />
          <Route
            path="/favorites"
            element={
              <AuthGuard>
                <FavoritesPage />
              </AuthGuard>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
