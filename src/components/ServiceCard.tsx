import React from 'react';
import { Clock, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Service } from '../models/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface ServiceCardProps {
  service: Service;
  onBook: (serviceId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-spa-200/70 shadow-soft hover:shadow-luxury transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      
      {/* Image Container with Badges */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-spa-100">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
        
        {/* Floating Top Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {service.popular && (
            <Badge variant="gold" className="shadow-sm font-semibold">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Más Solicitado
            </Badge>
          )}
          <Badge variant="slate" className="bg-white/90 backdrop-blur-md border-white/50 text-slate-800">
            {service.category.toUpperCase()}
          </Badge>
        </div>

        {/* Duration Chip on bottom image */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-medium text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <Clock className="w-3.5 h-3.5 text-spa-300" />
          <span>{service.durationMinutes} minutos</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between">
        <div>
          {/* Service Title */}
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-snug group-hover:text-spa-600 transition-colors">
            {service.name}
          </h3>

          {/* Description */}
          <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
            {service.shortDescription}
          </p>

          {/* Key Benefits List */}
          <div className="mt-4 pt-4 border-t border-spa-100 space-y-2">
            {service.benefits.slice(0, 3).map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-spa-500 flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Price & Action Button */}
        <div className="mt-6 pt-5 border-t border-spa-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Inversión
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">
                ${service.priceMXN.toLocaleString('es-MX')}
              </span>
              <span className="text-xs font-semibold text-spa-600">MXN</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => onBook(service.id)}
            className="group-hover:translate-x-0.5"
          >
            Agendar
          </Button>
        </div>

      </div>

    </div>
  );
};
