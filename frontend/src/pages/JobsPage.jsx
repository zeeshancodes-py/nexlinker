import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import JobCard from '../components/jobs/JobCard'
import api from '../api/axios'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { FiSearch, FiMapPin, FiBriefcase, FiPlus, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ q: '', location: '', job_type: '' })
  const [showPost, setShowPost] = useState(false)
  const [jobForm, setJobForm] = useState({
    title: '', company: '', location: '', job_type: 'full_time',
    experience_level: '', description: '', requirements: '',
    salary_min: '', salary_max: '', skills_required: '', deadline: '',
  })

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async (f = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ ...filters, ...f }).toString()
      const { data } = await api.get(`/jobs/?${params}`)
      setJobs(data.results || data)
    } catch {}
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadJobs()
  }

  const handlePost = async (e) => {
    e.preventDefault()
    try {
      // Convert salary fields to integers and deadline to proper format
      const payload = {
        ...jobForm,
        salary_min: jobForm.salary_min ? parseInt(jobForm.salary_min) : null,
        salary_max: jobForm.salary_max ? parseInt(jobForm.salary_max) : null,
        deadline: jobForm.deadline || null,
      }
      console.log('Posting job with payload:', payload)
      const { data } = await api.post('/jobs/', payload)
      setJobs(prev => [data, ...prev])
      setShowPost(false)
      toast.success('Job posted!')
      setJobForm({ title: '', company: '', location: '', job_type: 'full_time', experience_level: '', description: '', requirements: '', salary_min: '', salary_max: '', skills_required: '', deadline: '' })
    } catch (err) {
      console.error('Error response:', err.response?.data)
      toast.error('Failed to post job.')
    }
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '88px 24px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>Jobs</h1>
          <button onClick={() => setShowPost(v => !v)} className="btn btn-primary">
            <FiPlus size={15} /> Post a Job
          </button>
        </div>

        {/* Post Job Form */}
        {showPost && (
          <div className="card fade-in" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Post a New Job</h3>
              <button onClick={() => setShowPost(false)} style={{ background: 'none', color: 'var(--color-muted)' }}>
                <FiX size={18} />
              </button>
            </div>
            <form onSubmit={handlePost} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { key: 'title', label: 'Job Title', placeholder: 'Software Engineer', required: true },
                { key: 'company', label: 'Company', placeholder: 'Your Company', required: true },
                { key: 'location', label: 'Location', placeholder: 'Remote / New York', required: true },
                { key: 'skills_required', label: 'Skills (comma separated)', placeholder: 'React, Node.js, Python' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input className="input-field" placeholder={f.placeholder} required={f.required} value={jobForm[f.key]} onChange={e => setJobForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Job Type</label>
                <select className="input-field" value={jobForm.job_type} onChange={e => setJobForm(prev => ({ ...prev, job_type: e.target.value }))}>
                  {['full_time','part_time','contract','internship','remote'].map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Experience Level</label>
                <select className="input-field" value={jobForm.experience_level} onChange={e => setJobForm(prev => ({ ...prev, experience_level: e.target.value }))}>
                  <option value="">Any level</option>
                  {['entry','mid','senior','director','executive'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Description</label>
                <textarea required className="input-field" rows={4} value={jobForm.description} onChange={e => setJobForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the role..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Requirements</label>
                <textarea className="input-field" rows={3} value={jobForm.requirements} onChange={e => setJobForm(prev => ({ ...prev, requirements: e.target.value }))} placeholder="Required skills, experience..." style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Salary Min ($)</label>
                <input type="number" className="input-field" placeholder="50000" value={jobForm.salary_min} onChange={e => setJobForm(prev => ({ ...prev, salary_min: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Salary Max ($)</label>
                <input type="number" className="input-field" placeholder="120000" value={jobForm.salary_max} onChange={e => setJobForm(prev => ({ ...prev, salary_max: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Application Deadline</label>
                <input type="date" className="input-field" value={jobForm.deadline} onChange={e => setJobForm(prev => ({ ...prev, deadline: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">Post Job</button>
              </div>
            </form>
          </div>
        )}

        {/* Search Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 2, minWidth: 200 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                className="input-field"
                placeholder="Job title or company..."
                value={filters.q}
                onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
                style={{ paddingLeft: 38 }}
              />
            </div>
            <div style={{ position: 'relative', flex: 1, minWidth: 140 }}>
              <FiMapPin style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                className="input-field"
                placeholder="Location"
                value={filters.location}
                onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                style={{ paddingLeft: 38 }}
              />
            </div>
            <select
              className="input-field"
              value={filters.job_type}
              onChange={e => setFilters(f => ({ ...f, job_type: e.target.value }))}
              style={{ minWidth: 130 }}
            >
              <option value="">All Types</option>
              {['full_time','part_time','contract','internship','remote'].map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        {/* Job listings */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <LoadingSpinner size={36} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ fontSize: 32 }}>💼</p>
            <p style={{ color: 'var(--color-muted)', marginTop: 12 }}>No jobs found. Try different filters.</p>
          </div>
        ) : (
          jobs.map(job => <JobCard key={job.id} job={job} onApply={() => {}} />)
        )}
      </div>
    </div>
  )
}
