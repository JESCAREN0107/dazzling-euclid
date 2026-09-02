import { useState, useEffect, useMemo } from 'react';
import { Service, ServiceCategory } from '../models/types';
import { ServiceModel } from '../models/ServiceModel';
import { BUSINESS_CONFIG, REVIEWS, BEFORE_AFTER_ITEMS, SPECIALISTS, FAQS } from '../config/business.config';

export function useBusinessController() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadServices() {
      setIsLoading(true);
      try {
        const data = await ServiceModel.getAll();
        setServices(data.filter(s => s.active));
      } catch (err) {
        console.error('Error cargando servicios:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory = selectedCategory === 'todos' || service.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  return {
    businessInfo: BUSINESS_CONFIG,
    services: filteredServices,
    allServices: services,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading,
    reviews: REVIEWS,
    beforeAfterItems: BEFORE_AFTER_ITEMS,
    specialists: SPECIALISTS,
    faqs: FAQS
  };
}
