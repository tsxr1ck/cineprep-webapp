import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Home from '@/pages/home';
import MoviePage from '@/pages/movie';
import Login from '@/pages/login';
import { AuthGuard } from '@/components/auth/auth-guard';
import LandingPage from './pages/landing';
import ComingSoon from './pages/coming-soon';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<ComingSoon />} />
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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
