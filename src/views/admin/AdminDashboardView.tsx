import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, LogOut, Calendar, Clock, User, Phone, CheckCircle2, 
  XCircle, AlertCircle, Trash2, Search, Plus, Sparkles, DollarSign,
  TrendingUp, Database, ArrowLeft, MessageCircle, RefreshCw, ExternalLink,
  Edit3, SlidersHorizontal, Check
} from 'lucide-react';
import { useAdminController } from '../../controllers/useAdminController';
import { AppointmentStatus, Service, Appointment } from '../../models/types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BUSINESS_CONFIG } from '../../config/business.config';
import { EditAppointmentModal } from './EditAppointmentModal';
import { EditServiceModal } from './EditServiceModal';

interface AdminDashboardViewProps {
  onBackToPublic: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToPublic }) => {
  const admin = useAdminController();

  // ============================================================
  // PANTALLA DE LOGIN CON PIN
  // ============================================================
  if (!admin.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-700 text-center space-y-6">
          
          <div className="w-16 h-16 rounded-full bg-spa-100 text-spa-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-spa-600">
              Panel Administrativo
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {BUSINESS_CONFIG.name}
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Ingresa el PIN de seguridad del dueño para gestionar citas y servicios.
            </p>
          </div>

          <form onSubmit={admin.handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                placeholder="Ingresa PIN (Demo: 1234)"
                value={admin.pinInput}
                onChange={(e) => admin.setPinInput(e.target.value)}
                className="w-full px-4 py-3.5 text-center text-xl font-bold tracking-widest rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-spa-400 bg-slate-50"
                autoFocus
              />
              {admin.authError && (
                <p className="text-xs text-rose-600 mt-2 font-medium">
                  {admin.authError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              icon={<ShieldCheck className="w-5 h-5" />}
            >
              Acceder al Panel
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onBackToPublic}
              className="text-xs font-semibold text-slate-500 hover:text-spa-600 flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Regresar a la Web del Spa</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD PRINCIPAL
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Ver sitio público"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold leading-tight flex items-center gap-2">
                <span>Panel de Control</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-spa-600 font-sans font-semibold">
                  {BUSINESS_CONFIG.name}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={admin.reload}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
              title="Recargar citas y servicios"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={admin.handleLogout}
              className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs flex items-center gap-1.5 border border-rose-800/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Citas Hoy */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Citas de Hoy</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">
                {admin.metrics.todayCount}
              </div>
              <span className="text-xs text-emerald-600 font-medium mt-1 block">
                ${admin.metrics.todayRevenueMXN.toLocaleString('es-MX')} MXN estimados hoy
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-spa-100 text-spa-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Pendientes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Por Confirmar</span>
              <div className="text-3xl font-bold text-amber-600 mt-1">
                {admin.metrics.pendingCount}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Requieren WhatsApp</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Ingresos Totales */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ingresos Totales</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">
                ${admin.metrics.totalRevenueMXN.toLocaleString('es-MX')}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Ticket Prom: ${admin.metrics.averageTicketMXN.toLocaleString('es-MX')} MXN</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Base de Datos */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base de Datos</span>
              <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Supabase Cloud</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Sincronización en tiempo real</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 space-x-8">
          {[
            { id: 'citas', label: `Agenda de Citas (${admin.allAppointmentsCount})`, icon: Calendar },
            { id: 'servicios', label: `Catálogo de Tratamientos (${admin.services.length})`, icon: Sparkles },
            { id: 'configuracion', label: 'Estado Supabase & Nube', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = admin.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => admin.setActiveTab(tab.id as any)}
                className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                  isActive
                    ? 'border-spa-600 text-spa-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* TAB 1: AGENDA DE CITAS */}
        {/* ============================================================ */}
        {admin.activeTab === 'citas' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
            
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Status pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
                {[
                  { id: 'todas', label: 'Todas' },
                  { id: 'hoy', label: 'Hoy' },
                  { id: 'pendientes', label: 'Pendientes' },
                  { id: 'confirmadas', label: 'Confirmadas' },
                  { id: 'completadas', label: 'Completadas' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => admin.setFilterStatus(st.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      admin.filterStatus === st.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, folio o tel..."
                  value={admin.searchQuery}
                  onChange={(e) => admin.setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-spa-400"
                />
              </div>

            </div>

            {/* Appointments Table - 100% Visible sin scroll horizontal */}
            <div className="w-full">
              <div className="hidden md:block w-full">
                <table className="w-full text-left text-xs table-auto">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3">Clienta</th>
                      <th className="py-3 px-3">Fecha & Hora</th>
                      <th className="py-3 px-3">Tratamiento</th>
                      <th className="py-3 px-3">Inversión</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                      <th className="py-3 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admin.appointments.map((apt) => {
                      const statusBadgeVariant = 
                        apt.status === 'confirmada' ? 'success' :
                        apt.status === 'pendiente' ? 'warning' :
                        apt.status === 'completada' ? 'slate' : 'danger';

                      const clientWaMessage = `Hola ${apt.customerName}, te escribimos de ${BUSINESS_CONFIG.name} para confirmar los detalles de tu cita de ${apt.serviceName} agendada para el ${apt.date} a las ${apt.timeSlot}. ¿Nos confirmas tu asistencia?`;
                      const clientWaUrl = `https://api.whatsapp.com/send?phone=52${apt.customerPhone.replace(/\D/g, '')}&text=${encodeURIComponent(clientWaMessage)}`;

                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/90 transition-colors">
                          
                          {/* Clienta & Folio */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 text-xs leading-snug">
                              {apt.customerName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono font-bold text-spa-700 bg-spa-50 px-1.5 py-0.2 rounded text-[10px]">
                                {apt.bookingCode}
                              </span>
                              <span>•</span>
                              <span>{apt.customerPhone}</span>
                            </div>
                            {apt.customerNotes && (
                              <p className="text-[10px] text-amber-800 bg-amber-50/80 border border-amber-200/60 px-1.5 py-0.5 rounded mt-1 max-w-[220px] truncate" title={apt.customerNotes}>
                                {apt.customerNotes}
                              </p>
                            )}
                          </td>

                          {/* Fecha & Horario */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-spa-600" />
                              <span>{apt.date}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1 pl-5">
                              <span>{apt.timeSlot}</span>
                            </div>
                          </td>

                          {/* Tratamiento & Especialista */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block leading-tight text-xs" title={apt.serviceName}>
                              {apt.serviceName}
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {apt.specialistName} <span className="text-slate-300">({apt.durationMinutes}m)</span>
                            </span>
                          </td>

                          {/* Inversión */}
                          <td className="py-3 px-3 font-bold text-slate-900 text-xs whitespace-nowrap">
                            ${apt.priceMXN.toLocaleString('es-MX')} MXN
                          </td>

                          {/* Estado */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <Badge variant={statusBadgeVariant} size="sm">
                              {apt.status.toUpperCase()}
                            </Badge>
                          </td>

                          {/* Acciones */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1">
                              
                              {/* Botón rápido de cambio de estado */}
                              {apt.status === 'pendiente' && (
                                <button
                                  onClick={() => admin.handleUpdateStatus(apt.id, 'confirmada')}
                                  className="px-2 py-1 rounded-lg text-emerald-800 hover:bg-emerald-100 bg-emerald-50 border border-emerald-300 text-[11px] font-bold transition-colors"
                                  title="Confirmar Cita"
                                >
                                  Confirmar
                                </button>
                              )}

                              {apt.status === 'confirmada' && (
                                <button
                                  onClick={() => admin.handleUpdateStatus(apt.id, 'completada')}
                                  className="px-2 py-1 rounded-lg text-slate-700 hover:bg-slate-200 bg-slate-100 border border-slate-300 text-[11px] font-bold transition-colors"
                                  title="Completar y Cobrar Cita"
                                >
                                  Completar
                                </button>
                              )}

                              {/* Editar / Reasignar */}
                              <button
                                onClick={() => admin.setEditingAppointment(apt)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-spa-700 hover:bg-spa-50 border border-slate-200 bg-white transition-colors"
                                title="Editar y Reasignar Cita"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* WhatsApp a clienta */}
                              <a
                                href={clientWaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 bg-white transition-colors"
                                title="Enviar WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-emerald-100" />
                              </a>

                              {/* Cancelar Cita */}
                              {apt.status !== 'cancelada' && (
                                <button
                                  onClick={() => admin.handleUpdateStatus(apt.id, 'cancelada')}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Cancelar Cita"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Eliminar Registro */}
                              <button
                                onClick={() => admin.handleDeleteAppointment(apt.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Eliminar del Registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Vista Móvil / Tarjetas Adaptables (0 scroll horizontal) */}
              <div className="md:hidden space-y-3">
                {admin.appointments.map((apt) => {
                  const statusBadgeVariant = 
                    apt.status === 'confirmada' ? 'success' :
                    apt.status === 'pendiente' ? 'warning' :
                    apt.status === 'completada' ? 'slate' : 'danger';

                  const clientWaMessage = `Hola ${apt.customerName}, te escribimos de ${BUSINESS_CONFIG.name} para confirmar los detalles de tu cita de ${apt.serviceName} agendada para el ${apt.date} a las ${apt.timeSlot}. ¿Nos confirmas tu asistencia?`;
                  const clientWaUrl = `https://api.whatsapp.com/send?phone=52${apt.customerPhone.replace(/\D/g, '')}&text=${encodeURIComponent(clientWaMessage)}`;

                  return (
                    <div key={apt.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-spa-700 text-xs">
                            {apt.bookingCode}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{apt.customerName}</h4>
                          <span className="text-xs text-slate-500">{apt.customerPhone}</span>
                        </div>
                        <Badge variant={statusBadgeVariant} size="sm">
                          {apt.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-800 block">{apt.serviceName}</span>
                          <span className="text-slate-500">{apt.date} • {apt.timeSlot}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-right">
                          ${apt.priceMXN.toLocaleString('es-MX')} MXN
                        </div>
                      </div>

                      {apt.customerNotes && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          {apt.customerNotes}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {apt.status === 'pendiente' && (
                            <button
                              onClick={() => admin.handleUpdateStatus(apt.id, 'confirmada')}
                              className="px-2.5 py-1.5 rounded-lg text-emerald-800 bg-emerald-50 border border-emerald-300 text-xs font-bold"
                            >
                              Confirmar
                            </button>
                          )}
                          {apt.status === 'confirmada' && (
                            <button
                              onClick={() => admin.handleUpdateStatus(apt.id, 'completada')}
                              className="px-2.5 py-1.5 rounded-lg text-slate-700 bg-slate-100 border border-slate-300 text-xs font-bold"
                            >
                              Completar
                            </button>
                          )}
                          <a
                            href={clientWaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 border border-emerald-200 text-xs"
                          >
                            <MessageCircle className="w-4 h-4 fill-emerald-100" />
                          </a>
                          <button
                            onClick={() => admin.setEditingAppointment(apt)}
                            className="p-1.5 rounded-lg text-slate-600 border border-slate-200 text-xs"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {apt.status !== 'cancelada' && (
                            <button
                              onClick={() => admin.handleUpdateStatus(apt.id, 'cancelada')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => admin.handleDeleteAppointment(apt.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {admin.appointments.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay citas registradas bajo este filtro.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: GESTOR DE SERVICIOS */}
        {/* ============================================================ */}
        {admin.activeTab === 'servicios' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Catálogo de Tratamientos y Precios en MXN
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Puedes editar descripciones, cambiar precios, agregar nuevos faciales o pausarlos en la web.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  admin.setEditingService(null);
                  admin.setIsNewServiceModalOpen(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Nuevo Tratamiento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {admin.services.map((srv) => (
                <div
                  key={srv.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    srv.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-65'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={srv.imageUrl}
                      alt={srv.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{srv.name}</h4>
                        {srv.popular && <Badge variant="gold" size="sm">Top</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{srv.shortDescription}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-bold text-spa-700 text-sm">${srv.priceMXN.toLocaleString('es-MX')} MXN</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">{srv.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones del tratamiento */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => admin.handleToggleService(srv.id)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                          srv.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {srv.active ? 'Activo en Web' : 'Pausado'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          admin.setEditingService(srv);
                          admin.setIsNewServiceModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-spa-700 hover:bg-spa-50 border border-slate-200 text-xs font-semibold flex items-center gap-1"
                        title="Editar Tratamiento"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => admin.handleDeleteService(srv.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Eliminar del catálogo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CONFIGURACIÓN SUPABASE */}
        {/* ============================================================ */}
        {admin.activeTab === 'configuracion' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-3xl">
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  Estado de la Base de Datos Nube (Supabase)
                </h3>
                <p className="text-xs text-slate-500">
                  Conexión PostgreSQL en tiempo real y persistencia segura.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Estado de Conexión:</span>
                <Badge variant="success">✦ Conectado a Supabase Cloud (ffyypfqbixdyanxporxt)</Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Todas las citas agendadas por clientas en la web pública o modificadas por los dueños se guardan de forma instantánea en la nube de Supabase.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100">
                <span className="font-semibold">Tratamientos sincronizados:</span>
                <span className="font-bold text-slate-900">{admin.services.length} tratamientos</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100">
                <span className="font-semibold">Citas registradas:</span>
                <span className="font-bold text-slate-900">{admin.allAppointmentsCount} citas</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* MODAL DE EDICIÓN Y REASIGNACIÓN DE CITA */}
      {/* ============================================================ */}
      <EditAppointmentModal
        appointment={admin.editingAppointment}
        services={admin.services}
        onClose={() => admin.setEditingAppointment(null)}
        onSave={admin.handleSaveAppointment}
      />

      {/* ============================================================ */}
      {/* MODAL DE CREACIÓN Y EDICIÓN DE TRATAMIENTO */}
      {/* ============================================================ */}
      <EditServiceModal
        service={admin.editingService}
        isOpen={admin.isNewServiceModalOpen || !!admin.editingService}
        onClose={() => {
          admin.setEditingService(null);
          admin.setIsNewServiceModalOpen(false);
        }}
        onSave={admin.handleSaveService}
        onDelete={admin.handleDeleteService}
      />

    </div>
  );
};
