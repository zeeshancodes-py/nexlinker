import { useState } from 'react'
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
    // Validate required fields
    if (!certForm.name?.trim() || !certForm.issuing_org?.trim()) {
      toast.error('Please fill in Certification Name and Issuing Organization')
      return
    }
    setCertLoading(true)
    try {
      const payload = {
        ...certForm,
        issue_date: certForm.issue_date || null,
        expiry_date: certForm.expiry_date || null,
      }
      await api.post('/profiles/certifications/', payload)
      toast.success('Certification added!')
      setCertForm({ name: '', issuing_org: '', issue_date: '', expiry_date: '', credential_id: '', credential_url: '' })
      setShowCertForm(false)
      onRefresh?.()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add certification.')
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
