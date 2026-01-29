import { Link } from 'react-router-dom';
import { Film, Github, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center">
                <Film className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CinePrep</span>
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Preparate para el cine con resumenes inteligentes de las precuelas. Sin spoilers, solo el lore que necesitas.
            </p>
          </div>

          <div>
            <h4 className="text-foreground font-semibold mb-4">Explorar</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <a href="#upcoming" className="text-muted-foreground hover:text-foreground transition-colors">
                  Proximos estrenos
                </a>
              </li>
              <li>
                <a href="#popular" className="text-muted-foreground hover:text-foreground transition-colors">
                  Populares
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terminos
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border gap-4">
          <p className="text-muted-foreground text-sm text-center sm:text-left">
            Datos de peliculas proporcionados por{' '}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline"
            >
              TMDB
            </a>
            {' '}| 2026 CinePrep
          </p>

          <div className="flex items-center gap-3">
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              href="#"
              className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              <Twitter className="w-4 h-4" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              href="#"
              className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              <Github className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
