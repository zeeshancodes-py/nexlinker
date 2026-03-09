import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPosts } from '../store/feedSlice'
import { fetchMyProfile } from '../store/profileSlice'
import { useNotificationSocket } from '../hooks/useWebSocket'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import PostCard from '../components/feed/PostCard'
import CreatePost from '../components/feed/CreatePost'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ConnectionCard from '../components/network/ConnectionCard'
import api from '../api/axios'

export default function HomePage() {
  const dispatch = useDispatch()
  const { posts, loading, hasMore } = useSelector(s => s.feed)
  const { myProfile } = useSelector(s => s.profile)
  const [page, setPage] = useState(1)
  const [suggestions, setSuggestions] = useState([])

  useNotificationSocket()

  useEffect(() => {
    dispatch(fetchMyProfile())
    dispatch(fetchPosts(1))
    loadSuggestions()
  }, [dispatch])

  const loadSuggestions = async () => {
    try {
      const { data } = await api.get('/connections/suggestions/')
      setSuggestions(data.slice(0, 3))
    } catch {}
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    dispatch(fetchPosts(next))
  }

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content">
        {/* Left Sidebar */}
        <Sidebar profile={myProfile} />

        {/* Main Feed */}
        <main>
          <CreatePost profile={myProfile} />
          {loading && page === 1 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <LoadingSpinner size={36} />
            </div>
          ) : posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🌐</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>Your feed is empty</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                Connect with more people to see their posts and updates here.
              </p>
            </div>
          ) : (
            <>
              {posts.map(post => <PostCard key={post.id} post={post} />)}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  {loading ? 'Loading...' : 'Load More Posts'}
                </button>
              )}
            </>
          )}
        </main>

        {/* Right Panel */}
        <aside className="right-panel">
          {suggestions.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                People You May Know
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {suggestions.map(profile => (
                  <div key={profile.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img
                      src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.user?.full_name}&background=1e3a5f&color=60a5fa`}
                      alt=""
                      style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile.user?.full_name}
                      </p>
                      <p style={{ color: 'var(--color-muted)', fontSize: 11 }}>{profile.headline?.slice(0, 40) || 'Professional'}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await api.post(`/connections/request/${profile.user?.id}/`)
                        setSuggestions(prev => prev.filter(p => p.id !== profile.id))
                      }}
                      style={{
                        background: 'none', border: '1.5px solid var(--color-accent)',
                        color: 'var(--color-accent)', borderRadius: 50,
                        padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 2 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px' }}>
              {['About', 'Privacy', 'Terms', 'Help Center', 'Careers', 'Advertising'].map(l => (
                <a key={l} href="#" style={{ color: 'var(--color-muted)' }}>{l}</a>
              ))}
            </div>
            <p style={{ marginTop: 8 }}>NexLinker © {new Date().getFullYear()}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}