export type ServiceCategory = 'limpieza' | 'hidratacion' | 'antiedad' | 'acne' | 'paquetes';

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ServiceCategory;
  benefits?: string[];
  price_mxn: number;
  duration_min: number;
  icon: string;
  image_url: string | null;
  bookable: boolean;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface Stylist {
  id: string;
  slug: string;
  name: string;
  role: string;
  tags: string[];
  avatar_url: string | null;
  rating: number | null;
  rating_count: number;
  sort_order: number;
  is_active: boolean;
}

export interface StylistReview {
  id: string;
  stylist_id: string;
  booking_id: string | null;
  customer_name: string;
  rating: number;
  comment: string;
  likes_count: number;
  reports_count: number;
  created_at: string;
}

export interface BusinessHour {
  day_of_week: number;
  open_minute: number;
  close_minute: number;
  is_closed: boolean;
}

export interface BlockedSlot {
  id: string;
  stylist_id: string | null;
  starts_at: string;
  ends_at: string;
  reason: string;
}

export interface Booking {
  id: string;
  reference: string;
  service_id: string;
  service_ids: string[] | null;
  stylist_id: string | null;
  user_id: string | null;
  starts_at: string;
  ends_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string;
  status: 'confirmed' | 'completed' | 'no_show' | 'cancelled';
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  tag: string;
  category: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}
