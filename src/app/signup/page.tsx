import { SignupForm } from './signup-form';
import { safeNext } from '@/lib/auth/redirect';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNext(sp.next) ?? '';
  return (
    <main>
      <SignupForm next={next} prefillEmail={sp.email ?? ''} />
    </main>
  );
}
