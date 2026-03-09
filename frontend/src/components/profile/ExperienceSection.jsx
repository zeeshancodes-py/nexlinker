import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  FiPlus, FiEdit2, FiTrash2, FiBriefcase,
  FiMapPin, FiCalendar, FiX, FiCheck
} from 'react-icons/fi'

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
]

const EMPTY_FORM = {
  title: '', company: '', employment_type: 'full_time',
  location: '', start_date: '', end_date: '',
  is_current: false, description: '',
}

export default function ExperienceSection({ experiences = [], isOwner, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (exp) => {
    setForm({
      title: exp.title || '',
      company: exp.company || '',
      employment_type: exp.employment_type || 'full_time',
      location: exp.location || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      is_current: exp.is_current || false,
      description: exp.description || '',
    })
    setEditingId(exp.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  // Validate required fields
  if (!form.title?.trim() || !form.company?.trim() || !form.start_date) {
    toast.error('Please fill in Title, Company, and Start Date')
    return
  }
  setLoading(true)
  try {
    console.log('Form state:', form)
    // Build payload with proper null handling for end_date
    const payload = {
      title: form.title,
      company: form.company,
      employment_type: form.employment_type || 'full_time',
      location: form.location || '',
      start_date: form.start_date,
      end_date: form.is_current ? null : (form.end_date || null),
      is_current: form.is_current,
      description: form.description || '',
    }
    console.log('Submitting payload:', JSON.stringify(payload, null, 2))
    if (editingId) {
      await api.patch('/profiles/experiences/' + editingId + '/', payload)
      toast.success('Experience updated!')
    } else {
      await api.post('/profiles/experiences/', payload)
      toast.success('Experience added!')
    }
    onRefresh?.()
    handleCancel()
  } catch (err) {
    console.error('Full error object:', err)
    console.error('Full error response:', err.response)
    console.error('Error data:', err.response?.data)
    const errorData = err.response?.data
    let errorMsg = 'Failed to save'
    
    // Handle different error formats
    if (typeof errorData === 'string') {
      errorMsg = errorData
    } else if (errorData?.detail) {
      errorMsg = errorData.detail
    } else if (errorData?.non_field_errors) {
      errorMsg = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors
    } else if (typeof errorData === 'object') {
      // Get first error from any field
      const firstError = Object.values(errorData)[0]
      if (Array.isArray(firstError)) {
        errorMsg = firstError[0] || 'Failed to save'
      } else if (typeof firstError === 'string') {
        errorMsg = firstError
      }
    }
    
    console.error('Final error message:', errorMsg)
    toast.error(errorMsg)
  }
  setLoading(false)
}

  const handleDelete = async (id) => {
    if (!confirm('Remove this experience?')) return
    try {
      await api.delete(`/profiles/experiences/${id}/`)
      toast.success('Experience removed.')
      onRefresh?.()
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const getDuration = (start, end, isCurrent) => {
    const startDate = new Date(start)
    const endDate = isCurrent ? new Date() : new Date(end)
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth())
    const years = Math.floor(months / 12)
    const remainMonths = months % 12
    let result = ''
    if (years > 0) result += `${years} yr${years > 1 ? 's' : ''} `
    if (remainMonths > 0) result += `${remainMonths} mo`
    return result.trim()
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(59,130,246,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiBriefcase size={18} color="var(--color-accent)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
            Experience
          </h2>
        </div>
        {isOwner && (
          <button
            onClick={openAdd}
            className="btn btn-ghost"
            style={{
              padding: '7px 14px', fontSize: 13,
              border: '1.5px solid var(--color-border)', borderRadius: 8,
            }}
          >
            <FiPlus size={15} /> Add
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{
          background: 'var(--color-surface2)',
          border: '1.5px solid var(--color-accent)',
          borderRadius: 'var(--radius)',
          padding: 20,
          marginBottom: 20,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>
              {editingId ? 'Edit Experience' : 'Add Experience'}
            </h3>
            <button onClick={handleCancel} style={{ background: 'none', color: 'var(--color-muted)', padding: 4 }}>
              <FiX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  Job Title *
                </label>
                <input
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  Company *
                </label>
                <input
                  name="company"
                  required
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  Employment Type
                </label>
                <select
                  name="employment_type"
                  value={form.employment_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  {EMPLOYMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA"
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  Start Date *
                </label>
                <input
                  name="start_date"
                  type="date"
                  required
                  value={form.start_date}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  End Date
                </label>
                <input
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange}
                  disabled={form.is_current}
                  className="input-field"
                  style={{ opacity: form.is_current ? 0.5 : 1 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <input
                type="checkbox"
                id="is_current"
                name="is_current"
                checked={form.is_current}
                onChange={handleChange}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="is_current" style={{ fontSize: 14, cursor: 'pointer' }}>
                I currently work here
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your key responsibilities, achievements, and technologies used..."
                rows={4}
                className="input-field"
                style={{ resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost"
                style={{ padding: '9px 18px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '9px 22px' }}
              >
                <FiCheck size={14} />
                {loading ? 'Saving...' : editingId ? 'Update' : 'Add Experience'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Experience List */}
      {experiences.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-muted)' }}>
          <FiBriefcase size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
          <p style={{ fontSize: 15 }}>No experience added yet.</p>
          {isOwner && (
            <button onClick={openAdd} className="btn btn-outline" style={{ marginTop: 12 }}>
              <FiPlus size={14} /> Add Your First Experience
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {experiences.map((exp, index) => {
            const isExpanded = expandedId === exp.id
            const isLast = index === experiences.length - 1
            const duration = exp.start_date
              ? getDuration(exp.start_date, exp.end_date, exp.is_current)
              : ''
            const empType = EMPLOYMENT_TYPES.find(t => t.value === exp.employment_type)

            return (
              <div
                key={exp.id}
                style={{
                  display: 'flex', gap: 16,
                  paddingBottom: isLast ? 0 : 20,
                  marginBottom: isLast ? 0 : 20,
                  borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))',
                  border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FiBriefcase size={20} color="var(--color-accent)" />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>
                        {exp.title}
                      </h3>
                      <p style={{ color: 'var(--color-text)', fontSize: 14, marginTop: 2 }}>
                        {exp.company}
                        {empType && (
                          <span style={{ color: 'var(--color-muted)' }}> · {empType.label}</span>
                        )}
                      </p>
                    </div>

                    {/* Owner Actions */}
                    {isOwner && (
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                        <button
                          onClick={() => openEdit(exp)}
                          className="btn btn-ghost"
                          style={{ padding: '5px 8px', borderRadius: 7 }}
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="btn btn-ghost"
                          style={{ padding: '5px 8px', borderRadius: 7, color: 'var(--color-danger)' }}
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Date & Location */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '4px 14px',
                    marginTop: 6,
                  }}>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      color: 'var(--color-muted)', fontSize: 13,
                    }}>
                      <FiCalendar size={12} />
                      {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                      {duration && (
                        <span style={{
                          background: 'var(--color-surface2)',
                          padding: '1px 8px', borderRadius: 50,
                          fontSize: 11, fontWeight: 600,
                          marginLeft: 4,
                        }}>
                          {duration}
                        </span>
                      )}
                    </span>
                    {exp.location && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: 'var(--color-muted)', fontSize: 13,
                      }}>
                        <FiMapPin size={12} /> {exp.location}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {exp.description && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{
                        fontSize: 14, color: 'var(--color-muted)',
                        lineHeight: 1.7,
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {exp.description}
                      </p>
                      {exp.description.length > 200 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                          style={{
                            background: 'none', color: 'var(--color-accent)',
                            fontSize: 13, fontWeight: 600, marginTop: 4, padding: 0,
                          }}
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Current Job Badge */}
                  {exp.is_current && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{
                        background: 'rgba(16,185,129,0.12)',
                        color: '#10b981', border: '1px solid rgba(16,185,129,0.25)',
                        fontSize: 11, fontWeight: 700, padding: '3px 10px',
                        borderRadius: 50, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        Current Role
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}