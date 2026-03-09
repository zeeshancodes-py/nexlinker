import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { FiArrowRight, FiUsers, FiBriefcase, FiMessageSquare, FiBell, FiStar } from 'react-icons/fi'

const FEATURES = [
  { icon: FiUsers, title: 'Grow Your Network', desc: 'Connect with professionals, thought leaders and recruiters in your industry.', color: '#3b82f6' },
  { icon: FiBriefcase, title: 'Find Opportunities', desc: 'Discover jobs, projects and freelance gigs tailored to your expertise.', color: '#6366f1' },
  { icon: FiMessageSquare, title: 'Real-time Messaging', desc: 'Communicate instantly with your connections through encrypted messages.', color: '#10b981' },
  { icon: FiBell, title: 'Smart Notifications', desc: 'Stay informed about reactions, comments, connection requests and job alerts.', color: '#f59e0b' },
  { icon: FiStar, title: 'Showcase Skills', desc: 'Build a compelling professional profile that stands out to recruiters.', color: '#ec4899' },
]

const STATS = [
  { value: '10M+', label: 'Professionals' },
  { value: '500K+', label: 'Companies' },
  { value: '2M+', label: 'Jobs Posted' },
  { value: '98%', label: 'Satisfaction' },
]

export default function LandingPage() {
  const heroRef = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (!heroRef.current) return
      const { clientX, clientY } = e
      const { width, height, left, top } = heroRef.current.getBoundingClientRect()
      const x = (clientX - left) / width
      const y = (clientY - top) / height
      heroRef.current.style.setProperty('--mouse-x', `${x * 100}%`)
      heroRef.current.style.setProperty('--mouse-y', `${y * 100}%`)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', overflow: 'hidden' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
        @keyframes drift { 0%{transform:translateX(-100vw) rotate(0deg)} 100%{transform:translateX(100vw) rotate(360deg)} }
        .hero-card { animation: float 6s ease-in-out infinite; }
        .hero-card:nth-child(2) { animation-delay: -2s; }
        .hero-card:nth-child(3) { animation-delay: -4s; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 68,
        background: 'rgba(10, 15, 30, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          NexLinker
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 600 }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary">Join Now <FiArrowRight size={15} /></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 48px 60px',
          position: 'relative',
          overflow: 'hidden',
          background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59,130,246,0.06) 0%, transparent 60%)`,
        }}
      >
        {/* Background orbs */}
        {[
          { w: 600, h: 600, top: '-200px', right: '-200px', color: '#3b82f6' },
          { w: 400, h: 400, bottom: '-100px', left: '-100px', color: '#6366f1' },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: orb.w, height: orb.h,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}20, transparent 70%)`,
            top: orb.top, right: orb.right, bottom: orb.bottom, left: orb.left,
            animation: 'pulse-glow 4s ease-in-out infinite',
            animationDelay: `${i * 2}s`,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{ maxWidth: 700, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 50, padding: '6px 16px', marginBottom: 28,
            fontSize: 13, color: '#60a5fa',
          }}>
            ✨ The Future of Professional Networking
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 7vw, 80px)',
            fontWeight: 700,
            lineHeight: 1.05,
            marginBottom: 24,
            letterSpacing: '-2px',
          }}>
            Connect. Grow.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Succeed.
            </span>
          </h1>
          <p style={{
            fontSize: 18,
            color: 'var(--color-muted)',
            maxWidth: 520,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            NexLinker connects ambitious professionals with opportunities, mentors, and communities that elevate their careers to the next level.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Get Started Free <FiArrowRight />
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ fontSize: 16, padding: '14px 32px' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        padding: '60px 48px',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32,
        }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 40, fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {stat.value}
              </p>
              <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700,
            letterSpacing: '-1px', marginBottom: 16,
          }}>
            Everything You Need to{' '}
            <span style={{ color: 'var(--color-accent)' }}>Thrive</span>
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            All the professional tools you need in one beautifully designed platform.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="card"
              style={{
                transition: 'all 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = color + '60'
                e.currentTarget.style.boxShadow = `0 8px 32px ${color}20`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, color,
              }}>
                <Icon size={22} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
                {title}
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 48px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08))',
        borderTop: '1px solid var(--color-border)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 700,
          letterSpacing: '-1px', marginBottom: 20,
        }}>
          Ready to level up your career?
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: 17, marginBottom: 36 }}>
          Join 10 million professionals already building their future on NexLinker.
        </p>
        <Link to="/signup" className="btn btn-primary" style={{ fontSize: 17, padding: '16px 40px' }}>
          Create Free Account <FiArrowRight />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '24px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'var(--color-muted)', fontSize: 13,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent)' }}>NexLinker</span>
        <span>© {new Date().getFullYear()} NexLinker. All rights reserved.</span>
      </footer>
    </div>
  )
}