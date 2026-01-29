import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Home from '@/pages/home';
import MoviePage from '@/pages/movie';
import Login from '@/pages/login';
import FavoritesPage from '@/pages/favorites';
import SettingsPage from '@/pages/settings';
import { AuthGuard } from '@/components/auth/auth-guard';
import LandingPage from './pages/landing';
import Pricing from './pages/pricing';
import HistoryPage from './pages/history';
import { ThemeProvider } from '@/contexts/useTheme';

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
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
            <Route
              path="/history"
              element={
                <AuthGuard>
                  <HistoryPage />
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <SettingsPage />
                </AuthGuard>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
