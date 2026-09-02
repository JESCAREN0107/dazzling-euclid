import React from 'react';
import { 
  X, Calendar, Clock, User, Phone, Mail, Sparkles, CheckCircle2, 
  ArrowLeft, ArrowRight, MessageCircle, ShieldCheck, HeartHandshake,
  AlertCircle
} from 'lucide-react';
import { Service, Specialist, Appointment } from '../../models/types';
import { SPECIALISTS } from '../../config/business.config';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  setStep: (step: number) => void;
  services: Service[];
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  selectedService?: Service;
  selectedSpecialistId: string;
  setSelectedSpecialistId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTimeSlot: string;
  setSelectedTimeSlot: (slot: string) => void;
  availableSlots: string[];
  minDateStr: string;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  customerNotes: string;
  setCustomerNotes: (notes: string) => void;
  canProceedStep1: boolean;
  canProceedStep2: boolean;
  canProceedStep3: boolean;
  canProceedStep4: boolean;
  isLoading: boolean;
  onConfirmBooking: (e?: React.FormEvent) => void;
  confirmedAppointment: Appointment | null;
  getWhatsAppLink: (apt?: Appointment | null) => string;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  isOpen,
  onClose,
  step,
  setStep,
  services,
  selectedServiceId,
  setSelectedServiceId,
  selectedService,
  selectedSpecialistId,
  setSelectedSpecialistId,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  availableSlots,
  minDateStr,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  customerNotes,
  setCustomerNotes,
  canProceedStep1,
  canProceedStep2,
  canProceedStep3,
  canProceedStep4,
  isLoading,
  onConfirmBooking,
  confirmedAppointment,
  getWhatsAppLink
}) => {
  if (!isOpen) return null;

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-spa-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-spa-50 via-white to-spa-50 border-b border-spa-200/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-spa-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {step === 5 ? '¡Cita Reservada con Éxito!' : 'Agenda tu Sesión Facial'}
              </h3>
              {step <= totalSteps && (
                <p className="text-xs text-slate-500">
                  Paso {step} de {totalSteps} — {
                    step === 1 ? 'Selecciona tu Tratamiento' :
                    step === 2 ? 'Elige tu Especialista' :
                    step === 3 ? 'Selecciona Fecha y Horario' :
                    'Tus Datos de Contacto'
                  }
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-spa-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar (Only during steps 1 to 4) */}
        {step <= totalSteps && (
          <div className="w-full bg-spa-100 h-1 flex">
            <div 
              className="bg-spa-600 h-1 transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Body with Scroll */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">

          {/* ============================================================ */}
          {/* PASO 1: SELECCIONAR SERVICIO */}
          {/* ============================================================ */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 font-medium">
                Selecciona el tratamiento facial que deseas agendar:
              </div>

              <div className="space-y-3">
                {services.map((srv) => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-spa-600 bg-spa-50/70 shadow-sm ring-1 ring-spa-500'
                          : 'border-slate-200 hover:border-spa-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex gap-3.5 items-start">
                        <img
                          src={srv.imageUrl}
                          alt={srv.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200 bg-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base font-bold text-slate-900">
                              {srv.name}
                            </h4>
                            {srv.popular && (
                              <Badge variant="gold" size="sm">Top</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {srv.shortDescription}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-spa-600" />
                              {srv.durationMinutes} min
                            </span>
                            <span className="font-bold text-slate-900">
                              ${srv.priceMXN.toLocaleString('es-MX')} MXN
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center h-6 w-6 rounded-full border border-spa-400 mt-1 flex-shrink-0">
                        {isSelected && <div className="w-3.5 h-3.5 rounded-full bg-spa-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PASO 2: SELECCIONAR ESPECIALISTA */}
          {/* ============================================================ */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 font-medium">
                ¿Prefieres atenderte con alguna especialista en particular?
              </div>

              <div className="space-y-3">
                {/* Opción Automática */}
                <div
                  onClick={() => setSelectedSpecialistId('any')}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex items-center justify-between gap-4 ${
                    selectedSpecialistId === 'any'
                      ? 'border-spa-600 bg-spa-50/70 shadow-sm ring-1 ring-spa-500'
                      : 'border-slate-200 hover:border-spa-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-spa-100 flex items-center justify-center text-spa-600">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-slate-900">
                        Cualquier especialista disponible
                      </h4>
                      <p className="text-xs text-slate-500">
                        Te asignaremos a la primera terapeuta certificada con disponibilidad.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center h-6 w-6 rounded-full border border-spa-400 flex-shrink-0">
                    {selectedSpecialistId === 'any' && <div className="w-3.5 h-3.5 rounded-full bg-spa-600" />}
                  </div>
                </div>

                {/* Lista de terapeutas */}
                {SPECIALISTS.map((spec) => {
                  const isSelected = selectedSpecialistId === spec.id;
                  return (
                    <div
                      key={spec.id}
                      onClick={() => setSelectedSpecialistId(spec.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-spa-600 bg-spa-50/70 shadow-sm ring-1 ring-spa-500'
                          : 'border-slate-200 hover:border-spa-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={spec.avatarUrl}
                          alt={spec.name}
                          className="w-12 h-12 rounded-xl object-cover border border-spa-200 flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-serif text-base font-bold text-slate-900">
                            {spec.name}
                          </h4>
                          <p className="text-xs text-spa-600 font-medium">
                            {spec.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center h-6 w-6 rounded-full border border-spa-400 flex-shrink-0">
                        {isSelected && <div className="w-3.5 h-3.5 rounded-full bg-spa-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PASO 3: SELECCIONAR FECHA Y HORA */}
          {/* ============================================================ */}
          {step === 3 && (
            <div className="space-y-6">
              
              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Selecciona la Fecha
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={minDateStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-spa-300 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none shadow-sm"
                  />
                  <Calendar className="w-5 h-5 text-spa-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Time Slots Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Selecciona el Horario Disponible
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 border text-center ${
                          isSelected
                            ? 'bg-spa-600 text-white border-spa-600 shadow-md shadow-spa-600/30 scale-102'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-spa-300 hover:bg-spa-50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Service Preview recap */}
              {selectedService && (
                <div className="bg-spa-50/80 rounded-2xl p-4 border border-spa-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Servicio:</span>
                    <strong className="text-slate-900">{selectedService.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Inversión:</span>
                    <strong className="text-spa-700 text-sm">${selectedService.priceMXN.toLocaleString('es-MX')} MXN</strong>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* PASO 4: DATOS DE LA CLIENTA */}
          {/* ============================================================ */}
          {step === 4 && (
            <form onSubmit={onConfirmBooking} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ana Laura Morales"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teléfono / WhatsApp (10 dígitos) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 55 1234 5678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Te enviaremos la confirmación y recordatorio por WhatsApp.
                </span>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico (Opcional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ana.morales@correo.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Piel o Comentarios Especiales (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Tengo piel sensible, tendencia a acné, o tengo un evento el fin de semana..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none resize-none"
                />
              </div>

              {/* Security Alert */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-800">
                <ShieldCheck className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                <span>
                  No requerimos pago anticipado para agendar. Pagas cómodamente al finalizar tu sesión en la clínica.
                </span>
              </div>

            </form>
          )}

          {/* ============================================================ */}
          {/* PASO 5: ÉXITO / CONFIRMACIÓN Y WHATSAPP */}
          {/* ============================================================ */}
          {step === 5 && confirmedAppointment && (
            <div className="text-center py-4 space-y-6 animate-in zoom-in-95 duration-300">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-spa-600 bg-spa-100 px-3 py-1 rounded-full">
                  Código: {confirmedAppointment.bookingCode}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
                  ¡Tu Cita Ha Sido Registrada!
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Gracias <strong>{confirmedAppointment.customerName}</strong>. Hemos reservado tu espacio en nuestra agenda.
                </p>
              </div>

              {/* Appointment Ticket Card */}
              <div className="bg-[#FAF7F5] rounded-2xl p-5 border border-spa-200/80 text-left max-w-md mx-auto space-y-3 shadow-sm text-sm">
                <div className="flex justify-between border-b border-spa-200/60 pb-2">
                  <span className="text-slate-500">Tratamiento:</span>
                  <strong className="text-slate-900 text-right">{confirmedAppointment.serviceName}</strong>
                </div>
                <div className="flex justify-between border-b border-spa-200/60 pb-2">
                  <span className="text-slate-500">Fecha y Hora:</span>
                  <strong className="text-slate-900">{confirmedAppointment.date} a las {confirmedAppointment.timeSlot}</strong>
                </div>
                <div className="flex justify-between border-b border-spa-200/60 pb-2">
                  <span className="text-slate-500">Especialista:</span>
                  <strong className="text-slate-900">{confirmedAppointment.specialistName}</strong>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-medium">Inversión a pagar:</span>
                  <strong className="text-spa-700 text-base">${confirmedAppointment.priceMXN.toLocaleString('es-MX')} MXN</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 max-w-md mx-auto">
                <a
                  href={getWhatsAppLink(confirmedAppointment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-[#25D366]/25 transition-all text-sm"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Confirmar Inmediato por WhatsApp</span>
                </a>

                <Button
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  className="w-full"
                >
                  Cerrar y Regresar a la Web
                </Button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls (Steps 1 to 4) */}
        {step <= totalSteps && (
          <div className="px-6 py-4 bg-slate-50 border-t border-spa-200/80 flex items-center justify-between flex-shrink-0">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep(step - 1)}
              >
                Atrás
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps && (
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
                onClick={() => setStep(step + 1)}
              >
                Siguiente
              </Button>
            )}

            {step === totalSteps && (
              <Button
                variant="primary"
                size="md"
                icon={<HeartHandshake className="w-4 h-4" />}
                disabled={!canProceedStep4 || isLoading}
                onClick={onConfirmBooking}
              >
                {isLoading ? 'Registrando...' : 'Confirmar Reserva'}
              </Button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
