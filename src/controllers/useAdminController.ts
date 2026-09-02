import { useState, useEffect, useMemo, useCallback } from 'react';
import { Appointment, AppointmentStatus, Service } from '../models/types';
import { AppointmentModel } from '../models/AppointmentModel';
import { ServiceModel } from '../models/ServiceModel';
import { BUSINESS_CONFIG } from '../config/business.config';
import { isSupabaseConfigured } from '../services/supabaseClient';

export function useAdminController() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lumiere_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'citas' | 'servicios' | 'metricas' | 'configuracion'>('citas');
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

  // Cargar datos
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [apts, srvs] = await Promise.all([
        AppointmentModel.getAll(),
        ServiceModel.getAll()
      ]);
      setAppointments(apts);
      setServices(srvs);
    } catch (err) {
      console.error('Error cargando datos de administración:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Login con PIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === BUSINESS_CONFIG.adminPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('lumiere_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('PIN incorrecto. El PIN de demostración es 1234.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('lumiere_admin_auth');
    setPinInput('');
  };

  // Actualizar estado de cita
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    await AppointmentModel.updateStatus(id, newStatus);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  // Eliminar cita
  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta cita del registro?')) {
      await AppointmentModel.delete(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  // Toggle estado de servicio (activo/inactivo)
  const handleToggleService = async (id: string) => {
    await ServiceModel.toggleActive(id);
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  // Guardar o actualizar servicio
  const handleSaveService = async (service: Service) => {
    await ServiceModel.save(service);
    await loadData();
  };

  // Filtrado de citas
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Filtro de estado
      if (filterStatus === 'hoy' && apt.date !== todayStr) return false;
      if (filterStatus === 'pendientes' && apt.status !== 'pendiente') return false;
      if (filterStatus === 'confirmadas' && apt.status !== 'confirmada') return false;
      if (filterStatus === 'completadas' && apt.status !== 'completada') return false;

      // Filtro de fecha específica
      if (selectedDateFilter && apt.date !== selectedDateFilter) return false;

      // Búsqueda por texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = apt.customerName.toLowerCase().includes(q);
        const matchesPhone = apt.customerPhone.includes(q);
        const matchesCode = apt.bookingCode.toLowerCase().includes(q);
        const matchesService = apt.serviceName.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesCode || matchesService;
      }

      return true;
    });
  }, [appointments, filterStatus, selectedDateFilter, searchQuery, todayStr]);

  // Métricas financieras y operativas en MXN
  const metrics = useMemo(() => {
    const todayApts = appointments.filter(a => a.date === todayStr && a.status !== 'cancelada');
    const pendingCount = appointments.filter(a => a.status === 'pendiente').length;
    const completedApts = appointments.filter(a => a.status === 'completada' || a.status === 'confirmada');
    
    const totalRevenueMXN = completedApts.reduce((acc, curr) => acc + curr.priceMXN, 0);
    const averageTicketMXN = completedApts.length > 0 ? Math.round(totalRevenueMXN / completedApts.length) : 0;

    return {
      todayCount: todayApts.length,
      pendingCount,
      totalAppointments: appointments.length,
      totalRevenueMXN,
      averageTicketMXN,
      todayRevenueMXN: todayApts.reduce((acc, curr) => acc + curr.priceMXN, 0)
    };
  }, [appointments, todayStr]);

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState<boolean>(false);

  // Guardar cita editada / reasignada
  const handleSaveAppointment = async (updatedAppointment: Appointment) => {
    await AppointmentModel.update(updatedAppointment);
    setAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
    setEditingAppointment(null);
  };

  // Eliminar servicio del catálogo
  const handleDeleteService = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este tratamiento del catálogo?')) {
      await ServiceModel.delete(id);
      setServices(prev => prev.filter(s => s.id !== id));
      if (editingService?.id === id) setEditingService(null);
    }
  };

  return {
    isAuthenticated,
    pinInput,
    setPinInput,
    authError,
    handleLogin,
    handleLogout,
    isLoading,
    activeTab,
    setActiveTab,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    selectedDateFilter,
    setSelectedDateFilter,
    appointments: filteredAppointments,
    allAppointmentsCount: appointments.length,
    services,
    metrics,
    handleUpdateStatus,
    handleDeleteAppointment,
    handleToggleService,
    handleSaveService,
    handleDeleteService,
    editingAppointment,
    setEditingAppointment,
    handleSaveAppointment,
    editingService,
    setEditingService,
    isNewServiceModalOpen,
    setIsNewServiceModalOpen,
    reload: loadData,
    isSupabaseConfigured
  };
}
