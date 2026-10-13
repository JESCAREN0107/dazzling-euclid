'use client';

import { useState } from 'react';
import { mxPhone } from '@/lib/validators';

export function StepDetails({
  submitting,
  error,
  onSubmit,
  onBack,
  prefill,
}: {
  submitting: boolean;
  error: string | null;
  onSubmit: (d: { name: string; phone: string; email: string; notes: string }) => void;
  onBack: () => void;
  prefill?: { name?: string; email?: string; phone?: string };
}) {
  const [name, setName] = useState(prefill?.name ?? '');
  const [phone, setPhone] = useState(prefill?.phone ?? '');
  const [email, setEmail] = useState(prefill?.email ?? '');
  const [notes, setNotes] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    if (name.trim().length < 2) {
      setFieldError('Por favor ingresa tu nombre completo.');
      return;
    }
    const p = mxPhone.safeParse(phone);
    if (!p.success) {
      setFieldError(
        p.error.issues[0]?.message ?? 'Ingresa un número de teléfono válido de 10 dígitos.',
      );
      return;
    }
    onSubmit({ name: name.trim(), phone: p.data, email: email.trim(), notes: notes.trim() });
  }

  return (
    <form className="step" onSubmit={submit} noValidate>
      <h2 className="step__title">5. Tus datos de contacto</h2>
      <p className="step__hint">
        Generaremos tu código único de confirmación al instante. El pago se realiza en recepción el
        día de tu cita.
      </p>

      <div className="field">
        <label htmlFor="bk-name">Nombre completo *</label>
        <input
          id="bk-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Mariana Garza"
          autoComplete="name"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="bk-phone">Teléfono / WhatsApp (10 dígitos) *</label>
          <input
            id="bk-phone"
            type="tel"
            inputMode="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="899 527 6969"
            autoComplete="tel"
          />
          <span className="field__err">Número celular de 10 dígitos (ej. 899 527 6969)</span>
        </div>
        <div className="field">
          <label htmlFor="bk-email">Correo electrónico (opcional)</label>
          <input
            id="bk-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="bk-notes">Notas o necesidades de tu piel (opcional)</label>
        <textarea
          id="bk-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej. Piel sensible, alergias conocidas o si deseas enfocarte en luminosidad / poros…"
        />
      </div>

      {(fieldError || error) && (
        <div
          className="panel"
          style={{ borderColor: 'var(--error)', color: 'var(--error)', marginBottom: 16 }}
        >
          {fieldError ?? error}
        </div>
      )}

      <div className="step__nav">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onBack}
          disabled={submitting}
        >
          ← Cambiar horario
        </button>
        <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
          {submitting ? 'Confirmando tu cita…' : 'Confirmar Reservación'}
        </button>
      </div>
    </form>
  );
}
