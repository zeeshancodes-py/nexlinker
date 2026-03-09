

export default function LoadingSpinner({ fullPage, size = 40 }) {
  const spinner = (
    <div style={{
      width: size,
      height: size,
      border: '3px solid var(--color-border)',
      borderTop: '3px solid var(--color-accent)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  )

  if (fullPage) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--color-bg)',
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {spinner}
          <span style={{ color: 'var(--color-muted)', fontSize: 14 }}>Loading NexLinker...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {spinner}
    </>
  )
}