import { Service } from './types';
import { INITIAL_SERVICES } from '../config/business.config';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const STORAGE_KEY = 'lumiere_spa_services_v1';

export class ServiceModel {
  private static getLocalServices(): Service[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SERVICES;
    }
  }

  private static setLocalServices(services: Service[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  }

  static async getAll(): Promise<Service[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('price_mxn', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            shortDescription: row.short_description,
            fullDescription: row.full_description,
            durationMinutes: row.duration_minutes,
            priceMXN: Number(row.price_mxn),
            popular: row.popular,
            benefits: Array.isArray(row.benefits) ? row.benefits : [],
            imageUrl: row.image_url,
            active: row.active
          }));
        }
      } catch (err) {
        console.warn('Supabase no disponible para servicios, usando local:', err);
      }
    }
    return this.getLocalServices();
  }

  static async save(service: Service): Promise<Service> {
    const current = this.getLocalServices();
    const index = current.findIndex(s => s.id === service.id);
    let updated: Service[];

    if (index >= 0) {
      updated = current.map(s => s.id === service.id ? service : s);
    } else {
      updated = [service, ...current];
    }

    this.setLocalServices(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('services').upsert({
          id: service.id,
          name: service.name,
          category: service.category,
          short_description: service.shortDescription,
          full_description: service.fullDescription,
          duration_minutes: service.durationMinutes,
          price_mxn: service.priceMXN,
          popular: service.popular || false,
          benefits: service.benefits || [],
          image_url: service.imageUrl,
          active: service.active
        });
      } catch (err) {
        console.warn('Error guardando servicio en Supabase:', err);
      }
    }

    return service;
  }

  static async toggleActive(id: string): Promise<boolean> {
    const current = this.getLocalServices();
    const updated = current.map(s => s.id === id ? { ...s, active: !s.active } : s);
    this.setLocalServices(updated);
    return true;
  }
}
