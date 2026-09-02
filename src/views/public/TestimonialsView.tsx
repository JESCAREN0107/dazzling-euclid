import React from 'react';
import { Star, MessageSquare, Quote, ShieldCheck } from 'lucide-react';
import { Review } from '../../models/types';

interface TestimonialsViewProps {
  reviews: Review[];
}

export const TestimonialsView: React.FC<TestimonialsViewProps> = ({ reviews }) => {
  return (
    <section id="opiniones" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-800 mb-3 border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>Opiniones 5 Estrellas</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Lo que Dicen <span className="text-spa-600 italic">Nuestras Clientas</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            La satisfacción y confianza de quienes nos visitan es nuestra mejor recomendación.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FAF7F5] rounded-3xl p-7 border border-spa-200/80 shadow-soft flex flex-col justify-between relative hover:shadow-luxury transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-spa-300/40 absolute top-6 right-6" />

              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Service info */}
              <div className="mt-6 pt-5 border-t border-spa-200/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {rev.author}
                  </h4>
                  <span className="text-[11px] font-medium text-spa-600 block">
                    {rev.serviceName}
                  </span>
                </div>

                {rev.verified && (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verificado</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
