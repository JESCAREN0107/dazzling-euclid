import React from 'react';
import { Award, Sparkles, CheckCircle } from 'lucide-react';
import { Specialist } from '../../models/types';
import { Badge } from '../../components/ui/Badge';

interface SpecialistsViewProps {
  specialists: Specialist[];
}

export const SpecialistsView: React.FC<SpecialistsViewProps> = ({ specialists }) => {
  return (
    <section id="especialistas" className="py-20 sm:py-28 bg-[#FAF7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-spa-100 px-3.5 py-1.5 rounded-full text-xs font-semibold text-spa-800 mb-3 border border-spa-200">
            <Award className="w-3.5 h-3.5 text-spa-600" />
            <span>Profesionales Certificadas</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            En Manos de <span className="text-spa-600 italic">Especialistas en Piel</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Nuestro equipo cuenta con certificaciones internacionales en cosmiatría médica, dermoestética y aparatología de última generación.
          </p>
        </div>

        {/* Specialists Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {specialists.map((specialist) => (
            <div
              key={specialist.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-spa-200/70 shadow-soft hover:shadow-luxury transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left"
            >
              {/* Avatar Photo with Gold Ring */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-md border-2 border-spa-300 bg-spa-100">
                  <img
                    src={specialist.avatarUrl}
                    alt={specialist.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-spa-600 text-white p-1.5 rounded-lg shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2.5">
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  {specialist.name}
                </h3>
                <div className="text-xs font-bold text-spa-600 uppercase tracking-wider">
                  {specialist.role}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {specialist.bio}
                </p>

                {/* Specialties tags */}
                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-1.5">
                  {specialist.specialties.map((spec, i) => (
                    <Badge key={i} variant="rose" size="sm">
                      <CheckCircle className="w-3 h-3 text-spa-500" />
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
