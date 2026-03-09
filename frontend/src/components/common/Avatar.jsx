export default function Avatar({ src, name = '', size = 40, online = false }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
  const colorIndex = name.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid var(--color-border)',
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.35,
            fontWeight: 700,
            color: 'white',
            fontFamily: 'var(--font-display)',
            flexShrink: 0,
            border: '2px solid var(--color-border)',
          }}
        >
          {initials || '?'}
        </div>
      )}
      {online && (
        <div style={{
          position: 'absolute',
          bottom: 1,
          right: 1,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: '50%',
          background: '#10b981',
          border: '2px solid var(--color-surface)',
        }} />
      )}
    </div>
  )
}