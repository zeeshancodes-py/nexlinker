import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Avatar from '../components/common/Avatar'
import JobCard from '../components/jobs/JobCard'
import api from '../api/axios'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { FiSearch, FiUsers, FiBriefcase } from 'react-icons/fi'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState('people')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const q = searchParams.get('q') || ''

  useEffect(() => {
    if (q) {
      setQuery(q)
      doSearch(q, type)
    }
  }, [q, type])

  const doSearch = async (searchQ, searchType) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/search/?q=${encodeURIComponent(searchQ)}&type=${searchType}`)
      setResults(data.results)
    } catch {}
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) setSearchParams({ q: query.trim() })
  }

  const handleConnect = async (userId) => {
    try {
      await api.post(`/connections/request/${userId}/`)
      setResults(prev => prev.map(p => p.user?.id === userId ? { ...p, connection_status: 'pending' } : p))
    } catch {}
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '88px 24px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
          Search
        </h1>

        {/* Search Input */}
        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: 18 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for people, jobs, companies..."
              className="input-field"
              style={{ paddingLeft: 46, fontSize: 16, padding: '14px 16px 14px 46px' }}
            />
          </div>
        </form>

        {/* Type Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { id: 'people', icon: FiUsers, label: 'People' },
            { id: 'jobs', icon: FiBriefcase, label: 'Jobs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setType(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 50, fontSize: 14, fontWeight: 500,
                background: type === tab.id ? 'var(--color-accent)' : 'var(--color-surface)',
                color: type === tab.id ? 'white' : 'var(--color-muted)',
                border: '1px solid var(--color-border)', cursor: 'pointer',
              }}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {q ? (
          <>
            <p style={{ color: 'var(--color-muted)', fontSize: 14, marginBottom: 16 }}>
              {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`}
            </p>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <LoadingSpinner size={36} />
              </div>
            ) : results.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ fontSize: 32 }}>🔍</p>
                <p style={{ color: 'var(--color-muted)', marginTop: 12 }}>No {type} found for "{q}"</p>
              </div>
            ) : type === 'people' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.map(profile => (
                  <div key={profile.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Link to={`/profile/${profile.user?.id}`}>
                      <Avatar src={profile.avatar_url} name={profile.user?.full_name || ''} size={58} />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/profile/${profile.user?.id}`}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>
                          {profile.user?.full_name}
                        </h3>
                      </Link>
                      <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 2 }}>{profile.headline}</p>
                      {profile.location && (
                        <p style={{ color: 'var(--color-muted)', fontSize: 12, marginTop: 2 }}>📍 {profile.location}</p>
                      )}
                      <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                        {profile.connections_count} connections
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <Link to={`/profile/${profile.user?.id}`} className="btn btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }}>
                        View Profile
                      </Link>
                      {profile.connection_status === 'none' && (
                        <button
                          onClick={() => handleConnect(profile.user?.id)}
                          className="btn btn-outline"
                          style={{ fontSize: 13, padding: '7px 14px' }}
                        >
                          Connect
                        </button>
                      )}
                      {profile.connection_status === 'pending' && (
                        <span className="badge badge-yellow" style={{ padding: '7px 14px' }}>Pending</span>
                      )}
                      {profile.connection_status === 'accepted' && (
                        <span className="badge badge-green" style={{ padding: '7px 14px' }}>Connected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              results.map(job => <JobCard key={job.id} job={job} />)
            )}
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ fontSize: 40 }}>🔍</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginTop: 12 }}>
              Search NexLinker
            </h3>
            <p style={{ color: 'var(--color-muted)', marginTop: 8 }}>
              Find professionals, companies, and job opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
