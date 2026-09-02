export type ServiceCategory = 'todos' | 'limpieza' | 'antiedad' | 'hidratacion' | 'acne' | 'paquetes';

export interface Service {
  id: string;
  name: string;
  category: 'limpieza' | 'antiedad' | 'hidratacion' | 'acne' | 'paquetes';
  shortDescription: string;
  fullDescription: string;
  durationMinutes: number;
  priceMXN: number;
  popular?: boolean;
  benefits: string[];
  imageUrl: string;
  active: boolean;
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  specialties: string[];
}

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface Appointment {
  id: string;
  bookingCode: string;
  serviceId: string;
  serviceName: string;
  priceMXN: number;
  durationMinutes: number;
  specialistId: string;
  specialistName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNotes?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  status: AppointmentStatus;
  createdAt: string;
  source?: string;
}

export interface BusinessInfo {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  address: string;
  colonia: string;
  city: string;
  googleMapsEmbedUrl: string;
  instagram: string;
  facebook: string;
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  adminPin: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  serviceName: string;
  date: string;
  avatarUrl?: string;
  verified: boolean;
}

export interface BeforeAfterItem {
  id: string;
  title: string;
  description: string;
  serviceName: string;
  sessions: string;
  beforeImage: string;
  afterImage: string;
}
