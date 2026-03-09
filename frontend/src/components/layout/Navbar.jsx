import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../store/authSlice'
import { fetchUnreadCount } from '../../store/notificationSlice'
import { fetchConversations, selectUnreadMessageCount } from '../../store/messageSlice'
import { useSelector } from 'react-redux'
import Avatar from '../common/Avatar'
import {
  FiHome, FiBriefcase, FiUsers, FiBell, FiMessageSquare,
  FiSearch, FiLogOut, FiUser, FiEdit, FiChevronDown
} from 'react-icons/fi'

export default function Navbar() {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const unreadCount = useSelector(s => s.notifications.unreadCount)
  const unreadMessageCount = useSelector(selectUnreadMessageCount)

  useEffect(() => {
    dispatch(fetchUnreadCount())
    dispatch(fetchConversations())
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const navLinks = [
    { to: '/home', icon: FiHome, label: 'Home' },
    { to: '/network', icon: FiUsers, label: 'Network' },
    { to: '/jobs', icon: FiBriefcase, label: 'Jobs' },
    { to: '/messages', icon: FiMessageSquare, label: 'Messages', badge: unreadMessageCount },
    { to: '/notifications', icon: FiBell, label: 'Alerts', badge: unreadCount },
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 64,
      background: 'rgba(10, 15, 30, 0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      zIndex: 1000,
      gap: 16,
    }}>
      {/* Logo */}
      <Link to="/home" style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 22,
        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px',
        flexShrink: 0,
      }}>
        NexLinker
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 340 }}>
        <div style={{ position: 'relative' }}>
          <FiSearch style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-muted)', fontSize: 15
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search people, jobs..."
            style={{
              width: '100%',
              background: 'var(--color-surface2)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 50,
              padding: '8px 16px 8px 38px',
              color: 'var(--color-text)',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      </form>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
        {navLinks.map(({ to, icon: Icon, label, badge }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '6px 14px',
              borderRadius: 10,
              position: 'relative',
              color: isActive(to) ? 'var(--color-accent)' : 'var(--color-muted)',
              transition: 'all 0.2s',
              fontSize: 20,
              textDecoration: 'none',
              background: isActive(to) ? 'var(--color-accent-glow)' : 'transparent',
            }}
          >
            <Icon />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
            {badge > 0 && (
              <span style={{
                position: 'absolute',
                top: 4, right: 10,
                background: 'var(--color-danger)',
                color: 'white',
                fontSize: 9,
                fontWeight: 700,
                borderRadius: 50,
                minWidth: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}>
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* User Menu */}
      <div style={{ position: 'relative', marginLeft: 8 }}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-surface2)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 50,
            padding: '6px 12px 6px 6px',
            cursor: 'pointer',
            color: 'var(--color-text)',
          }}
        >
          <Avatar
            src={user?.profile?.avatar_url}
            name={user?.full_name || ''}
            size={30}
          />
          <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.first_name}
          </span>
          <FiChevronDown size={13} />
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            minWidth: 200,
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
            animation: 'fadeIn 0.15s ease',
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{user?.full_name}</p>
              <p style={{ color: 'var(--color-muted)', fontSize: 12 }}>{user?.email}</p>
            </div>
            {[
              { icon: FiUser, label: 'My Profile', to: `/profile/${user?.id}` },
              { icon: FiEdit, label: 'Edit Profile', to: '/profile/edit' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', color: 'var(--color-text)',
                  fontSize: 13, transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <item.icon size={15} /> {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', color: 'var(--color-danger)',
                fontSize: 13, background: 'transparent', width: '100%',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <FiLogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}