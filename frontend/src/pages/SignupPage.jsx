import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { register } from '../store/authSlice'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'

export default function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', password2: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(err => ({ ...err, [e.target.name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      setErrors({ password2: 'Passwords do not match.' })
      return
    }
    setLoading(true)
    const result = await dispatch(register(form))
    if (register.fulfilled.match(result)) {
      toast.success('Account created! Welcome to NexLinker 🎉')
      navigate('/profile/edit')
    } else {
      const errs = result.payload
      if (typeof errs === 'object') setErrors(errs)
      toast.error('Registration failed. Please check your details.')
    }
    setLoading(false)
  }

  const fields = [
    { name: 'first_name', label: 'First Name', placeholder: 'John', icon: FiUser, type: 'text' },
    { name: 'last_name', label: 'Last Name', placeholder: 'Doe', icon: FiUser, type: 'text' },
    { name: 'email', label: 'Email Address', placeholder: 'john@company.com', icon: FiMail, type: 'email' },
  ]

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          top: '-200px', left: '-150px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          bottom: '-100px', right: '-100px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.10), transparent 70%)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            display: 'inline-block', marginBottom: 14,
          }}>
            NexLinker
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700 }}>Create your account</h1>
          <p style={{ color: 'var(--color-muted)', marginTop: 6, fontSize: 14 }}>
            Join millions of professionals on NexLinker
          </p>
        </div>

        <div className="card slide-up" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['first_name', 'last_name'].map(name => (
                <div key={name}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                    {name === 'first_name' ? 'First Name' : 'Last Name'}
                  </label>
                  <input
                    name={name}
                    type="text"
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={name === 'first_name' ? 'John' : 'Doe'}
                    required
                    className="input-field"
                    style={{ borderColor: errors[name] ? 'var(--color-danger)' : undefined }}
                  />
                  {errors[name] && <p style={{ color: 'var(--color-danger)', fontSize: 11, marginTop: 3 }}>{errors[name]}</p>}
                </div>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: 15 }} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                  className="input-field"
                  style={{ paddingLeft: 40, borderColor: errors.email ? 'var(--color-danger)' : undefined }}
                />
              </div>
              {errors.email && <p style={{ color: 'var(--color-danger)', fontSize: 11, marginTop: 3 }}>{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
            </div>

            {['password', 'password2'].map((name) => (
              <div key={name}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
                  {name === 'password' ? 'Password' : 'Confirm Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: 15 }} />
                  <input
                    name={name}
                    type={showPass ? 'text' : 'password'}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="input-field"
                    style={{ paddingLeft: 40, paddingRight: 44, borderColor: errors[name] ? 'var(--color-danger)' : undefined }}
                  />
                  {name === 'password2' && (
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--color-muted)', padding: 0 }}
                    >
                      {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  )}
                </div>
                {errors[name] && <p style={{ color: 'var(--color-danger)', fontSize: 11, marginTop: 3 }}>{Array.isArray(errors[name]) ? errors[name][0] : errors[name]}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 6 }}
            >
              {loading ? 'Creating Account...' : <>Create Account <FiArrowRight /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--color-muted)', fontSize: 14 }}>
            Already on NexLinker?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}