import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from '../store/profileSlice'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import PostCard from '../components/feed/PostCard'
import api from '../api/axios'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ProfileHeader from '../components/profile/ProfileHeader'
import ExperienceSection from '../components/profile/ExperienceSection'
import EducationSection from '../components/profile/EducationSection'
import SkillsSection from '../components/profile/SkillsSection'

export default function ProfilePage() {
  const { userId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { viewedProfile, loading } = useSelector(s => s.profile)
  const [posts, setPosts] = useState([])

  const isOwner = user?.id === userId

  useEffect(() => {
    dispatch(fetchProfile(userId))
    loadPosts()
  }, [userId, dispatch])

  const loadPosts = async () => {
    try {
      const { data } = await api.get(`/feed/user/${userId}/`)
      setPosts(data.results || data)
    } catch {}
  }

  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <LoadingSpinner size={40} />
      </div>
    </>
  )

  if (!viewedProfile) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <p style={{ color: 'var(--color-muted)' }}>Profile not found.</p>
      </div>
    </>
  )

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '88px 24px 40px' }}>

        {/* Profile Header */}
        <ProfileHeader
          profile={viewedProfile}
          onRefresh={() => dispatch(fetchProfile(userId))}
        />

        {/* About */}
        {viewedProfile.about && (
          <div className="card fade-in" style={{ marginBottom: 16 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, fontWeight: 700, marginBottom: 12
            }}>
              About
            </h2>
            <p style={{
              color: 'var(--color-muted)',
              lineHeight: 1.8, fontSize: 15,
              whiteSpace: 'pre-wrap'
            }}>
              {viewedProfile.about}
            </p>
          </div>
        )}

        {/* Experience */}
        <ExperienceSection
          experiences={viewedProfile.experiences || []}
          isOwner={isOwner}
          onRefresh={() => dispatch(fetchProfile(userId))}
        />

        {/* Education */}
        <EducationSection
          educations={viewedProfile.educations || []}
          isOwner={isOwner}
          onRefresh={() => dispatch(fetchProfile(userId))}
        />

        {/* Skills & Certifications */}
        <SkillsSection
          skills={viewedProfile.skills || []}
          certifications={viewedProfile.certifications || []}
          isOwner={isOwner}
          onRefresh={() => dispatch(fetchProfile(userId))}
        />

        {/* Posts */}
        <div className="card fade-in" style={{ marginBottom: 16 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20, fontWeight: 700, marginBottom: 16
          }}>
            Posts
          </h2>
          {posts.length > 0 ? (
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-muted)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📝</p>
              <p style={{ fontSize: 15 }}>No posts yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}