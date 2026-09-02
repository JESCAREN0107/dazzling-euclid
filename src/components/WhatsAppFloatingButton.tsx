import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { BusinessInfo } from '../models/types';

interface WhatsAppFloatingButtonProps {
  business: BusinessInfo;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ business }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  const defaultMessage = `Hola ${business.name}, me gustaría pedir informes o agendar una cita facial. ¿Me podrían asesorar?`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${business.whatsapp}&text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="mb-3 bg-white text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl border border-spa-200/80 flex items-center gap-3 animate-bounce duration-1000 max-w-xs">
          <span className="text-xs font-medium leading-tight">
            ¿Tienes dudas sobre qué facial elegir? <strong>¡Escríbenos por WhatsApp!</strong>
          </span>
          <button 
            onClick={() => setShowTooltip(false)} 
            className="text-slate-400 hover:text-slate-600 p-0.5"
            aria-label="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        
        {/* Pulse ring animation */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-50 animate-ping -z-10" />
      </a>

    </div>
  );
};
