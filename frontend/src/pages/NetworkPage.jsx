import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import ConnectionCard from '../components/network/ConnectionCard'
import api from '../api/axios'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Avatar from '../components/common/Avatar'
import { Link } from 'react-router-dom'
import { FiUsers, FiUserPlus, FiClock, FiSend } from 'react-icons/fi'

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState('suggestions')
  const [suggestions, setSuggestions] = useState([])
  const [connections, setConnections] = useState([])
  const [pending, setPending] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [suggRes, connRes, pendRes, sentRes] = await Promise.all([
        api.get('/connections/suggestions/'),
        api.get('/connections/'),
        api.get('/connections/pending/'),
        api.get('/connections/sent/'),
      ])
      setSuggestions(suggRes.data)
      setConnections(connRes.data.results || connRes.data)
      setPending(pendRes.data.results || pendRes.data)
      setSent(sentRes.data.results || sentRes.data)
    } catch {}
    setLoading(false)
  }

  const tabs = [
    { id: 'suggestions', label: 'Suggestions', icon: FiUserPlus, count: suggestions.length },
    { id: 'connections', label: 'My Connections', icon: FiUsers, count: connections.length },
    { id: 'pending', label: 'Pending', icon: FiClock, count: pending.length },
    { id: 'sent', label: 'Sent', icon: FiSend, count: sent.length },
  ]

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '88px 24px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
          My Network
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
          padding: 4, marginBottom: 24, overflowX: 'auto',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                background: activeTab === tab.id ? 'var(--color-accent)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--color-muted)',
                transition: 'all 0.2s', whiteSpace: 'nowrap', border: 'none',
              }}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--color-surface2)',
                  borderRadius: 50, padding: '0 7px', fontSize: 11, fontWeight: 700,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <LoadingSpinner size={36} />
          </div>
        ) : (
          <>
            {activeTab === 'suggestions' && (
              <div>
                <p style={{ color: 'var(--color-muted)', marginBottom: 16, fontSize: 14 }}>
                  People you might know based on your network
                </p>
                {suggestions.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    {suggestions.map(profile => (
                      <ConnectionCard
                        key={profile.id}
                        profile={profile}
                        type="suggestion"
                        onAction={loadAll}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <p style={{ fontSize: 32 }}>🌐</p>
                    <p style={{ color: 'var(--color-muted)', marginTop: 12 }}>No suggestions right now. Check back later!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'connections' && (
              <div>
                {connections.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {connections.map(conn => {
                      const profile = conn.sender_profile?.user?.id !== conn.receiver_profile?.user?.id
                        ? conn.receiver_profile
                        : conn.sender_profile
                      return (
                        <div key={conn.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <Avatar src={profile?.avatar_url} name={profile?.user?.full_name || ''} size={52} />
                          <div style={{ flex: 1 }}>
                            <Link to={`/profile/${profile?.user?.id}`} style={{ fontWeight: 700, fontSize: 16 }}>
                              {profile?.user?.full_name}
                            </Link>
                            <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>{profile?.headline}</p>
                          </div>
                          <Link to={`/profile/${profile?.user?.id}`} className="btn btn-ghost" style={{ fontSize: 13 }}>
                            View Profile
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ color: 'var(--color-muted)' }}>Noconnections yet. Start connecting!</p>
</div>
)}
</div>
)}{activeTab === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.length > 0 ? pending.map(conn => (
              <ConnectionCard
                key={conn.id}
                profile={{ ...conn.sender_profile, connectionId: conn.id }}
                type="pending"
                onAction={loadAll}
              />
            )) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <p style={{ color: 'var(--color-muted)' }}>No pending requests.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sent.length > 0 ? sent.map(conn => (
              <div key={conn.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar src={conn.receiver_profile?.avatar_url} name={conn.receiver_profile?.user?.full_name || ''} size={52} />
                <div style={{ flex: 1 }}>
                  <Link to={`/profile/${conn.receiver_profile?.user?.id}`} style={{ fontWeight: 700, fontSize: 16 }}>
                    {conn.receiver_profile?.user?.full_name}
                  </Link>
                  <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>{conn.receiver_profile?.headline}</p>
                </div>
                <span className="badge badge-yellow">Pending</span>
              </div>
            )) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <p style={{ color: 'var(--color-muted)' }}>No sent requests.</p>
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>
</div>
)
}