'use client';
import { useActionState } from 'react';
import { saveBlock } from './actions';
import { saveHours } from './hours-actions';
import {
  Field,
  TextInput,
  TextArea,
  Switch,
  SubmitButton,
  FormStatus,
} from '@/components/admin/form-kit';
import type {
  QuoteContent,
  CtaContent,
  StoryContent,
  HeroContent,
  StatsContent,
  ContactContent,
} from '@/lib/content/blocks';
import type { BusinessHour } from '@/lib/supabase/types';
import { minutesToLabel } from '@/lib/format';

function useSave() {
  return useActionState(
    async (_p: unknown, fd: FormData) => saveBlock(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
}

export function HeroForm({ content }: { content: HeroContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="hero" />
      <div className="acard__title">Portada Principal (Hero)</div>
      <Field label="Subtítulo superior (Eyebrow)">
        <TextInput name="eyebrow" defaultValue={content.eyebrow} />
      </Field>
      <Field label="Título línea 1">
        <TextInput name="title_line1" defaultValue={content.title_line1} />
      </Field>
      <Field label="Título línea 2 (en cursiva)">
        <TextInput name="title_accent" defaultValue={content.title_accent} />
      </Field>
      <Field label="Título línea 3">
        <TextInput name="title_line2" defaultValue={content.title_line2} />
      </Field>
      <Field label="Descripción principal">
        <TextArea name="lead" defaultValue={content.lead} rows={3} />
      </Field>
      <div className="atwo">
        <Field label="Botón principal">
          <TextInput name="cta_primary" defaultValue={content.cta_primary} />
        </Field>
        <Field label="Enlace secundario">
          <TextInput name="cta_secondary" defaultValue={content.cta_secondary} />
        </Field>
      </div>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function StatsForm({ content }: { content: StatsContent }) {
  const [state, action, pending] = useSave();
  const keys = ['s1', 's2', 's3', 's4'] as const;
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="stats" />
      <div className="acard__title">Indicadores (4 tarjetas)</div>
      {keys.map((k, i) => (
        <div key={k} className="atwo">
          <Field label={`Valor ${i + 1}`}>
            <TextInput name={`${k}_n`} defaultValue={content[k].n} />
          </Field>
          <Field label={`Etiqueta ${i + 1}`}>
            <TextInput name={`${k}_l`} defaultValue={content[k].l} />
          </Field>
        </div>
      ))}
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function QuoteForm({ content }: { content: QuoteContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="quote" />
      <div className="acard__title">Frase Destacada</div>
      <Field label="Cita">
        <TextArea name="text" defaultValue={content.text} rows={3} />
      </Field>
      <Field label="Autor / Firma">
        <TextInput name="attribution" defaultValue={content.attribution} />
      </Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function CtaForm({ content }: { content: CtaContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="cta" />
      <div className="acard__title">Llamado a la Acción (CTA)</div>
      <Field label="Subtítulo superior">
        <TextInput name="eyebrow" defaultValue={content.eyebrow} />
      </Field>
      <Field label="Título">
        <TextInput name="heading" defaultValue={content.heading} />
      </Field>
      <Field label="Texto descriptivo">
        <TextArea name="sub" defaultValue={content.sub} rows={3} />
      </Field>
      <Field label="Texto del botón">
        <TextInput name="button" defaultValue={content.button} />
      </Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function StoryForm({ content }: { content: StoryContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="story" />
      <div className="acard__title">Nuestra Filosofía</div>
      <Field label="Subtítulo superior">
        <TextInput name="eyebrow" defaultValue={content.eyebrow} />
      </Field>
      <Field label="Encabezado">
        <TextInput name="heading" defaultValue={content.heading} />
      </Field>
      <Field label="Párrafo 1">
        <TextArea name="body1" defaultValue={content.body1} rows={3} />
      </Field>
      <Field label="Párrafo 2">
        <TextArea name="body2" defaultValue={content.body2} rows={3} />
      </Field>
      <Field label="Frase de cierre">
        <TextInput name="quote" defaultValue={content.quote} />
      </Field>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

export function ContactForm({ content }: { content: ContactContent }) {
  const [state, action, pending] = useSave();
  return (
    <form action={action} className="acard">
      <input type="hidden" name="key" value="contact" />
      <div className="acard__title">Ubicación y Contacto</div>
      <Field label="Dirección">
        <TextInput name="address" defaultValue={content.address} />
      </Field>
      <Field label="Referencias / Estacionamiento">
        <TextInput name="landmark" defaultValue={content.landmark} />
      </Field>
      <div className="atwo">
        <Field label="Teléfono / WhatsApp">
          <TextInput name="phone" defaultValue={content.phone} />
        </Field>
        <Field label="Correo electrónico">
          <TextInput name="email" defaultValue={content.email} />
        </Field>
      </div>
      <Field label="Nota de horarios">
        <TextInput name="hours_note" defaultValue={content.hours_note} />
      </Field>
      <Field label="Enlace de Google Maps">
        <TextInput name="map_url" defaultValue={content.map_url} />
      </Field>
      <div className="atwo">
        <Field label="Instagram URL">
          <TextInput name="instagram" defaultValue={content.instagram} />
        </Field>
        <Field label="Facebook URL">
          <TextInput name="facebook" defaultValue={content.facebook} />
        </Field>
      </div>
      <FormStatus state={state} />
      <SubmitButton pending={pending} />
    </form>
  );
}

const DAY_LABELS: { dow: number; label: string }[] = [
  { dow: 1, label: 'Lunes' },
  { dow: 2, label: 'Martes' },
  { dow: 3, label: 'Miércoles' },
  { dow: 4, label: 'Jueves' },
  { dow: 5, label: 'Viernes' },
  { dow: 6, label: 'Sábado' },
  { dow: 0, label: 'Domingo' },
];

const TIME_OPTIONS: number[] = (() => {
  const o: number[] = [];
  for (let m = 0; m <= 1440; m += 30) o.push(m);
  return o;
})();

export function HoursForm({ hours }: { hours: BusinessHour[] }) {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => saveHours(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  const byDow = new Map(hours.map((h) => [h.day_of_week, h]));
  return (
    <form action={action} className="acard">
      <div className="acard__title">Horarios de Atención (America/Matamoros)</div>
      {DAY_LABELS.map(({ dow, label }) => {
        const h = byDow.get(dow);
        const open = h?.open_minute ?? 540;
        const close = h?.close_minute ?? 1140;
        const closed = h?.is_closed ?? false;
        return (
          <div key={dow} className="ahours-row">
            <span style={{ fontSize: 13, color: 'var(--fg)' }}>{label}</span>
            <select
              className="ainput"
              name={`open_${dow}`}
              defaultValue={open}
              aria-label={`${label} apertura`}
            >
              {TIME_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {minutesToLabel(m)}
                </option>
              ))}
            </select>
            <select
              className="ainput"
              name={`close_${dow}`}
              defaultValue={close}
              aria-label={`${label} cierre`}
            >
              {TIME_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {minutesToLabel(m)}
                </option>
              ))}
            </select>
            <Switch name={`closed_${dow}`} label="Cerrado" defaultChecked={closed} />
          </div>
        );
      })}
      <FormStatus state={state} />
      <SubmitButton pending={pending}>Guardar horarios</SubmitButton>
    </form>
  );
}
