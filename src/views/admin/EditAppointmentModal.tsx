import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, Sparkles, MessageCircle, Save } from 'lucide-react';
import { Appointment, AppointmentStatus, Service } from '../../models/types';
import { SPECIALISTS, AVAILABLE_TIME_SLOTS, BUSINESS_CONFIG } from '../../config/business.config';
import { Button } from '../../components/ui/Button';

interface EditAppointmentModalProps {
  appointment: Appointment | null;
  services: Service[];
  onClose: () => void;
  onSave: (appointment: Appointment) => Promise<void>;
}

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  services,
  onClose,
  onSave
}) => {
  if (!appointment) return null;

  const [date, setDate] = useState(appointment.date);
  const [timeSlot, setTimeSlot] = useState(appointment.timeSlot);
  const [specialistId, setSpecialistId] = useState(appointment.specialistId);
  const [serviceId, setServiceId] = useState(appointment.serviceId);
  const [customerName, setCustomerName] = useState(appointment.customerName);
  const [customerPhone, setCustomerPhone] = useState(appointment.customerPhone);
  const [customerEmail, setCustomerEmail] = useState(appointment.customerEmail || '');
  const [customerNotes, setCustomerNotes] = useState(appointment.customerNotes || '');
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (appointment) {
      setDate(appointment.date);
      setTimeSlot(appointment.timeSlot);
      setSpecialistId(appointment.specialistId);
      setServiceId(appointment.serviceId);
      setCustomerName(appointment.customerName);
      setCustomerPhone(appointment.customerPhone);
      setCustomerEmail(appointment.customerEmail || '');
      setCustomerNotes(appointment.customerNotes || '');
      setStatus(appointment.status);
    }
  }, [appointment]);

  const selectedService = services.find(s => s.id === serviceId) || {
    name: appointment.serviceName,
    priceMXN: appointment.priceMXN,
    durationMinutes: appointment.durationMinutes
  };

  const selectedSpecialist = SPECIALISTS.find(sp => sp.id === specialistId) || {
    name: specialistId === 'any' ? 'Cualquier especialista' : appointment.specialistName
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated: Appointment = {
        ...appointment,
        date,
        timeSlot,
        specialistId,
        specialistName: selectedSpecialist.name,
        serviceId,
        serviceName: selectedService.name,
        priceMXN: selectedService.priceMXN,
        durationMinutes: selectedService.durationMinutes,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerNotes: customerNotes.trim(),
        status
      };
      await onSave(updated);
    } finally {
      setIsSaving(false);
    }
  };

  // Enlace para avisar a la clienta por WhatsApp de la reasignación
  const notifyWaMessage = 
    `Hola ${customerName}, te escribimos de ${BUSINESS_CONFIG.name} para notificarte una actualización en tu cita:\n\n` +
    `Código: ${appointment.bookingCode}\n` +
    `Tratamiento: ${selectedService.name}\n` +
    `Nueva Fecha: ${date}\n` +
    `Nuevo Horario: ${timeSlot}\n` +
    `Especialista: ${selectedSpecialist.name}\n` +
    `Inversión: $${selectedService.priceMXN.toLocaleString('es-MX')} MXN\n\n` +
    `¿Nos confirmas que este nuevo horario te queda bien? ¡Muchas gracias!`;

  const notifyWaUrl = `https://api.whatsapp.com/send?phone=52${customerPhone.replace(/\D/g, '')}&text=${encodeURIComponent(notifyWaMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-xs font-mono font-bold text-spa-400">
              {appointment.bookingCode}
            </span>
            <h3 className="font-serif text-lg font-bold">
              Editar y Reasignar Cita
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Fila 1: Fecha y Horario (Reasignar) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-spa-50/60 p-4 rounded-2xl border border-spa-200/80">
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-spa-600" />
                <span>Fecha de la Cita *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-spa-600" />
                <span>Horario *</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none"
              >
                {AVAILABLE_TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: Especialista y Tratamiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Especialista Asignada
              </label>
              <select
                value={specialistId}
                onChange={(e) => setSpecialistId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none"
              >
                <option value="any">Cualquier especialista disponible</option>
                {SPECIALISTS.map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.name} ({sp.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Tratamiento Facial
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none"
              >
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} (${srv.priceMXN} MXN)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 3: Estado de la Cita */}
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Estado de la Cita
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'pendiente', label: 'Pendiente', color: 'border-amber-300 bg-amber-50 text-amber-800' },
                { id: 'confirmada', label: 'Confirmada', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                { id: 'completada', label: 'Completada', color: 'border-slate-300 bg-slate-100 text-slate-800' },
                { id: 'cancelada', label: 'Cancelada', color: 'border-rose-300 bg-rose-50 text-rose-800' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id as AppointmentStatus)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    status === st.id
                      ? `${st.color} ring-2 ring-slate-900 shadow-sm`
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 4: Datos de la Clienta */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Datos de la Clienta
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre Completo</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">WhatsApp (10 dígitos)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Notas o Tipo de Piel</label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Observaciones de la clienta..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a
              href={notifyWaUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-4 py-2.5 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-100" />
              <span>Avisar Nueva Fecha por WhatsApp</span>
            </a>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
