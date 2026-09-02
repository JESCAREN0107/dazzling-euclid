import React from 'react';
import { Sparkles, Calendar, Star, ShieldCheck, ArrowRight, Award } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BusinessInfo } from '../../models/types';

interface HeroViewProps {
  business: BusinessInfo;
  onOpenBooking: () => void;
}

export const HeroView: React.FC<HeroViewProps> = ({ business, onOpenBooking }) => {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-gradient-to-b from-spa-100/60 via-[#FAF7F5] to-[#FAF7F5]">
      
      {/* Background Decorative Blur Elements */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-spa-200/40 via-amber-100/30 to-sage-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-spa-200/80 shadow-sm text-xs font-semibold text-spa-800">
              <span className="flex h-2 w-2 rounded-full bg-spa-500 animate-pulse" />
              <span>Dermoestética Facial Avanzada & Skincare</span>
              <Sparkles className="w-3.5 h-3.5 text-spa-500" />
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              El arte de resaltar la <span className="text-spa-600 italic">luminosidad natural</span> de tu piel.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Tratamientos faciales clínicos de alta gama, hidrodermoabrasión y aparatología europea no invasiva. Diseñamos cada sesión según el diagnóstico único de tu cutis.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={<Calendar className="w-5 h-5" />}
                onClick={onOpenBooking}
                className="w-full sm:w-auto text-base"
              >
                Agendar Cita en 1 Minuto
              </Button>

              <a
                href="#servicios"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 hover:text-spa-600 bg-white hover:bg-spa-50 border border-spa-200/90 px-6 py-3.5 rounded-full shadow-sm transition-all"
              >
                <span>Ver Catálogo y Precios</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Social Proof & Trust Badges */}
            <div className="pt-6 border-t border-spa-200/60 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-500 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <div className="text-sm font-bold text-slate-900">5.0 Estrellas</div>
                <div className="text-xs text-slate-500">+450 reseñas</div>
              </div>

              <div className="text-center lg:text-left border-x border-spa-200/60 px-2">
                <div className="text-sm font-bold text-slate-900 flex items-center justify-center lg:justify-start gap-1">
                  <Award className="w-4 h-4 text-spa-600" />
                  <span>+2,800</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Faciales realizados</div>
              </div>

              <div className="text-center lg:text-left">
                <div className="text-sm font-bold text-slate-900 flex items-center justify-center lg:justify-start gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Seguro</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Insumos estériles</div>
              </div>
            </div>

          </div>

          {/* Right Column: High Quality Aesthetic Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image with rounded luxury mask */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-spa-200">
                <img
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80"
                  alt="Tratamiento Facial en Lumière Spa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
              </div>

              {/* Floating Testimonial Card */}
              <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-luxury border border-spa-200/80 max-w-[240px] sm:max-w-[270px] animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Verificado</span>
                </div>
                <p className="text-xs text-slate-600 italic leading-snug">
                  "Mi piel nunca se había sentido tan limpia y suave. ¡100% recomendado!"
                </p>
                <div className="mt-2 text-[11px] font-semibold text-spa-700">
                  — Mariana R., Clienta Frecuente
                </div>
              </div>

              {/* Floating Badge on Top Right */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-gradient-to-br from-spa-600 to-spa-500 text-white p-3.5 rounded-2xl shadow-lg shadow-spa-500/30 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider font-semibold opacity-90">Protocolo</div>
                  <div className="text-xs font-bold leading-none">Glow HidraFacial</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
