import os

# ── ProfileHeader.jsx ──────────────────────────────────────────
profile_header = '''import { useState } from 'react'
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
              <FiGlobe size={13} /> {profile.website.replace(/^https?:\\/\\//, '')}
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
'''

# ── SkillsSection.jsx ──────────────────────────────────────────
skills_section = '''import { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiX, FiCheck, FiZap, FiAward, FiTrendingUp } from 'react-icons/fi'

const SUGGESTED_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'SQL',
  'Machine Learning', 'Project Management', 'Agile',
  'UI/UX Design', 'Data Analysis', 'Communication',
  'Leadership', 'TypeScript', 'Docker', 'AWS',
  'Figma', 'Excel', 'Public Speaking', 'Git', 'Django',
]

export default function SkillsSection({ skills = [], certifications = [], isOwner, onRefresh }) {
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [showCertForm, setShowCertForm] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('skills')
  const [certLoading, setCertLoading] = useState(false)
  const [certForm, setCertForm] = useState({
    name: '', issuing_org: '', issue_date: '',
    expiry_date: '', credential_id: '', credential_url: '',
  })

  const handleAddSkill = async (skillName) => {
    const name = skillName || newSkill.trim()
    if (!name) return
    setLoading(true)
    try {
      await api.post('/profiles/skills/', { name })
      toast.success(name + ' added!')
      setNewSkill('')
      setShowSkillForm(false)
      onRefresh?.()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add skill.')
    }
    setLoading(false)
  }

  const handleDeleteSkill = async (id, name) => {
    if (!confirm('Remove ' + name + '?')) return
    try {
      await api.delete('/profiles/skills/' + id + '/')
      toast.success('Skill removed.')
      onRefresh?.()
    } catch {
      toast.error('Failed.')
    }
  }

  const handleAddCert = async (e) => {
    e.preventDefault()
    setCertLoading(true)
    try {
      await api.post('/profiles/certifications/', certForm)
      toast.success('Certification added!')
      setCertForm({ name: '', issuing_org: '', issue_date: '', expiry_date: '', credential_id: '', credential_url: '' })
      setShowCertForm(false)
      onRefresh?.()
    } catch {
      toast.error('Failed to add certification.')
    }
    setCertLoading(false)
  }

  const handleDeleteCert = async (id) => {
    if (!confirm('Remove this certification?')) return
    try {
      await api.delete('/profiles/certifications/' + id + '/')
      toast.success('Removed.')
      onRefresh?.()
    } catch {
      toast.error('Failed.')
    }
  }

  const getSkillLevel = (endorsements) => {
    if (endorsements >= 20) return { label: 'Expert', color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
    if (endorsements >= 10) return { label: 'Advanced', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }
    if (endorsements >= 5) return { label: 'Intermediate', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' }
    return { label: 'Beginner', color: '#64748b', bg: 'rgba(100,116,139,0.1)' }
  }

  const suggestedNotAdded = SUGGESTED_SKILLS.filter(
    s => !skills.some(sk => sk.name.toLowerCase() === s.toLowerCase())
  ).slice(0, 8)

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiZap size={18} color="#f59e0b" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Skills and Certifications</h2>
        </div>
        {isOwner && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { setShowSkillForm(v => !v); setShowCertForm(false) }} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12, border: '1.5px solid var(--color-border)', borderRadius: 8 }}>
              <FiPlus size={13} /> Skill
            </button>
            <button onClick={() => { setShowCertForm(v => !v); setShowSkillForm(false) }} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12, border: '1.5px solid var(--color-border)', borderRadius: 8 }}>
              <FiPlus size={13} /> Certification
            </button>
          </div>
        )}
      </div>

      {showSkillForm && (
        <div style={{ background: 'var(--color-surface2)', border: '1.5px solid #f59e0b', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ fontWeight: 700, fontSize: 15 }}>Add a Skill</h4>
            <button onClick={() => setShowSkillForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
              <FiX size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill() } }} placeholder="Type a skill name..." className="input-field" style={{ flex: 1 }} autoFocus />
            <button onClick={() => handleAddSkill()} disabled={loading || !newSkill.trim()} className="btn btn-primary" style={{ background: '#f59e0b', padding: '10px 16px' }}>
              <FiCheck size={14} /> Add
            </button>
          </div>
          {suggestedNotAdded.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggested</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {suggestedNotAdded.map(skill => (
                  <button key={skill} onClick={() => handleAddSkill(skill)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: 50, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)' }}
                  >+ {skill}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showCertForm && (
        <div style={{ background: 'var(--color-surface2)', border: '1.5px solid #10b981', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ fontWeight: 700, fontSize: 15 }}>Add Certification</h4>
            <button onClick={() => setShowCertForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
              <FiX size={16} />
            </button>
          </div>
          <form onSubmit={handleAddCert}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Certification Name *</label>
                <input required className="input-field" placeholder="e.g. AWS Solutions Architect" value={certForm.name} onChange={e => setCertForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Issuing Organization *</label>
                <input required className="input-field" placeholder="e.g. Amazon Web Services" value={certForm.issuing_org} onChange={e => setCertForm(p => ({ ...p, issuing_org: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Issue Date</label>
                <input type="date" className="input-field" value={certForm.issue_date} onChange={e => setCertForm(p => ({ ...p, issue_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Expiry Date</label>
                <input type="date" className="input-field" value={certForm.expiry_date} onChange={e => setCertForm(p => ({ ...p, expiry_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Credential ID</label>
                <input className="input-field" placeholder="ID or license number" value={certForm.credential_id} onChange={e => setCertForm(p => ({ ...p, credential_id: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Credential URL</label>
                <input type="url" className="input-field" placeholder="https://verify.example.com" value={certForm.credential_url} onChange={e => setCertForm(p => ({ ...p, credential_url: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCertForm(false)} className="btn btn-ghost" style={{ padding: '8px 16px' }}>Cancel</button>
              <button type="submit" disabled={certLoading} className="btn btn-primary" style={{ padding: '8px 20px', background: '#10b981' }}>
                <FiCheck size={13} /> {certLoading ? 'Adding...' : 'Add Certification'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
        {[
          { id: 'skills', label: 'Skills (' + skills.length + ')', icon: FiZap },
          { id: 'certs', label: 'Certifications (' + certifications.length + ')', icon: FiAward },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', background: 'none', border: 'none', fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 400, color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-muted)', borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent', marginBottom: -1, cursor: 'pointer' }}>
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'skills' && (
        <div>
          {skills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-muted)' }}>
              <FiZap size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>No skills added yet.</p>
              {isOwner && (
                <button onClick={() => setShowSkillForm(true)} className="btn btn-outline" style={{ marginTop: 12, borderColor: '#f59e0b', color: '#f59e0b' }}>
                  <FiPlus size={14} /> Add Skills
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {skills.map(skill => {
                const level = getSkillLevel(skill.endorsements)
                return (
                  <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: level.bg, border: '1px solid ' + level.color + '30', borderRadius: 10, padding: '8px 14px' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{skill.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: level.color, textTransform: 'uppercase', letterSpacing: 0.3 }}>{level.label}</span>
                        {skill.endorsements > 0 && <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>· {skill.endorsements} endorsements</span>}
                      </div>
                    </div>
                    {isOwner && (
                      <button onClick={() => handleDeleteSkill(skill.id, skill.name)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', padding: '0 0 0 4px', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)' }}
                      >
                        <FiX size={13} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'certs' && (
        <div>
          {certifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-muted)' }}>
              <FiAward size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>No certifications added yet.</p>
              {isOwner && (
                <button onClick={() => setShowCertForm(true)} className="btn btn-outline" style={{ marginTop: 12, borderColor: '#10b981', color: '#10b981' }}>
                  <FiPlus size={14} /> Add Certification
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {certifications.map(cert => (
                <div key={cert.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 14, background: 'var(--color-surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    🏅
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{cert.name}</h4>
                        <p style={{ color: 'var(--color-muted)', fontSize: 13, marginTop: 2 }}>{cert.issuing_org}</p>
                      </div>
                      {isOwner && (
                        <button onClick={() => handleDeleteCert(cert.id)} className="btn btn-ghost" style={{ padding: '4px 7px', color: 'var(--color-danger)', borderRadius: 6 }}>
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 6 }}>
                      {cert.issue_date && <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Issued: {cert.issue_date}</span>}
                      {cert.expiry_date && <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Expires: {cert.expiry_date}</span>}
                      {cert.credential_id && <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>ID: {cert.credential_id}</span>}
                    </div>
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, fontWeight: 600, color: '#10b981', textDecoration: 'none' }}>
                        <FiTrendingUp size={12} /> View Credential
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
'''

# Write files
os.makedirs('src/components/profile', exist_ok=True)

with open('src/components/profile/ProfileHeader.jsx', 'w', encoding='utf-8') as f:
    f.write(profile_header)
print('ProfileHeader.jsx created successfully')

with open('src/components/profile/SkillsSection.jsx', 'w', encoding='utf-8') as f:
    f.write(skills_section)
print('SkillsSection.jsx created successfully')

print('Done! Now run: npm run dev')