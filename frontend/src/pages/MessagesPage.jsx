import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchConversations, fetchMessages, sendMessage, setActiveConversation } from '../store/messageSlice'
import Navbar from '../components/layout/Navbar'
import Avatar from '../components/common/Avatar'
import { useAuth } from '../hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { FiSend, FiSearch } from 'react-icons/fi'

export default function MessagesPage() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useAuth()
  const { conversations, activeConversation, messages } = useSelector(s => s.messages)
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef()
  const ws = useRef(null)

  useEffect(() => {
    console.log('MessagesPage mounted, fetching conversations')
    dispatch(fetchConversations())
  }, [dispatch])

  useEffect(() => {
    // Handle navigation with pre-selected conversation
    if (location.state?.conversationId) {
      console.log('Selecting conversation from location state:', location.state.conversationId)
      selectConversation(location.state.conversationId)
    }
  }, [location.state, conversations])

  useEffect(() => {
    if (activeConversation) {
      console.log('Active conversation changed:', activeConversation)
      console.log('Fetching messages for conversation:', activeConversation)
      dispatch(fetchMessages(activeConversation))
      connectWebSocket(activeConversation)
    }
    return () => ws.current?.close()
  }, [activeConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeConversation])

  const connectWebSocket = (convId) => {
    ws.current?.close()
    console.log('Attempting WebSocket connection to:', `ws://localhost:8000/ws/chat/${convId}/`)
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${convId}/`)
    
    ws.current.onopen = () => {
      console.log('WebSocket connected for conversation:', convId)
    }
    
    ws.current.onmessage = (e) => {
      console.log('WebSocket message received:', e.data)
      const data = JSON.parse(e.data)
      if (data.sender_id !== user?.id) {
        console.log('Adding message from other user')
        dispatch({ type: 'messages/addMessage', payload: { conversationId: convId, message: { id: data.message_id, content: data.message, sender: { id: data.sender_id, full_name: data.sender_name }, created_at: data.created_at } } })
      }
    }
    
    ws.current.onerror = (e) => {
      console.error('WebSocket error:', e)
      console.warn('WebSocket unavailable. Messages will load via REST API.')
    }
    
    ws.current.onclose = () => {
      console.log('WebSocket closed for conversation:', convId)
    }
  }

  const selectConversation = (id) => {
    dispatch(setActiveConversation(id))
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim() || !activeConversation) return
    dispatch(sendMessage({ conversationId: activeConversation, content }))
    setContent('')
  }

  const currentMessages = messages[activeConversation] || []
  const filteredConvs = conversations.filter(c =>
    !search || c.other_participant?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  console.log('Current active conversation:', activeConversation)
  console.log('All messages state:', messages)
  console.log('Current messages for active conversation:', currentMessages)
  console.log('Conversations:', conversations)

  const activeConv = conversations.find(c => c.id === activeConversation)
  const other = activeConv?.other_participant

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 0', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', background: 'var(--color-surface)', marginTop: 8,
          height: 'calc(100vh - 100px)',
        }}>
          {/* Conversations list */}
          <div style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Messages</h2>
              <div style={{ position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: 14 }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="input-field"
                  style={{ paddingLeft: 36, fontSize: 13 }}
                />
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredConvs.length === 0 ? (
                <p style={{ padding: 24, color: 'var(--color-muted)', fontSize: 14, textAlign: 'center' }}>No conversations yet.</p>
              ) : filteredConvs.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    padding: '12px 16px', cursor: 'pointer',
                    background: activeConversation === conv.id ? 'var(--color-accent-glow)' : 'transparent',
                    borderLeft: activeConversation === conv.id ? '3px solid var(--color-accent)' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <Avatar
                    src={conv.other_participant?.avatar_url}
                    name={conv.other_participant?.full_name || ''}
                    size={44}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.other_participant?.full_name}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--color-muted)', flexShrink: 0, marginLeft: 4 }}>
                        {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false }).replace('about ', '') : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.last_message || 'No messages yet'}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span style={{
                      background: 'var(--color-accent)', color: 'white',
                      borderRadius: 50, padding: '2px 7px', fontSize: 11, fontWeight: 700,
                    }}>{conv.unread_count}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          {activeConversation ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar src={other?.avatar_url} name={other?.full_name || ''} size={40} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{other?.full_name}</p>
                  <p style={{ color: 'var(--color-muted)', fontSize: 12 }}>{other?.headline}</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {currentMessages.map(msg => {
                  const isMe = msg.sender?.id === user?.id || msg.sender_id === user?.id
                  return (
                    <div key={msg.id} style={{
                      display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8,
                    }}>
                      {!isMe && <Avatar src={msg.sender_avatar} name={msg.sender?.full_name || ''} size={32} />}
                      <div>
                        <div style={{
                          maxWidth: 380, padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isMe ? 'var(--color-accent)' : 'var(--color-surface2)',
                          color: isMe ? 'white' : 'var(--color-text)',
                          fontSize: 14, lineHeight: 1.5,
                        }}>
                          {msg.content}
                        </div>
                        <p style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                          {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }) : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex', gap: 10,
              }}>
                <input
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write a message..."
                  className="input-field"
                  style={{ flex: 1, borderRadius: 50 }}
                />
                <button type="submit" disabled={!content.trim()} className="btn btn-primary" style={{ borderRadius: 50, padding: '10px 18px' }}>
                  <FiSend size={16} />
                </button>
              </form>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--color-muted)' }}>
              <p style={{ fontSize: 32 }}>💬</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Select a conversation</p>
              <p style={{ fontSize: 14 }}>Choose from your existing conversations or start a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

