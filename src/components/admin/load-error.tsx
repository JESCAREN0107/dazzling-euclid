export function LoadError({
  what,
  error,
}: {
  what: string;
  error: { message: string } | null | undefined;
}) {
  if (!error) return null;
  return (
    <div
      role="alert"
      style={{
        padding: '12px 16px',
        marginBottom: 16,
        borderRadius: 10,
        border: '1px solid rgba(214,69,69,0.4)',
        background: 'rgba(214,69,69,0.08)',
        color: 'var(--error)',
        fontSize: 13,
      }}
    >
      No se pudo cargar {what}: <span style={{ fontFamily: 'var(--font-mono)' }}>{error.message}</span>
    </div>
  );
}
