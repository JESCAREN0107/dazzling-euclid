import React from 'react';
import { MapPin, Clock, Phone, Mail, MessageCircle, Navigation } from 'lucide-react';
import { BusinessInfo } from '../../models/types';
import { Button } from '../../components/ui/Button';

interface ContactLocationViewProps {
  business: BusinessInfo;
  onOpenBooking: () => void;
}

export const ContactLocationView: React.FC<ContactLocationViewProps> = ({ business, onOpenBooking }) => {
  return (
    <section id="contacto" className="py-20 sm:py-28 bg-white border-t border-spa-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-spa-100 px-3.5 py-1.5 rounded-full text-xs font-semibold text-spa-800 mb-3 border border-spa-200">
            <MapPin className="w-3.5 h-3.5 text-spa-600" />
            <span>Nuestra Ubicación</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Visita Nuestra <span className="text-spa-600 italic">Clínica Spa</span>
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Te esperamos en nuestras instalaciones diseñadas para brindarte la máxima relajación y confort.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Info Card */}
          <div className="lg:col-span-5 bg-[#FAF7F5] rounded-3xl p-8 sm:p-10 border border-spa-200/80 shadow-soft flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-spa-100 border border-spa-300 flex items-center justify-center text-spa-600 flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Ubicación</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-snug">
                    {business.city}<br />
                    <span className="text-xs text-slate-500">Coordenadas: 25.9833, -98.1002</span>
                  </p>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=25.983294863816297,-98.10022678386305"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-spa-600 hover:text-spa-700 mt-2 underline underline-offset-4"
                  >
                    <span>Abrir en Google Maps / Waze</span>
                    <Navigation className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-spa-100 border border-spa-300 flex items-center justify-center text-spa-600 flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Horarios de Atención</h4>
                  <div className="text-xs sm:text-sm text-slate-600 mt-1 space-y-1">
                    <div>{business.openingHours.weekdays}</div>
                    <div>{business.openingHours.saturday}</div>
                    <div>{business.openingHours.sunday}</div>
                  </div>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-spa-100 border border-spa-300 flex items-center justify-center text-spa-600 flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Teléfono & WhatsApp</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    WhatsApp: <a href={`https://api.whatsapp.com/send?phone=${business.whatsapp}`} target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 hover:underline">{business.whatsappDisplay}</a>
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-spa-200/60 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={onOpenBooking}
                className="w-full justify-center"
              >
                Agendar Cita
              </Button>
              <a
                href={`https://api.whatsapp.com/send?phone=${business.whatsapp}&text=${encodeURIComponent('Hola, me gustaría saber cómo llegar a la clínica o pedir informes.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold py-2.5 px-4 rounded-full transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Directo</span>
              </a>
            </div>

          </div>

          {/* Right Column: Google Maps Embed Frame */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-soft border border-spa-200/80 min-h-[380px] relative bg-slate-100">
            <iframe
              title="Ubicación de Lumière Spa en Google Maps"
              src={business.googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '380px' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>

        </div>

      </div>
    </section>
  );
};
