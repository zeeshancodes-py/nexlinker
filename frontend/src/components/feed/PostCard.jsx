import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { reactToPost, deletePost } from '../../store/feedSlice'
import Avatar from '../common/Avatar'
import CommentSection from './CommentSection'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import {
  FiThumbsUp, FiMessageCircle, FiShare2, FiSend,
  FiMoreHorizontal, FiTrash2, FiEdit
} from 'react-icons/fi'

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { type: 'support', emoji: '❤️', label: 'Support' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
  { type: 'curious', emoji: '🤔', label: 'Curious' },
]

export default function PostCard({ post }) {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const isOwner = post.author?.id === user?.id
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  const handleReact = (reactionType) => {
    dispatch(reactToPost({ postId: post.id, reactionType }))
    setShowReactions(false)
  }

  const handleDelete = async () => {
    if (confirm('Delete this post?')) {
      await dispatch(deletePost(post.id))
      toast.success('Post deleted.')
    }
    setShowMenu(false)
  }

  const currentReactionEmoji = post.user_reaction
    ? REACTIONS.find(r => r.type === post.user_reaction)?.emoji
    : null

  return (
    <div className="card fade-in" style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <Link to={`/profile/${post.author?.id}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar
            src={post.author_avatar}
            name={post.author?.full_name || ''}
            size={46}
          />
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, fontFamily: 'var(--font-display)' }}>
              {post.author?.full_name}
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: 12 }}>
              {post.author_headline}
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: 11 }}>{timeAgo}</p>
          </div>
        </Link>
        {isOwner && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              className="btn btn-ghost"
              style={{ padding: '6px 8px', borderRadius: 8 }}
            >
              <FiMoreHorizontal />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '100%',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                minWidth: 140,
                zIndex: 10,
                overflow: 'hidden',
              }}>
                <button
                  onClick={handleDelete}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', color: 'var(--color-danger)',
                    background: 'none', width: '100%', fontSize: 13,
                  }}
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: post.image_url ? 14 : 0, whiteSpace: 'pre-wrap' }}>
        {post.content}
      </p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          style={{
            width: '100%',
            borderRadius: 10,
            marginTop: 12,
            maxHeight: 460,
            objectFit: 'cover',
          }}
        />
      )}

      {/* Stats */}
      {(post.likes_count > 0 || post.comments_count > 0) && (
        <div style={{
          display: 'flex',
          gap: 16,
          padding: '10px 0',
          marginTop: 12,
          borderBottom: '1px solid var(--color-border)',
          fontSize: 13,
          color: 'var(--color-muted)',
        }}>
          {post.likes_count > 0 && (
            <span>👍 {post.likes_count} reaction{post.likes_count !== 1 ? 's' : ''}</span>
          )}
          {post.comments_count > 0 && (
            <span
              style={{ marginLeft: 'auto', cursor: 'pointer' }}
              onClick={() => setShowComments(v => !v)}
            >
              {post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 4, paddingTop: 8 }}>
        {/* Like with reaction picker */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            onClick={() => handleReact('like')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '8px', width: '100%',
              background: 'none', borderRadius: 8,
              color: post.is_liked ? 'var(--color-accent)' : 'var(--color-muted)',
              fontSize: 13, fontWeight: post.is_liked ? 600 : 400,
              transition: 'all 0.2s',
            }}
            onMouseEnterCapture={e => e.currentTarget.style.background = 'var(--color-surface2)'}
            onMouseLeaveCapture={e => e.currentTarget.style.background = 'none'}
          >
            {currentReactionEmoji ? (
              <span style={{ fontSize: 17 }}>{currentReactionEmoji}</span>
            ) : (
              <FiThumbsUp size={16} />
            )}
            <span>{post.user_reaction ? REACTIONS.find(r => r.type === post.user_reaction)?.label : 'Like'}</span>
          </button>

          {showReactions && (
            <div
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              style={{
                position: 'absolute', bottom: '100%', left: 0,
                display: 'flex', gap: 4,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 50,
                padding: '6px 10px',
                zIndex: 20,
                boxShadow: 'var(--shadow)',
                animation: 'fadeIn 0.15s ease',
              }}
            >
              {REACTIONS.map(r => (
                <button
                  key={r.type}
                  title={r.label}
                  onClick={() => handleReact(r.type)}
                  style={{
                    background: 'none', fontSize: 22, cursor: 'pointer',
                    transition: 'transform 0.15s',
                    padding: '2px 4px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowComments(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '8px', flex: 1,
            background: showComments ? 'var(--color-surface2)' : 'none',
            borderRadius: 8,
            color: 'var(--color-muted)', fontSize: 13,
          }}
        >
          <FiMessageCircle size={16} /> Comment
        </button>

        <button
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '8px', flex: 1,
            background: 'none', borderRadius: 8,
            color: 'var(--color-muted)', fontSize: 13,
          }}
        >
          <FiShare2 size={16} /> Share
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} topComments={post.top_comments} />}
    </div>
  )
}