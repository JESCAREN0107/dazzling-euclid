import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2, Image, DollarSign, Clock, Check, Save } from 'lucide-react';
import { Service, ServiceCategory } from '../../models/types';
import { Button } from '../../components/ui/Button';

interface EditServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

type TreatmentCategory = 'limpieza' | 'antiedad' | 'hidratacion' | 'acne' | 'paquetes';

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  if (!isOpen) return null;

  const isEditing = !!service;

  const [name, setName] = useState(service?.name || '');
  const [category, setCategory] = useState<TreatmentCategory>(service?.category || 'limpieza');
  const [priceMXN, setPriceMXN] = useState<number>(service?.priceMXN || 850);
  const [durationMinutes, setDurationMinutes] = useState<number>(service?.durationMinutes || 60);
  const [shortDescription, setShortDescription] = useState(service?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(service?.fullDescription || '');
  const [benefits, setBenefits] = useState<string[]>(service?.benefits || ['']);
  const [imageUrl, setImageUrl] = useState(service?.imageUrl || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80');
  const [popular, setPopular] = useState<boolean>(service?.popular || false);
  const [active, setActive] = useState<boolean>(service?.active !== false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategory(service.category);
      setPriceMXN(service.priceMXN);
      setDurationMinutes(service.durationMinutes);
      setShortDescription(service.shortDescription);
      setFullDescription(service.fullDescription);
      setBenefits(service.benefits?.length ? service.benefits : ['']);
      setImageUrl(service.imageUrl || '');
      setPopular(!!service.popular);
      setActive(service.active !== false);
    } else {
      // Nuevo servicio
      setName('');
      setCategory('limpieza');
      setPriceMXN(850);
      setDurationMinutes(60);
      setShortDescription('');
      setFullDescription('');
      setBenefits(['Extracción profunda e indolora', 'Piel luminosa y suave', 'Mascarilla hidratante']);
      setImageUrl('https://images.unsplash.com/photo-1512290900672-1f4a9b5f9215?auto=format&fit=crop&w=800&q=80');
      setPopular(false);
      setActive(true);
    }
  }, [service, isOpen]);

  const handleAddBenefit = () => {
    setBenefits(prev => [...prev, '']);
  };

  const handleBenefitChange = (index: number, val: string) => {
    setBenefits(prev => prev.map((b, i) => i === index ? val : b));
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const id = service?.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `srv-${Date.now()}`;
      const updated: Service = {
        id,
        name: name.trim(),
        category,
        priceMXN: Number(priceMXN),
        durationMinutes: Number(durationMinutes),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim() || shortDescription.trim(),
        benefits: benefits.map(b => b.trim()).filter(Boolean),
        imageUrl: imageUrl.trim(),
        popular,
        active
      };
      await onSave(updated);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-spa-400" />
            <h3 className="font-serif text-lg font-bold">
              {isEditing ? 'Editar Tratamiento Facial' : 'Nuevo Tratamiento Facial'}
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Nombre del Tratamiento *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. HidraFacial Glow Anti-Acné"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-spa-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TreatmentCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-spa-400 focus:outline-none"
              >
                <option value="limpieza">Limpieza Profunda</option>
                <option value="hidratacion">Hidratación & Glow</option>
                <option value="antiedad">Anti-Edad & Lifting</option>
                <option value="acne">Control Acné</option>
                <option value="paquetes">Paquetes VIP</option>
              </select>
            </div>
          </div>

          {/* Precio y Duración */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-spa-50/60 p-4 rounded-2xl border border-spa-200/80">
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-spa-600" />
                <span>Precio en Pesos (MXN) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={priceMXN}
                  onChange={(e) => setPriceMXN(Number(e.target.value))}
                  className="w-full pl-7 pr-12 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-spa-400 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">MXN</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-spa-600" />
                <span>Duración en Cabina *</span>
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-spa-400 focus:outline-none"
              >
                <option value={30}>30 minutos (Express)</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (1 hora estándar)</option>
                <option value={75}>75 minutos</option>
                <option value={90}>90 minutos (1.5 horas)</option>
                <option value={120}>120 minutos (2 horas VIP)</option>
              </select>
            </div>
          </div>

          {/* Descripciones */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Resumen Corto (Para la tarjeta del catálogo) *
              </label>
              <input
                type="text"
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Breve explicación de 1 línea para las clientas..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-spa-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Descripción Completa (Paso a paso del protocolo)
              </label>
              <textarea
                rows={3}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Explica qué incluye: vapor de ozono, extracción, mascarilla, luz led..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 resize-none focus:ring-2 focus:ring-spa-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Beneficios */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-800 uppercase tracking-wider">
                Beneficios Clave (Puntos a destacar)
              </label>
              <button
                type="button"
                onClick={handleAddBenefit}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-spa-600 hover:text-spa-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar punto</span>
              </button>
            </div>
            <div className="space-y-2">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-spa-100 flex items-center justify-center flex-shrink-0 text-spa-600">
                    <Check className="w-3 h-3" />
                  </div>
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(idx, e.target.value)}
                    placeholder="Ej. Estimula el colágeno natural"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                  {benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* URL de Imagen y Opciones */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-slate-500" />
                <span>URL de la Fotografía del Tratamiento</span>
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-spa-600 focus:ring-spa-400"
                />
                <span className="font-semibold text-xs text-slate-800">
                  Marcar como "Más Solicitado / Top" (Insignia dorada)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-spa-600 focus:ring-spa-400"
                />
                <span className="font-semibold text-xs text-slate-800">
                  Visible en la página web pública
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(service.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar del Catálogo</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                {isSaving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Tratamiento')}
              </Button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
