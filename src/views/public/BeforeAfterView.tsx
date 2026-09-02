import React from 'react';
import { Sparkles, CheckCheck, ArrowRight } from 'lucide-react';
import { BeforeAfterItem } from '../../models/types';
import { Button } from '../../components/ui/Button';

interface BeforeAfterViewProps {
  items: BeforeAfterItem[];
  onOpenBooking: () => void;
}

export const BeforeAfterView: React.FC<BeforeAfterViewProps> = ({ items, onOpenBooking }) => {
  return (
    <section id="resultados" className="py-20 sm:py-28 bg-white border-y border-spa-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-sage-100 px-3.5 py-1.5 rounded-full text-xs font-semibold text-sage-800 mb-3 border border-sage-200">
            <CheckCheck className="w-3.5 h-3.5 text-sage-600" />
            <span>Evidencia Clínica y Visual</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Resultados Reales en <span className="text-spa-600 italic">Nuestras Clientas</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Fotografías sin filtros ni retoques digitales. Comprueba la transformación en textura, luminosidad y reducción de imperfecciones.
          </p>
        </div>

        {/* Before and After Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {items.map((item) => (
            <div 
              key={item.id}
              className="bg-[#FAF7F5] rounded-3xl p-6 sm:p-8 border border-spa-200/80 shadow-soft hover:shadow-luxury transition-all duration-300"
            >
              {/* Dual image container */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl overflow-hidden mb-6">
                
                {/* Before Image */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-200">
                  <img
                    src={item.beforeImage}
                    alt={`${item.title} Antes`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/20">
                    Antes
                  </div>
                </div>

                {/* After Image */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-200">
                  <img
                    src={item.afterImage}
                    alt={`${item.title} Después`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-spa-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                    Después
                  </div>
                </div>

              </div>

              {/* Text Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-spa-600 uppercase tracking-wider">
                    {item.serviceName}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-spa-200">
                    {item.sessions}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Banner CTA */}
        <div className="mt-14 bg-gradient-to-r from-spa-600 to-spa-700 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-spa-600/20">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              ¿Quieres un diagnóstico personalizado de tu piel?
            </h3>
            <p className="text-sm text-spa-100 max-w-xl">
              Nuestras especialistas evaluarán tu cutis con luz de Wood y dermatoscopio antes de comenzar tu tratamiento.
            </p>
          </div>

          <Button
            variant="secondary"
            size="lg"
            onClick={onOpenBooking}
            className="w-full sm:w-auto flex-shrink-0 bg-white text-spa-900 hover:bg-spa-50 shadow-md font-bold"
          >
            Agendar Diagnóstico Facial
          </Button>
        </div>

      </div>
    </section>
  );
};
