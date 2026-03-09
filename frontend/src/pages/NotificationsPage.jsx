import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotifications, markAllRead } from '../store/notificationSlice'
import Navbar from '../components/layout/Navbar'
import Avatar from '../components/common/Avatar'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../api/axios'

const ICONS = {
  connection_request: '🤝',
  connection_accepted: '✅',
  reaction: '👍',
  comment: '💬',
  follow: '👤',
  job: '💼',
  mention: '@',
}

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const { items } = useSelector(s => s.notifications)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const handleMarkRead = async (id) => {
    await api.post(`/notifications/${id}/read/`)
    dispatch(fetchNotifications())
  }

  const unread = items.filter(n => !n.is_read)
  const read = items.filter(n => n.is_read)

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Notifications</h1>
          {unread.length > 0 && (
            <button
              onClick={() => dispatch(markAllRead())}
              className="btn btn-ghost"
              style={{ fontSize: 13 }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {unread.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              New ({unread.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unread.map(notif => (
                <NotifItem key={notif.id} notif={notif} onRead={handleMarkRead} />
              ))}
            </div>
          </div>
        )}

        {read.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Earlier
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {read.map(notif => (
                <NotifItem key={notif.id} notif={notif} onRead={handleMarkRead} />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ fontSize: 40 }}>🔔</p>
            <p style={{ color: 'var(--color-muted)', marginTop: 12 }}>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function NotifItem({ notif, onRead }) {
  return (
    <div
      onClick={() => !notif.is_read && onRead(notif.id)}
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '14px 16px', borderRadius: 'var(--radius)',
        background: notif.is_read ? 'var(--color-surface)' : 'rgba(59,130,246,0.06)',
        border: `1px solid ${notif.is_read ? 'var(--color-border)' : 'rgba(59,130,246,0.2)'}`,
        cursor: notif.is_read ? 'default' : 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar src={notif.sender_avatar} name={notif.sender?.full_name || ''} size={44} />
        <span style={{
          position: 'absolute', bottom: -2, right: -2,
          fontSize: 16, background: 'var(--color-surface)', borderRadius: '50%', padding: 1,
        }}>
          {ICONS[notif.notification_type] || '🔔'}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          <strong>{notif.sender?.full_name}</strong> {notif.message.replace(notif.sender?.full_name || '', '')}
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>
          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notif.is_read && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0, marginTop: 4 }} />
      )}
    </div>
  )
}