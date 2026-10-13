export default function SiteLoading() {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text-muted)', fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: 'var(--color-accent)',
            animation: 'pulse 1.2s ease-in-out infinite',
          }}
        />
        Lumière Skin &amp; Spa
      </div>
    </div>
  );
}
