import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { FAQS } from '../../config/business.config';

export const FAQView: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="preguntas" className="py-20 sm:py-28 bg-[#FAF7F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-spa-100 px-3.5 py-1.5 rounded-full text-xs font-semibold text-spa-800 mb-3 border border-spa-200">
            <HelpCircle className="w-3.5 h-3.5 text-spa-600" />
            <span>Resuelve tus Dudas</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Preguntas <span className="text-spa-600 italic">Frecuentes</span>
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Todo lo que necesitas saber antes de tu primera sesión de cuidado facial.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-spa-200/80 overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-spa-600 transition-colors"
                >
                  <span className="text-base sm:text-lg font-serif">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-spa-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-spa-100 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
