import { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiBook
} from 'react-icons/fi'

const EMPTY_FORM = {
  school: '', degree: '', field_of_study: '',
  start_year: '', end_year: '', is_current: false,
  grade: '', description: '',
}

const DEGREE_OPTIONS = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'MBA',
  'Ph.D.',
  'M.D.',
  'J.D.',
  'Certificate',
  'Bootcamp',
  'Other',
]

export default function EducationSection({ educations = [], isOwner, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 60 }, (_, i) => currentYear + 5 - i)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'is_current' && checked ? { end_year: '' } : {}),
    }))
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (edu) => {
    setForm({
      school: edu.school || '',
      degree: edu.degree || '',
      field_of_study: edu.field_of_study || '',
      start_year: edu.start_year?.toString() || '',
      end_year: edu.end_year?.toString() || '',
      is_current: edu.is_current || false,
      grade: edu.grade || '',
      description: edu.description || '',
    })
    setEditingId(edu.id)
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
    if (!form.school?.trim() || !form.start_year) {
      toast.error('Please fill in School and Start Year')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        start_year: parseInt(form.start_year),
        // If currently studying, end_year must be null. Otherwise use provided value or null if empty
        end_year: form.is_current ? null : (form.end_year ? parseInt(form.end_year) : null),
      }
      if (editingId) {
        await api.patch(`/profiles/educations/${editingId}/`, payload)
        toast.success('Education updated!')
      } else {
        await api.post('/profiles/educations/', payload)
        toast.success('Education added!')
      }
      onRefresh?.()
      handleCancel()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save education.')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this education?')) return
    try {
      await api.delete(`/profiles/educations/${id}/`)
      toast.success('Education removed.')
      onRefresh?.()
    } catch {
      toast.error('Failed to delete.')
    }
  }

  // School logo placeholder colors
  const schoolColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
  const getSchoolColor = (name) => schoolColors[name?.charCodeAt(0) % schoolColors.length]

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
            background: 'rgba(99,102,241,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiBook size={18} color="#6366f1" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
            Education
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
          border: '1.5px solid #6366f1',
          borderRadius: 'var(--radius)',
          padding: 20,
          marginBottom: 20,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>
              {editingId ? 'Edit Education' : 'Add Education'}
            </h3>
            <button onClick={handleCancel} style={{ background: 'none', color: 'var(--color-muted)', padding: 4 }}>
              <FiX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                School / University *
              </label>
              <input
                name="school"
                required
                value={form.school}
                onChange={handleChange}
                placeholder="e.g. Massachusetts Institute of Technology"
                className="input-field"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  Degree
                </label>
                <select
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select degree</option>
                  {DEGREE_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  Field of Study
                </label>
                <input
                  name="field_of_study"
                  value={form.field_of_study}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  Start Year *
                </label>
                <select
                  name="start_year"
                  required
                  value={form.start_year}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  End Year
                </label>
                <select
                  name="end_year"
                  value={form.end_year}
                  onChange={handleChange}
                  disabled={form.is_current}
                  className="input-field"
                  style={{ opacity: form.is_current ? 0.5 : 1 }}
                >
                  <option value="">Select year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <input
                type="checkbox"
                id="edu_is_current"
                name="is_current"
                checked={form.is_current}
                onChange={handleChange}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="edu_is_current" style={{ fontSize: 14, cursor: 'pointer' }}>
                I currently study here
              </label>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                Grade / GPA
              </label>
              <input
                name="grade"
                value={form.grade}
                onChange={handleChange}
                placeholder="e.g. 3.8 / 4.0 or First Class Honours"
                className="input-field"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                Description / Activities
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Clubs, activities, thesis, awards..."
                rows={3}
                className="input-field"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleCancel} className="btn btn-ghost" style={{ padding: '9px 18px' }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '9px 22px', background: '#6366f1' }}
              >
                <FiCheck size={14} />
                {loading ? 'Saving...' : editingId ? 'Update' : 'Add Education'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Education List */}
      {educations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-muted)' }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 10, opacity: 0.4 }}>🎓</span>
          <p style={{ fontSize: 15 }}>No education added yet.</p>
          {isOwner && (
            <button onClick={openAdd} className="btn btn-outline" style={{ marginTop: 12, borderColor: '#6366f1', color: '#6366f1' }}>
              <FiPlus size={14} /> Add Your Education
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {educations.map((edu, index) => {
            const isLast = index === educations.length - 1
            const isExpanded = expandedId === edu.id
            const color = getSchoolColor(edu.school)

            return (
              <div
                key={edu.id}
                style={{
                  display: 'flex', gap: 16,
                  paddingBottom: isLast ? 0 : 20,
                  marginBottom: isLast ? 0 : 20,
                  borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {/* School Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                  border: `1px solid ${color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  🎓
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>
                        {edu.school}
                      </h3>
                      {(edu.degree || edu.field_of_study) && (
                        <p style={{ color: 'var(--color-text)', fontSize: 14, marginTop: 2 }}>
                          {[edu.degree, edu.field_of_study].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>

                    {isOwner && (
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                        <button
                          onClick={() => openEdit(edu)}
                          className="btn btn-ghost"
                          style={{ padding: '5px 8px', borderRadius: 7 }}
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(edu.id)}
                          className="btn btn-ghost"
                          style={{ padding: '5px 8px', borderRadius: 7, color: 'var(--color-danger)' }}
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Year Range */}
                  <p style={{ color: 'var(--color-muted)', fontSize: 13, marginTop: 5 }}>
                    {edu.start_year} — {edu.is_current ? 'Present' : edu.end_year || ''}
                  </p>

                  {/* Grade */}
                  {edu.grade && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        background: `${color}15`, color,
                        border: `1px solid ${color}30`,
                        fontSize: 12, fontWeight: 600, padding: '2px 10px',
                        borderRadius: 50,
                      }}>
                        Grade: {edu.grade}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {edu.description && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{
                        fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {edu.description}
                      </p>
                      {edu.description.length > 120 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : edu.id)}
                          style={{
                            background: 'none', color: '#6366f1',
                            fontSize: 12, fontWeight: 600, padding: 0, marginTop: 3,
                          }}
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  )}

                  {edu.is_current && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{
                        background: 'rgba(99,102,241,0.12)', color: '#6366f1',
                        border: '1px solid rgba(99,102,241,0.25)',
                        fontSize: 11, fontWeight: 700, padding: '3px 10px',
                        borderRadius: 50, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        Currently Studying
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