import { Appointment, AppointmentStatus } from './types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const STORAGE_KEY = 'lumiere_spa_appointments_v1';

// Citas iniciales de demostración para que el panel administrativo tenga datos reales de inmediato
const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    bookingCode: 'LUM-8492',
    serviceId: 'limpieza-profunda-lumiere',
    serviceName: 'Limpieza Facial Profunda con Hidrodermoabrasión',
    priceMXN: 850,
    durationMinutes: 60,
    specialistId: 'dra-sofia-navarro',
    specialistName: 'Dra. Sofía Navarro',
    customerName: 'Camila González Hernández',
    customerPhone: '55 9876 5432',
    customerEmail: 'camila.gonzalez@gmail.com',
    customerNotes: 'Piel mixta con tendencia a sensibilidad en mejillas.',
    date: new Date().toISOString().split('T')[0], // Hoy
    timeSlot: '10:00 AM',
    status: 'confirmada',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    source: 'web'
  },
  {
    id: 'apt-002',
    bookingCode: 'LUM-1934',
    serviceId: 'hidrafacial-glow-express',
    serviceName: 'Glow HidraFacial 3 en 1',
    priceMXN: 1100,
    durationMinutes: 50,
    specialistId: 'lic-valeria-morales',
    specialistName: 'Lic. Valeria Morales',
    customerName: 'Valeria Sotomayor',
    customerPhone: '55 1234 9988',
    customerEmail: 'valeria.soto@outlook.com',
    customerNotes: 'Tiene una boda el sábado y quiere lucir piel radiante.',
    date: new Date().toISOString().split('T')[0], // Hoy
    timeSlot: '03:15 PM',
    status: 'pendiente',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    source: 'web'
  },
  {
    id: 'apt-003',
    bookingCode: 'LUM-5521',
    serviceId: 'lifting-radiofrecuencia-antiedad',
    serviceName: 'Lifting Facial Tensor con Radiofrecuencia Tripolar',
    priceMXN: 1450,
    durationMinutes: 60,
    specialistId: 'dra-sofia-navarro',
    specialistName: 'Dra. Sofía Navarro',
    customerName: 'Patricia Morales Cuevas',
    customerPhone: '55 4433 2211',
    customerEmail: 'patricia.morales@yahoo.com',
    customerNotes: 'Sesión #2 de su paquete anti-edad.',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
    timeSlot: '11:15 AM',
    status: 'confirmada',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    source: 'whatsapp'
  }
];

export class AppointmentModel {
  private static getLocalAppointments(): Appointment[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPOINTMENTS));
      return SEED_APPOINTMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_APPOINTMENTS;
    }
  }

  private static setLocalAppointments(appointments: Appointment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }

  // Obtener todas las citas
  static async getAll(): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(row => ({
            id: row.id,
            bookingCode: row.booking_code,
            serviceId: row.service_id,
            serviceName: row.service_name,
            priceMXN: Number(row.price_mxn),
            durationMinutes: row.duration_minutes,
            specialistId: row.specialist_id,
            specialistName: row.specialist_name,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            customerEmail: row.customer_email || '',
            customerNotes: row.customer_notes || '',
            date: row.appointment_date,
            timeSlot: row.time_slot,
            status: row.status as AppointmentStatus,
            createdAt: row.created_at,
            source: row.source
          }));
        }
      } catch (err) {
        console.warn('Supabase no disponible, usando almacenamiento local:', err);
      }
    }
    return this.getLocalAppointments();
  }

  // Guardar una nueva cita
  static async create(appointmentData: Omit<Appointment, 'id' | 'bookingCode' | 'createdAt'>): Promise<Appointment> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `LUM-${randomSuffix}`;
    const newAppointment: Appointment = {
      ...appointmentData,
      id: 'apt-' + Date.now(),
      bookingCode,
      createdAt: new Date().toISOString()
    };

    // Guardar en Supabase si está activo
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('appointments').insert({
          booking_code: newAppointment.bookingCode,
          service_id: newAppointment.serviceId,
          service_name: newAppointment.serviceName,
          price_mxn: newAppointment.priceMXN,
          duration_minutes: newAppointment.durationMinutes,
          specialist_id: newAppointment.specialistId,
          specialist_name: newAppointment.specialistName,
          customer_name: newAppointment.customerName,
          customer_phone: newAppointment.customerPhone,
          customer_email: newAppointment.customerEmail,
          customer_notes: newAppointment.customerNotes,
          appointment_date: newAppointment.date,
          time_slot: newAppointment.timeSlot,
          status: newAppointment.status,
          source: newAppointment.source || 'web'
        });
      } catch (err) {
        console.warn('Error guardando en Supabase, respaldando localmente:', err);
      }
    }

    // Guardar siempre en LocalStorage para redundancia y modo offline
    const current = this.getLocalAppointments();
    const updated = [newAppointment, ...current];
    this.setLocalAppointments(updated);

    return newAppointment;
  }

  // Actualizar todos los campos de una cita (reasignar fecha, hora, especialista, etc.)
  static async update(appointment: Appointment): Promise<Appointment> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('appointments').update({
          service_id: appointment.serviceId,
          service_name: appointment.serviceName,
          price_mxn: appointment.priceMXN,
          duration_minutes: appointment.durationMinutes,
          specialist_id: appointment.specialistId,
          specialist_name: appointment.specialistName,
          customer_name: appointment.customerName,
          customer_phone: appointment.customerPhone,
          customer_email: appointment.customerEmail,
          customer_notes: appointment.customerNotes,
          appointment_date: appointment.date,
          time_slot: appointment.timeSlot,
          status: appointment.status
        }).eq('id', appointment.id);
      } catch (err) {
        console.warn('Error actualizando cita completa en Supabase:', err);
      }
    }

    const current = this.getLocalAppointments();
    const updated = current.map(item => (item.id === appointment.id || item.bookingCode === appointment.bookingCode) ? appointment : item);
    this.setLocalAppointments(updated);
    return appointment;
  }

  // Actualizar estado de cita
  static async updateStatus(id: string, status: AppointmentStatus): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('appointments').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Error actualizando en Supabase:', err);
      }
    }

    const current = this.getLocalAppointments();
    const updated = current.map(item => item.id === id ? { ...item, status } : item);
    this.setLocalAppointments(updated);
    return true;
  }

  // Eliminar cita
  static async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('appointments').delete().eq('id', id);
      } catch (err) {
        console.warn('Error eliminando en Supabase:', err);
      }
    }

    const current = this.getLocalAppointments();
    const updated = current.filter(item => item.id !== id);
    this.setLocalAppointments(updated);
    return true;
  }
}
