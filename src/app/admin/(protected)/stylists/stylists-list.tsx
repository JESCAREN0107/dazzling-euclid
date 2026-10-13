'use client';
import { useActionState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import {
  Field,
  TextInput,
  Switch,
  SubmitButton,
  FormStatus,
  DeleteForm,
} from '@/components/admin/form-kit';
import { ImageField } from '@/components/admin/image-field';
import { MediaCard } from '@/components/admin/media-card';
import { useViewMode } from '@/components/admin/use-view-mode';
import { ViewToggle } from '@/components/admin/view-toggle';
import { createStylist, updateStylist, deleteStylist } from './actions';
import { dicebearUrl } from '@/lib/avatar';
import { ratingLabel, stylistAvatarSrc } from '@/lib/stylist-card';
import type { Stylist } from '@/lib/supabase/types';

function StylistFields({ s }: { s?: Stylist }) {
  return (
    <>
      <Field label="Nombre">
        <TextInput name="name" defaultValue={s?.name ?? ''} required />
      </Field>
      <Field label="Especialidad / Cargo">
        <TextInput name="role" defaultValue={s?.role ?? ''} />
      </Field>
      <Field label="Etiquetas (separadas por coma)">
        <TextInput
          name="tags"
          defaultValue={s ? s.tags.join(', ') : ''}
          placeholder="Hidrodermoabrasión, Dermaplaning, Radiofrecuencia"
        />
      </Field>
      <ImageField
        name="avatar_url"
        label="Fotografía"
        folder="stylists"
        defaultValue={s?.avatar_url ?? ''}
      />
      <Field label="Orden">
        <TextInput name="sort_order" type="number" defaultValue={s?.sort_order ?? 0} />
      </Field>
      <Switch
        name="is_active"
        label="Activa (visible en el sitio)"
        defaultChecked={s?.is_active ?? true}
      />
    </>
  );
}

function CreateForm() {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => createStylist(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <form action={action} className="acard">
      <div className="acard__title">Agregar especialista</div>
      <StylistFields />
      <FormStatus state={state} />
      <SubmitButton pending={pending}>Agregar especialista</SubmitButton>
    </form>
  );
}

function StylistActions({ s }: { s: Stylist }) {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => updateStylist(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <>
      <details className="arow__edit">
        <summary />
        <form action={action}>
          <input type="hidden" name="id" value={s.id} />
          <StylistFields s={s} />
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
      <DeleteForm action={deleteStylist} id={s.id} confirm={`¿Eliminar a ${s.name}?`} />
    </>
  );
}

function EditRow({ s }: { s: Stylist }) {
  const r = ratingLabel(s.rating, s.rating_count);
  return (
    <li className="arow">
      <div className="arow__head">
        <span className="arow__name">{s.name}</span>
        <span className="arow__meta">
          {s.role} · {r.stars}
          {r.reviews ? ` ${r.reviews}` : ''}
          {s.is_active ? '' : ' · oculta'}
        </span>
      </div>
      <div className="arow__actions">
        <StylistActions s={s} />
      </div>
    </li>
  );
}

function StylistCard({ s }: { s: Stylist }) {
  const r = ratingLabel(s.rating, s.rating_count);
  return (
    <MediaCard
      media={{
        src: stylistAvatarSrc(s),
        fallbackSrc: dicebearUrl(s.name),
        aspect: 'square',
      }}
      title={s.name}
      subtitle={s.role || undefined}
      meta={`${r.stars}${r.reviews ? ` · ${r.reviews}` : ''}`}
      chips={s.tags}
      badges={s.is_active ? [] : [{ label: 'Oculta', tone: 'hidden' as const }]}
    >
      <StylistActions s={s} />
    </MediaCard>
  );
}

export function StylistsList({ stylists }: { stylists: Stylist[] }) {
  const [mode, setMode] = useViewMode('stylists');
  const chips: FilterChip<Stylist>[] = [
    { id: 'all', label: 'Todas', match: () => true },
    { id: 'active', label: 'Activas', match: (s) => s.is_active },
    { id: 'hidden', label: 'Ocultas', match: (s) => !s.is_active },
  ];
  return (
    <div className="acrud">
      <div className="acrud__list">
        <ListToolbar
          items={stylists}
          placeholder="Buscar especialistas…"
          searchText={(s) => `${s.name} ${s.role} ${s.tags.join(' ')}`}
          chips={chips}
          emptyLabel="Ninguna especialista coincide con tus filtros."
          right={<ViewToggle mode={mode} onChange={setMode} />}
          render={(rows) =>
            mode === 'cards' ? (
              <ul className="mgrid">
                {rows.map((s) => (
                  <StylistCard key={s.id} s={s} />
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
