import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import api from '../../api/axios'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiUserPlus, FiCheck, FiX } from 'react-icons/fi'

export default function ConnectionCard({ profile, type = 'suggestion', onAction }) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      await api.post(`/connections/request/${profile.user.id}/`)
      toast.success(`Connection request sent to ${profile.user.full_name}!`)
      onAction?.()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request.')
    }
    setLoading(false)
  }

  const handleAccept = async (connectionId) => {
    setLoading(true)
    try {
      await api.patch(`/connections/respond/${connectionId}/`, { action: 'accept' })
      toast.success('Connection accepted!')
      onAction?.()
    } catch { toast.error('Failed.') }
    setLoading(false)
  }

  const handleReject = async (connectionId) => {
    setLoading(true)
    try {
      await api.patch(`/connections/respond/${connectionId}/`, { action: 'reject' })
      toast.success('Request declined.')
      onAction?.()
    } catch { toast.error('Failed.') }
    setLoading(false)
  }

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <Link to={`/profile/${profile.user?.id}`}>
        <Avatar
          src={profile.avatar_url}
          name={profile.user?.full_name || ''}
          size={64}
        />
        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: 10, fontSize: 15 }}>
          {profile.user?.full_name}
        </h4>
        <p style={{ color: 'var(--color-muted)', fontSize: 12, margin: '4px 0' }}>
          {profile.headline || 'Professional'}
        </p>
        {profile.location && (
          <p style={{ color: 'var(--color-muted)', fontSize: 11 }}>📍 {profile.location}</p>
        )}
      </Link>
      <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '8px 0' }}>
        {profile.connections_count} connections
      </p>

      {type === 'suggestion' && (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="btn btn-outline"
          style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
        >
          <FiUserPlus size={14} /> Connect
        </button>
      )}

      {type === 'pending' && profile.connectionId && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={() => handleAccept(profile.connectionId)}
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
          >
            <FiCheck size={14} /> Accept
          </button>
          <button
            onClick={() => handleReject(profile.connectionId)}
            disabled={loading}
            className="btn btn-ghost"
            style={{ flex: 1, justifyContent: 'center', padding: '8px', color: 'var(--color-danger)' }}
          >
            <FiX size={14} /> Decline
          </button>
        </div>
      )}
    </div>
  )
}