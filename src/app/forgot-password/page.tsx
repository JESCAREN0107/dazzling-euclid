import { ForgotForm } from './forgot-form';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const expired =
    sp.error === 'expired'
      ? 'Ese enlace de recuperación expiró o ya fue utilizado — solicita uno nuevo a continuación.'
      : null;
  return (
    <main>
      <ForgotForm expiredNotice={expired} />
    </main>
  );
}
