'use client';
import { useTransition, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="afield">
      <span className="afield__label">{label}</span>
      {children}
      {hint && <span className="afield__hint">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`ainput${props.className ? ` ${props.className}` : ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`ainput${props.className ? ` ${props.className}` : ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`ainput${props.className ? ` ${props.className}` : ''}`} />;
}

export function Switch({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="aswitch">
      <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} />
      <span className="aswitch__track" aria-hidden="true" />
      <span className="aswitch__label">{label}</span>
    </label>
  );
}

export function SubmitButton({
  pending,
  children = 'Guardar',
}: {
  pending?: boolean;
  children?: ReactNode;
}) {
  return (
    <button type="submit" disabled={pending} className="btn btn--primary">
      {pending ? 'Guardando…' : children}
    </button>
  );
}

export function FormStatus({
  state,
}: {
  state: { error?: string; ok?: boolean } | undefined;
}) {
  if (!state) return null;
  if (state.error) return <p className="astatus astatus--err">{state.error}</p>;
  if (state.ok) return <p className="astatus astatus--ok">Guardado.</p>;
  return null;
}

export function DeleteForm({
  action,
  id,
  confirm: confirmMsg = '¿Eliminar este elemento?',
}: {
  action: (fd: FormData) => Promise<{ ok?: true; error?: string }>;
  id: string;
  confirm?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="abtn-del"
      aria-label="Eliminar"
      title="Eliminar"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMsg)) return;
        const fd = new FormData();
        fd.set('id', id);
        start(async () => {
          await action(fd);
        });
      }}
    >
      {pending ? '…' : 'Eliminar'}
    </button>
  );
}
