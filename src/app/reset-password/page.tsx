import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth';
import { ResetForm } from './reset-form';

export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) redirect('/forgot-password?error=expired');
  return (
    <main>
      <ResetForm email={user.email ?? ''} />
    </main>
  );
}
