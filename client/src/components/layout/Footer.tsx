import { Link } from 'react-router-dom';
import { Film, Github, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0A0A0F]/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CinePrep</span>
            </Link>
            <p className="text-[#6B6B78] max-w-sm leading-relaxed">
              Preparate para el cine con resumenes inteligentes de las precuelas. Sin spoilers, solo el lore que necesitas.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Explorar</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-[#6B6B78] hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <a href="#upcoming" className="text-[#6B6B78] hover:text-white transition-colors">
                  Proximos estrenos
                </a>
              </li>
              <li>
                <a href="#popular" className="text-[#6B6B78] hover:text-white transition-colors">
                  Populares
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#6B6B78] hover:text-white transition-colors">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-[#6B6B78] hover:text-white transition-colors">
                  Terminos
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-[#6B6B78] text-sm text-center sm:text-left">
            Datos de peliculas proporcionados por{' '}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4ECDC4] hover:underline"
            >
              TMDB
            </a>
            {' '}| 2024 CinePrep
          </p>
          
          <div className="flex items-center gap-3">
            <motion.a 
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              href="#" 
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#6B6B78] hover:text-white transition-all"
            >
              <Twitter className="w-4 h-4" />
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              href="#" 
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#6B6B78] hover:text-white transition-all"
            >
              <Github className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
