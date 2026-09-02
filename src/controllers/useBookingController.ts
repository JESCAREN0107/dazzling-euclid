import { useState, useMemo } from 'react';
import { Service, Specialist, Appointment } from '../models/types';
import { AppointmentModel } from '../models/AppointmentModel';
import { BUSINESS_CONFIG, SPECIALISTS, AVAILABLE_TIME_SLOTS } from '../config/business.config';
import confetti from 'canvas-confetti';

export function useBookingController(services: Service[], initialServiceId?: string | null) {
  // Pasos: 1 = Servicio, 2 = Especialista, 3 = Fecha y Hora, 4 = Datos de la Clienta, 5 = Éxito / Confirmación
  const [step, setStep] = useState<number>(1);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Selecciones del cliente
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || (services[0]?.id || ''));
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>(SPECIALISTS[0]?.id || 'any');
  
  // Mañana como fecha mínima por defecto
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(minDateStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:15 AM');

  // Datos de contacto
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Cita creada final
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Servicio y Especialista seleccionados en tiempo real
  const selectedService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  const selectedSpecialist = useMemo(() => {
    if (selectedSpecialistId === 'any') {
      return { id: 'any', name: 'Cualquier especialista disponible', role: 'Asignación automática' };
    }
    return SPECIALISTS.find(s => s.id === selectedSpecialistId) || SPECIALISTS[0];
  }, [selectedSpecialistId]);

  // Abrir modal con servicio preseleccionado
  const openWithService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setStep(2); // Salta directo al paso de fecha/hora si ya eligió servicio
    setIsOpen(true);
  };

  const openGeneral = () => {
    if (!selectedServiceId && services.length > 0) {
      setSelectedServiceId(services[0].id);
    }
    setStep(1);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Resetear formulario si ya se confirmó
    if (confirmedAppointment) {
      setStep(1);
      setConfirmedAppointment(null);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerNotes('');
    }
  };

  // Validaciones
  const canProceedStep1 = Boolean(selectedServiceId);
  const canProceedStep2 = Boolean(selectedSpecialistId);
  const canProceedStep3 = Boolean(selectedDate && selectedTimeSlot);
  const isPhoneValid = customerPhone.replace(/\D/g, '').length >= 10;
  const canProceedStep4 = Boolean(customerName.trim().length >= 3 && isPhoneValid);

  // Confirmar y guardar cita
  const handleConfirmBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canProceedStep4 || !selectedService) return;

    setIsLoading(true);
    try {
      const created = await AppointmentModel.create({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        priceMXN: selectedService.priceMXN,
        durationMinutes: selectedService.durationMinutes,
        specialistId: selectedSpecialist.id,
        specialistName: selectedSpecialist.name,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerNotes: customerNotes.trim(),
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        status: 'pendiente',
        source: 'web'
      });

      setConfirmedAppointment(created);
      setStep(5); // Pantalla de éxito

      // Efecto festivo de confeti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignorar si el navegador restringe canvas
      }
    } catch (err) {
      console.error('Error al guardar la cita:', err);
      alert('Hubo un inconveniente al registrar la cita. Por favor intenta de nuevo o escríbenos directamente por WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generador de enlace a WhatsApp con mensaje estructurado
  const getWhatsAppLink = (appointment?: Appointment | null) => {
    const apt = appointment || confirmedAppointment;
    if (!apt && !selectedService) return `https://wa.me/${BUSINESS_CONFIG.whatsapp}`;

    const sName = apt ? apt.serviceName : selectedService.name;
    const sPrice = apt ? apt.priceMXN : selectedService.priceMXN;
    const sDate = apt ? apt.date : selectedDate;
    const sTime = apt ? apt.timeSlot : selectedTimeSlot;
    const cName = apt ? apt.customerName : (customerName || 'Cliente');
    const cCode = apt ? apt.bookingCode : 'LUM-NUEVA';

    const message = 
      `Hola ${BUSINESS_CONFIG.name}\n\n` +
      `Me gustaría confirmar mi cita facial agendada desde su página web:\n\n` +
      `Código: ${cCode}\n` +
      `Tratamiento: ${sName}\n` +
      `Fecha: ${sDate}\n` +
      `Hora: ${sTime}\n` +
      `Inversión: $${sPrice.toLocaleString('es-MX')} MXN\n` +
      `Nombre: ${cName}\n` +
      (apt?.customerNotes ? `Nota: ${apt.customerNotes}\n\n` : `\n`) +
      `¿Podrían confirmarme la disponibilidad para acudir? ¡Muchas gracias!`;

    return `https://api.whatsapp.com/send?phone=${BUSINESS_CONFIG.whatsapp}&text=${encodeURIComponent(message)}`;
  };

  return {
    step,
    setStep,
    isOpen,
    setIsOpen,
    openWithService,
    openGeneral,
    closeModal,
    isLoading,
    // Selecciones
    selectedServiceId,
    setSelectedServiceId,
    selectedService,
    selectedSpecialistId,
    setSelectedSpecialistId,
    selectedSpecialist,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    minDateStr,
    availableSlots: AVAILABLE_TIME_SLOTS,
    // Contacto
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerEmail,
    setCustomerEmail,
    customerNotes,
    setCustomerNotes,
    // Validaciones
    canProceedStep1,
    canProceedStep2,
    canProceedStep3,
    canProceedStep4,
    isPhoneValid,
    // Acciones
    handleConfirmBooking,
    confirmedAppointment,
    getWhatsAppLink
  };
}
