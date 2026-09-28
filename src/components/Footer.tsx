import React from 'react';
import { Sparkles, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';
import { BusinessInfo } from '../models/types';

interface FooterProps {
  business: BusinessInfo;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ business, onOpenBooking }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-spa-500 to-spa-400 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                {business.name}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {business.description}
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="text-xs font-semibold text-spa-400 hover:text-spa-300 underline underline-offset-4"
              >
                ✦ Agenda tu diagnóstico facial sin costo $\rightarrow$
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#servicios" className="hover:text-spa-400 transition-colors">Catálogo de Faciales</a>
              </li>
              <li>
                <a href="#resultados" className="hover:text-spa-400 transition-colors">Antes y Después</a>
              </li>
              <li>
                <a href="#especialistas" className="hover:text-spa-400 transition-colors">Nuestras Especialistas</a>
              </li>
              <li>
                <a href="#opiniones" className="hover:text-spa-400 transition-colors">Testimonios Reales</a>
              </li>
              <li>
                <a href="#preguntas" className="hover:text-spa-400 transition-colors">Preguntas Frecuentes</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Location */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">
              Contacto y Citas
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-spa-400 flex-shrink-0 mt-1" />
                <span>{business.address}, {business.colonia}, {business.city}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-spa-400 flex-shrink-0" />
                <a href={`tel:${business.phone}`} className="hover:text-white transition-colors">
                  {business.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-spa-400 flex-shrink-0" />
                <a href={`mailto:${business.email}`} className="hover:text-white transition-colors">
                  {business.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Opening Hours */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">
              Horarios de Atención
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-spa-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block text-xs uppercase tracking-wider">Lunes a Viernes</strong>
                  <span>9:00 AM - 8:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-spa-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block text-xs uppercase tracking-wider">Sábados</strong>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-spa-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block text-xs uppercase tracking-wider">Domingos</strong>
                  <span>10:00 AM - 3:00 PM (Previa Cita)</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} {business.name}. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Desarrollado con <Heart className="w-3.5 h-3.5 text-spa-400 fill-current" /> para Clínicas de Belleza
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
