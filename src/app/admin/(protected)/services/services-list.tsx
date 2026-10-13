'use client';
import { useActionState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Switch,
  SubmitButton,
  FormStatus,
  DeleteForm,
} from '@/components/admin/form-kit';
import { ImageField } from '@/components/admin/image-field';
import { MediaCard, type CardBadge } from '@/components/admin/media-card';
import { useViewMode } from '@/components/admin/use-view-mode';
import { ViewToggle } from '@/components/admin/view-toggle';
import { createService, updateService, deleteService } from './actions';
import { CATEGORY_LABELS, money, minutesToLabel } from '@/lib/format';
import { serviceImageSrc } from '@/lib/service-photo';
import type { Service } from '@/lib/supabase/types';

const CATEGORIES: Service['category'][] = [
  'limpieza',
  'hidratacion',
  'antiedad',
  'acne',
  'paquetes',
];
const ICONS = ['sparkles', 'droplet', 'sun', 'shield', 'flame', 'crown', 'leaf', 'heart'];

function ServiceFields({ s }: { s?: Service }) {
  return (
    <>
      <Field label="Nombre del tratamiento">
        <TextInput name="name" defaultValue={s?.name ?? ''} required />
      </Field>
      <div className="atwo">
        <Field label="Categoría">
          <Select name="category" defaultValue={s?.category ?? 'limpieza'}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ícono">
          <Select name="icon" defaultValue={s?.icon ?? 'sparkles'}>
            {ICONS.map((ic) => (
              <option key={ic} value={ic}>
                {ic}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="atwo">
        <Field label="Precio (MXN)">
          <TextInput name="price_mxn" type="number" min={0} defaultValue={s?.price_mxn ?? 850} required />
        </Field>
        <Field label="Duración (min)">
          <TextInput
            name="duration_min"
            type="number"
            min={5}
            step={5}
            defaultValue={s?.duration_min ?? 60}
            required
          />
        </Field>
      </div>
      <Field label="Descripción clínica">
        <TextArea name="description" rows={2} defaultValue={s?.description ?? ''} />
      </Field>
      <Field label="Beneficios (separados por coma)">
        <TextInput
          name="benefits"
          defaultValue={(s?.benefits ?? []).join(', ')}
          placeholder="Poros limpios, Luminosidad inmediata, Sin irritación"
        />
      </Field>
      <ImageField
        name="image_url"
        label="Fotografía"
        folder="services"
        defaultValue={s?.image_url ?? ''}
      />
      <div className="atwo">
        <Field label="Slug (opcional)" hint="Se genera automáticamente desde el nombre">
          <TextInput name="slug" defaultValue={s?.slug ?? ''} />
        </Field>
        <Field label="Orden">
          <TextInput name="sort_order" type="number" defaultValue={s?.sort_order ?? 0} />
        </Field>
      </div>
      <Switch name="bookable" label="Reservable en línea" defaultChecked={s?.bookable ?? true} />
      <Switch
        name="is_active"
        label="Activo (visible en el sitio)"
        defaultChecked={s?.is_active ?? true}
      />
      <Switch name="is_featured" label="Destacado" defaultChecked={s?.is_featured ?? false} />
    </>
  );
}

function CreateForm() {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => createService(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <form action={action} className="acard">
      <div className="acard__title">Agregar tratamiento</div>
      <ServiceFields />
      <FormStatus state={state} />
      <SubmitButton pending={pending}>Agregar tratamiento</SubmitButton>
    </form>
  );
}

function ServiceActions({ s }: { s: Service }) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => updateService(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <>
      <details className="arow__edit">
        <summary />
        <form action={action}>
          <input type="hidden" name="id" value={s.id} />
          <ServiceFields s={s} />
          <FormStatus state={state} />
          <div className="aform__foot">
            <SubmitButton pending={pending} />
            <button
              type="button"
              className="btn btn--ghost"
              onClick={(e) => e.currentTarget.closest('details')?.removeAttribute('open')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </details>
      <DeleteForm
        action={deleteService}
        id={s.id}
        confirm={`¿Eliminar "${s.name}"? Las citas vinculadas a este tratamiento impedirán su borrado.`}
      />
    </>
  );
}

function EditRow({ s }: { s: Service }) {
  return (
    <li className="arow">
      <div className="arow__head">
        <span className="arow__name">{s.name}</span>
        <span className="arow__meta">
          {CATEGORY_LABELS[s.category]} · {money(s.price_mxn)} · {minutesToLabel(s.duration_min)}
          {s.is_featured ? ' · ★ destacado' : ''}
          {s.is_active ? '' : ' · oculto'}
        </span>
      </div>
      <div className="arow__actions">
        <ServiceActions s={s} />
      </div>
    </li>
  );
}

function ServiceCard({ s }: { s: Service }) {
  const badges: CardBadge[] = [];
  if (s.is_featured) badges.push({ label: '★ Destacado', tone: 'gold' });
  if (!s.bookable) badges.push({ label: 'Solo consulta', tone: 'muted' });
  if (!s.is_active) badges.push({ label: 'Oculto', tone: 'hidden' });
  const fallback = serviceImageSrc({ category: s.category, image_url: null });
  return (
    <MediaCard
      media={{ src: serviceImageSrc(s), fallbackSrc: fallback }}
      title={s.name}
      meta={`${CATEGORY_LABELS[s.category]} · ${money(s.price_mxn)} · ${minutesToLabel(s.duration_min)}`}
      description={s.description || undefined}
      badges={badges}
    >
      <ServiceActions s={s} />
    </MediaCard>
  );
}

export function ServicesList({ services }: { services: Service[] }) {
  const [mode, setMode] = useViewMode('services');
  const chips: FilterChip<Service>[] = [
    { id: 'all', label: 'Todos', match: () => true },
    ...CATEGORIES.map((c) => ({
      id: c,
      label: CATEGORY_LABELS[c],
      match: (s: Service) => s.category === c,
    })),
    { id: 'hidden', label: 'Ocultos', match: (s) => !s.is_active },
  ];

  return (
    <div className="acrud">
      <div className="acrud__list">
        <ListToolbar
          items={services}
          placeholder="Buscar tratamientos…"
          searchText={(s) => `${s.name} ${s.description} ${s.category}`}
          chips={chips}
          emptyLabel="Ningún tratamiento coincide con tus filtros."
          right={<ViewToggle mode={mode} onChange={setMode} />}
          render={(rows) =>
            mode === 'cards' ? (
              <ul className="mgrid">
                {rows.map((s) => (
                  <ServiceCard key={s.id} s={s} />
                ))}
              </ul>
            ) : (
              <ul className="alist">
                {rows.map((s) => (
                  <EditRow key={s.id} s={s} />
                ))}
              </ul>
            )
          }
        />
      </div>
      <div className="acrud__form">
        <CreateForm />
      </div>
    </div>
  );
}
