import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, Calendar, Menu, X, ShieldCheck } from 'lucide-react';
import { BusinessInfo } from '../models/types';
import { Button } from './ui/Button';

interface NavbarProps {
  business: BusinessInfo;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ business, onOpenBooking, onOpenAdmin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Tratamientos', href: '#servicios' },
    { name: 'Resultados', href: '#resultados' },
    { name: 'Especialistas', href: '#especialistas' },
    { name: 'Opiniones', href: '#opiniones' },
    { name: 'Ubicación', href: '#contacto' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-spa-600 to-spa-400 flex items-center justify-center text-white shadow-sm shadow-spa-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-900 block leading-none">
                {business.name.split(' ')[0]} <span className="text-spa-600 font-light italic">{business.name.split(' ').slice(1).join(' ')}</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-spa-600 font-semibold block mt-0.5">
                Clínica Dermoestética
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-spa-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href={`tel:${business.phone}`} 
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-spa-600 transition-colors bg-spa-50 px-3 py-1.5 rounded-full border border-spa-200/60"
            >
              <Phone className="w-3.5 h-3.5 text-spa-600" />
              <span>{business.whatsappDisplay}</span>
            </a>

            <Button 
              variant="primary" 
              size="md" 
              icon={<Calendar className="w-4 h-4" />}
              onClick={onOpenBooking}
            >
              Agendar Cita
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenBooking}
            >
              Agendar
            </Button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-spa-50 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-spa-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-spa-50 hover:text-spa-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-spa-100 flex flex-col gap-3">
            <a 
              href={`tel:${business.phone}`} 
              className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 bg-spa-50 py-2.5 rounded-xl border border-spa-200"
            >
              <Phone className="w-4 h-4 text-spa-600" />
              <span>Llamar: {business.whatsappDisplay}</span>
            </a>

            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              icon={<Calendar className="w-5 h-5" />}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
            >
              Agendar Cita Ahora
            </Button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="text-xs text-center text-slate-400 hover:text-spa-600 pt-2 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acceso de Administración</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
