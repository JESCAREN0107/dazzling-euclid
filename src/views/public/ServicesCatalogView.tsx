import React from 'react';
import { Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import { Service, ServiceCategory } from '../../models/types';
import { ServiceCard } from '../../components/ServiceCard';

interface ServicesCatalogViewProps {
  services: Service[];
  selectedCategory: ServiceCategory;
  onSelectCategory: (cat: ServiceCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onBookService: (serviceId: string) => void;
}

export const ServicesCatalogView: React.FC<ServicesCatalogViewProps> = ({
  services,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onBookService
}) => {
  const categories: { id: ServiceCategory; label: string }[] = [
    { id: 'todos', label: 'Todos los Faciales' },
    { id: 'limpieza', label: 'Limpiezas Profundas' },
    { id: 'hidratacion', label: 'Hidratación & Glow' },
    { id: 'antiedad', label: 'Anti-Edad & Lifting' },
    { id: 'acne', label: 'Control Acné' },
    { id: 'paquetes', label: 'Rituales & Paquetes VIP' },
  ];

  return (
    <section id="servicios" className="py-20 sm:py-28 bg-[#FAF7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-spa-100 px-3.5 py-1.5 rounded-full text-xs font-semibold text-spa-800 mb-3 border border-spa-200">
            <Sparkles className="w-3.5 h-3.5 text-spa-600" />
            <span>Menú de Tratamientos</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Nuestros Protocolos de <span className="text-spa-600 italic">Cuidado Facial</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Cada tratamiento es personalizado según tu tipo de piel (grasa, seca, mixta o sensible). Selecciona el servicio que deseas y agenda tu cita en segundos.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-10 space-y-4">
          
          {/* Search bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar facial por nombre o beneficio..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-spa-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-spa-400 shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 px-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-spa-600 text-white shadow-md shadow-spa-600/25 scale-105'
                    : 'bg-white text-slate-600 hover:bg-spa-50 border border-spa-200/80 hover:text-spa-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Services Cards Grid */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={onBookService}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-spa-200 p-8 max-w-lg mx-auto">
            <SlidersHorizontal className="w-12 h-12 text-spa-300 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-slate-800">No encontramos resultados</h3>
            <p className="text-sm text-slate-500 mt-1">
              Prueba buscando con otro término o selecciona otra categoría.
            </p>
            <button
              onClick={() => {
                onSelectCategory('todos');
                onSearchChange('');
              }}
              className="mt-4 text-xs font-semibold text-spa-600 hover:underline"
            >
              Ver todos los faciales
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
