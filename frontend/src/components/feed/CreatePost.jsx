import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { createPost } from '../../store/feedSlice'
import Avatar from '../common/Avatar'
import toast from 'react-hot-toast'
import { FiImage, FiX, FiSend } from 'react-icons/fi'

export default function CreatePost({ profile }) {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return toast.error('Post content is required.')
    setLoading(true)
    const formData = new FormData()
    formData.append('content', content)
    if (image) formData.append('image', image)
    const result = await dispatch(createPost(formData))
    if (createPost.fulfilled.match(result)) {
      setContent('')
      setImage(null)
      setPreview(null)
      setExpanded(false)
      toast.success('Post published!')
    } else {
      toast.error('Failed to post.')
    }
    setLoading(false)
  }

  return (
    <div className="card fade-in" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar src={profile?.avatar_url} name={user?.full_name || ''} size={44} />
        <div style={{ flex: 1 }}>
          {!expanded ? (
            <div
              onClick={() => setExpanded(true)}
              style={{
                background: 'var(--color-surface2)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 50,
                padding: '12px 20px',
                color: 'var(--color-muted)',
                fontSize: 14,
                cursor: 'text',
              }}
            >
              Share something with your network...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                autoFocus
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--color-surface2)',
                  border: '1.5px solid var(--color-accent)',
                  borderRadius: 12,
                  padding: 16,
                  color: 'var(--color-text)',
                  fontSize: 14,
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.6,
                }}
              />
              {preview && (
                <div style={{ position: 'relative', marginTop: 8 }}>
                  <img src={preview} alt="" style={{ width: '100%', borderRadius: 10, maxHeight: 300, objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setPreview(null) }}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.7)', border: 'none',
                      borderRadius: '50%', padding: 6, color: 'white', cursor: 'pointer',
                    }}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-muted)', fontSize: 13, cursor: 'pointer' }}>
                  <FiImage size={18} />
                  <span>Photo</span>
                  <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="btn btn-ghost"
                    style={{ padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', opacity: loading ? 0.7 : 1 }}
                  >
                    <FiSend size={14} />
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}