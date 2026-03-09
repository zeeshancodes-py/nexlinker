import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchMyProfile, updateProfile } from '../store/profileSlice'
import Navbar from '../components/layout/Navbar'
import Avatar from '../components/common/Avatar'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiCamera, FiSave } from 'react-icons/fi'

export default function EditProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { myProfile } = useSelector(s => s.profile)
  const [activeSection, setActiveSection] = useState('basic')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    headline: '', about: '', location: '', website: '', phone: '', open_status: 'not_looking'
  })
  const [avatar, setAvatar] = useState(null)
  const [cover, setCover] = useState(null)

  const [experiences, setExperiences] = useState([])
  const [educations, setEducations] = useState([])
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')

  // Experience form
  const [expForm, setExpForm] = useState({
    title: '', company: '', employment_type: '', location: '', start_date: '', end_date: '', is_current: false, description: ''
  })
  // Education form
  const [eduForm, setEduForm] = useState({
    school: '', degree: '', field_of_study: '', start_year: '', end_year: '', is_current: false, grade: '', description: ''
  })

  useEffect(() => {
    dispatch(fetchMyProfile())
    loadSections()
  }, [dispatch])

  useEffect(() => {
    if (myProfile) {
      setForm({
        headline: myProfile.headline || '',
        about: myProfile.about || '',
        location: myProfile.location || '',
        website: myProfile.website || '',
        phone: myProfile.phone || '',
        open_status: myProfile.open_status || 'not_looking',
      })
    }
  }, [myProfile])

  const loadSections = async () => {
    try {
      const [expRes, eduRes, skillRes] = await Promise.all([
        api.get('/profiles/experiences/'),
        api.get('/profiles/educations/'),
        api.get('/profiles/skills/'),
      ])
      setExperiences(expRes.data.results || expRes.data)
      setEducations(eduRes.data.results || eduRes.data)
      setSkills(skillRes.data.results || skillRes.data)
    } catch {}
  }

  const handleSaveBasic = async () => {
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (avatar) fd.append('avatar', avatar)
    if (cover) fd.append('cover_image', cover)
    const result = await dispatch(updateProfile(fd))
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated!')
    } else {
      toast.error('Failed to update.')
    }
    setLoading(false)
  }

  const handleAddExperience = async (e) => {
    e.preventDefault()
    console.log('Experience form before submission:', expForm)
    
    // Validate required fields
    if (!expForm.title?.trim() || !expForm.company?.trim() || !expForm.start_date) {
      toast.error('Please fill in Title, Company, and Start Date')
      return
    }
    
    try {
      const payload = {
        title: expForm.title,
        company: expForm.company,
        employment_type: expForm.employment_type || 'full_time',
        location: expForm.location || '',
        start_date: expForm.start_date,
        end_date: expForm.is_current ? null : (expForm.end_date || null),
        is_current: expForm.is_current,
        description: expForm.description || '',
      }
      console.log('Submitting payload:', payload)
      const { data } = await api.post('/profiles/experiences/', payload)
      setExperiences(prev => [data, ...prev])
      setExpForm({ title: '', company: '', employment_type: '', location: '', start_date: '', end_date: '', is_current: false, description: '' })
      toast.success('Experience added!')
    } catch (err) {
      console.error('Full error:', err)
      console.error('Error response:', err.response?.data)
      const errorData = err.response?.data
      let errorMsg = 'Failed to add experience'
      if (typeof errorData === 'object') {
        const firstError = Object.values(errorData)[0]
        if (Array.isArray(firstError)) {
          errorMsg = firstError[0]
        } else if (typeof firstError === 'string') {
          errorMsg = firstError
        }
      }
      toast.error(errorMsg)
    }
  }

  const handleDeleteExp = async (id) => {
    await api.delete(`/profiles/experiences/${id}/`)
    setExperiences(prev => prev.filter(e => e.id !== id))
    toast.success('Removed.')
  }

  const handleAddEducation = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/profiles/educations/', eduForm)
      setEducations(prev => [data, ...prev])
      setEduForm({ school: '', degree: '', field_of_study: '', start_year: '', end_year: '', is_current: false, grade: '', description: '' })
      toast.success('Education added!')
    } catch { toast.error('Failed.') }
  }

  const handleDeleteEdu = async (id) => {
    await api.delete(`/profiles/educations/${id}/`)
    setEducations(prev => prev.filter(e => e.id !== id))
    toast.success('Removed.')
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    try {
      const { data } = await api.post('/profiles/skills/', { name: newSkill.trim() })
      setSkills(prev => [...prev, data])
      setNewSkill('')
      toast.success('Skill added!')
    } catch { toast.error('Failed.') }
  }

  const handleDeleteSkill = async (id) => {
    await api.delete(`/profiles/skills/${id}/`)
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  const sections = [
    { id: 'basic', label: '👤 Basic Info' },
    { id: 'experience', label: '💼 Experience' },
    { id: 'education', label: '🎓 Education' },
    { id: 'skills', label: '⚡ Skills' },
  ]

  const inputStyle = { className: 'input-field', style: { marginBottom: 12 } }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '88px 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Edit Profile</h1>
          <button
            onClick={() => navigate(`/profile/${user?.id}`)}
            className="btn btn-outline"
          >
            View Profile
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
          {/* Sidebar nav */}
          <div className="card" style={{ height: 'fit-content', padding: 8, position: 'sticky', top: 88 }}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 14px', borderRadius: 8, fontSize: 14,
                  background: activeSection === s.id ? 'var(--color-accent-glow)' : 'transparent',
                  color: activeSection === s.id ? 'var(--color-accent)' : 'var(--color-text)',
                  fontWeight: activeSection === s.id ? 600 : 400,
                  border: 'none', marginBottom: 2,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            {/* Basic Info */}
            {activeSection === 'basic' && (
              <div className="card fade-in">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Basic Information</h2>

                {/* Avatar & Cover */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 10 }}>Profile Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Avatar src={avatar ? URL.createObjectURL(avatar) : myProfile?.avatar_url} name={user?.full_name || ''} size={80} />
                    <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                      <FiCamera size={14} /> Upload Photo
                      <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files[0])} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Cover Image</label>
                  <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                    Upload Cover
                    <input type="file" accept="image/*" onChange={e => setCover(e.target.files[0])} style={{ display: 'none' }} />
                  </label>
                  {cover && <span style={{ marginLeft: 10, color: 'var(--color-success)', fontSize: 13 }}>✓ {cover.name}</span>}
                </div>

                <hr className="divider" />

                {[
                  { label: 'Professional Headline', key: 'headline', placeholder: 'e.g. Senior Software Engineer at Google' },
                  { label: 'Location', key: 'location', placeholder: 'e.g. San Francisco, CA' },
                  { label: 'Website', key: 'website', placeholder: 'https://yourwebsite.com' },
                  { label: 'Phone', key: 'phone', placeholder: '+1 555 000 0000' },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{field.label}</label>
                    <input
                      className="input-field"
                      value={form[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>About</label>
                  <textarea
                    className="input-field"
                    rows={5}
                    value={form.about}
                    onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
                    placeholder="Tell your professional story..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Open To</label>
                  <select
                    className="input-field"
                    value={form.open_status}
                    onChange={e => setForm(f => ({ ...f, open_status: e.target.value }))}
                  >
                    <option value="not_looking">Not looking for opportunities</option>
                    <option value="open">Open to Work</option>
                    <option value="hiring">Hiring</option>
                  </select>
                </div>

                <button onClick={handleSaveBasic} disabled={loading} className="btn btn-primary" style={{ padding: '11px 28px' }}>
                  <FiSave size={14} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Experience */}
            {activeSection === 'experience' && (
              <div className="fade-in">
                <div className="card" style={{ marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Add Experience</h2>
                  <form onSubmit={handleAddExperience} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { key: 'title', label: 'Job Title', placeholder: 'Software Engineer' },
                      { key: 'company', label: 'Company', placeholder: 'Google' },
                      { key: 'location', label: 'Location', placeholder: 'New York, NY' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>{f.label}</label>
                        <input className="input-field" placeholder={f.placeholder} value={expForm[f.key]} onChange={e => setExpForm(prev => ({ ...prev, [f.key]: e.target.value }))} required={f.key !== 'location'} />
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Employment Type</label>
                        <select className="input-field" value={expForm.employment_type} onChange={e => setExpForm(prev => ({ ...prev, employment_type: e.target.value }))}>
                          <option value="">Select type</option>
                          {['full_time','part_time','self_employed','freelance','contract','internship'].map(t => (
                            <option key={t} value={t}>{t.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Start Date</label>
                        <input type="date" className="input-field" value={expForm.start_date} onChange={e => setExpForm(prev => ({ ...prev, start_date: e.target.value }))} required />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id="isCurrent" checked={expForm.is_current} onChange={e => setExpForm(prev => ({ ...prev, is_current: e.target.checked }))} />
                      <label htmlFor="isCurrent" style={{ fontSize: 14 }}>I currently work here</label>
                    </div>
                    {!expForm.is_current && (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>End Date</label>
                        <input type="date" className="input-field" value={expForm.end_date} onChange={e => setExpForm(prev => ({ ...prev, end_date: e.target.value }))} />
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Description</label>
                      <textarea className="input-field" rows={3} value={expForm.description} onChange={e => setExpForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe your responsibilities..." style={{ resize: 'none' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                      <FiPlus size={14} /> Add Experience
                    </button>
                  </form>
                </div>

                {experiences.map(exp => (
                  <div key={exp.id} className="card" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 700 }}>{exp.title}</h4>
                      <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>{exp.company} · {exp.employment_type?.replace('_', ' ')}</p>
                      <p style={{ color: 'var(--color-muted)', fontSize: 12 }}>{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</p>
                    </div>
                    <button onClick={() => handleDeleteExp(exp.id)} style={{ background: 'none', color: 'var(--color-danger)', padding: 6 }}>
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {activeSection === 'education' && (
              <div className="fade-in">
                <div className="card" style={{ marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Add Education</h2>
                  <form onSubmit={handleAddEducation} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { key: 'school', label: 'School / University', placeholder: 'MIT', required: true },
                      { key: 'degree', label: 'Degree', placeholder: 'B.Sc. Computer Science' },
                      { key: 'field_of_study', label: 'Field of Study', placeholder: 'Computer Science' },
                      { key: 'grade', label: 'Grade / GPA', placeholder: '3.8' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>{f.label}</label>
                        <input className="input-field" placeholder={f.placeholder} required={f.required} value={eduForm[f.key]} onChange={e => setEduForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Start Year</label>
                        <input type="number" className="input-field" min="1950" max="2030" value={eduForm.start_year} onChange={e => setEduForm(prev => ({ ...prev, start_year: e.target.value }))} required />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>End Year</label>
                        <input type="number" className="input-field" min="1950" max="2030" value={eduForm.end_year} onChange={e => setEduForm(prev => ({ ...prev, end_year: e.target.value }))} disabled={eduForm.is_current} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id="isCurrentEdu" checked={eduForm.is_current} onChange={e => setEduForm(prev => ({ ...prev, is_current: e.target.checked }))} />
                      <label htmlFor="isCurrentEdu" style={{ fontSize: 14 }}>Currently studying here</label>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                      <FiPlus size={14} /> Add Education
                    </button>
                  </form>
                </div>

                {educations.map(edu => (
                  <div key={edu.id} className="card" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontWeight: 700 }}>{edu.school}</h4>
                      <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>{edu.degree}</p>
                      <p style={{ color: 'var(--color-muted)', fontSize: 12 }}>{edu.start_year} — {edu.is_current ? 'Present' : edu.end_year}</p>
                    </div>
                    <button onClick={() => handleDeleteEdu(edu.id)} style={{ background: 'none', color: 'var(--color-danger)', padding: 6 }}>
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {activeSection === 'skills' && (
              <div className="fade-in">
                <div className="card" style={{ marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Add Skill</h2>
                  <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 10 }}>
                    <input
                      className="input-field"
                      placeholder="e.g. React, Python, Leadership..."
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary">
                      <FiPlus size={14} /> Add
                    </button>
                  </form>
                </div>
                <div className="card">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Your Skills ({skills.length})</h3>
                  {skills.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {skills.map(skill => (
                        <div key={skill.id} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: 'var(--color-surface2)', border: '1px solid var(--color-border)',
                          borderRadius: 8, padding: '7px 14px',
                        }}>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{skill.name}</span>
                          <button onClick={() => handleDeleteSkill(skill.id)} style={{ background: 'none', color: 'var(--color-muted)', padding: '0 0 0 4px', fontSize: 12 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>No skills added yet. Start building your skill set!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}