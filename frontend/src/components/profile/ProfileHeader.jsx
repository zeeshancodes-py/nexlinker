import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../common/Avatar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { FiEdit, FiUserPlus, FiUserCheck, FiMessageSquare, FiMapPin, FiGlobe, FiMail, FiPhone, FiMoreHorizontal, FiShare2, FiBell, FiBellOff } from 'react-icons/fi'

export default function ProfileHeader({ profile, onRefresh }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [connLoading, setConnLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const isOwner = user?.id === profile?.user?.id
  const connStatus = profile?.connection_status
  const isFollowing = profile?.is_following

  const handleConnect = async () => {
    setConnLoading(true)
    try {
      await api.post('/connections/request/' + profile.user.id + '/')
      toast.success('Connection request sent!')
      onRefresh?.()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request.')
    }
    setConnLoading(false)
  }

  const handleFollow = async () => {
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await api.delete('/connections/follow/' + profile.user.id + '/')
        toast.success('Unfollowed.')
      } else {
        await api.post('/connections/follow/' + profile.user.id + '/')
        toast.success('Following!')
      }
      onRefresh?.()
    } catch {
      toast.error('Failed.')
    }
    setFollowLoading(false)
  }

  const handleMessage = async () => {
    try {
      const { data } = await api.post('/messages/conversations/with/' + profile.user.id + '/')
      navigate('/messages', { state: { conversationId: data.id } })
    } catch {
      toast.error('Failed to open conversation.')
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Profile link copied!')
  }

  const statusMap = {
    open: { label: 'Open to Work', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
    hiring: { label: 'Hiring', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
    not_looking: null,
  }
  const statusConfig = statusMap[profile?.open_status]

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>

      <div style={{
        height: 220,
        background: profile?.cover_image_url ? 'url(' + profile.cover_image_url + ') center/cover no-repeat' : 'linear-gradient(135deg, #0f2040 0%, #1a1a4e 50%, #0d1b40 100%)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4) 100%)' }} />

        {statusConfig && (
          <div style={{
            position: 'absolute', top: 16, left: 16,
            background: statusConfig.bg,
            border: '1px solid ' + statusConfig.border,
            color: statusConfig.color,
            padding: '6px 14px', borderRadius: 50,
            fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)',
          }}>
            {statusConfig.label}
          </div>
        )}

        {isOwner && (
          <Link to="/profile/edit" style={{
            position: 'absolute', top: 14, right: 14,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            color: 'white', borderRadius: 8, padding: '7px 14px',
            fontSize: 13, fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.15)', textDecoration: 'none',
          }}>
            <FiEdit size={13} /> Edit Profile
          </Link>
        )}
      </div>

      <div style={{ padding: '0 32px 28px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginTop: -64, marginBottom: 16, flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{
            border: '4px solid var(--color-surface)', borderRadius: '50%',
            background: 'var(--color-surface)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <Avatar src={profile?.avatar_url} name={profile?.user?.full_name || ''} size={128} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 4, alignItems: 'center' }}>
            {!isOwner && (
              <>
                {connStatus === 'none' && (
                  <button onClick={handleConnect} disabled={connLoading} className="btn btn-primary" style={{ padding: '9px 22px' }}>
                    <FiUserPlus size={15} /> {connLoading ? 'Sending...' : 'Connect'}
                  </button>
                )}
                {connStatus === 'pending' && (
                  <button disabled className="btn btn-ghost" style={{ padding: '9px 20px', opacity: 0.7 }}>
                    <FiUserCheck size={15} /> Pending
                  </button>
                )}
                {connStatus === 'accepted' && (
                  <button disabled className="btn btn-ghost" style={{ padding: '9px 20px', color: 'var(--color-success)' }}>
                    <FiUserCheck size={15} /> Connected
                  </button>
                )}
                <button onClick={handleFollow} disabled={followLoading} className={isFollowing ? 'btn btn-ghost' : 'btn btn-outline'} style={{ padding: '9px 18px' }}>
                  {isFollowing ? <FiBellOff size={15} /> : <FiBell size={15} />}
                  {followLoading ? '...' : isFollowing ? ' Following' : ' Follow'}
                </button>
                <button onClick={handleMessage} className="btn btn-ghost" style={{ padding: '9px 18px', border: '1.5px solid var(--color-border)', borderRadius: 50 }}>
                  <FiMessageSquare size={15} /> Message
                </button>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowMore(v => !v)} className="btn btn-ghost" style={{ padding: '9px 12px', border: '1.5px solid var(--color-border)', borderRadius: 50 }}>
                    <FiMoreHorizontal size={18} />
                  </button>
                  {showMore && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)', minWidth: 180, zIndex: 20,
                      overflow: 'hidden', boxShadow: 'var(--shadow)',
                    }}>
                      <button onClick={handleShare} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '11px 16px', width: '100%', background: 'none',
                        color: 'var(--color-text)', fontSize: 13, border: 'none', cursor: 'pointer',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface2)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                      >
                        <FiShare2 size={14} /> Copy Profile Link
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {isOwner && (
              <>
                <Link to="/profile/edit" className="btn btn-outline" style={{ padding: '9px 22px' }}>
                  <FiEdit size={14} /> Edit Profile
                </Link>
                <button onClick={handleShare} className="btn btn-ghost" style={{ padding: '9px 14px', border: '1.5px solid var(--color-border)', borderRadius: 50 }}>
                  <FiShare2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>
            {profile?.user?.full_name}
          </h1>
          {profile?.headline && (
            <p style={{ fontSize: 16, color: 'var(--color-text)', lineHeight: 1.5 }}>{profile.headline}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', marginBottom: 16 }}>
          {profile?.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-muted)', fontSize: 14 }}>
              <FiMapPin size={13} /> {profile.location}
            </span>
          )}
          {profile?.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-accent)', fontSize: 14, textDecoration: 'none' }}>
              <FiGlobe size={13} /> {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {isOwner && profile?.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-muted)', fontSize: 14 }}>
              <FiPhone size={13} /> {profile.phone}
            </span>
          )}
          {isOwner && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-muted)', fontSize: 14 }}>
              <FiMail size={13} /> {profile?.user?.email}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', paddingTop: 16, borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
          {[
            { label: 'Connections', value: profile?.connections_count || 0, color: '#3b82f6' },
            { label: 'Followers', value: profile?.followers_count || 0, color: '#6366f1' },
            { label: 'Following', value: profile?.following_count || 0, color: '#8b5cf6' },
          ].map((stat, i) => (
            <div key={stat.label} style={{ padding: '8px 24px 8px 0', marginRight: 24, borderRight: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: stat.color }}>
                {stat.value >= 1000 ? (stat.value / 1000).toFixed(1) + 'K' : stat.value}
              </p>
              <p style={{ color: 'var(--color-muted)', fontSize: 12, marginTop: 1 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
