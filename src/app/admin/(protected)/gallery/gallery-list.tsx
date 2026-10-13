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
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from './actions';
import type { GalleryItem } from '@/lib/supabase/types';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85';

function GalleryFields({ g }: { g?: GalleryItem }) {
  return (
    <>
      <Field label="Título">
        <TextInput name="title" defaultValue={g?.title ?? ''} required />
      </Field>
      <Field label="Etiqueta">
        <TextInput name="tag" defaultValue={g?.tag ?? ''} />
      </Field>
      <Field label="Categoría / Subtítulo">
        <TextInput name="category" defaultValue={g?.category ?? ''} />
      </Field>
      <ImageField name="image_url" label="Imagen" defaultValue={g?.image_url ?? ''} />
      <Field label="Orden">
        <TextInput name="sort_order" type="number" defaultValue={g?.sort_order ?? 0} />
      </Field>
      <Switch
        name="is_active"
        label="Activa (visible en el sitio)"
        defaultChecked={g?.is_active ?? true}
      />
    </>
  );
}

function CreateForm() {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => createGalleryItem(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <form action={action} className="acard">
      <div className="acard__title">Agregar imagen a la galería</div>
      <GalleryFields />
      <FormStatus state={state} />
      <SubmitButton pending={pending}>Agregar imagen</SubmitButton>
    </form>
  );
}

function GalleryActions({ g }: { g: GalleryItem }) {
  const [state, action, pending] = useActionState(
    async (_p: unknown, fd: FormData) => updateGalleryItem(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <>
      <details className="arow__edit">
        <summary />
        <form action={action}>
          <input type="hidden" name="id" value={g.id} />
          <GalleryFields g={g} />
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
      <DeleteForm action={deleteGalleryItem} id={g.id} confirm={`¿Eliminar "${g.title}"?`} />
    </>
  );
}

function EditRow({ g }: { g: GalleryItem }) {
  return (
    <li className="arow">
      <div className="arow__head">
        <span className="arow__name">{g.title}</span>
        <span className="arow__meta">
          {g.tag}
          {g.is_active ? '' : ' · oculta'}
        </span>
      </div>
      <div className="arow__actions">
        <GalleryActions g={g} />
      </div>
    </li>
  );
}

function GalleryCard({ g }: { g: GalleryItem }) {
  return (
    <MediaCard
      media={{ src: g.image_url || FALLBACK_IMG, fallbackSrc: FALLBACK_IMG }}
      title={g.title}
      meta={[g.tag, g.category].filter(Boolean).join(' · ')}
      badges={g.is_active ? [] : [{ label: 'Oculta', tone: 'hidden' as const }]}
    >
      <GalleryActions g={g} />
    </MediaCard>
  );
}

export function GalleryList({ items }: { items: GalleryItem[] }) {
  const [mode, setMode] = useViewMode('gallery');
  const chips: FilterChip<GalleryItem>[] = [
    { id: 'all', label: 'Todas', match: () => true },
    { id: 'active', label: 'Activas', match: (g) => g.is_active },
    { id: 'hidden', label: 'Ocultas', match: (g) => !g.is_active },
  ];
  return (
    <div className="acrud">
      <div className="acrud__list">
        <ListToolbar
          items={items}
          placeholder="Buscar en galería…"
          searchText={(g) => `${g.title} ${g.tag} ${g.category}`}
          chips={chips}
          emptyLabel="Ninguna imagen coincide con tus filtros."
          right={<ViewToggle mode={mode} onChange={setMode} />}
          render={(rows) =>
            mode === 'cards' ? (
              <ul className="mgrid">
                {rows.map((g) => (
                  <GalleryCard key={g.id} g={g} />
                ))}
              </ul>
            ) : (
              <ul className="alist">
                {rows.map((g) => (
                  <EditRow key={g.id} g={g} />
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
