import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../common/Avatar'
import { FiHome, FiUsers, FiBriefcase, FiBell, FiMessageSquare, FiBookmark } from 'react-icons/fi'

export default function Sidebar({ profile }) {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const links = [
    { to: '/home', icon: FiHome, label: 'Home Feed' },
    { to: '/network', icon: FiUsers, label: 'My Network' },
    { to: '/jobs', icon: FiBriefcase, label: 'Jobs' },
    { to: '/notifications', icon: FiBell, label: 'Notifications' },
    { to: '/messages', icon: FiMessageSquare, label: 'Messages' },
  ]

  return (
    <aside className="left-panel" style={{ position: 'sticky', top: 88, height: 'fit-content' }}>
      {/* Profile Card */}
      <div className="card" style={{ marginBottom: 16, overflow: 'hidden', padding: 0 }}>
        <div style={{
          height: 70,
          background: 'linear-gradient(135deg, #1e3a5f, #1a1a3e)',
          position: 'relative',
        }}>
          {profile?.cover_image_url && (
            <img src={profile.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
          <div style={{ marginTop: -28, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={profile?.avatar_url}
              name={user?.full_name || ''}
              size={56}
            />
          </div>
          <Link to={`/profile/${user?.id}`} style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-display)' }}>
            {user?.full_name}
          </Link>
          <p style={{ color: 'var(--color-muted)', fontSize: 12, marginTop: 2 }}>
            {profile?.headline || 'Add your headline'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
            {[
              { label: 'Connections', value: profile?.connections_count || 0 },
              { label: 'Followers', value: profile?.followers_count || 0 },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-accent)' }}>{stat.value}</p>
                <p style={{ fontSize: 10, color: 'var(--color-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="card">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive(to) ? 600 : 400,
                color: isActive(to) ? 'var(--color-accent)' : 'var(--color-text)',
                background: isActive(to) ? 'var(--color-accent-glow)' : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.background = 'var(--color-surface2)' }}
              onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}