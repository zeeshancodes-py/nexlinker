import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDispatch } from 'react-redux'
import { addComment } from '../../store/feedSlice'
import Avatar from '../common/Avatar'
import api from '../../api/axios'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { FiSend } from 'react-icons/fi'

export default function CommentSection({ postId, topComments = [] }) {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const [comments, setComments] = useState(topComments)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadComments = async () => {
    try {
      const { data } = await api.get(`/feed/${postId}/comments/`)
      setComments(data.results || data)
      setLoaded(true)
    } catch {}
  }

  useEffect(() => {
    if (!loaded) loadComments()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post(`/feed/${postId}/comments/`, { content })
      setComments(prev => [...prev, data])
      setContent('')
      dispatch(addComment({ postId }))
      toast.success('Comment added.')
    } catch {
      toast.error('Failed to post comment.')
    }
    setLoading(false)
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
      {/* Add comment */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Avatar src={null} name={user?.full_name || ''} size={36} />
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', gap: 8 }}>
          <input
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="input-field"
            style={{ borderRadius: 50 }}
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="btn btn-primary"
            style={{ padding: '8px 14px', borderRadius: 50 }}
          >
            <FiSend size={14} />
          </button>
        </form>
      </div>

      {/* Comments list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.map(comment => (
          <div key={comment.id} style={{ display: 'flex', gap: 10 }}>
            <Link to={`/profile/${comment.author?.id}`}>
              <Avatar src={comment.author_avatar} name={comment.author?.full_name || ''} size={34} />
            </Link>
            <div style={{ flex: 1 }}>
              <div style={{
                background: 'var(--color-surface2)',
                borderRadius: 12,
                padding: '10px 14px',
              }}>
                <Link to={`/profile/${comment.author?.id}`}>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>{comment.author?.full_name}</p>
                </Link>
                {comment.author_headline && (
                  <p style={{ color: 'var(--color-muted)', fontSize: 11, marginBottom: 4 }}>
                    {comment.author_headline}
                  </p>
                )}
                <p style={{ fontSize: 14, lineHeight: 1.5 }}>{comment.content}</p>
              </div>
              <p style={{ color: 'var(--color-muted)', fontSize: 11, marginTop: 4, paddingLeft: 4 }}>
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}