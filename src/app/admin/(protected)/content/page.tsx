import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { getSiteContent } from '@/lib/content/get';
import { getBusinessHours } from '@/lib/queries';
import {
  QuoteForm,
  CtaForm,
  StoryForm,
  HeroForm,
  StatsForm,
  ContactForm,
  HoursForm,
} from './content-forms';

export default async function ContentPage() {
  await requireRole(['admin'], '/admin/content');
  const [quote, cta, story, hero, stats, contact, hours] = await Promise.all([
    getSiteContent('quote'),
    getSiteContent('cta'),
    getSiteContent('story'),
    getSiteContent('hero'),
    getSiteContent('stats'),
    getSiteContent('contact'),
    getBusinessHours(),
  ]);
  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Página Promocional</span>
          <h1 className="ahead__title">Contenido y Horarios</h1>
        </div>
        <Link href="/" target="_blank" className="btn btn--ghost">
          Ver en el sitio ↗
        </Link>
      </div>
      <div className="acontent-grid">
        <HeroForm content={hero} />
        <StatsForm content={stats} />
        <StoryForm content={story} />
        <QuoteForm content={quote} />
        <CtaForm content={cta} />
        <HoursForm hours={hours} />
        <ContactForm content={contact} />
      </div>
    </div>
  );
}
