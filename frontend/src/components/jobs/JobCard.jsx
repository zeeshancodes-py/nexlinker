import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function JobCard({ job, onApply }) {
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(job.has_applied)

  const handleApply = async () => {
    setLoading(true)
    try {
      await api.post(`/jobs/${job.id}/apply/`)
      setApplied(true)
      toast.success('Application submitted!')
      onApply?.()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply.')
    }
    setLoading(false)
  }

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {job.company_logo_url ? (
          <img src={job.company_logo_url} alt={job.company} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--color-border)' }} />
        ) : (
          <div style={{
            width: 52, height: 52, borderRadius: 10,
            background: 'var(--color-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0, border: '1px solid var(--color-border)',
          }}>
            🏢
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16 }}>{job.title}</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 2 }}>{job.company}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-muted)', fontSize: 12 }}>
              <FiMapPin size={12} /> {job.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-muted)', fontSize: 12 }}>
              <FiBriefcase size={12} /> {job.job_type?.replace('_', '-')}
            </span>
            {job.salary_min && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-muted)', fontSize: 12 }}>
                <FiDollarSign size={12} /> {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString() || '+'} /yr
              </span>
            )}
          </div>
          {job.skills_required && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {job.skills_required.split(',').slice(0, 4).map(skill => (
                <span key={skill} className="badge badge-blue">{skill.trim()}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <p style={{ color: 'var(--color-muted)', fontSize: 11 }}>
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </p>
          <button
            onClick={handleApply}
            disabled={loading || applied}
            className={`btn ${applied ? 'btn-ghost' : 'btn-primary'}`}
            style={{ padding: '7px 16px', fontSize: 13 }}
          >
            {applied ? '✓ Applied' : loading ? 'Applying...' : 'Easy Apply'}
          </button>
        </div>
      </div>
      {job.description && (
        <p style={{ color: 'var(--color-muted)', fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
          {job.description.slice(0, 200)}{job.description.length > 200 ? '...' : ''}
        </p>
      )}
    </div>
  )
}