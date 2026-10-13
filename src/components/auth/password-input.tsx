'use client';
import { useState } from 'react';

export function PasswordInput({
  id,
  name,
  placeholder = '••••••••',
  autoComplete,
  required,
  value,
  onChange,
}: {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  value?: string;
  onChange?: (val: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
      <button
        type="button"
        className="pw-toggle"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}
