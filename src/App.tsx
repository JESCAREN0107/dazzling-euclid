import React, { useState } from 'react';
import { useBusinessController } from './controllers/useBusinessController';
import { useBookingController } from './controllers/useBookingController';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { HeroView } from './views/public/HeroView';
import { ServicesCatalogView } from './views/public/ServicesCatalogView';
import { BeforeAfterView } from './views/public/BeforeAfterView';
import { SpecialistsView } from './views/public/SpecialistsView';
import { TestimonialsView } from './views/public/TestimonialsView';
import { FAQView } from './views/public/FAQView';
import { ContactLocationView } from './views/public/ContactLocationView';
import { BookingWizardModal } from './views/public/BookingWizardModal';
import { AdminDashboardView } from './views/admin/AdminDashboardView';

export function App() {
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');

  // Business Controller (Models & Services data)
  const business = useBusinessController();

  // Booking Controller (Wizard state & validation)
  const booking = useBookingController(business.allServices);

  // Si estamos en modo de administración
  if (viewMode === 'admin') {
    return (
      <AdminDashboardView 
        onBackToPublic={() => setViewMode('public')} 
      />
    );
  }

  // Vista Pública (Web Corporativa + Flujo de Citas)
  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col selection:bg-spa-200 selection:text-spa-900">
      
      {/* Barra de Navegación */}
      <Navbar
        business={business.businessInfo}
        onOpenBooking={booking.openGeneral}
        onOpenAdmin={() => setViewMode('admin')}
      />

      {/* Cuerpo Principal */}
      <main className="flex-grow">
        
        {/* 1. Hero Section */}
        <HeroView
          business={business.businessInfo}
          onOpenBooking={booking.openGeneral}
        />

        {/* 2. Catálogo de Servicios / Tratamientos */}
        <ServicesCatalogView
          services={business.services}
          selectedCategory={business.selectedCategory}
          onSelectCategory={business.setSelectedCategory}
          searchQuery={business.searchQuery}
          onSearchChange={business.setSearchQuery}
          onBookService={booking.openWithService}
        />

        {/* 3. Antes y Después */}
        <BeforeAfterView
          items={business.beforeAfterItems}
          onOpenBooking={booking.openGeneral}
        />

        {/* 4. Especialistas Certificadas */}
        <SpecialistsView
          specialists={business.specialists}
        />

        {/* 5. Opiniones y Testimonios */}
        <TestimonialsView
          reviews={business.reviews}
        />

        {/* 6. Preguntas Frecuentes */}
        <FAQView />

        {/* 7. Ubicación y Contacto */}
        <ContactLocationView
          business={business.businessInfo}
          onOpenBooking={booking.openGeneral}
        />

      </main>

      {/* Footer */}
      <Footer
        business={business.businessInfo}
        onOpenAdmin={() => setViewMode('admin')}
        onOpenBooking={booking.openGeneral}
      />

      {/* Botón Flotante de WhatsApp */}
      <WhatsAppFloatingButton
        business={business.businessInfo}
      />

      {/* Modal Interactivo de Citas */}
      <BookingWizardModal
        isOpen={booking.isOpen}
        onClose={booking.closeModal}
        step={booking.step}
        setStep={booking.setStep}
        services={business.allServices}
        selectedServiceId={booking.selectedServiceId}
        setSelectedServiceId={booking.setSelectedServiceId}
        selectedService={booking.selectedService}
        selectedSpecialistId={booking.selectedSpecialistId}
        setSelectedSpecialistId={booking.setSelectedSpecialistId}
        selectedDate={booking.selectedDate}
        setSelectedDate={booking.setSelectedDate}
        selectedTimeSlot={booking.selectedTimeSlot}
        setSelectedTimeSlot={booking.setSelectedTimeSlot}
        availableSlots={booking.availableSlots}
        minDateStr={booking.minDateStr}
        customerName={booking.customerName}
        setCustomerName={booking.setCustomerName}
        customerPhone={booking.customerPhone}
        setCustomerPhone={booking.setCustomerPhone}
        customerEmail={booking.customerEmail}
        setCustomerEmail={booking.setCustomerEmail}
        customerNotes={booking.customerNotes}
        setCustomerNotes={booking.setCustomerNotes}
        canProceedStep1={booking.canProceedStep1}
        canProceedStep2={booking.canProceedStep2}
        canProceedStep3={booking.canProceedStep3}
        canProceedStep4={booking.canProceedStep4}
        isLoading={booking.isLoading}
        onConfirmBooking={booking.handleConfirmBooking}
        confirmedAppointment={booking.confirmedAppointment}
        getWhatsAppLink={booking.getWhatsAppLink}
      />

    </div>
  );
}

export default App;
